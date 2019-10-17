"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_rpc_node_1 = require("pip-services3-rpc-node");
class BlobsHttpServiceV1 extends pip_services3_rpc_node_1.CommandableHttpService {
    constructor() {
        super('v1/blobs');
        this._dependencyResolver.put('controller', new pip_services3_commons_node_1.Descriptor('pip-services-blobs', 'controller', 'default', '*', '1.0'));
    }
}
exports.BlobsHttpServiceV1 = BlobsHttpServiceV1;
//# sourceMappingURL=BlobsHttpServiceV1.js.map