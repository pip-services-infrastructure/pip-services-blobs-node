"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
let fs = require('fs');
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_data_node_1 = require("pip-services-data-node");
const pip_services_commons_node_2 = require("pip-services-commons-node");
const BlobsMemoryPersistence_1 = require("./BlobsMemoryPersistence");
const TempBlobStorage_1 = require("./TempBlobStorage");
class BlobsFilePersistence extends BlobsMemoryPersistence_1.BlobsMemoryPersistence {
    constructor(path, index) {
        super();
        this._path = './data/blobs';
        this._index = './data/blobs/index.json';
        this._maxBlobSize = 100 * 1024;
        this._path = path || this._path;
        this._index = index || this._path + '/index.json';
        this._storage = new TempBlobStorage_1.TempBlobStorage(this._path);
        this._persister = new pip_services_data_node_1.JsonFilePersister(this._index);
        this._loader = this._persister;
        this._saver = this._persister;
    }
    configure(config) {
        config = new pip_services_commons_node_1.ConfigParams(config);
        this._storage.configure(config);
        this._path = config.getAsStringWithDefault('path', this._path);
        this._index = config.getAsStringWithDefault('index', this._path + '/index.json');
        this._maxBlobSize = config.getAsLongWithDefault('options.max_blob_size', this._maxBlobSize);
        // Override and set configuration
        config.setAsObject('path', this._index);
        super.configure(config);
        this._persister.configure(config);
    }
    open(correlationId, callback) {
        async.series([
            (callback) => {
                // Open temp blob storage
                this._storage.open(correlationId, callback);
            },
            (callback) => {
                // Create folder if it doesn't exist
                if (!fs.existsSync(this._path))
                    fs.mkdir(this._path, callback);
                else
                    callback();
            },
            (callback) => {
                // Close index
                super.open(correlationId, callback);
            }
        ], callback);
    }
    close(correlationId, callback) {
        // Close temp blob storage
        this._storage.close(correlationId, (err) => {
            // Close index
            if (err == null)
                super.close(correlationId, callback);
            else if (callback)
                callback(err);
        });
    }
    makeFileName(id) {
        return this._path + '/' + id + '.dat';
    }
    isUriSupported() {
        return false;
    }
    getUri(correlationId, id, callback) {
        callback(null, null);
    }
    beginWrite(correlationId, item, callback) {
        super.beginWrite(correlationId, item, callback);
    }
    writeChunk(correlationId, token, chunk, callback) {
        let id = token;
        let buffer = Buffer.from(chunk, 'base64');
        this._storage.appendChunk(correlationId, id, buffer, (err, chunks) => {
            callback(err, token);
        });
    }
    endWrite(correlationId, token, chunk, callback) {
        let id = token;
        let buffer = Buffer.from(chunk, 'base64');
        let size = buffer.length;
        let append = false;
        let item;
        async.series([
            // Get blob info
            (callback) => {
                super.getOneById(correlationId, id, (err, data) => {
                    if (err == null && data == null) {
                        err = new pip_services_commons_node_2.NotFoundException(correlationId, 'BLOB_NOT_FOUND', 'Blob ' + id + ' was not found').withDetails('blob_id', id);
                    }
                    item = data;
                    callback(err);
                });
            },
            // Read current size and decide to append or to write from scratch
            (callback) => {
                this._storage.getChunksSize(correlationId, id, (err, writtenSize) => {
                    append = writtenSize > 0;
                    size += writtenSize;
                    callback();
                });
            },
            // Append existing file and rename
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
                    let oldPath = this._storage.makeFileName(id);
                    let newPath = this.makeFileName(id);
                    fs.rename(oldPath, newPath, (err) => {
                        callback(err);
                    });
                });
            },
            // Write blob from scratch
            (callback) => {
                if (append) {
                    callback();
                    return;
                }
                // If it's the first chunk then upload it without writing to temp file
                fs.writeFile(this.makeFileName(id), buffer, callback);
            },
            // Update blob info with size and create time
            (callback) => {
                let buffer = this._content[id];
                item.create_time = new Date();
                item.size = size;
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
        super.deleteById(correlationId, id, (err, item) => {
            this._storage.deleteChunks(correlationId, id, callback);
        });
    }
    beginRead(correlationId, id, callback) {
        let filePath = this.makeFileName(id);
        if (!fs.existsSync(filePath)) {
            let err = new pip_services_commons_node_2.NotFoundException(correlationId, 'BLOB_NOT_FOUND', 'Blob ' + id + ' was not found').withDetails('blob_id', id)
                .withDetails('path', filePath);
            callback(err, null);
            return;
        }
        super.getOneById(correlationId, id, callback);
    }
    readChunk(correlationId, id, skip, take, callback) {
        fs.open(this.makeFileName(id), 'r', (err, fd) => {
            let buffer = new Buffer(take);
            if (err == null) {
                fs.read(fd, buffer, 0, take, skip, (err) => {
                    if (err == null) {
                        fs.close(fd, (err) => {
                            let result = buffer.toString('base64');
                            callback(err, result);
                        });
                    }
                    else
                        callback(err, null);
                });
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
        super.deleteById(correlationId, id, (err, item) => {
            fs.unlink(this.makeFileName(id), (err) => {
                if (err == null) {
                    super.deleteById(correlationId, id, (err) => {
                        if (err && err.code == 'ENOENT')
                            err = null;
                        if (callback)
                            callback(err, item);
                    });
                }
                else if (callback)
                    callback(err, null);
            });
        });
    }
    deleteByIds(correlationId, ids, callback) {
        super.deleteByIds(correlationId, ids, (err) => {
            if (err == null) {
                async.each(ids, (id, callback) => {
                    fs.unlink(this.makeFileName(id), (err) => {
                        if (err && err.code == 'ENOENT')
                            err = null;
                        if (callback)
                            callback(err);
                    });
                }, callback);
            }
            else if (callback)
                callback(err);
        });
    }
    clear(correlationId, callback) {
        super.clear(correlationId, (err) => {
            if (err == null) {
                fs.readdir(this._path, (err, files) => {
                    if (err == null) {
                        files = _.filter(files, (file) => file.endsWith('.dat'));
                        async.each(files, (file, callback) => {
                            fs.unlink(this._path + '/' + file, callback);
                        }, callback);
                    }
                    else
                        callback(err);
                });
            }
            else if (callback)
                callback(err);
        });
    }
}
exports.BlobsFilePersistence = BlobsFilePersistence;
//# sourceMappingURL=BlobsFilePersistence.js.map