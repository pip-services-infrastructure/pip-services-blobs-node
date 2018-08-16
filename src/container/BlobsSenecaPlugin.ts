import { References } from 'pip-services-commons-node';
import { Descriptor } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { ConsoleLogger } from 'pip-services-components-node';
import { ConfigException } from 'pip-services-commons-node';
import { SenecaPlugin } from 'pip-services-seneca-node';
import { SenecaInstance } from 'pip-services-seneca-node';

import { BlobsMemoryPersistence } from '../persistence/BlobsMemoryPersistence';
import { BlobsFilePersistence } from '../persistence/BlobsFilePersistence';
import { BlobsMongoDbPersistence } from '../persistence/BlobsMongoDbPersistence';
import { BlobsS3Persistence } from '../persistence/BlobsS3Persistence';

import { BlobsController } from '../logic/BlobsController';
import { BlobsSenecaServiceV1 } from '../services/version1/BlobsSenecaServiceV1';

export class BlobsSenecaPlugin extends SenecaPlugin {
    public constructor(seneca: any, options: any) {
        super('pip-services-blobs', seneca, BlobsSenecaPlugin.createReferences(seneca, options));
    }

    private static createReferences(seneca: any, options: any): References {
        options = options || {};

        let logger = new ConsoleLogger();
        let loggerOptions = options.logger || {};
        logger.configure(ConfigParams.fromValue(loggerOptions));

        let controller = new BlobsController();

        let persistence;
        let persistenceOptions = options['persistence'] || {};
        let persistenceType = persistenceOptions.type || 'memory';
        if (persistenceType == 'mongodb') 
            persistence = new BlobsMongoDbPersistence();
        else if (persistenceType == 'file')
            persistence = new BlobsFilePersistence();
        else if (persistenceType == 'memory')
            persistence = new BlobsMemoryPersistence();
        else if (persistenceType == 's3')
            persistence = new BlobsS3Persistence();
        else 
            throw new ConfigException(null, 'WRONG_PERSISTENCE_TYPE', 'Unrecognized persistence type: ' + persistenceType);
        persistence.configure(ConfigParams.fromValue(persistenceOptions));

        let senecaInstance = new SenecaInstance(seneca);

        let service = new BlobsSenecaServiceV1();
        let serviceOptions = options.service || {};
        service.configure(ConfigParams.fromValue(serviceOptions));

        return References.fromTuples(
            new Descriptor('pip-services', 'logger', 'console', 'default', '1.0'), logger,
            new Descriptor('pip-services-seneca', 'seneca', 'instance', 'default', '1.0'), senecaInstance,
            new Descriptor('pip-services-blobs', 'persistence', persistenceType, 'default', '1.0'), persistence,
            new Descriptor('pip-services-blobs', 'controller', 'default', 'default', '1.0'), controller,
            new Descriptor('pip-services-blobs', 'service', 'seneca', 'default', '1.0'), service
        );
    }
}

module.exports = function(options: any): any {
    let seneca = this;
    let plugin = new BlobsSenecaPlugin(seneca, options);
    return { name: plugin.name };
}