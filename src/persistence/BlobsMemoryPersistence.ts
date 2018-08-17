let _ = require('lodash');
let async = require('async');

import { ConfigParams } from 'pip-services-commons-node';
import { FilterParams } from 'pip-services-commons-node';
import { PagingParams } from 'pip-services-commons-node';
import { DataPage } from 'pip-services-commons-node';
import { AnyValueMap } from 'pip-services-commons-node';
import { NotFoundException } from 'pip-services-commons-node';
import { BadRequestException } from 'pip-services-commons-node';
import { IdGenerator } from 'pip-services-commons-node';
import { IdentifiableMemoryPersistence } from 'pip-services-data-node';

import { BlobInfoV1 } from '../data/version1/BlobInfoV1';
import { IBlobsPersistence } from './IBlobsPersistence';

export class BlobsMemoryPersistence 
    extends IdentifiableMemoryPersistence<BlobInfoV1, string> 
    implements IBlobsPersistence {

    protected _content: { [index: string]: Buffer } = {};
    protected _maxBlobSize: number = 100 * 1024;

    constructor() {
        super();
    }

    public configure(config: ConfigParams): void {
        super.configure(config);
        this._maxBlobSize = config.getAsLongWithDefault('options.max_blob_size', this._maxBlobSize);
    }

    private matchString(value: string, search: string): boolean {
        if (value == null && search == null)
            return true;
        if (value == null || search == null)
            return false;
        return value.toLowerCase().indexOf(search) >= 0;
    }

    private matchSearch(item: BlobInfoV1, search: string): boolean {
        search = search.toLowerCase();
        if (this.matchString(item.name, search))
            return true;
        if (this.matchString(item.group, search))
            return true;
        return false;
    }

    private composeFilter(filter: FilterParams): any {
        filter = filter || new FilterParams();
        let search = filter.getAsNullableString('search');
        let id = filter.getAsNullableString('id');
        let name = filter.getAsNullableString('name');
        let group = filter.getAsNullableString('group');
        let completed = filter.getAsNullableBoolean('completed');
        let expired = filter.getAsNullableBoolean('expired');
        let fromCreateTime = filter.getAsNullableDateTime('from_create_time');
        let toCreateTime = filter.getAsNullableDateTime('to_create_time');

        let now = new Date();

        return (item: BlobInfoV1) => {
            if (search != null && !this.matchSearch(item, search))
                return false;
            if (id != null && id != item.id)
                return false;
            if (name != null && name != item.name)
                return false;
            if (group != null && group != item.group)
                return false;
            if (completed != null && completed != item.completed)
                return false;
            if (expired != null && expired == true && item.expire_time > now)
                return false;
            if (expired != null && expired == false && item.expire_time <= now)
                return false;
            if (fromCreateTime != null && item.create_time >= fromCreateTime)
                return false;
            if (toCreateTime != null && item.create_time < toCreateTime)
                return false;
            return true;
        };
    }

    public getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams,
        callback: (err: any, page: DataPage<BlobInfoV1>) => void): void {
        super.getPageByFilter(correlationId, this.composeFilter(filter), paging, null, null, callback);
    }

    public markCompleted(correlationId: string, ids: string[],
        callback: (err: any) => void): void {
        async.each(ids, (id, callback) => {
            let data = AnyValueMap.fromTuples(
                'completed', true
            );
            super.updatePartially(correlationId, id, data, callback);
        }, callback);
    }

    public deleteById(correlationId: string, id: string,
        callback?: (err: any, item: BlobInfoV1) => void): void {
        delete this._content[id];
        super.deleteById(correlationId, id, callback);
    }

    public deleteByIds(correlationId: string, ids: string[],
        callback?: (err: any) => void): void {
        _.each(ids, (id) => {
            delete this._content[id];
        });
        super.deleteByIds(correlationId, ids, callback);
    }

    public clear(correlationId: string, callback?: (err: any) => void): void {
        this._content = {};
        super.clear(correlationId, callback);
    }


    public isUriSupported(): boolean {
        return false;
    }

    public getUri(correlationId: string, id: string,
        callback: (err: any, uri: string) => void): void {
        callback(null, null);
    }

    public beginWrite(correlationId: string, item: BlobInfoV1,
        callback: (err: any, token: string) => void): void {
        
        if (item.size != null && item.size > this._maxBlobSize) {
            let err = new BadRequestException(
                correlationId,
                'BLOB_TOO_LARGE',
                'Blob ' + item.id + ' exceeds allowed maximum size of ' + this._maxBlobSize
            ).withDetails('blob_id', item.id)
            .withDetails('size', item.size)
            .withDetails('max_size', this._maxBlobSize);
            callback(err, null);
            return;
        }

        super.create(correlationId, item, (err, item) => {
            let buffer = new Buffer([])
            this._content[item.id] = buffer;
            callback(null, item.id);
        });
    }

    public writeChunk(correlationId: string, token: string, chunk: string,
        callback: (err: any, token: string) => void): void {
        
        let id = token;
        let oldBuffer = this._content[id];
        if (oldBuffer == null) {
            let err = new NotFoundException(
                correlationId, 
                'BLOB_NOT_FOUND', 
                'Blob ' + id + ' was not found'
            ).withDetails('blob_id', id);
            callback(err, null);
            return;
        }

        // Enforce maximum size
        let chunkLength = chunk ? chunk.length : 0;
        if (this._maxBlobSize > 0 && oldBuffer.length + chunkLength > this._maxBlobSize) {
            let err = new BadRequestException(
                correlationId,
                'BLOB_TOO_LARGE',
                'Blob ' + id + ' exceeds allowed maximum size of ' + this._maxBlobSize
            ).withDetails('blob_id', id)
            .withDetails('size', oldBuffer.length + chunkLength)
            .withDetails('max_size', this._maxBlobSize);
            callback(err, null);
            return;
        }

        let buffer = new Buffer("", "base64");
        if (chunk) 
            buffer = Buffer.from(chunk, 'base64');
        this._content[id] = Buffer.concat([oldBuffer, buffer]);

        callback(null, token);
    }

    public endWrite(correlationId: string, token: string, chunk: string,
        callback?: (err: any, item: BlobInfoV1) => void): void {

        let id = token;
        let item: BlobInfoV1;

        async.series([
            // Write last chunk of the blob
            (callback) => {
                this.writeChunk(correlationId, token, chunk, callback);
            },
            // Get blob info
            (callback) => {
                super.getOneById(correlationId, id, (err, data) => {
                    if (err == null && data == null) {
                        err = new NotFoundException(
                            correlationId, 
                            'BLOB_NOT_FOUND', 
                            'Blob ' + id + ' was not found'
                        ).withDetails('blob_id', id);
                    }
                    item = data;
                    callback(err);
                });
            },
            // Update blob info with size and create time
            (callback) => {
                let buffer = this._content[id];
                item.create_time = new Date();
                item.size = buffer != null ? buffer.length : 0;

                super.update(correlationId, item, callback);
            }
        ], (err) => {
            if (err) callback(err, null);
            else callback(null, item);
        });
    }

    public abortWrite(correlationId: string, token: string,
        callback?: (err: any) => void): void {
        let id = token;
        this.deleteById(correlationId, id, callback);
    }

    public beginRead(correlationId: string, id: string,
        callback: (err: any, item: BlobInfoV1) => void): void {
        let oldBuffer = this._content[id];
        if (oldBuffer == null) {
            let err = new NotFoundException(
                correlationId, 
                'BLOB_NOT_FOUND', 
                'Blob ' + id + ' was not found'
            ).withDetails('blob_id', id);
            callback(err, null);
            return;
        }

        super.getOneById(correlationId, id, callback);
    }

    public readChunk(correlationId: string, id: string,  
        skip: number, take: number,
        callback: (err: any, chunk: string) => void): void {

        let oldBuffer = this._content[id];
        if (oldBuffer == null) {
            let err = new NotFoundException(
                correlationId, 
                'BLOB_NOT_FOUND', 
                'Blob ' + id + ' was not found'
            ).withDetails('blob_id', id);
            callback(err, null);
            return;
        }

        let result = oldBuffer.toString('base64', skip, skip + take);
        callback(null, result);
    }

    public endRead(correlationId: string, id: string,
        callback?: (err: any) => void): void {
        if (callback) callback(null);
    }

}
