let _ = require('lodash');
let async = require('async');
let stream = require('stream');

import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { ICleanable } from 'pip-services3-commons-node';
import { BadRequestException } from 'pip-services3-commons-node';
import { NotFoundException } from 'pip-services3-commons-node';
import { IOpenable } from 'pip-services3-commons-node';
import { MongoDbPersistence } from 'pip-services3-mongodb-node';
import { IdGenerator } from 'pip-services3-commons-node';
import { BooleanConverter } from 'pip-services3-commons-node';
import { DateTimeConverter } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';

import { BlobInfoV1 } from '../data/version1/BlobInfoV1';
import { IBlobsPersistence } from './IBlobsPersistence';
import { TempBlobStorage } from './TempBlobStorage';

export class BlobsMongoDbPersistence  extends MongoDbPersistence implements IBlobsPersistence {
    protected _GridStore: any;
    protected _storage: TempBlobStorage = new TempBlobStorage('./data/temp');
    protected _maxBlobSize: number = 100 * 1024;
    protected _maxPageSize: number = 100;

    public constructor() {
        super('blobs', null);
    }

    public configure(config: ConfigParams): void {
        super.configure(config);
        this._storage.configure(config);

        this._maxBlobSize = config.getAsLongWithDefault('options.max_blob_size', this._maxBlobSize);
        this._maxPageSize = config.getAsIntegerWithDefault("options.max_page_size", this._maxPageSize);
    }

    public open(correlationId: string, callback?: (err: any) => void): void {
        async.series([
            (callback) => {
                super.open(correlationId, callback);
            },
            (callback) => {
                // Open temp blob storage
                this._storage.open(correlationId, callback);
            },
            (callback) => {
                let mongoose = require('mongoose');
                this._GridStore = mongoose.mongo.GridStore;

                callback(null);
            }
        ], (err) => {
            callback(err);
        });
    }

    public close(correlationId: string, callback?: (err: any) => void): void {
        // Close temp blob storage
        this._storage.close(correlationId, (err) => {
            this._GridStore = null;
            super.close(correlationId, callback);
        });
    }


    private composeFilter(filter: FilterParams): any {
        filter = filter || new FilterParams();

        let criteria = [];

        let search = filter.getAsNullableString('search');
        if (search != null) {
            let searchRegex = new RegExp(search, "i");
            let searchCriteria = [];
            searchCriteria.push({ 'metadata.name': { $regex: searchRegex } });
            searchCriteria.push({ 'metadata.group': { $regex: searchRegex } });
            criteria.push({ $or: searchCriteria });
        }

        let id = filter.getAsNullableString('id');
        if (id != null)
            criteria.push({ 'filename': id });

        let name = filter.getAsNullableString('name');
        if (name != null)
            criteria.push({ 'metadata.name': name });

        let group = filter.getAsNullableString('group');
        if (group != null)
            criteria.push({ 'metadata.group': group });

        let completed = filter.getAsNullableBoolean('completed');
        if (completed != null)
            criteria.push({ 'metadata.completed': completed });

        let expired = filter.getAsNullableBoolean('expired');
        if (expired != null) {
            let now = new Date();
            if (expired)
                criteria.push({ 'metadata.expire_time': { $lte: now } });
            else
                criteria.push({ 'metadata.expire_time': { $gt: now } });
        }

        let fromCreateTime = filter.getAsNullableDateTime('from_create_time');
        if (fromCreateTime != null)
            criteria.push({ 'uploadTime': { $gte: fromCreateTime } });

        let toCreateTime = filter.getAsNullableDateTime('to_create_time');
        if (toCreateTime != null)
            criteria.push({ 'uploadTime': { $lt: toCreateTime } });

        return criteria.length > 0 ? { $and: criteria } : {};
    }

