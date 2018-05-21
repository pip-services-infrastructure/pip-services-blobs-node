let _ = require('lodash');
let async = require('async');
let restify = require('restify');
let assert = require('chai').assert;

import { ConfigParams } from 'pip-services-commons-node';
import { Descriptor } from 'pip-services-commons-node';
import { References } from 'pip-services-commons-node';
import { IdGenerator } from 'pip-services-commons-node';

import { BlobInfoV1 } from '../../../src/data/version1/BlobInfoV1';
import { BlobsMemoryPersistence } from '../../../src/persistence/BlobsMemoryPersistence';
import { BlobsController } from '../../../src/logic/BlobsController';
import { BlobsHttpServiceV1 } from '../../../src/services/version1/BlobsHttpServiceV1';

let httpConfig = ConfigParams.fromTuples(
    "connection.protocol", "http",
    "connection.host", "localhost",
    "connection.port", 3000
);


suite('BlobsHttpServiceV1', ()=> {
    let service: BlobsHttpServiceV1;
    let persistence: BlobsMemoryPersistence;
    let rest: any;

    suiteSetup((done) => {
        persistence = new BlobsMemoryPersistence();
        let controller = new BlobsController();

        service = new BlobsHttpServiceV1();
        service.configure(httpConfig);

        let references: References = References.fromTuples(
            new Descriptor('pip-services-blobs', 'persistence', 'memory', 'default', '1.0'), persistence,
            new Descriptor('pip-services-blobs', 'controller', 'default', 'default', '1.0'), controller,
            new Descriptor('pip-services-blobs', 'service', 'http', 'default', '1.0'), service
        );
        controller.setReferences(references);
        service.setReferences(references);

        service.open(null, done);
    });
    
    suiteTeardown((done) => {
        service.close(null, done);
    });

    setup((done) => {
        let url = 'http://localhost:3000';
        rest = restify.createJsonClient({ url: url, version: '*' });

        persistence.clear(null, (err) => {
            persistence.clear(null, done);
        });
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

                rest.post('/v1/blobs/begin_blob_write',
                    {
                        blob: blob
                    },
                    (err, req, res, tok) => {
                        assert.isNull(err);
                        token = tok;
                        callback();
                    }
                );
            },
        // Write blob
            (callback) => {
                let chunk = Buffer.from([1, 2, 3]).toString('base64');

                rest.post('/v1/blobs/write_blob_chunk',
                    {
                        token: token,
                        chunk: chunk
                    },
                    (err, req, res, tok) => {
                        assert.isNull(err);
                        token = tok;
                        callback();
                    }
                );
            },
        // Finish writing blob
            (callback) => {
                let chunk = Buffer.from([4, 5, 6]).toString('base64');

                rest.post('/v1/blobs/end_blob_write',
                    {
                        token: token,
                        chunk: chunk
                    },
                    (err, req, res, blob) => {
                        assert.isNull(err);
                        callback();
                    }
                );
            },
        // Start reading
            (callback) => {
                rest.post('/v1/blobs/begin_blob_read',
                    {
                        blob_id: blobId
                    },
                    (err, req, res, blob) => {
                        assert.isNull(err);

                        assert.equal(6, blob.size);

                        callback();
                    }
                );
            },
        // Read first chunk
            (callback) => {
                rest.post('/v1/blobs/read_blob_chunk',
                    {
                        blob_id: blobId,
                        skip: 0,
                        take: 3
                    },
                    (err, req, res, chunk) => {
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
                rest.post('/v1/blobs/get_blobs_by_filter',
                    {
                    },
                    (err, req, res, page) => {
                        assert.isNull(err);

                        assert.lengthOf(page.data, 1);

                        callback();
                    }
                );
            },
        // Delete blob
            (callback) => {
                rest.post('/v1/blobs/delete_blobs_by_ids',
                    {
                        blob_ids: [blobId]
                    },
                    (err, req, res) => {
                        assert.isNull(err);
                        callback();
                    }
                );
            },
        // Try to get deleted blob
            (callback) => {
                rest.post('/v1/blobs/get_blob_by_id',
                    {
                        blob_id: blobId
                    },
                    (err, req, res, blob) => {
                        assert.isNull(err);
                        //assert.isNull(blob);
                        callback();
                    }
                )
            }
        ], done);
    });
});