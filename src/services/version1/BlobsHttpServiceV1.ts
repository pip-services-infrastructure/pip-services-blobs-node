import { Descriptor } from 'pip-services3-commons-node';
import { CommandableHttpService } from 'pip-services3-rpc-node';

export class BlobsHttpServiceV1 extends CommandableHttpService {
    public constructor() {
        super('v1/blobs');
        this._dependencyResolver.put('controller', new Descriptor('pip-services-blobs', 'controller', 'default', '*', '1.0'));
    }
}