"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlobsCommandableGrpcServiceV1 = void 0;
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_grpc_node_1 = require("pip-services3-grpc-node");
class BlobsCommandableGrpcServiceV1 extends pip_services3_grpc_node_1.CommandableGrpcService {
    constructor() {
        super('v1/blobs');
        this._dependencyResolver.put('controller', new pip_services3_commons_node_1.Descriptor('pip-services-blobs', 'controller', 'default', '*', '1.0'));
    }
}
exports.BlobsCommandableGrpcServiceV1 = BlobsCommandableGrpcServiceV1;
//# sourceMappingURL=BlobsCommandableGrpcServiceV1.js.map