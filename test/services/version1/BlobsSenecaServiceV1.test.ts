let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { Descriptor } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { References } from 'pip-services-commons-node';
import { ConsoleLogger } from 'pip-services-commons-node';
import { SenecaInstance } from 'pip-services-net-node';
import { IdGenerator } from 'pip-services-commons-node';

import { BlobInfoV1 } from '../../../src/data/version1/BlobInfoV1';
import { BlobsMemoryPersistence } from '../../../src/persistence/BlobsMemoryPersistence';
import { BlobsController } from '../../../src/logic/BlobsController';
import { BlobsSenecaServiceV1 } from '../../../src/services/version1/BlobsSenecaServiceV1';


suite('BlobsSenecaServiceV1', ()=> {
    let seneca: any;
    let service: BlobsSenecaServiceV1;
    let persistence: BlobsMemoryPersistence;
    let controller: BlobsController;

    suiteSetup((done) => {
        persistence = new BlobsMemoryPersistence();
        controller = new BlobsController();

        service = new BlobsSenecaServiceV1();
        service.configure(ConfigParams.fromTuples(
            "connection.protocol", "none"
        ));

        let logger = new ConsoleLogger();
        let senecaAddon = new SenecaInstance();

        let references: References = References.fromTuples(
            new Descriptor('pip-services-commons', 'logger', 'console', 'default', '1.0'), logger,
            new Descriptor('pip-services-net', 'seneca', 'instance', 'default', '1.0'), senecaAddon,
            new Descriptor('pip-services-blobs', 'persistence', 'memory', 'default', '1.0'), persistence,
            new Descriptor('pip-services-blobs', 'controller', 'default', 'default', '1.0'), controller,
            new Descriptor('pip-services-blobs', 'service', 'seneca', 'default', '1.0'), service
        );

        controller.setReferences(references);
        service.setReferences(references);

        seneca = senecaAddon.getInstance();

        service.open(null, done);
    });
    
    suiteTeardown((done) => {
        service.close(null, done);
    });
    
    setup((done) => {
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

                seneca.act(
                    {
                        role: 'blobs',
                        cmd: 'begin_blob_write',
                        blob: blob
                    },
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

                seneca.act(
                    {
                        role: 'blobs',
                        cmd: 'write_blob_chunk',
                        token: token,
                        chunk: chunk
                    },
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

                seneca.act(
                    {
                        role: 'blobs',
                        cmd: 'end_blob_write',
                        token: token,
                        chunk: chunk
                    },
                    (err, blob) => {
                        assert.isNull(err);
                        callback();
                    }
                );
            },
        // Start reading
            (callback) => {
                seneca.act(
                    {
                        role: 'blobs',
                        cmd: 'begin_blob_read',
                        blob_id: blobId
                    },
                    (err, blob) => {
                        assert.isNull(err);

                        assert.equal(6, blob.size);

                        callback();
                    }
                );
            },
        // Read first chunk
            (callback) => {
                seneca.act(
                    {
                        role: 'blobs',
                        cmd: 'read_blob_chunk',
                        blob_id: blobId,
                        skip: 0,
                        take: 3
                    },
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
                seneca.act(
                    {
                        role: 'blobs',
                        cmd: 'get_blobs_by_filter'
                    },
                    (err, page) => {
                        assert.isNull(err);

                        assert.lengthOf(page.data, 1);

                        callback();
                    }
                );
            },
        // Delete blob
            (callback) => {
                seneca.act(
                    {
                        role: 'blobs',
                        cmd: 'delete_blobs_by_ids',
                        blob_ids: [blobId]
                    },
                    (err) => {
                        assert.isNull(err);
                        callback();
                    }
                );
            },
        // Try to get deleted blob
            (callback) => {
                seneca.act(
                    {
                        role: 'blobs',
                        cmd: 'get_blob_by_id',
                        blob_id: blobId
                    },
                    (err, blob) => {
                        assert.isNull(err);
                        assert.isNull(blob);
                        callback();
                    }
                )
            }
        ], done);
    });
});