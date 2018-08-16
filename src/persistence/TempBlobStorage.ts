let _ = require('lodash');
let async = require('async');
let fs = require('fs');

import { ConfigParams } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { IOpenable } from 'pip-services-commons-node';
import { ICleanable } from 'pip-services-commons-node';
import { BadRequestException } from 'pip-services-commons-node';

export class TempBlobStorage implements IConfigurable, IOpenable, ICleanable {
    private _path: string = './data/temp';
    private _maxBlobSize: number = 100 * 1024;
    private _minChunkSize: number = 5 * 1024 * 1024;
    private _cleanupTimeout: number = 9000000;
    private _writeTimeout: number = 9000000;
    private _cleanupInterval: any = null;
    private _opened: boolean = false;

    public constructor(path?: string) {
        this._path = path || this._path;
    }

    public configure(config: ConfigParams): void {
        this._path = config.getAsStringWithDefault('temp_path', this._path);
        this._minChunkSize = config.getAsLongWithDefault('options.min_chunk_size', this._minChunkSize);
        this._maxBlobSize = config.getAsLongWithDefault('options.max_blob_size', this._maxBlobSize);
        this._cleanupTimeout = config.getAsLongWithDefault('options.cleanup_timeout', this._cleanupTimeout);
        this._writeTimeout = config.getAsLongWithDefault('options.write_timeout', this._writeTimeout);
    }

    public isOpen(): boolean {
        return this._opened;
    }

    public open(correlationId: string, callback?: (err: any) => void): void {
        if (this._opened == true) {
            if (callback) callback(null);
            return;
        }

        async.series([
            (callback) => {
                // Create filter if it doesn't exist
                if (!fs.existsSync(this._path))
                    fs.mkdir(this._path, callback);
                else callback();
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

    public close(correlationId: string, callback?: (err: any) => void): void {
        // Stop cleanup process
        if (this._cleanupInterval) {
            clearInterval(this._cleanupInterval);
            this._cleanupInterval = null;
        }

        this._opened = false;
        if (callback) callback(null);
    }

    public makeFileName(id: string): string {
        return this._path + '/' + id + '.tmp';
    }

    public getChunksSize(correlationId: string, id: string,
        callback: (err: any, size: number) => void): void {

        // Read temp size
        fs.stat(this.makeFileName(id), (err, stats) => {
            let size = stats != null ? stats.size : 0;
            if (err != null && err.code == 'ENOENT')
                err = null;

            callback(err, size);
        });
    }

    public appendChunk(correlationId: string, id: string, buffer: Buffer,
        callback: (err: any, size: number) => void): void {

        this.getChunksSize(correlationId, id, (err, size) => {
            // Enforce max blob size
            size = size + buffer.length;
            if (size > this._maxBlobSize) {
                let err = new BadRequestException(
                    correlationId,
                    'BLOB_TOO_LARGE',
                    'Blob ' + id + ' exceeds allowed maximum size of ' + this._maxBlobSize
                ).withDetails('blob_id', id)
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

    public readChunks(correlationId: string, id: string,
        callback: (err: any, buffer: Buffer) => void): void {
        fs.readFile(this.makeFileName(id), (err, data) => {
            if (err != null && err.code == 'ENOENT')
                err = null;
            callback(err, data);
        });
    }

    public deleteChunks(correlationId: string, id: string, callback: (err: any) => void): void {
        fs.unlink(this.makeFileName(id), (err) => {
            if (err != null && err.code == 'ENOENT')
                err = null;
            callback(err);
        });
    }

    public cleanup(correlationId: string, callback?: (err: any) => void): void {
        let cutoffTime = new Date().getTime() - this._writeTimeout;

        fs.readdir(this._path, (err, files) => {
            if (err == null) {
                files = _.filter(files, (file) => file.endsWith('.tmp'));
                async.each(files, (file, callback) => {
                    let path = this._path + '/' + file;
                    fs.stat(path, (err, stats) => {
                        if (err == null && stats != null && stats.birthtime.getTime() < cutoffTime)
                            fs.unlink(path, callback);
                        else callback(err);
                    });
                }, callback);
            } else callback(err);
        });
    }

    public clear(correlationId: string, callback?: (err: any) => void): void {
        fs.readdir(this._path, (err, files) => {
            if (err == null) {
                files = _.filter(files, (file) => file.endsWith('.dat'));
                async.each(files, (file, callback) => {
                    fs.unlink(this._path + '/' + file, callback);
                }, callback);
            } else callback(err);
        });
    }

}