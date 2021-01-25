"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlobsMongoDbPersistence = void 0;
let _ = require('lodash');
let async = require('async');
let stream = require('stream');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const pip_services3_mongoose_node_1 = require("pip-services3-mongoose-node");
const pip_services3_commons_node_4 = require("pip-services3-commons-node");
const pip_services3_commons_node_5 = require("pip-services3-commons-node");
const pip_services3_commons_node_6 = require("pip-services3-commons-node");
const pip_services3_commons_node_7 = require("pip-services3-commons-node");
const pip_services3_commons_node_8 = require("pip-services3-commons-node");
const pip_services3_commons_node_9 = require("pip-services3-commons-node");
const TempBlobStorage_1 = require("./TempBlobStorage");
class BlobsMongoDbPersistence extends pip_services3_mongoose_node_1.MongoosePersistence {
    constructor() {
        super('blobs', null);
        this._storage = new TempBlobStorage_1.TempBlobStorage('./data/temp');
        this._maxBlobSize = 100 * 1024;
        this._maxPageSize = 100;
    }
    configure(config) {
        super.configure(config);
        this._storage.configure(config);
        this._maxBlobSize = config.getAsLongWithDefault('options.max_blob_size', this._maxBlobSize);
        this._maxPageSize = config.getAsIntegerWithDefault("options.max_page_size", this._maxPageSize);
    }
    open(correlationId, callback) {
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
    close(correlationId, callback) {
        // Close temp blob storage
        this._storage.close(correlationId, (err) => {
            this._GridStore = null;
            super.close(correlationId, callback);
        });
    }
    composeFilter(filter) {
        filter = filter || new pip_services3_commons_node_7.FilterParams();
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
    getPageByFilter(correlationId, filter, paging, callback) {
        let collection = this._connection.getDatabase().collection(this._collection + '.files');
        let criteria = this.composeFilter(filter);
        // Adjust max item count based on configuration
        let options = {};
        paging = paging || new pip_services3_commons_node_8.PagingParams();
        let skip = paging.getSkip(-1);
        if (skip >= 0)
            options.skip = skip;
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
                    let page = new pip_services3_commons_node_9.DataPage(items, count);
                    callback(null, page);
                });
            }
            else {
                let page = new pip_services3_commons_node_9.DataPage(items);
                callback(null, page);
            }
        });
    }
    getListByIds(correlationId, ids, callback) {
        let collection = this._connection.getDatabase().collection(this._collection + '.files');
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
    getOneById(correlationId, id, callback) {
        let collection = this._connection.getDatabase().collection(this._collection + '.files');
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
    update(correlationId, item, callback) {
        let collection = this._connection.getDatabase().collection(this._collection + '.files');
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
        };
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
    markCompleted(correlationId, ids, callback) {
        let collection = this._connection.getDatabase().collection(this._collection + '.files');
        let criteria = {
            filename: { $in: ids }
        };
        let doc = {
            $set: {
                'metadata.completed': true
            }
        };
        let options = {
            multi: true
        };
        collection.update(criteria, doc, options, (err) => {
            callback(err);
        });
    }
    isUriSupported() {
        return false;
    }
    getUri(correlationId, id, callback) {
        callback(null, null);
    }
    infoToToken(item) {
        let data = pip_services3_commons_node_1.ConfigParams.fromValue(item);
        return data.toString();
    }
    tokenToInfo(token) {
        let data = pip_services3_commons_node_1.ConfigParams.fromString(token);
        return {
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
    beginWrite(correlationId, item, callback) {
        if (item.size != null && item.size > this._maxBlobSize) {
            let err = new pip_services3_commons_node_2.BadRequestException(correlationId, 'BLOB_TOO_LARGE', 'Blob ' + item.id + ' exceeds allowed maximum size of ' + this._maxBlobSize).withDetails('blob_id', item.id)
                .withDetails('size', item.size)
                .withDetails('max_size', this._maxBlobSize);
            callback(err, null);
            return;
        }
        item.id = item.id || pip_services3_commons_node_4.IdGenerator.nextLong();
        let token = this.infoToToken(item);
        callback(null, token);
    }
    writeChunk(correlationId, token, chunk, callback) {
        let item = this.tokenToInfo(token);
        chunk = chunk || "";
        let buffer = Buffer.from(chunk, 'base64');
        this._storage.appendChunk(correlationId, item.id, buffer, (err, chunks) => {
            callback(err, token);
        });
    }
    endWrite(correlationId, token, chunk, callback) {
        chunk = chunk || "";
        let buffer = Buffer.from(chunk, 'base64');
        let item = this.tokenToInfo(token);
        let id = item.id;
        let metadata = _.pick(item, 'group', 'name', 'expire_time', 'completed');
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
                        if (callback)
                            callback(err);
                        return;
                    }
                    // Open and seek to define blob size
                    let gs = new this._GridStore(this._connection.getDatabase(), id, "w", {
                        root: this._collection,
                        content_type: item.content_type,
                        metadata: metadata
                    });
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
                            }
                            else
                                callback(err);
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
                let gs = new this._GridStore(this._connection.getDatabase(), id, "w", {
                    root: this._collection,
                    content_type: item.content_type,
                    metadata: metadata
                });
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
                        }
                        else
                            callback(err);
                    });
                });
            }
        ], (err) => {
            callback(err, item);
        });
    }
    abortWrite(correlationId, token, callback) {
        let item = this.tokenToInfo(token);
        let id = item.id;
        this._storage.deleteChunks(correlationId, id, callback);
    }
    gridToInfo(gs) {
        if (gs == null)
            return null;
        let metadata = gs.metadata || {};
        return {
            id: gs.filename,
            group: metadata.group,
            name: metadata.name,
            size: gs.length,
            content_type: gs.contentType,
            create_time: pip_services3_commons_node_6.DateTimeConverter.toNullableDateTime(gs.uploadDate),
            expire_time: pip_services3_commons_node_6.DateTimeConverter.toNullableDateTime(metadata.expire_time),
            completed: pip_services3_commons_node_5.BooleanConverter.toBoolean(metadata.completed)
        };
    }
    beginRead(correlationId, id, callback) {
        this._GridStore.exist(this._connection.getDatabase(), id, this._collection, (err, exist) => {
            if (err == null && exist == false) {
                err = new pip_services3_commons_node_3.NotFoundException(correlationId, 'BLOB_NOT_FOUND', 'Blob ' + id + ' was not found')
                    .withDetails('blob_id', id);
            }
            if (err) {
                callback(err, null);
                return;
            }
            // Open and seek to define blob size
            let gs = new this._GridStore(this._connection.getDatabase(), id, "r", { root: this._collection });
            gs.open((err, gs) => {
                if (err != null) {
                    callback(err, null);
                    return;
                }
                gs.close((err) => {
                    if (err == null) {
                        let item = this.gridToInfo(gs);
                        callback(null, item);
                    }
                    else
                        callback(err, null);
                });
            });
        });
    }
    readChunk(correlationId, id, skip, take, callback) {
        this._GridStore.read(this._connection.getDatabase(), id, take, skip, { root: this._collection }, (err, data) => {
            if (err) {
                callback(err, null);
                return;
            }
            let result = Buffer.from(data).toString('base64');
            callback(err, result);
        });
    }
    endRead(correlationId, id, callback) {
        if (callback)
            callback(null);
    }
    deleteById(correlationId, id, callback) {
        this._GridStore.unlink(this._connection.getDatabase(), id, { root: this._collection }, (err, result) => {
            if (callback)
                callback(err);
        });
    }
    deleteByIds(correlationId, ids, callback) {
        this._GridStore.unlink(this._connection.getDatabase(), ids, { root: this._collection }, (err, result) => {
            if (callback)
                callback(err);
        });
    }
    clear(correlationId, callback) {
        this._GridStore.list(this._connection.getDatabase(), this._collection, (err, ids) => {
            if (err) {
                if (callback)
                    callback(err);
                return;
            }
            async.each(ids, (id, callback) => {
                if (id == null) {
                    callback();
                    return;
                }
                this._GridStore.unlink(this._connection.getDatabase(), id, { root: this._collection }, (err, result) => {
                    callback(err);
                });
            }, callback);
        });
    }
}
exports.BlobsMongoDbPersistence = BlobsMongoDbPersistence;
//# sourceMappingURL=BlobsMongoDbPersistence.js.map