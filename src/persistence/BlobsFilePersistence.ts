let _ = require('lodash');
let async = require('async');
let fs = require('fs');

import { ConfigParams } from 'pip-services-commons-node';
import { FilterParams } from 'pip-services-commons-node';
import { PagingParams } from 'pip-services-commons-node';
import { DataPage } from 'pip-services-commons-node';
import { JsonFilePersister } from 'pip-services-data-node';
import { NotFoundException } from 'pip-services-commons-node';
import { BadRequestException } from 'pip-services-commons-node';

import { BlobsMemoryPersistence } from './BlobsMemoryPersistence';
import { BlobInfoV1 } from '../data/version1/BlobInfoV1';
import { TempBlobStorage } from './TempBlobStorage';

export class BlobsFilePersistence extends BlobsMemoryPersistence {
	protected _persister: JsonFilePersister<BlobInfoV1>;
    protected _path: string = './data/blobs';
    protected _index: string = './data/blobs/index.json';
    protected _maxBlobSize: number = 100 * 1024;
    protected _storage: TempBlobStorage;

    public constructor(path?: string, index?: string) {
        super();

        this._path = path || this._path;
        this._index = index || this._path + '/index.json';

        this._storage = new TempBlobStorage(this._path);
        this._persister = new JsonFilePersister<BlobInfoV1>(this._index);
        this._loader = this._persister;
        this._saver = this._persister;
    }

    public configure(config: ConfigParams): void {
        config = new ConfigParams(config);
        this._storage.configure(config);

        this._path = config.getAsStringWithDefault('path', this._path);
        this._index = config.getAsStringWithDefault('index', this._path + '/index.json');
        this._maxBlobSize = config.getAsLongWithDefault('options.max_blob_size', this._maxBlobSize);

        // Override and set configuration
        config.setAsObject('path', this._index);
        super.configure(config);
        this._persister.configure(config);
    }

    public open(correlationId: string, callback?: (err: any) => void): void {
        async.series([
            (callback) => {
                // Open temp blob storage
                this._storage.open(correlationId, callback);
            },
            (callback) => {
                // Create folder if it doesn't exist
                if (!fs.existsSync(this._path))
                    fs.mkdir(this._path, callback);
                else callback();
            },
            (callback) => {
                // Close index
                super.open(correlationId, callback);
            }
        ], callback);
    }

    public close(correlationId: string, callback?: (err: any) => void): void {
        // Close temp blob storage
        this._storage.close(correlationId, (err) => {
            // Close index
            if (err == null)
                super.close(correlationId, callback);
            else if (callback) callback(err);
        });
    }

    protected makeFileName(id: string): string {
        return this._path + '/' + id + '.dat';
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
        
        super.beginWrite(correlationId, item, callback);
    }

    public writeChunk(correlationId: string, token: string, chunk: string,
        callback: (err: any, token: string) => void): void {
        let id = token;
        let buffer = Buffer.from(chunk, 'base64');
        this._storage.appendChunk(correlationId, id, buffer, (err, chunks) => {
            callback(err, token);
        });
    }

    public endWrite(correlationId: string, token: string, chunk: string,
        callback?: (err: any, item: BlobInfoV1) => void): void {
        let id = token;
        let buffer = Buffer.from(chunk, 'base64');
        let size = buffer.length;
        let append = false;
        let item: BlobInfoV1;

        async.series([
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
                        if (callback) callback(err);
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
            if (err) callback(err, null);
            else callback(null, item);
        });
    }
    
    public abortWrite(correlationId: string, token: string,
        callback?: (err: any) => void): void {
        let id = token;
        super.deleteById(correlationId, id, (err, item) => {
            this._storage.deleteChunks(correlationId, id, callback);
        });
    }

    public beginRead(correlationId: string, id: string,
        callback: (err: any, item: BlobInfoV1) => void): void {

        let filePath = this.makeFileName(id);

        if (!fs.existsSync(filePath)) {
            let err = new NotFoundException(
                correlationId, 
                'BLOB_NOT_FOUND', 
                'Blob ' + id + ' was not found'
            ).withDetails('blob_id', id)
            .withDetails('path', filePath);
            
            callback(err, null);
            return;
        }

        super.beginRead(correlationId, id, callback);
    }

    public readChunk(correlationId: string, id: string, skip: number, take: number,
        callback: (err: any, chunk: string) => void): void {

        fs.open(this.makeFileName(id), 'r', (err, fd) => {
            let buffer = new Buffer(take);
            if (err == null) {
                fs.read(fd, buffer, 0, take, skip, (err) => {
                    if (err == null) {
                        fs.close(fd, (err) => {
                            let result = buffer.toString('base64');
                            callback(err, result);
                        });
                    } else callback(err, null);
                });
            } else callback(err, null);
        });
    }

    public endRead(correlationId: string, id: string,
        callback?: (err: any) => void): void {
        if (callback) callback(null);
    }

    public deleteById(correlationId: string, id: string,
        callback?: (err: any, item: BlobInfoV1) => void): void {

        super.deleteById(correlationId, id, (err, item) => {
            fs.unlink(this.makeFileName(id), (err) => {
                if (err == null) { 
                    super.deleteById(correlationId, id, (err) => {
                        if (err && err.code == 'ENOENT') err = null;
                        if (callback) callback(err, item);
                    });
                } else if (callback) callback(err, null);
            });
        });
    }

    public deleteByIds(correlationId: string, ids: string[], callback?: (err: any) => void): void {
        super.deleteByIds(correlationId, ids, (err) => {
            if (err == null) {
                async.each(ids, (id, callback) => {
                    fs.unlink(this.makeFileName(id), (err) => {
                        if (err && err.code == 'ENOENT') err = null;
                        if (callback) callback(err);
                    });
                }, callback);
            } else if (callback) callback(err);
        });
    }

    public clear(correlationId: string, callback?: (err: any) => void): void {
        super.clear(correlationId, (err) => {
            if (err == null) {
                fs.readdir(this._path, (err, files) => {
                    if (err == null) {
                        files = _.filter(files, (file) => file.endsWith('.dat'));
                        async.each(files, (file, callback) => {
                            fs.unlink(this._path + '/' + file, callback);
                        }, callback);
                    } else callback(err);
                });
            } else if (callback) callback(err);
        });
    }
}