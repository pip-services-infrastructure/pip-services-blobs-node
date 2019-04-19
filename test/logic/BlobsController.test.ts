let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { Descriptor } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';
import { References } from 'pip-services3-commons-node';
import { ConsoleLogger } from 'pip-services3-components-node';
import { IdGenerator } from 'pip-services3-commons-node';

import { BlobInfoV1 } from '../../src/data/version1/BlobInfoV1';
import { BlobsMemoryPersistence } from '../../src/persistence/BlobsMemoryPersistence';
import { BlobsController } from '../../src/logic/BlobsController';

suite('BlobsController', ()=> {
    let persistence: BlobsMemoryPersistence;
    let controller: BlobsController;

    suiteSetup((done) => {
        persistence = new BlobsMemoryPersistence();
        controller = new BlobsController();

        let logger = new ConsoleLogger();

        let references: References = References.fromTuples(
            new Descriptor('pip-services', 'logger', 'console', 'default', '1.0'), logger,
            new Descriptor('pip-services-blobs', 'persistence', 'memory', 'default', '1.0'), persistence,
            new Descriptor('pip-services-blobs', 'controller', 'default', 'default', '1.0'), controller,
        );
        controller.setReferences(references);

        done();
    });
        
    setup((done) => {
        persistence.clear(null, done);
    });
    
    test('CRUD Operations', (done) => {
        let blobId = IdGenerator.nextLong();
        let token: string = null;

        async.series([
        // Start writing blob
            (callback) => {
                let blob = new BlobInfoV1(
                    blobId, 'test', 'file-' + blobId + '.dat', 6, 'application/binary'
                );

                controller.beginBlobWrite(
                    null, blob,
                    (err, tok) => {
                        assert.isNull(err);
                        token = tok;
                        callback();
                    }
                );
            },
        // Write blob
            (callback) => {
                let chunk = Buffer.from([1, 2, 3]).toString('base64');

                controller.writeBlobChunk(
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
                let chunk = Buffer.from([4, 5, 6]).toString('base64');

                controller.endBlobWrite(
                    null, token, chunk,
                    (err, blob) => {
                        assert.isNull(err);
                        callback();
                    }
                );
            },
        // Start reading
            (callback) => {
                controller.beginBlobRead(
                    null, blobId,
                    (err, blob) => {
                        assert.isNull(err);

                        assert.equal(6, blob.size);

                        callback();
                    }
                );
            },
        // Read first chunk
            (callback) => {
                controller.readBlobChunk(
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
        // Get blobs
            (callback) => {
                controller.getBlobsByFilter(
                    null, null, null, 
                    (err, page) => {
                        assert.isNull(err);

                        assert.lengthOf(page.data, 1);

                        callback();
                    }
                );
            },
        // Delete blob
            (callback) => {
                controller.deleteBlobsByIds(
                    null, [blobId],
                    (err) => {
                        assert.isNull(err);
                        callback();
                    }
                );
            },
        // Try to get deleted blob
            (callback) => {
                controller.getBlobById(
                    null, blobId, (err, blob) => {
                        assert.isNull(err);
                        assert.isNull(blob);
                        callback();
                    }
                )
            }
        ], done);
    });
});