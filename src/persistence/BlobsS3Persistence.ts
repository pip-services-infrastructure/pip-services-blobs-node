let _ = require('lodash');
let async = require('async');
let fs = require('fs');
let querystring = require('querystring');

import { IOpenable } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { Schema } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';
import { CompositeLogger } from 'pip-services3-components-node';
import { CompositeCounters } from 'pip-services3-components-node';
import { Timing } from 'pip-services3-components-node';
import { IdGenerator } from 'pip-services3-commons-node';
import { NotFoundException } from 'pip-services3-commons-node';
import { BadRequestException } from 'pip-services3-commons-node';
import { InvocationException } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { DependencyResolver } from 'pip-services3-commons-node';
import { StringConverter } from 'pip-services3-commons-node';
import { IntegerConverter } from 'pip-services3-commons-node';
import { BooleanConverter } from 'pip-services3-commons-node';
import { DateTimeConverter } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { AwsConnectionResolver } from 'pip-services3-aws-node';
import { AwsConnectionParams } from 'pip-services3-aws-node';

import { BlobInfoV1 } from '../data/version1/BlobInfoV1';
import { IBlobsPersistence } from './IBlobsPersistence';
import { TempBlobStorage } from './TempBlobStorage';

export class BlobsS3Persistence
    implements IOpenable, IConfigurable, IReferenceable, IBlobsPersistence {
    
    private static readonly _defaultConfig: ConfigParams = ConfigParams.fromTuples(
        "connection.protocol", "aws",
        "connection.region", null,
        "connection.account_id", null,
        "connection.bucket", null,
        "connection.arn", null,

        "credential.access_id", null,
        "credential.access_key", null,
        
        "options.reduced_redundancy", true,
        "options.max_blob_size", 10 * 1024,
        "options.connect_timeout", 30000
    );

    protected _s3: any;
    protected _opened: boolean = false;
    protected _connection: AwsConnectionParams;
    protected _bucket: string;
 
    protected _connectTimeout: number = 30000;
    protected _minChunkSize: number = 5 * 1024 * 1024;
    protected _maxBlobSize: number = 100 * 1024;
    protected _reducedRedundancy: boolean = true;
    protected _maxPageSize: number = 100;

    protected _dependencyResolver: DependencyResolver = new DependencyResolver(BlobsS3Persistence._defaultConfig);
    protected _connectionResolver: AwsConnectionResolver = new AwsConnectionResolver();
    protected _logger: CompositeLogger = new CompositeLogger();
    protected _counters: CompositeCounters = new CompositeCounters();
    protected _storage: TempBlobStorage = new TempBlobStorage('./data/temp');

    public configure(config: ConfigParams): void {
        config = config.setDefaults(BlobsS3Persistence._defaultConfig);
        this._connectionResolver.configure(config);
		this._dependencyResolver.configure(config);
        this._storage.configure(config);

        this._minChunkSize = config.getAsLongWithDefault('options.min_chunk_size', this._minChunkSize);
        this._maxBlobSize = config.getAsLongWithDefault('options.max_blob_size', this._maxBlobSize);
        this._reducedRedundancy = config.getAsBooleanWithDefault('options.reduced_redundancy', this._reducedRedundancy);
        this._maxPageSize = config.getAsIntegerWithDefault("options.max_page_size", this._maxPageSize);
        this._connectTimeout = config.getAsIntegerWithDefault("options.connect_timeout", this._connectTimeout);
    }

    public setReferences(references: IReferences): void {
        this._logger.setReferences(references);
        this._counters.setReferences(references);
        this._connectionResolver.setReferences(references);
        this._dependencyResolver.setReferences(references);
    }

    public isOpen(): boolean {
        return this._opened;
    }

    public open(correlationId: string, callback: (err?: any) => void): void {
        if (this.isOpen()) {
            if (callback) callback();
            return;
        }

        async.series([
            (callback) => {
                this._connectionResolver.resolve(correlationId, (err, connection) => {
                    this._connection = connection;
                    callback(err);
                });
            },
            (callback) => {
                let aws = require('aws-sdk');
                
                aws.config.update({
                    accessKeyId: this._connection.getAccessId(),
                    secretAccessKey: this._connection.getAccessKey(),
                    region: this._connection.getRegion()
                });

                aws.config.httpOptions = {
                    timeout: this._connectTimeout
                };

                this._s3 = new aws.S3();
                this._bucket = this._connection.getResource();

                this._opened = true;
                this._logger.debug(correlationId, "S3 persistence connected to %s", this._connection.getArn());

                callback();
            },
            (callback) => {
                this._storage.open(correlationId, callback);
            }
        ], callback);
    }

    public close(correlationId: string, callback?: (err?: any) => void): void {
        // Close temp blob storage
        this._storage.close(correlationId, (err) => {
            this._opened = false;
            if (callback) callback(err);
        });
    }

    private dataToInfo(id: string, data: any): BlobInfoV1 {
        if (data == null) return null;

        let metadata = data.Metadata;
        return <BlobInfoV1>{
            id: id || data.Key,
            group: this.decodeString(metadata.group),
            name: this.decodeString(metadata.name),
            size: data.ContentLength,
            content_type: data.ContentType,
            create_time: data.LastModified,
            expire_time: data.Expires,
            completed: BooleanConverter.toBoolean(metadata.completed)
        };
    }

    private encodeString(value: string): string {
        if (value == null) return null;
        return querystring.escape(value);
    }

    private decodeString(value: string): string {
        if (value == null) return null;
        return querystring.unescape(value);
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
        let search = this.encodeString(filter.getAsNullableString('search'));
        let id = filter.getAsNullableString('id');
        let name = this.encodeString(filter.getAsNullableString('name'));
        let group = this.encodeString(filter.getAsNullableString('group'));
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

        let filterCurl = this.composeFilter(filter);

        paging = paging || new PagingParams();
        let skip = paging.getSkip(0);
        let take = paging.getTake(this._maxPageSize);

        let result: BlobInfoV1[] = [];
        let token = null;
        let completed = false;

        async.whilst(
            () => completed == false && result.length < take,
            (callback) => {
                let params = {
                    Bucket: this._bucket,
                    ContinuationToken: token,
                    MaxKeys: this._maxPageSize
                };

                this._s3.listObjectsV2(
                    params,
                    (err, data) => {
                        if (err) {
                            callback(err);
                            return;
                        }

                        // Set token to continue
                        token = data.ContinuationToken;
                        completed = token == null;

                        // If nothing is returned then exit
                        if (data.Contents == null || data.Contents.length == 0) {
                            completed = true;
                            callback();
                            return;
                        }

                        // Extract ids and retrieve objects
                        let ids = _.map(data.Contents, c => c.Key);
                        this.getListByIds(correlationId, ids, (err, items) => {
                            if (err) {
                                callback(err);
                                return;
                            }

                            // Filter items using provided criteria
                            items = _.filter(items, filterCurl);

                            // Continue if skipped completely
                            if (items.length <= skip) {
                                skip -= items.length;
                                callback();
                                return;
                            }

                            // Truncate by skip number
                            if (skip > 0 && items.length >= skip) {
                                skip = 0;
                                items = items.splice(0, skip);
                            }

                            // Include items until page is over
                            for (let item of items) {
                                if (take > 0) {
                                    result.push(item);
                                    take--;
                                }
                            }

                            callback();
                        });
                    } 
                );    
            },
            (err) => {
                let page = err == null ? new DataPage<BlobInfoV1>(result, null) : null;
                callback(err, page);
            }
        )
    }

    public getListByIds(correlationId: string, ids: string[],
        callback: (err: any, items: BlobInfoV1[]) => void): void {
        let items: BlobInfoV1[] = [];
        async.each(
            ids, 
            (id, callback) => {
                this.getOneById(correlationId, id, (err, item) => {
                    if (item) items.push(item);
                    callback(err);
                });
            }, 
            (err) => {
                callback(err, err == null ? items: null);
            }
        );
    }

    public getOneById(correlationId: string, id: string,
        callback: (err: any, item: BlobInfoV1) => void): void {

        let params = {
            Bucket: this._bucket,
            Key: id
        };

         this._s3.headObject(
             params,
             (err, data) => {
                if (err && err.code == "NotFound") err = null;

                if (err == null && data != null) {
                    let item = this.dataToInfo(id, data);
                    callback(null, item);
                } else callback(err, null);
             } 
        );    
    }

    public update(correlationId: string, item: BlobInfoV1,
        callback: (err: any, item: BlobInfoV1) => void): void {

        item.group = this.encodeString(item.group);
        item.name = this.encodeString(item.name);
        let filename = item.name || (item.id + '.dat');

        let params = {
            Bucket: this._bucket,
            Key: item.id,
            CopySource: this._bucket + '/' + item.id,
            ACL: 'public-read',
            ContentDisposition: 'inline; filename=' + filename,
            ContentType: item.content_type,
            StorageClass: this._reducedRedundancy ? 'REDUCED_REDUNDANCY' : 'STANDARD',
            Expires: DateTimeConverter.toNullableDateTime(item.expire_time),
            Metadata: {
                name: item.name,
                group: item.group,
                completed: StringConverter.toString(item.completed)
            }
        };

         this._s3.copyObject(
             params,
             (err, data) => {
                 item = err == null ? item : null;
                 callback(err, item);
             } 
        );
    }

    public markCompleted(correlationId: string, ids: string[],
        callback: (err: any) => void): void {
        async.each(ids, (id, callback) => {
            this.getOneById(correlationId, id, (err, item) => {
                if (err != null || item == null || item.completed) {
                    callback(err, item);
                } else {
                    item.completed = true;
                    this.update(correlationId, item, callback);
                }
            });
        }, callback);
    }

    public isUriSupported(): boolean {
        return true;
    }

    public getUri(correlationId: string, id: string,
        callback: (err: any, uri: string) => void): void {
        let params = {
            Bucket: this._bucket,
            Key: id
        };

        this._s3.getSignedUrl('getObject', params, callback);
    }

    public beginWrite(correlationId: string, item: BlobInfoV1,
        callback: (err: any, token: string) => void): void {

        item.group = this.encodeString(item.group);
        item.name = this.encodeString(item.name);
        let filename = item.name || (item.id + '.dat');

        let params = {
            Bucket: this._bucket,
            Key: item.id,
            ACL: 'public-read',
            ContentDisposition: 'inline; filename=' + filename,
            ContentType: item.content_type,
            StorageClass: this._reducedRedundancy ? 'REDUCED_REDUNDANCY' : 'STANDARD',
            Expires: DateTimeConverter.toNullableDateTime(item.expire_time),
            Metadata: {
                name: item.name,
                group: item.group,
                completed: StringConverter.toString(item.completed)
            }
        };

         this._s3.createMultipartUpload(
             params,
             (err, data) => {
                if (err == null && data != null) {
                    let token = item.id + ';' + data.UploadId;
                    callback(null, token);
                } else callback(err, null);
             } 
        );
    }

    private uploadPart(correlationId: string, token: string, body: any,
        callback: (err: any, token: string) => void): void {

        let tokens = (token || '').split(';');

        if (tokens.length == 0) {
            let err = new BadRequestException(correlationId, 'BAD_TOKEN', 'Token ' + token + ' is invalid')
                .withDetails('token', token);
            callback(err, null);
            return;
        }

        let params = {
            Bucket: this._bucket,
            Key: tokens[0],
            UploadId: tokens[1],
            PartNumber: tokens.length - 1,
            Body: body
        };

        this._s3.uploadPart(
            params,
            (err, data) => {
                if (data != null)
                    token = token + ';' + data.ETag;
                callback(err, token);
            } 
        );
    }

    private uploadAndDeleteChunks(correlationId: string, token: string,
        callback: (err: any, token: string) => void): void {

        let tokens = (token || '').split(';');

        if (tokens.length == 0) {
            let err = new BadRequestException(correlationId, 'BAD_TOKEN', 'Token ' + token + ' is invalid')
                .withDetails('token', token);
            callback(err, null);
            return;
        }

        let id = tokens[0];
        let body = fs.createReadStream(this._storage.makeFileName(id));
        this.uploadPart(correlationId, token, body,
            (err, token) => {
                if (err == null) {
                    this._storage.deleteChunks(correlationId, id, (err) => {
                        callback(err, token);
                    });
                }
            } 
        );
    }

    public writeChunk(correlationId: string, token: string, chunk: string,
        callback: (err: any, token: string) => void): void {

        let tokens = (token || '').split(';');

        if (tokens.length == 0) {
            let err = new BadRequestException(correlationId, 'BAD_TOKEN', 'Token ' + token + ' is invalid')
                .withDetails('token', token);
            callback(err, null);
            return;
        }

        let id = tokens[0];
        chunk = chunk || "";
        let buffer = Buffer.from(chunk, 'base64');
        this._storage.appendChunk(correlationId, id, buffer, (err, size) => {
            if (err == null && size >= this._minChunkSize)
                this.uploadAndDeleteChunks(correlationId, token, callback);
            else callback(err, token)
        });
    }

    public endWrite(correlationId: string, token: string, chunk: string,
        callback?: (err: any, item: BlobInfoV1) => void): void {

        let tokens = (token || '').split(';');

        if (tokens.length == 0) {
            let err = new BadRequestException(correlationId, 'BAD_TOKEN', 'Token ' + token + ' is invalid')
                .withDetails('token', token);
            callback(err, null);
            return;
        }

        let id = tokens[0];
        chunk = chunk || "";
        let buffer = Buffer.from(chunk, 'base64');
        let append = false;
        let uri = null;

        async.series([
            // Check if temp file exist
            (callback) => {
                this._storage.getChunksSize(correlationId, id, (err, size) => {
                    append = size > 0;
                    callback(err);
                });
            },
            // Upload temp file or chunks directly
            (callback) => {
                if (append) {
                    // If some chunks already stored in temp file - append then upload the entire file
                    this._storage.appendChunk(correlationId, id, buffer, (err, size) => {
                        this.uploadAndDeleteChunks(correlationId, token, (err, tok) => {
                            token = tok || token;
                            callback(err);
                        });
                    });
                } else {
                    // If it's the first chunk then upload it without writing to temp file
                    this.uploadPart(correlationId, token, buffer, (err, tok) => {
                        token = tok || token;
                        callback(err);
                    })
                }
            },
            // Complete upload
            (callback) => {
                let tokens = (token || '').split(';');
                let parts = [];

                for (let index = 2; index < tokens.length; index++) {
                    parts.push({
                        ETag: tokens[index],
                        PartNumber: index - 1
                    });
                }

                let params = {
                    Bucket: this._bucket,
                    Key: id,
                    UploadId: tokens[1],
                    MultipartUpload: {
                        Parts: parts
                    }
                };

                this._s3.completeMultipartUpload(
                    params,
                    (err, data) => {
                        callback(err);
                    } 
                );
            }
        ], (err) => {
            if (err == null) {
                this.getOneById(correlationId, id, callback);
            } else if (callback) callback(err, null);
        });
    }

    public abortWrite(correlationId: string, token: string, 
        callback?: (err: any) => void): void {

        let tokens = (token || '').split(';');

        if (tokens.length == 0) {
            let err = new BadRequestException(correlationId, 'BAD_TOKEN', 'Token ' + token + ' is invalid')
                .withDetails('token', token);
            callback(err);
            return;
        }

        let parts = [];

        for (let index = 2; index < tokens.length; index++) {
            parts.push({
                PartNumber: index,
                ETag: tokens[index]
            });
        }

        let params = {
            Bucket: this._bucket,
            Key: tokens[0],
            UploadId: tokens[1],
            MultipartUpload: {
                Parts: parts
            }
        };

        this._s3.abortMultipartUpload(
            params,
            (err, data) => {
                callback(err);
            } 
        );
    }

    public beginRead(correlationId: string, id: string,
        callback: (err: any, item: BlobInfoV1) => void): void {

        this.getOneById(correlationId, id, (err, item) => {
            if (err == null && item == null) {
                err = new NotFoundException(
                    correlationId, 
                    'BLOB_NOT_FOUND', 
                    'Blob ' + id + ' was not found'
                ).withDetails('blob_id', id);
            }

            callback(err, item);
        });
    }

    public readChunk(correlationId: string, id: string, skip: number, take: number,
        callback: (err: any, chunk: string) => void): void {

        let params = {
            Bucket: this._bucket,
            Key: id,
            Range: 'bytes=' + skip + '-' + (skip + take - 1)
        };

         this._s3.getObject(
             params,
             (err, data) => {
                if (err == null && data != null) {
                    let chunk = data.Body.toString('base64');
                    callback(null, chunk);
                } else callback(err, null);
             } 
        );    
    }

    public endRead(correlationId: string, id: string,
        callback?: (err: any) => void): void {
        if (callback) callback(null);
    }

    public deleteById(correlationId: string, id: string, callback?: (err: any) => void): void {
        let params = {
            Bucket: this._bucket,
            Key: id
        };

        this._s3.deleteObject(params, callback);
    }

    public deleteByIds(correlationId: string, ids: string[], callback?: (err: any) => void): void {
        let params = {
            Bucket: this._bucket,
            Delete: {
                Objects: []
            }
        };

        _.each(ids, (id) => {
            params.Delete.Objects.push({ Key: id });
        })

        this._s3.deleteObjects(params, callback);
    }

    public clear(correlationId: string, callback?: (err: any) => void): void {
        let params = {
            Bucket: this._bucket,
        };

         this._s3.listObjects(
             params,
             (err, data) => {
                if (err != null || data.Contents.length == 0) {
                    if (callback) callback(err);
                    return;
                }

                let params = {
                    Bucket: this._bucket,
                    Delete: {
                        Objects: []
                    }
                };

                _.each(data.Contents, (c) => {
                    params.Delete.Objects.push({ Key: c.Key })
                })

                this._s3.deleteObjects(params, callback);
             } 
        );    

    }

}