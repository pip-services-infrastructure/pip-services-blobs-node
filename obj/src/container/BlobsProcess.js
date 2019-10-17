"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_container_node_1 = require("pip-services3-container-node");
const BlobsServiceFactory_1 = require("../build/BlobsServiceFactory");
const pip_services3_rpc_node_1 = require("pip-services3-rpc-node");
const pip_services3_grpc_node_1 = require("pip-services3-grpc-node");
class BlobsProcess extends pip_services3_container_node_1.ProcessContainer {
    constructor() {
        super("blobs", "Blobs microservice");
        this._factories.add(new BlobsServiceFactory_1.BlobsServiceFactory);
        this._factories.add(new pip_services3_rpc_node_1.DefaultRpcFactory);
        this._factories.add(new pip_services3_grpc_node_1.DefaultGrpcFactory);
    }
}
exports.BlobsProcess = BlobsProcess;
//# sourceMappingURL=BlobsProcess.js.map