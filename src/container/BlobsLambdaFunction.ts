import { Descriptor } from 'pip-services3-commons-node';
import { CommandableLambdaFunction } from 'pip-services3-aws-node';

import { BlobsServiceFactory } from '../build/BlobsServiceFactory';

export class BlobsLambdaFunction extends CommandableLambdaFunction {
    public constructor() {
        super("blobs", "Blobs function");
        this._dependencyResolver.put('controller', new Descriptor('pip-services-blobs', 'controller', 'default', '*', '*'));
        this._factories.add(new BlobsServiceFactory());
    }
}

export const handler = new BlobsLambdaFunction().getHandler();