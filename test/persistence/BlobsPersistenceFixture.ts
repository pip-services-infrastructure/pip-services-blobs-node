let async = require('async');
let assert = require('chai').assert;

import { FilterParams } from 'pip-services-commons-node';
import { PagingParams } from 'pip-services-commons-node';
import { IdGenerator } from 'pip-services-commons-node';

import { BlobInfoV1 } from '../../src/data/version1/BlobInfoV1';
import { IBlobsPersistence } from '../../src/persistence/IBlobsPersistence';

let BLOB1 = new BlobInfoV1(null, 'test', 'files_image1.jpg', null, 'image/jpg');
let BLOB2 = new BlobInfoV1(null, 'test', 'files_image2.jpg', null, 'image/jpg');

export class BlobsPersistenceFixture {
    private _persistence: IBlobsPersistence;
    
    constructor(persistence: IBlobsPersistence) {
        assert.isNotNull(persistence);
        this._persistence = persistence;
    }

    public testCrudOperations(done) {
        let blob1, blob2;

        async.series([
        // Upload one blob
            (callback) => {
                this._persistence.beginWrite(
                    null,
                    BLOB1,
                    (err, token) => {
                        assert.isNull(err);

                        this._persistence.endWrite(
                            null, token, '', (err, blob) => {
                                assert.isNull(err);
                                
                                assert.isObject(blob);
                                blob1 = blob;

                                assert.equal(blob.name, BLOB1.name);
                                assert.equal(blob.group, BLOB1.group);
                                assert.equal(blob.content_type, BLOB1.content_type);

                                callback();
                            }
                        );
                    }
                );
            },
        // Upload another blob
            (callback) => {
                this._persistence.beginWrite(
                    null,
                    BLOB2,
                    (err, token) => {
                        assert.isNull(err);

                        this._persistence.endWrite(
                            null, token, '', (err, blob) => {
                                assert.isNull(err);
                                
                                assert.isObject(blob);
                                blob2 = blob;

                                assert.equal(blob.name, BLOB2.name);
                                assert.equal(blob.group, BLOB2.group);
                                assert.equal(blob.content_type, BLOB2.content_type);

                                callback();
                            }
                        );
                    }
                );
            },
        // Get all blobs
            (callback) => {
                this._persistence.getPageByFilter(
                    null,
                    FilterParams.fromValue({
                        group: 'test'
                    }),
                    new PagingParams(),
                    (err, blobs) => {
                        assert.isNull(err);
                        
                        assert.isObject(blobs);
                        assert.lengthOf(blobs.data, 2);

                        callback();
                    }
                );
            },
        // Get the blob
            (callback) => {
                this._persistence.getOneById(
                    null,
                    blob1.id,
                    (err, blob) => {
                        assert.isNull(err);
                        
                        assert.isObject(blob);
                        assert.equal(blob.id, blob1.id);

                        callback();
                    }
                );
            },
        // Update the blob
            (callback) => {
                blob1.name = "file1.xxx";

                this._persistence.update(
                    null,
                    blob1,
                    (err, blob) => {
                        assert.isNull(err);
                        
                        assert.isObject(blob);
                        blob1 = blob;

                        assert.equal(blob.id, blob1.id);
                        assert.equal(blob.name, 'file1.xxx');

                        callback();
                    }
                );
            },
        // Delete the blob
            (callback) => {
                this._persistence.deleteById(
                    null,
                    blob1.id,
                    (err) => {
                        assert.isNull(err);

                        callback();
                    }
                );
            },
        // Delete all blobs
            (callback) => {
                this._persistence.deleteByIds(
                    null,
                    [blob1.id, blob2.id],
                    (err) => {
                        assert.isNull(err);

                        callback();
                    }
                );
            },
        // Try to get deleted file
            (callback) => {
                this._persistence.getOneById(
                    null,
                    blob2.id,
                    (err, blob) => {
                        assert.isNull(err);

                        assert.isNull(blob || null);

                        callback();
                    }
                );
            }
        ], done);
    }

