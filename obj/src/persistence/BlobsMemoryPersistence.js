"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const pip_services3_commons_node_4 = require("pip-services3-commons-node");
const pip_services3_data_node_1 = require("pip-services3-data-node");
class BlobsMemoryPersistence extends pip_services3_data_node_1.IdentifiableMemoryPersistence {
    constructor() {
        super();
        this._content = {};
        this._maxBlobSize = 100 * 1024;
    }
    configure(config) {
        super.configure(config);
        this._maxBlobSize = config.getAsLongWithDefault('options.max_blob_size', this._maxBlobSize);
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
        filter = filter || new pip_services3_commons_node_1.FilterParams();
        let search = filter.getAsNullableString('search');
        let id = filter.getAsNullableString('id');
        let name = filter.getAsNullableString('name');
        let group = filter.getAsNullableString('group');
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
        super.getPageByFilter(correlationId, this.composeFilter(filter), paging, null, null, callback);
    }
    markCompleted(correlationId, ids, callback) {
        async.each(ids, (id, callback) => {
            let data = pip_services3_commons_node_2.AnyValueMap.fromTuples('completed', true);
            super.updatePartially(correlationId, id, data, callback);
        }, callback);
    }
    deleteById(correlationId, id, callback) {
        delete this._content[id];
        super.deleteById(correlationId, id, callback);
    }
    deleteByIds(correlationId, ids, callback) {
        _.each(ids, (id) => {
            delete this._content[id];
        });
        super.deleteByIds(correlationId, ids, callback);
    }
    clear(correlationId, callback) {
        this._content = {};
        super.clear(correlationId, callback);
    }
    isUriSupported() {
        return false;
    }
    getUri(correlationId, id, callback) {
        callback(null, null);
    }
    beginWrite(correlationId, item, callback) {
        if (item.size != null && item.size > this._maxBlobSize) {
            let err = new pip_services3_commons_node_4.BadRequestException(correlationId, 'BLOB_TOO_LARGE', 'Blob ' + item.id + ' exceeds allowed maximum size of ' + this._maxBlobSize).withDetails('blob_id', item.id)
                .withDetails('size', item.size)
                .withDetails('max_size', this._maxBlobSize);
            callback(err, null);
            return;
        }
        super.create(correlationId, item, (err, item) => {
            let buffer = new Buffer([]);
            this._content[item.id] = buffer;
            callback(null, item.id);
        });
    }
    writeChunk(correlationId, token, chunk, callback) {
        let id = token;
        let oldBuffer = this._content[id];
        if (oldBuffer == null) {
            let err = new pip_services3_commons_node_3.NotFoundException(correlationId, 'BLOB_NOT_FOUND', 'Blob ' + id + ' was not found').withDetails('blob_id', id);
            callback(err, null);
            return;
        }
        // Enforce maximum size
        let chunkLength = chunk ? chunk.length : 0;
        if (this._maxBlobSize > 0 && oldBuffer.length + chunkLength > this._maxBlobSize) {
            let err = new pip_services3_commons_node_4.BadRequestException(correlationId, 'BLOB_TOO_LARGE', 'Blob ' + id + ' exceeds allowed maximum size of ' + this._maxBlobSize).withDetails('blob_id', id)
                .withDetails('size', oldBuffer.length + chunkLength)
                .withDetails('max_size', this._maxBlobSize);
            callback(err, null);
            return;
        }
        let buffer = new Buffer("", "base64");
        if (chunk != null && chunk.length > 0)
            buffer = Buffer.from(chunk, 'base64');
        this._content[id] = Buffer.concat([oldBuffer, buffer]);
        callback(null, token);
    }
    endWrite(correlationId, token, chunk, callback) {
        let id = token;
        let item;
        async.series([
            // Write last chunk of the blob
            (callback) => {
                this.writeChunk(correlationId, token, chunk, callback);
            },
            // Get blob info
            (callback) => {
                super.getOneById(correlationId, id, (err, data) => {
                    if (err == null && data == null) {
                        err = new pip_services3_commons_node_3.NotFoundException(correlationId, 'BLOB_NOT_FOUND', 'Blob ' + id + ' was not found').withDetails('blob_id', id);
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
            if (err)
                callback(err, null);
            else
                callback(null, item);
        });
    }
    abortWrite(correlationId, token, callback) {
        let id = token;
        this.deleteById(correlationId, id, callback);
    }
    beginRead(correlationId, id, callback) {
        let oldBuffer = this._content[id];
        if (oldBuffer == null) {
            let err = new pip_services3_commons_node_3.NotFoundException(correlationId, 'BLOB_NOT_FOUND', 'Blob ' + id + ' was not found').withDetails('blob_id', id);
            callback(err, null);
            return;
        }
        super.getOneById(correlationId, id, callback);
    }
    readChunk(correlationId, id, skip, take, callback) {
        let oldBuffer = this._content[id];
        if (oldBuffer == null) {
            let err = new pip_services3_commons_node_3.NotFoundException(correlationId, 'BLOB_NOT_FOUND', 'Blob ' + id + ' was not found').withDetails('blob_id', id);
            callback(err, null);
            return;
        }
        let result = oldBuffer.toString('base64', skip, skip + take);
        callback(null, result);
    }
    endRead(correlationId, id, callback) {
        if (callback)
            callback(null);
    }
}
exports.BlobsMemoryPersistence = BlobsMemoryPersistence;
//# sourceMappingURL=BlobsMemoryPersistence.js.map