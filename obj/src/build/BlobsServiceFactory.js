"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_commons_node_2 = require("pip-services-commons-node");
const BlobsMongoDbPersistence_1 = require("../persistence/BlobsMongoDbPersistence");
const BlobsFilePersistence_1 = require("../persistence/BlobsFilePersistence");
const BlobsMemoryPersistence_1 = require("../persistence/BlobsMemoryPersistence");
const BlobsController_1 = require("../logic/BlobsController");
const BlobsHttpServiceV1_1 = require("../services/version1/BlobsHttpServiceV1");
const BlobsSenecaServiceV1_1 = require("../services/version1/BlobsSenecaServiceV1");
class BlobsServiceFactory extends pip_services_commons_node_1.Factory {
    constructor() {
        super();
        this.registerAsType(BlobsServiceFactory.MemoryPersistenceDescriptor, BlobsMemoryPersistence_1.BlobsMemoryPersistence);
        this.registerAsType(BlobsServiceFactory.FilePersistenceDescriptor, BlobsFilePersistence_1.BlobsFilePersistence);
        this.registerAsType(BlobsServiceFactory.MongoDbPersistenceDescriptor, BlobsMongoDbPersistence_1.BlobsMongoDbPersistence);
        this.registerAsType(BlobsServiceFactory.S3PersistenceDescriptor, BlobsMongoDbPersistence_1.BlobsMongoDbPersistence);
        this.registerAsType(BlobsServiceFactory.ControllerDescriptor, BlobsController_1.BlobsController);
        this.registerAsType(BlobsServiceFactory.SenecaServiceDescriptor, BlobsSenecaServiceV1_1.BlobsSenecaServiceV1);
        this.registerAsType(BlobsServiceFactory.HttpServiceDescriptor, BlobsHttpServiceV1_1.BlobsHttpServiceV1);
    }
}
BlobsServiceFactory.Descriptor = new pip_services_commons_node_2.Descriptor("pip-services-blobs", "factory", "default", "default", "1.0");
BlobsServiceFactory.MemoryPersistenceDescriptor = new pip_services_commons_node_2.Descriptor("pip-services-blobs", "persistence", "memory", "*", "1.0");
BlobsServiceFactory.FilePersistenceDescriptor = new pip_services_commons_node_2.Descriptor("pip-services-blobs", "persistence", "file", "*", "1.0");
BlobsServiceFactory.MongoDbPersistenceDescriptor = new pip_services_commons_node_2.Descriptor("pip-services-blobs", "persistence", "mongodb", "*", "1.0");
BlobsServiceFactory.S3PersistenceDescriptor = new pip_services_commons_node_2.Descriptor("pip-services-blobs", "persistence", "s3", "*", "1.0");
BlobsServiceFactory.ControllerDescriptor = new pip_services_commons_node_2.Descriptor("pip-services-blobs", "controller", "default", "*", "1.0");
BlobsServiceFactory.SenecaServiceDescriptor = new pip_services_commons_node_2.Descriptor("pip-services-blobs", "service", "seneca", "*", "1.0");
BlobsServiceFactory.HttpServiceDescriptor = new pip_services_commons_node_2.Descriptor("pip-services-blobs", "service", "http", "*", "1.0");
exports.BlobsServiceFactory = BlobsServiceFactory;
//# sourceMappingURL=BlobsServiceFactory.js.map