    public getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams,
        callback: (err: any, page: DataPage<BlobInfoV1>) => void): void {
        let collection = this._connection.db.collection(this._collection + '.files');
        let criteria = this.composeFilter(filter);

        // Adjust max item count based on configuration
        let options: any = {};
        paging = paging || new PagingParams();
        let skip = paging.getSkip(-1);
        if (skip >= 0) options.skip = skip;

        let take = paging.getTake(this._maxPageSize);
        options.limit = take;

        let pagingEnabled = paging.total;

        collection.find(criteria, options).toArray((err, items) => {
            if (err) {
                callback(err, null);
                return;
            }

            if (items != null)
                this._logger.trace(correlationId, "Retrieved %d from %s", items.length, this._collection);

            items = _.map(items, (item) => {
                return this.gridToInfo(item);
            });

            if (pagingEnabled) {
                collection.count(criteria, (err, count) => {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                        
                    let page = new DataPage<BlobInfoV1>(items, count);
                    callback(null, page);
                });
            } else {
                let page = new DataPage<BlobInfoV1>(items);
                callback(null, page);
            }
        });
    }

    public getListByIds(correlationId: string, ids: string[],
        callback: (err: any, items: BlobInfoV1[]) => void): void {
        let collection = this._connection.db.collection(this._collection + '.files');
        let criteria = {
            filename: { $in: ids }
        };

        collection.find(criteria).toArray((err, items) => {
            if (err) {
                callback(err, null);
                return;
            }

            if (items != null)
                this._logger.trace(correlationId, "Retrieved %d from %s", items.length, this._collection);

            items = _.map(items, (item) => {
                return this.gridToInfo(item);
            });

            callback(null, items);
        });
    }

    public getOneById(correlationId: string, id: string,
        callback: (err: any, item: BlobInfoV1) => void): void {

        let collection = this._connection.db.collection(this._collection + '.files');
        let criteria = {
            filename: id
        };

        collection.findOne(criteria, (err, item) => {
            if (err) {
                callback(err, null);
                return;
            }

            item = this.gridToInfo(item);
            callback(null, item);
        });
    }

    public update(correlationId: string, item: BlobInfoV1,
        callback: (err: any, item: BlobInfoV1) => void): void {

        let collection = this._connection.db.collection(this._collection + '.files');
        let criteria = {
            filename: item.id
        };
        let doc = {
            $set: {
                'metadata.name': item.name,
                'metadata.group': item.group,
                'metadata.completed': item.completed,
                'metadata.expire_time': item.expire_time
            }
        }
        let options = {
            new: true
        };

        collection.findAndModify(criteria, [], doc, options, (err, item) => {
            if (err != null || item == null || item.value == null) {
                callback(err, null);
                return;
            }

            item = this.gridToInfo(item.value);
            callback(null, item);
        });
    }

    public markCompleted(correlationId: string, ids: string[],
        callback: (err: any) => void): void {

        let collection = this._connection.db.collection(this._collection + '.files');
        let criteria = {
            filename: { $in: ids }
        };
        let doc = {
            $set: {
                'metadata.completed': true
            }
        }
        let options = {
            multi: true
        };

        collection.update(criteria, doc, options, (err) => {
            callback(err);
        });
    }

    public isUriSupported(): boolean {
        return false;
    }

    public getUri(correlationId: string, id: string,
        callback: (err: any, uri: string) => void): void {
        callback(null, null);
    }

    private infoToToken(item: BlobInfoV1): string {
        let data = ConfigParams.fromValue(item);
        return data.toString();
    }

    private tokenToInfo(token: string): BlobInfoV1 {
        let data = ConfigParams.fromString(token);
        return <BlobInfoV1>{
            id: data.getAsNullableString('id'),
            group: data.getAsNullableString('group'),
            name: data.getAsNullableString('name'),
            size: data.getAsNullableLong('size'),
            content_type: data.getAsNullableString('content_type'),
            create_time: data.getAsNullableDateTime('create_time'),
            expire_time: data.getAsNullableDateTime('expire_time'),
            completed: data.getAsNullableBoolean('completed')
        };
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

        item.id = item.id || IdGenerator.nextLong();
        let token = this.infoToToken(item);

        callback(null, token);
    }

    public writeChunk(correlationId: string, token: string, chunk: string,
        callback: (err: any, token: string) => void): void {

        let item = this.tokenToInfo(token);
        let buffer = Buffer.from(chunk, 'base64');
        this._storage.appendChunk(correlationId, item.id, buffer, (err, chunks) => {
            callback(err, token);
        });
    }

    public endWrite(correlationId: string, token: string, chunk: string,
        callback?: (err: any, item: BlobInfoV1) => void): void {

        let buffer = Buffer.from(chunk, 'base64');
        let item = this.tokenToInfo(token);
        let id = item.id;
        let metadata = _.pick(item, 'group', 'name', 'expire_time', 'completed')
        let append = false;

        async.series([
            (callback) => {
                this._storage.getChunksSize(correlationId, id, (err, size) => {
                    append = size > 0;
                    callback();
                });
            },
            (callback) => {
                if (!append) {
                    callback();
                    return;
                }

                // If some chunks already stored in temp file - append then upload the entire file
                this._storage.appendChunk(correlationId, id, buffer, (err, chunks) => {
                    if (err != null) {
                        if (callback) callback(err);
                        return;
                    }

                    // Open and seek to define blob size
                    let gs = new this._GridStore(
                        this._connection.db, id, "w", 
                        { 
                            root: this._collection,
                            content_type: item.content_type,
                            metadata: metadata
                        }
                    );
                    gs.open((err, gs) => {
                        if (err != null) {
                            callback(err);
                            return;
                        }

                        gs.writeFile(this._storage.makeFileName(id), (err) => {
                            if (err == null) {
                                item.size = gs.position;
                                item.create_time = new Date();
                                this._storage.deleteChunks(correlationId, id, callback);
                            } else callback(err);
                        });
                    });    
                });
            },
            (callback) => {
                if (append) {
                    callback();
                    return;
                }

                // If it's the first chunk then upload it without writing to temp file
                let gs = new this._GridStore(
                    this._connection.db, id, "w", 
                    { 
                        root: this._collection,
                        content_type: item.content_type,
                        metadata: metadata
                    }
                );
                gs.open((err, gs) => {
                    if (err != null) {
                        callback(err);
                        return;
                    }

                    gs.write(buffer, (err) => {
                        if (err == null) {
                            item.size = gs.position;
                            item.create_time = new Date();
                            gs.close(callback);
                        } else callback(err);
                    });
                });    
            }
        ], (err) => {
            callback(err, item);
        });
    }
    
    public abortWrite(correlationId: string, token: string,
        callback?: (err: any) => void): void {
        let item = this.tokenToInfo(token);
        let id = item.id;
        this._storage.deleteChunks(correlationId, id, callback);
    }

    private gridToInfo(gs: any): BlobInfoV1 {
        if (gs == null) return null;

        let metadata = gs.metadata || {};
        return <BlobInfoV1>{
            id: gs.filename,
            group: metadata.group,
            name: metadata.name,
            size: gs.length,
            content_type: gs.contentType,
            create_time: DateTimeConverter.toNullableDateTime(gs.uploadDate),
            expire_time: DateTimeConverter.toNullableDateTime(metadata.expire_time),
            completed: BooleanConverter.toBoolean(metadata.completed)
        };
    }

    public beginRead(correlationId: string, id: string,
        callback: (err: any, item: BlobInfoV1) => void): void {

        this._GridStore.exist(this._connection.db, id, this._collection, (err, exist) => {
            if (err == null && exist == false) {
                err = new NotFoundException(correlationId, 'BLOB_NOT_FOUND', 'Blob ' + id + ' was not found')
                    .withDetails('blob_id', id);
            }
            if (err) {
                callback(err, null);
                return;
            }

            // Open and seek to define blob size
            let gs = new this._GridStore(this._connection.db, id, "r", { root: this._collection });
            gs.open((err, gs) => {
                if (err != null) {
                    callback(err, null);
                    return;
                }

                gs.close((err) => {
                    if (err == null) {
                        let item = this.gridToInfo(gs);
                        callback(null, item);
                    } else callback(err, null);
                });
            });    
        });
    }

    public readChunk(correlationId: string, id: string, skip: number, take: number,
        callback: (err: any, chunk: string) => void): void {

        this._GridStore.read(this._connection.db, id, take, skip, { root: this._collection }, (err, data) => {
            if (err) {
                callback(err, null);
                return;
            }

            let result = Buffer.from(data).toString('base64');
            callback(err, result);
        });
    }

    public endRead(correlationId: string, id: string,
        callback?: (err: any) => void): void {
        if (callback) callback(null);
    }

    public deleteById(correlationId: string, id: string, callback?: (err: any) => void): void {
        this._GridStore.unlink(this._connection.db, id, { root: this._collection }, (err, result) => {
            if (callback) callback(err);
        });
    }

    public deleteByIds(correlationId: string, ids: string[], callback?: (err: any) => void): void {
        this._GridStore.unlink(this._connection.db, ids, { root: this._collection }, (err, result) => {
            if (callback) callback(err);
        });
    }

    public clear(correlationId: string, callback?: (err: any) => void): void {
        this._GridStore.list(this._connection.db, this._collection, (err, ids) => {
            if (err) {
                if (callback) callback(err);
                return;
            }

            async.each(ids, (id, callback) => {
                if (id == null) {
                    callback();
                    return;
                }

                this._GridStore.unlink(this._connection.db, id, { root: this._collection }, (err, result) => {
                    callback(err);
                });
            }, callback);
        });
    }

}
