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
import { BlobsCommandableGrpcServiceV1 } from '../../../src/services/version1/BlobsCommandableGrpcServiceV1';

var grpcConfig = ConfigParams.fromTuples(
    "connection.protocol", "http",
    "connection.host", "localhost",
    "connection.port", 3000
);

suite('BlobsCommandableGrpcServiceV1', ()=> {
    let service: BlobsCommandableGrpcServiceV1;

    let client: any;

    suiteSetup((done) => {
        let persistence = new BlobsMemoryPersistence();
        let controller = new BlobsController();

        service = new BlobsCommandableGrpcServiceV1();
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
            __dirname + "../../../../../node_modules/pip-services3-grpc-node/src/protos/commandable.proto",
            {
                keepCase: true,
                longs: Number,
                enums: Number,
                defaults: true,
                oneofs: true
            }
        );
        let clientProto = grpc.loadPackageDefinition(packageDefinition).commandable.Commandable;

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

                client.invoke(
                    {
                        method: 'v1/blobs.begin_blob_write',
                        args_empty: false,
                        args_json: JSON.stringify({ 
                            blob: blob
                        })
                    },
                    (err, response) => {
                        assert.isNull(err);

                        assert.isFalse(response.result_empty);
                        assert.isString(response.result_json);
                        let tok = JSON.parse(response.result_json);

                        token = tok;

                        callback();
                    }
                );
            },
        // Write blob
            (callback) => {
                let chunk = Buffer.from([1, 2, 3]).toString('base64');

                client.invoke(
                    {
                        method: 'v1/blobs.write_blob_chunk',
                        args_empty: false,
                        args_json: JSON.stringify({ 
                            token: token,
                            chunk: chunk
                            })
                    },
                    (err, response) => {
                        assert.isNull(err);

                        assert.isFalse(response.result_empty);
                        assert.isString(response.result_json);
                        let tok = JSON.parse(response.result_json);
                        
                        token = tok;

                        callback();
                    }
                );
            },
        // Finish writing blob
            (callback) => {
                let chunk = Buffer.from([4, 5, 6]).toString('base64');

                client.invoke(
                    {
                        method: 'v1/blobs.end_blob_write',
                        args_empty: false,
                        args_json: JSON.stringify({ 
                            token: token,
                            chunk: chunk
                        })
                    },
                    (err, response) => {
                        assert.isNull(err);

                        assert.isFalse(response.result_empty);
                        assert.isString(response.result_json);
                        let blob = JSON.parse(response.result_json);
                        
                        callback();
                    }
                );
            },
        // Start reading
            (callback) => {
                client.invoke(
                    {
                        method: 'v1/blobs.begin_blob_read',
                        args_empty: false,
                        args_json: JSON.stringify({ 
                            blob_id: blobId
                        })
                    },
                    (err, response) => {
                        assert.isNull(err);

                        assert.isFalse(response.result_empty);
                        assert.isString(response.result_json);
                        let blob = JSON.parse(response.result_json);

                        assert.equal(6, blob.size);

                        callback();
                    }
                );
            },
        // Read first chunk
            (callback) => {
                client.invoke(
                    {
                        method: 'v1/blobs.read_blob_chunk',
                        args_empty: false,
                        args_json: JSON.stringify({ 
                            blob_id: blobId,
                            skip: 0,
                            take: 3
                        })
                    },
                    (err, response) => {
                        assert.isNull(err);

                        assert.isFalse(response.result_empty);
                        assert.isString(response.result_json);
                        let chunk = JSON.parse(response.result_json);

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
                client.invoke(
                    {
                        method: 'v1/blobs.get_blobs_by_filter',
                        args_empty: false,
                        args_json: JSON.stringify({ 
                        })
                    },
                    (err, response) => {
                        assert.isNull(err);

                        assert.isFalse(response.result_empty);
                        assert.isString(response.result_json);
                        let page = JSON.parse(response.result_json);

                        assert.lengthOf(page.data, 1);

                        callback();
                    }
                );
            },
        // Delete blob
            (callback) => {
                client.invoke(
                    {
                        method: 'v1/blobs.delete_blobs_by_ids',
                        args_empty: false,
                        args_json: JSON.stringify({ 
                            blob_ids: [blobId]
                        })
                    },
                    (err, response) => {
                        assert.isNull(err);

                        assert.isTrue(response.result_empty);

                        callback();
                    }
                );
            },
        // Try to get deleted blob
            (callback) => {
                client.invoke(
                    {
                        method: 'v1/blobs.get_blob_by_id',
                        args_empty: false,
                        args_json: JSON.stringify({ 
                            blob_id: blobId
                        })
                    },
                    (err, response) => {
                        assert.isNull(err);

                        assert.isTrue(response.result_empty);
                        
                        //assert.isNull(blob);

                        callback();
                    }
                )
            }
        ], done);
    });
    
});
