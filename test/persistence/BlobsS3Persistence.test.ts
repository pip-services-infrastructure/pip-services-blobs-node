let process = require('process');

import { ConfigParams } from 'pip-services-commons-node';

import { BlobsS3Persistence } from '../../src/persistence/BlobsS3Persistence';
import { BlobsPersistenceFixture } from './BlobsPersistenceFixture';

suite('BlobsS3Persistence', ()=> {
    let persistence: BlobsS3Persistence;
    let fixture: BlobsPersistenceFixture;

    setup((done) => {
        
        var AWS_ARN = process.env["AWS_ARN"] || "arn:aws:s3:us-east-1::pip-services-blobs";
        // TO DO: insert default value for AWS keys
        var AWS_ACCESS_ID = process.env["AWS_ACCESS_ID"] || "";
        var AWS_ACCESS_KEY = process.env["AWS_ACCESS_KEY"] || "";

        var dbConfig = ConfigParams.fromTuples(
            "connection.arn", AWS_ARN,
            "credential.access_id", AWS_ACCESS_ID,
            "credential.access_key", AWS_ACCESS_KEY
        );

        persistence = new BlobsS3Persistence();
        persistence.configure(dbConfig);

        fixture = new BlobsPersistenceFixture(persistence);
        
        persistence.open(null, (err: any) => {
            persistence.clear(null, (err) => {
                done(err);
            });
        });
    });
    
    teardown((done) => {
        persistence.close(null, done);
    });

    test('CRUD Operations', (done) => {
        fixture.testCrudOperations(done);
    });

    test('Read and Write', (done) => {
        fixture.testReadAndWrite(done);
    });

    test('Write in One Chunk', (done) => {
        fixture.testWriteInOneChunk(done);
    });

    test('Get Uri for missing blob', (done) => {
        fixture.testGetUriForMissingBlob(done);
    });

    test('Override blob', (done) => {
        fixture.testOverrideBlob(done);
    });

});