    public testReadAndWrite(done) {
        let blobId = IdGenerator.nextLong();
        let token: string = null;

        async.series([
        // Start writing blob
            (callback) => {
                let blob = new BlobInfoV1(
                    blobId, 'test', 'file-' + blobId + '.dat',  6, 'application/binary'
                );

                this._persistence.beginWrite(
                    null, blob,
                    (err, tok) => {
                        assert.isNull(err);
                        token = tok;
                        callback();
                    }
                );
            },
        // Write first chunk
            (callback) => {
                let chunk = Buffer.from([1, 2, 3]).toString('base64');

                this._persistence.writeChunk(
                    null, token, chunk, 
                    (err, tok) => {
                        assert.isNull(err);
                        token = tok;
                        callback();
                    }
                );
            },
        // Write second chunk
            (callback) => {
                let chunk = Buffer.from('\u0004\u0005\u0006', 'utf8').toString('base64');

                this._persistence.writeChunk(
                    null, token, chunk, 
                    (err, tok) => {
                        assert.isNull(err);
                        token = tok;
                        callback();
                    }
                );
            },
        // Finish writing blob
            (callback) => {
                this._persistence.endWrite(
                    null, token, '',
                    (err, blob) => {
                        assert.isNull(err);

                        assert.isObject(blob);
                        assert.equal(blob.id, blobId);

                        callback();
                    }
                );
            },
        // Start reading
            (callback) => {
                this._persistence.beginRead(
                    null, blobId,
                    (err, blob) => {
                        assert.isNull(err);

                        assert.isObject(blob);
                        assert.equal(blob.id, blobId);
                        assert.equal(6, blob.size);

                        callback();
                    }
                );
            },
        // Read first chunk
            (callback) => {
                this._persistence.readChunk(
                    null, blobId, 0, 3,
                    (err, chunk) => {
                        assert.isNull(err);

                        assert.isString(chunk);

                        let buffer = Buffer.from(chunk, 'base64');
                        assert.lengthOf(buffer, 3);
                        assert.equal(1, buffer[0]);
                        assert.equal(2, buffer[1]);
                        assert.equal(3, buffer[2]);

                        callback();
                    }
                );
            },
        // Read second chunk
            (callback) => {
                this._persistence.readChunk(
                    null, blobId, 3, 3,
                    (err, chunk) => {
                        assert.isNull(err);

                        let buffer = Buffer.from(chunk, 'base64');
                        assert.lengthOf(buffer, 3);
                        assert.equal(4, buffer[0]);
                        assert.equal(5, buffer[1]);
                        assert.equal(6, buffer[2]);

                        callback();
                    }
                );
            },
        // Finish reading blob
            (callback) => {
                this._persistence.endRead(
                    null, blobId, 
                    (err) => {
                        assert.isNull(err);
                        callback();
                    }
                );
            },
        // Finish writing blob
            (callback) => {
                this._persistence.getUri(
                    null, blobId,
                    (err, uri) => {
                        assert.isNull(err);
                        if (this._persistence.isUriSupported())
                            assert.isNotNull(uri)
                        else
                            assert.isNull(uri || null);
                        callback();
                    }
                );
            },
        // Delete blob
            (callback) => {
                this._persistence.deleteByIds(
                    null, [blobId],
                    (err) => {
                        assert.isNull(err);
                        callback();
                    }
                );
            },
        // Try to read delete blob
            (callback) => {
                this._persistence.beginRead(
                    null, blobId,
                    (err, blob) => {
                        assert.isNotNull(err);

                        assert.isNull(blob);

                        callback();
                    }
                );
            }
        ], done);
    }

    public testWriteInOneChunk(done) {
        let blobId = IdGenerator.nextLong();
        let token: string = null;

        async.series([
        // Start writing blob
            (callback) => {
                let blob = new BlobInfoV1(
                    blobId, 'test', 'файл-' + blobId + '.dat',  6, 'application/binary'
                );

                this._persistence.beginWrite(
                    null, blob,
                    (err, tok) => {
                        assert.isNull(err);
                        token = tok;
                        callback();
                    }
                );
            },
        // Write first and last chunk
            (callback) => {
                let chunk = Buffer.from([1, 2, 3]).toString('base64');

                this._persistence.endWrite(
                    null, token, chunk, 
                    (err, blob) => {
                        assert.isNull(err);
                        callback();
                    }
                );
            },
        // Start reading
            (callback) => {
                this._persistence.beginRead(
                    null, blobId,
                    (err, blob) => {
                        assert.isNull(err);

                        assert.isObject(blob);
                        assert.equal(blob.id, blobId);
                        assert.equal(3, blob.size);

                        callback();
                    }
                );
            },
        // Delete blob
            (callback) => {
                this._persistence.deleteById(
                    null, blobId,
                    (err) => {
                        assert.isNull(err);
                        callback();
                    }
                );
            }
        ], done);
    }

    public testGetUriForMissingBlob(done) {
        this._persistence.getUri(null, '123', (err, uri) => {
            assert.isNull(err);
            done();
        });
    }

    public testOverrideBlob(done) {
        let blobId = IdGenerator.nextLong();
        let token: string = null;

        async.series([
        // Start writing blob
            (callback) => {
                let blob = new BlobInfoV1(
                    blobId, 'test', 'file-' + blobId + '.dat',  6, 'application/binary'
                );

                this._persistence.beginWrite(
                    null, blob,
                    (err, tok) => {
                        assert.isNull(err);
                        token = tok;
                        callback();
                    }
                );
            },
        // Write first and last chunk
            (callback) => {
                let chunk = Buffer.from([1, 2, 3]).toString('base64');

                this._persistence.endWrite(
                    null, token, chunk, 
                    (err, blob) => {
                        assert.isNull(err);

                        assert.equal(blobId, blob.id);
                        assert.equal(3, blob.size);

                        callback();
                    }
                );
            },
        // Start writing blob same blob
            (callback) => {
                let blob = new BlobInfoV1(
                    blobId, 'test', 'file-' + blobId + '.bin',  6, 'application/binary'
                );

                this._persistence.beginWrite(
                    null, blob,
                    (err, tok) => {
                        assert.isNull(err);
                        token = tok;
                        callback();
                    }
                );
            },
        // Write first and last chunk
            (callback) => {
                let chunk = Buffer.from([3, 4, 5, 6]).toString('base64');

                this._persistence.endWrite(
                    null, token, chunk, 
                    (err, blob) => {
                        assert.isNull(err);

                        assert.equal(blobId, blob.id);
                        assert.equal(4, blob.size);

                        callback();
                    }
                );
            },
        ], done);
    }

}
