"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_commons_node_2 = require("pip-services-commons-node");
const pip_services_commons_node_3 = require("pip-services-commons-node");
const pip_services_components_node_1 = require("pip-services-components-node");
const pip_services_commons_node_4 = require("pip-services-commons-node");
const pip_services_seneca_node_1 = require("pip-services-seneca-node");
const pip_services_seneca_node_2 = require("pip-services-seneca-node");
const BlobsMemoryPersistence_1 = require("../persistence/BlobsMemoryPersistence");
const BlobsFilePersistence_1 = require("../persistence/BlobsFilePersistence");
const BlobsMongoDbPersistence_1 = require("../persistence/BlobsMongoDbPersistence");
const BlobsS3Persistence_1 = require("../persistence/BlobsS3Persistence");
const BlobsController_1 = require("../logic/BlobsController");
const BlobsSenecaServiceV1_1 = require("../services/version1/BlobsSenecaServiceV1");
class BlobsSenecaPlugin extends pip_services_seneca_node_1.SenecaPlugin {
    constructor(seneca, options) {
        super('pip-services-blobs', seneca, BlobsSenecaPlugin.createReferences(seneca, options));
    }
    static createReferences(seneca, options) {
        options = options || {};
        let logger = new pip_services_components_node_1.ConsoleLogger();
        let loggerOptions = options.logger || {};
        logger.configure(pip_services_commons_node_3.ConfigParams.fromValue(loggerOptions));
        let controller = new BlobsController_1.BlobsController();
        let persistence;
        let persistenceOptions = options['persistence'] || {};
        let persistenceType = persistenceOptions.type || 'memory';
        if (persistenceType == 'mongodb')
            persistence = new BlobsMongoDbPersistence_1.BlobsMongoDbPersistence();
        else if (persistenceType == 'file')
            persistence = new BlobsFilePersistence_1.BlobsFilePersistence();
        else if (persistenceType == 'memory')
            persistence = new BlobsMemoryPersistence_1.BlobsMemoryPersistence();
        else if (persistenceType == 's3')
            persistence = new BlobsS3Persistence_1.BlobsS3Persistence();
        else
            throw new pip_services_commons_node_4.ConfigException(null, 'WRONG_PERSISTENCE_TYPE', 'Unrecognized persistence type: ' + persistenceType);
        persistence.configure(pip_services_commons_node_3.ConfigParams.fromValue(persistenceOptions));
        let senecaInstance = new pip_services_seneca_node_2.SenecaInstance(seneca);
        let service = new BlobsSenecaServiceV1_1.BlobsSenecaServiceV1();
        let serviceOptions = options.service || {};
        service.configure(pip_services_commons_node_3.ConfigParams.fromValue(serviceOptions));
        return pip_services_commons_node_1.References.fromTuples(new pip_services_commons_node_2.Descriptor('pip-services', 'logger', 'console', 'default', '1.0'), logger, new pip_services_commons_node_2.Descriptor('pip-services-seneca', 'seneca', 'instance', 'default', '1.0'), senecaInstance, new pip_services_commons_node_2.Descriptor('pip-services-blobs', 'persistence', persistenceType, 'default', '1.0'), persistence, new pip_services_commons_node_2.Descriptor('pip-services-blobs', 'controller', 'default', 'default', '1.0'), controller, new pip_services_commons_node_2.Descriptor('pip-services-blobs', 'service', 'seneca', 'default', '1.0'), service);
    }
}
exports.BlobsSenecaPlugin = BlobsSenecaPlugin;
module.exports = function (options) {
    let seneca = this;
    let plugin = new BlobsSenecaPlugin(seneca, options);
    return { name: plugin.name };
};
//# sourceMappingURL=BlobsSenecaPlugin.js.map