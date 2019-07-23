let assert = require('chai').assert;
let grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
let async = require('async');

let services = require('../../../../src/protos/blobs_v1_grpc_pb');
let messages = require('../../../../src/protos/blobs_v1_pb');

import { Descriptor } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';
import { References } from 'pip-services3-commons-node';
import { IdGenerator } from 'pip-services3-commons-node';

import { BlobInfoV1 } from '../../../src/data/version1/BlobInfoV1';
import { BlobsMemoryPersistence } from '../../../src/persistence/BlobsMemoryPersistence';
import { BlobsController } from '../../../src/logic/BlobsController';
import { BlobsGrpcServiceV1 } from '../../../src/services/version1/BlobsGrpcServiceV1';

var grpcConfig = ConfigParams.fromTuples(
    "connection.protocol", "http",
    "connection.host", "localhost",
    "connection.port", 3000
);

suite('BlobsGrpcServiceV1', ()=> {
    let service: BlobsGrpcServiceV1;

    let client: any;

    suiteSetup((done) => {
        let persistence = new BlobsMemoryPersistence();
        let controller = new BlobsController();

        service = new BlobsGrpcServiceV1();
        service.configure(grpcConfig);

        let references: References = References.fromTuples(
            new Descriptor('pip-services-blobs', 'persistence', 'memory', 'default', '1.0'), persistence,
            new Descriptor('pip-services-blobs', 'controller', 'default', 'default', '1.0'), controller,
            new Descriptor('pip-services-blobs', 'service', 'grpc', 'default', '1.0'), service
        );
        controller.setReferences(references);
        service.setReferences(references);

        service.open(null, done);
    });
    
    suiteTeardown((done) => {
        service.close(null, done);
    });

    setup(() => {
        let packageDefinition = protoLoader.loadSync(
            __dirname + "../../../../../src/protos/blobs_v1.proto",
            {
                keepCase: true,
                longs: Number,
                enums: Number,
                defaults: true,
                oneofs: true
            }
        );
        let clientProto = grpc.loadPackageDefinition(packageDefinition).blobs_v1.Blobs;

        client = new clientProto('localhost:3000', grpc.credentials.createInsecure());
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

                client.begin_blob_write(
                    {
                        blob: blob
                    },
                    (err, response) => {
                        err = err || response.error;
                        let tok = response ? response.token : null;

                        assert.isNull(err);

                        token = tok;

                        callback();
                    }
                );
            },
        // Write blob
            (callback) => {
                let chunk = Buffer.from([1, 2, 3]).toString('base64');

                client.write_blob_chunk(
                    {
                        token: token,
                        chunk: chunk
                    },
                    (err, response) => {
                        err = err || response.error;
                        let tok = response ? response.token : null;

                        assert.isNull(err);
                        
                        token = tok;

                        callback();
                    }
                );
            },
        // Finish writing blob
            (callback) => {
                let chunk = Buffer.from([4, 5, 6]).toString('base64');

                client.end_blob_write(
                    {
                        token: token,
                        chunk: chunk
                    },
                    (err, response) => {
                        err = err || response.error;
                        let blob = response ? response.blob : null;

                        assert.isNull(err);
                        
                        callback();
                    }
                );
            },
        // Start reading
            (callback) => {
                client.begin_blob_read(
                    {
                        blob_id: blobId
                    },
                    (err, response) => {
                        err = err || response.error;
                        let blob = response ? response.blob : null;

                        assert.isNull(err);

                        assert.equal(6, blob.size);

                        callback();
                    }
                );
            },
        // Read first chunk
            (callback) => {
                client.read_blob_chunk(
                    {
                        blob_id: blobId,
                        skip: 0,
                        take: 3
                    },
                    (err, response) => {
                        err = err || response.error;
                        let chunk = response ? response.chunk : null;

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
                client.get_blobs_by_filter(
                    {
                    },
                    (err, response) => {
                        err = err || response.error;
                        let page = response ? response.page : null;

                        assert.isNull(err);

                        assert.lengthOf(page.data, 1);

                        callback();
                    }
                );
            },
        // Delete blob
            (callback) => {
                client.delete_blobs_by_ids(
                    {
                        blob_ids: [blobId]
                    },
                    (err, response) => {
                        err = err || response.error;

                        assert.isNull(err);

                        callback();
                    }
                );
            },
        // Try to get deleted blob
            (callback) => {
                client.get_blob_by_id(
                    {
                        blob_id: blobId
                    },
                    (err, response) => {
                        err = err || response.error;
                        let blob = response ? response.blob : null;

                        assert.isNull(err);
                        
                        //assert.isNull(blob);

                        callback();
                    }
                )
            }
        ], done);
    });
    
});
