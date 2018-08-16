"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
let fs = require('fs');
let querystring = require('querystring');
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_components_node_1 = require("pip-services-components-node");
const pip_services_components_node_2 = require("pip-services-components-node");
const pip_services_commons_node_2 = require("pip-services-commons-node");
const pip_services_commons_node_3 = require("pip-services-commons-node");
const pip_services_commons_node_4 = require("pip-services-commons-node");
const pip_services_commons_node_5 = require("pip-services-commons-node");
const pip_services_commons_node_6 = require("pip-services-commons-node");
const pip_services_commons_node_7 = require("pip-services-commons-node");
const pip_services_commons_node_8 = require("pip-services-commons-node");
const pip_services_commons_node_9 = require("pip-services-commons-node");
const pip_services_commons_node_10 = require("pip-services-commons-node");
const pip_services_aws_node_1 = require("pip-services-aws-node");
const TempBlobStorage_1 = require("./TempBlobStorage");
class BlobsS3Persistence {
    constructor() {
        this._opened = false;
        this._connectTimeout = 30000;
        this._minChunkSize = 5 * 1024 * 1024;
        this._maxBlobSize = 100 * 1024;
        this._reducedRedundancy = true;
        this._maxPageSize = 100;
        this._dependencyResolver = new pip_services_commons_node_4.DependencyResolver(BlobsS3Persistence._defaultConfig);
        this._connectionResolver = new pip_services_aws_node_1.AwsConnectionResolver();
        this._logger = new pip_services_components_node_1.CompositeLogger();
        this._counters = new pip_services_components_node_2.CompositeCounters();
        this._storage = new TempBlobStorage_1.TempBlobStorage('./data/temp');
    }
    configure(config) {
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
    setReferences(references) {
        this._logger.setReferences(references);
        this._counters.setReferences(references);
        this._connectionResolver.setReferences(references);
        this._dependencyResolver.setReferences(references);
    }
    isOpen() {
        return this._opened;
    }
    open(correlationId, callback) {
        if (this.isOpen()) {
            if (callback)
                callback();
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
    close(correlationId, callback) {
        // Close temp blob storage
        this._storage.close(correlationId, (err) => {
            this._opened = false;
            if (callback)
                callback(err);
        });
    }
    dataToInfo(id, data) {
        if (data == null)
            return null;
        let metadata = data.Metadata;
        return {
            id: id || data.Key,
            group: this.decodeString(metadata.group),
            name: this.decodeString(metadata.name),
            size: data.ContentLength,
            content_type: data.ContentType,
            create_time: data.LastModified,
            expire_time: data.Expires,
            completed: pip_services_commons_node_6.BooleanConverter.toBoolean(metadata.completed)
        };
    }
    encodeString(value) {
        if (value == null)
            return null;
        return querystring.escape(value);
    }
    decodeString(value) {
        if (value == null)
            return null;
        return querystring.unescape(value);
    }
    matchString(value, search) {
        if (value == null && search == null)
            return true;
        if (value == null || search == null)
            return false;
        return value.toLowerCase().indexOf(search) >= 0;
    }
    matchSearch(item, search) {
        search = search.toLowerCase();
        if (this.matchString(item.name, search))
            return true;
        if (this.matchString(item.group, search))
            return true;
        return false;
    }
    composeFilter(filter) {
        filter = filter || new pip_services_commons_node_8.FilterParams();
        let search = this.encodeString(filter.getAsNullableString('search'));
        let id = filter.getAsNullableString('id');
        let name = this.encodeString(filter.getAsNullableString('name'));
        let group = this.encodeString(filter.getAsNullableString('group'));
        let completed = filter.getAsNullableBoolean('completed');
        let expired = filter.getAsNullableBoolean('expired');
        let fromCreateTime = filter.getAsNullableDateTime('from_create_time');
        let toCreateTime = filter.getAsNullableDateTime('to_create_time');
        let now = new Date();
        return (item) => {
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
    getPageByFilter(correlationId, filter, paging, callback) {
        let filterCurl = this.composeFilter(filter);
        paging = paging || new pip_services_commons_node_9.PagingParams();
        let skip = paging.getSkip(0);
        let take = paging.getTake(this._maxPageSize);
        let result = [];
        let token = null;
        let completed = false;
        async.whilst(() => completed == false && result.length < take, (callback) => {
            let params = {
                Bucket: this._bucket,
                ContinuationToken: token,
                MaxKeys: this._maxPageSize
            };
            this._s3.listObjectsV2(params, (err, data) => {
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
            });
        }, (err) => {
            let page = err == null ? new pip_services_commons_node_10.DataPage(result, null) : null;
            callback(err, page);
        });
    }
    getListByIds(correlationId, ids, callback) {
        let items = [];
        async.each(ids, (id, callback) => {
            this.getOneById(correlationId, id, (err, item) => {
                if (item)
                    items.push(item);
                callback(err);
            });
        }, (err) => {
            callback(err, err == null ? items : null);
        });
    }
    getOneById(correlationId, id, callback) {
        let params = {
            Bucket: this._bucket,
            Key: id
        };
        this._s3.headObject(params, (err, data) => {
            if (err && err.code == "NotFound")
                err = null;
            if (err == null && data != null) {
                let item = this.dataToInfo(id, data);
                callback(null, item);
            }
            else
                callback(err, null);
        });
    }
    update(correlationId, item, callback) {
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
            Expires: pip_services_commons_node_7.DateTimeConverter.toNullableDateTime(item.expire_time),
            Metadata: {
                name: item.name,
                group: item.group,
                completed: pip_services_commons_node_5.StringConverter.toString(item.completed)
            }
        };
        this._s3.copyObject(params, (err, data) => {
            item = err == null ? item : null;
            callback(err, item);
        });
    }
    markCompleted(correlationId, ids, callback) {
        async.each(ids, (id, callback) => {
            this.getOneById(correlationId, id, (err, item) => {
                if (err != null || item == null || item.completed) {
                    callback(err, item);
                }
                else {
                    item.completed = true;
                    this.update(correlationId, item, callback);
                }
            });
        }, callback);
    }
    isUriSupported() {
        return true;
    }
    getUri(correlationId, id, callback) {
        let params = {
            Bucket: this._bucket,
            Key: id
        };
        this._s3.getSignedUrl('getObject', params, callback);
    }
    beginWrite(correlationId, item, callback) {
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
            Expires: pip_services_commons_node_7.DateTimeConverter.toNullableDateTime(item.expire_time),
            Metadata: {
                name: item.name,
                group: item.group,
                completed: pip_services_commons_node_5.StringConverter.toString(item.completed)
            }
        };
        this._s3.createMultipartUpload(params, (err, data) => {
            if (err == null && data != null) {
                let token = item.id + ';' + data.UploadId;
                callback(null, token);
            }
            else
                callback(err, null);
        });
    }
    uploadPart(correlationId, token, body, callback) {
        let tokens = (token || '').split(';');
        if (tokens.length == 0) {
            let err = new pip_services_commons_node_3.BadRequestException(correlationId, 'BAD_TOKEN', 'Token ' + token + ' is invalid')
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
        this._s3.uploadPart(params, (err, data) => {
            if (data != null)
                token = token + ';' + data.ETag;
            callback(err, token);
        });
    }
    uploadAndDeleteChunks(correlationId, token, callback) {
        let tokens = (token || '').split(';');
        if (tokens.length == 0) {
            let err = new pip_services_commons_node_3.BadRequestException(correlationId, 'BAD_TOKEN', 'Token ' + token + ' is invalid')
                .withDetails('token', token);
            callback(err, null);
            return;
        }
        let id = tokens[0];
        let body = fs.createReadStream(this._storage.makeFileName(id));
        this.uploadPart(correlationId, token, body, (err, token) => {
            if (err == null) {
                this._storage.deleteChunks(correlationId, id, (err) => {
                    callback(err, token);
                });
            }
        });
    }
    writeChunk(correlationId, token, chunk, callback) {
        let tokens = (token || '').split(';');
        if (tokens.length == 0) {
            let err = new pip_services_commons_node_3.BadRequestException(correlationId, 'BAD_TOKEN', 'Token ' + token + ' is invalid')
                .withDetails('token', token);
            callback(err, null);
            return;
        }
        let id = tokens[0];
        let buffer = Buffer.from(chunk, 'base64');
        this._storage.appendChunk(correlationId, id, buffer, (err, size) => {
            if (err == null && size >= this._minChunkSize)
                this.uploadAndDeleteChunks(correlationId, token, callback);
            else
                callback(err, token);
        });
    }
    endWrite(correlationId, token, chunk, callback) {
        let tokens = (token || '').split(';');
        if (tokens.length == 0) {
            let err = new pip_services_commons_node_3.BadRequestException(correlationId, 'BAD_TOKEN', 'Token ' + token + ' is invalid')
                .withDetails('token', token);
            callback(err, null);
            return;
        }
        let id = tokens[0];
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
                }
                else {
                    // If it's the first chunk then upload it without writing to temp file
                    this.uploadPart(correlationId, token, buffer, (err, tok) => {
                        token = tok || token;
                        callback(err);
                    });
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
                this._s3.completeMultipartUpload(params, (err, data) => {
                    callback(err);
                });
            }
        ], (err) => {
            if (err == null) {
                this.getOneById(correlationId, id, callback);
            }
            else if (callback)
                callback(err, null);
        });
    }
    abortWrite(correlationId, token, callback) {
        let tokens = (token || '').split(';');
        if (tokens.length == 0) {
            let err = new pip_services_commons_node_3.BadRequestException(correlationId, 'BAD_TOKEN', 'Token ' + token + ' is invalid')
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
        this._s3.abortMultipartUpload(params, (err, data) => {
            callback(err);
        });
    }
    beginRead(correlationId, id, callback) {
        this.getOneById(correlationId, id, (err, item) => {
            if (err == null && item == null) {
                err = new pip_services_commons_node_2.NotFoundException(correlationId, 'BLOB_NOT_FOUND', 'Blob ' + id + ' was not found').withDetails('blob_id', id);
            }
            callback(err, item);
        });
    }
    readChunk(correlationId, id, skip, take, callback) {
        let params = {
            Bucket: this._bucket,
            Key: id,
            Range: 'bytes=' + skip + '-' + (skip + take - 1)
        };
        this._s3.getObject(params, (err, data) => {
            if (err == null && data != null) {
                let chunk = data.Body.toString('base64');
                callback(null, chunk);
            }
            else
                callback(err, null);
        });
    }
    endRead(correlationId, id, callback) {
        if (callback)
            callback(null);
    }
    deleteById(correlationId, id, callback) {
        let params = {
            Bucket: this._bucket,
            Key: id
        };
        this._s3.deleteObject(params, callback);
    }
    deleteByIds(correlationId, ids, callback) {
        let params = {
            Bucket: this._bucket,
            Delete: {
                Objects: []
            }
        };
        _.each(ids, (id) => {
            params.Delete.Objects.push({ Key: id });
        });
        this._s3.deleteObjects(params, callback);
    }
    clear(correlationId, callback) {
        let params = {
            Bucket: this._bucket,
        };
        this._s3.listObjects(params, (err, data) => {
            if (err != null || data.Contents.length == 0) {
                if (callback)
                    callback(err);
                return;
            }
            let params = {
                Bucket: this._bucket,
                Delete: {
                    Objects: []
                }
            };
            _.each(data.Contents, (c) => {
                params.Delete.Objects.push({ Key: c.Key });
            });
            this._s3.deleteObjects(params, callback);
        });
    }
}
BlobsS3Persistence._defaultConfig = pip_services_commons_node_1.ConfigParams.fromTuples("connection.protocol", "aws", "connection.region", null, "connection.account_id", null, "connection.bucket", null, "connection.arn", null, "credential.access_id", null, "credential.access_key", null, "options.reduced_redundancy", true, "options.max_blob_size", 10 * 1024, "options.connect_timeout", 30000);
exports.BlobsS3Persistence = BlobsS3Persistence;
//# sourceMappingURL=BlobsS3Persistence.js.map