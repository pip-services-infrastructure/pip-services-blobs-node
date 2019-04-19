let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { Descriptor } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';
import { References } from 'pip-services3-commons-node';
import { ConsoleLogger } from 'pip-services3-components-node';
import { IdGenerator } from 'pip-services3-commons-node';

import { BlobInfoV1 } from '../../src/data/version1/BlobInfoV1';
import { BlobsController } from '../../src/logic/BlobsController';
import { BlobsLambdaFunction } from '../../src/container/BlobsLambdaFunction';

suite('BlobsLambdaFunction', ()=> {
    let lambda: BlobsLambdaFunction;

    suiteSetup((done) => {
        let config = ConfigParams.fromTuples(
            'logger.descriptor', 'pip-services:logger:console:default:1.0',
            'persistence.descriptor', 'pip-services-blobs:persistence:memory:default:1.0',
            'controller.descriptor', 'pip-services-blobs:controller:default:default:1.0'
        );

        lambda = new BlobsLambdaFunction();
        lambda.configure(config);
        lambda.open(null, done);
    });
    
    suiteTeardown((done) => {
        lambda.close(null, done);
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

                lambda.act(
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

                lambda.act(
                    {
                        role: 'blobs',
                        cmd: 'write_blob_chunk',
                        blob_id: blobId,
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

                lambda.act(
                    {
                        role: 'blobs',
                        cmd: 'end_blob_write',
                        blob_id: blobId,
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
                lambda.act(
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
                lambda.act(
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
                lambda.act(
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
                lambda.act(
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
                lambda.act(
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