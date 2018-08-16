import { Descriptor } from 'pip-services-commons-node';
import { CommandableSenecaService } from 'pip-services-seneca-node';

export class BlobsSenecaServiceV1 extends CommandableSenecaService {
    public constructor() {
        super('blobs');
        this._dependencyResolver.put('controller', new Descriptor('pip-services-blobs', 'controller', 'default', '*', '1.0'));
    }
}