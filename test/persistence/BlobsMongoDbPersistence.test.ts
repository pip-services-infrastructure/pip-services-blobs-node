import { YamlConfigReader } from 'pip-services-commons-node';

import { BlobsMongoDbPersistence } from '../../src/persistence/BlobsMongoDbPersistence';
import { BlobsPersistenceFixture } from './BlobsPersistenceFixture';

suite('BlobsMongoDbPersistence', ()=> {
    let persistence: BlobsMongoDbPersistence;
    let fixture: BlobsPersistenceFixture;

    let config = YamlConfigReader.readConfig(null, './config/test_connections.yaml', null);
    let dbConfig = config.getSection('mongodb');

    if (dbConfig.length() == 0)
        return;

    setup((done) => {
        persistence = new BlobsMongoDbPersistence();
        persistence.configure(dbConfig);

        fixture = new BlobsPersistenceFixture(persistence);

        persistence.open(null, (err: any) => {
            if (err) {
                done(err);
                return;
            }
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