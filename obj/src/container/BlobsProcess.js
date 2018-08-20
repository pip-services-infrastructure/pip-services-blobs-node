"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services_container_node_1 = require("pip-services-container-node");
const BlobsServiceFactory_1 = require("../build/BlobsServiceFactory");
const pip_services_rpc_node_1 = require("pip-services-rpc-node");
class BlobsProcess extends pip_services_container_node_1.ProcessContainer {
    constructor() {
        super("blobs", "Blobs microservice");
        this._factories.add(new BlobsServiceFactory_1.BlobsServiceFactory);
        this._factories.add(new pip_services_rpc_node_1.DefaultRpcFactory);
    }
}
exports.BlobsProcess = BlobsProcess;
//# sourceMappingURL=BlobsProcess.js.map