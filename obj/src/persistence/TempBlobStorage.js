"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TempBlobStorage = void 0;
let _ = require('lodash');
let async = require('async');
let fs = require('fs');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
class TempBlobStorage {
    constructor(path) {
        this._path = './data/temp';
        this._maxBlobSize = 100 * 1024;
        this._minChunkSize = 5 * 1024 * 1024;
        this._cleanupTimeout = 9000000;
        this._writeTimeout = 9000000;
        this._cleanupInterval = null;
        this._opened = false;
        this._path = path || this._path;
    }
    configure(config) {
        this._path = config.getAsStringWithDefault('temp_path', this._path);
        this._minChunkSize = config.getAsLongWithDefault('options.min_chunk_size', this._minChunkSize);
        this._maxBlobSize = config.getAsLongWithDefault('options.max_blob_size', this._maxBlobSize);
        this._cleanupTimeout = config.getAsLongWithDefault('options.cleanup_timeout', this._cleanupTimeout);
        this._writeTimeout = config.getAsLongWithDefault('options.write_timeout', this._writeTimeout);
    }
    isOpen() {
        return this._opened;
    }
    open(correlationId, callback) {
        if (this._opened == true) {
            if (callback)
                callback(null);
            return;
        }
        async.series([
            (callback) => {
                // Create filter if it doesn't exist
                if (!fs.existsSync(this._path))
                    fs.mkdir(this._path, callback);
                else
                    callback();
            },
            (callback) => {
                // Restart cleanup process
                if (this._cleanupInterval)
                    clearInterval(this._cleanupInterval);
                this._cleanupInterval = setInterval(() => {
                    this.cleanup(null);
                }, this._cleanupTimeout);
                callback();
            }
        ], (err) => {
            if (err == null)
                this._opened = true;
            callback(err);
        });
    }
    close(correlationId, callback) {
        // Stop cleanup process
        if (this._cleanupInterval) {
            clearInterval(this._cleanupInterval);
            this._cleanupInterval = null;
        }
        this._opened = false;
        if (callback)
            callback(null);
    }
    makeFileName(id) {
        return this._path + '/' + id + '.tmp';
    }
    getChunksSize(correlationId, id, callback) {
        // Read temp size
        fs.stat(this.makeFileName(id), (err, stats) => {
            let size = stats != null ? stats.size : 0;
            if (err != null && err.code == 'ENOENT')
                err = null;
            callback(err, size);
        });
    }
    appendChunk(correlationId, id, buffer, callback) {
        this.getChunksSize(correlationId, id, (err, size) => {
            // Enforce max blob size
            size = size + buffer.length;
            if (size > this._maxBlobSize) {
                let err = new pip_services3_commons_node_1.BadRequestException(correlationId, 'BLOB_TOO_LARGE', 'Blob ' + id + ' exceeds allowed maximum size of ' + this._maxBlobSize).withDetails('blob_id', id)
                    .withDetails('size', size)
                    .withDetails('max_size', this._maxBlobSize);
            }
            if (err != null) {
                callback(err, null);
                return;
            }
            fs.appendFile(this.makeFileName(id), buffer, (err) => {
                callback(err, size);
            });
        });
    }
    readChunks(correlationId, id, callback) {
        fs.readFile(this.makeFileName(id), (err, data) => {
            if (err != null && err.code == 'ENOENT')
                err = null;
            callback(err, data);
        });
    }
    deleteChunks(correlationId, id, callback) {
        fs.unlink(this.makeFileName(id), (err) => {
            if (err != null && err.code == 'ENOENT')
                err = null;
            callback(err);
        });
    }
    cleanup(correlationId, callback) {
        let cutoffTime = new Date().getTime() - this._writeTimeout;
        fs.readdir(this._path, (err, files) => {
            if (err == null) {
                files = _.filter(files, (file) => file.endsWith('.tmp'));
                async.each(files, (file, callback) => {
                    let path = this._path + '/' + file;
                    fs.stat(path, (err, stats) => {
                        if (err == null && stats != null && stats.birthtime.getTime() < cutoffTime)
                            fs.unlink(path, callback);
                        else
                            callback(err);
                    });
                }, callback);
            }
            else
                callback(err);
        });
    }
    clear(correlationId, callback) {
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
}
exports.TempBlobStorage = TempBlobStorage;
//# sourceMappingURL=TempBlobStorage.js.map