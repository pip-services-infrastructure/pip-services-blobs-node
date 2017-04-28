import { BlobsMemoryPersistence } from '../../src/persistence/BlobsMemoryPersistence';
import { BlobsPersistenceFixture } from './BlobsPersistenceFixture';

suite('BlobsMemoryPersistence', ()=> {
    let persistence: BlobsMemoryPersistence;
    let fixture: BlobsPersistenceFixture;
    
    setup((done) => {
        persistence = new BlobsMemoryPersistence();
        fixture = new BlobsPersistenceFixture(persistence);
        
        persistence.open(null, done);
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