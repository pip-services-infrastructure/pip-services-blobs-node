import { IReferences } from 'pip-services3-commons-node';
import { ProcessContainer } from 'pip-services3-container-node';

import { BlobsServiceFactory } from '../build/BlobsServiceFactory';
import { DefaultRpcFactory } from 'pip-services3-rpc-node';
import { DefaultGrpcFactory } from 'pip-services3-grpc-node';

export class BlobsProcess extends ProcessContainer {

    public constructor() {
        super("blobs", "Blobs microservice");
        this._factories.add(new BlobsServiceFactory);
        this._factories.add(new DefaultRpcFactory);
        this._factories.add(new DefaultGrpcFactory);
    }

}
