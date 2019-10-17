"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_aws_node_1 = require("pip-services3-aws-node");
const BlobsServiceFactory_1 = require("../build/BlobsServiceFactory");
class BlobsLambdaFunction extends pip_services3_aws_node_1.CommandableLambdaFunction {
    constructor() {
        super("blobs", "Blobs function");
        this._dependencyResolver.put('controller', new pip_services3_commons_node_1.Descriptor('pip-services-blobs', 'controller', 'default', '*', '*'));
        this._factories.add(new BlobsServiceFactory_1.BlobsServiceFactory());
    }
}
exports.BlobsLambdaFunction = BlobsLambdaFunction;
exports.handler = new BlobsLambdaFunction().getHandler();
//# sourceMappingURL=BlobsLambdaFunction.js.map