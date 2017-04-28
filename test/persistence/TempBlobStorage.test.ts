let async = require('async');
let assert = require('chai').assert;

import { ConfigParams } from 'pip-services-commons-node';
import { IdGenerator } from 'pip-services-commons-node';

import { TempBlobStorage } from '../../src/persistence/TempBlobStorage';

suite('TempBlobStorage', ()=> {
    let storage: TempBlobStorage;
    
    setup((done) => {
        storage = new TempBlobStorage();

        storage.configure(ConfigParams.fromTuples(
            'temp_path', './data/temp',
            'options.write_timeout', 0,
            'options.min_chunk_size', 5
        ));
        
        storage.open(null, (err) => {
            if (err) done(err);
            else storage.clear(null, done);
        });
    });
    
    teardown((done) => {
        storage.close(null, done);
    });
        
    test('Read and Write', (done) => {
        let id = IdGenerator.nextLong();

        async.series([
            // Write the first chunk
            (callback) => {
                let chunk = Buffer.from('ABC');
                storage.appendChunk(null, id, chunk, (err, size) => {
                    assert.isNull(err);

                    assert.equal(3, size);

                    callback();
                });
            },
            // Write second chunk
            (callback) => {
                let chunk = Buffer.from('DEF');
                storage.appendChunk(null, id, chunk, (err, size) => {
                    assert.isNull(err);

                    assert.equal(6, size);

                    callback();
                });
            },
            // Read chunks size
            (callback) => {
                storage.getChunksSize(null, id, (err, size) => {
                    assert.isNull(err);

                    assert.equal(6, size);

                    callback();
                })
            },
            // Delete chunks
            (callback) => {
                storage.deleteChunks(null, id, (err) => {
                    assert.isNull(err);

                    callback();
                });
            },
        ], done);
    });

    test('Append and Cleanup', (done) => {
        let id = IdGenerator.nextLong();

        async.series([
            // Create a new blob
            (callback) => {
                let chunk = Buffer.from('ABC');
                storage.appendChunk(null, id, chunk, (err, size) => {
                    assert.isNull(err);
                    callback();
                });
            },
            // Cleanup chunks
            (callback) => {
                storage.cleanup(null, (err) => {
                    assert.isNull(err);
                    callback();
                });
            }
        ], done);
    });

});