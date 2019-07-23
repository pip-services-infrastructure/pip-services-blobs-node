import { Descriptor } from 'pip-services3-commons-node';
import { CommandableGrpcService } from 'pip-services3-grpc-node';

export class BlobsCommandableGrpcServiceV1 extends CommandableGrpcService {
    public constructor() {
        super('v1/blobs');
        this._dependencyResolver.put('controller', new Descriptor('pip-services-blobs', 'controller', 'default', '*', '1.0'));
    }
}