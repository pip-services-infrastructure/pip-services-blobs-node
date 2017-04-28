import { ConfigParams } from 'pip-services-commons-node';

import { BlobsFilePersistence } from '../../src/persistence/BlobsFilePersistence';
import { BlobsPersistenceFixture } from './BlobsPersistenceFixture';

suite('BlobsFilePersistence', ()=> {
    let persistence: BlobsFilePersistence;
    let fixture: BlobsPersistenceFixture;
    
    setup((done) => {
        persistence = new BlobsFilePersistence('./data/blobs.test');

        fixture = new BlobsPersistenceFixture(persistence);
        
        persistence.open(null, (err) => {
            if (err) done(err);
            else persistence.clear(null, done);
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