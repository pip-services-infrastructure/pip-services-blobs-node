"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_seneca_node_1 = require("pip-services-seneca-node");
class BlobsSenecaServiceV1 extends pip_services_seneca_node_1.CommandableSenecaService {
    constructor() {
        super('blobs');
        this._dependencyResolver.put('controller', new pip_services_commons_node_1.Descriptor('pip-services-blobs', 'controller', 'default', '*', '1.0'));
    }
}
exports.BlobsSenecaServiceV1 = BlobsSenecaServiceV1;
//# sourceMappingURL=BlobsSenecaServiceV1.js.map