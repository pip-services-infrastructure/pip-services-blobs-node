import { IReferences } from 'pip-services-commons-node';
import { ProcessContainer } from 'pip-services-container-node';
import { DefaultNetFactory } from 'pip-services-net-node';
import { DefaultOssFactory } from 'pip-services-oss-node';

import { BlobsServiceFactory } from '../build/BlobsServiceFactory';

export class BlobsProcess extends ProcessContainer {

    public constructor() {
        super("blobs", "Blobs microservice");
        this._factories.add(new BlobsServiceFactory);
        this._factories.add(new DefaultNetFactory);
        this._factories.add(new DefaultOssFactory);
    }

}
