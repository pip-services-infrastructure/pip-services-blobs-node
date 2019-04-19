let process = require('process');

import { ConfigParams } from 'pip-services3-commons-node';

import { BlobsS3Persistence } from '../../src/persistence/BlobsS3Persistence';
import { BlobsPersistenceFixture } from './BlobsPersistenceFixture';

suite('BlobsS3Persistence', ()=> {
    let persistence: BlobsS3Persistence;
    let fixture: BlobsPersistenceFixture;

    let S3_ARN = process.env["S3_ARN"] || "";
    let AWS_ACCESS_ID = process.env["AWS_ACCESS_ID"] || "";
    let AWS_ACCESS_KEY = process.env["AWS_ACCESS_KEY"] || "";

    if (S3_ARN == "" || AWS_ACCESS_ID == "" || AWS_ACCESS_KEY == "")
        return;

    setup((done) => {

        let dbConfig = ConfigParams.fromTuples(
            "connection.arn", S3_ARN,
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