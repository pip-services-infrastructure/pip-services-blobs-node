import { Factory } from 'pip-services3-components-node';
import { Descriptor } from 'pip-services3-commons-node';
export declare class BlobsServiceFactory extends Factory {
    static Descriptor: Descriptor;
    static MemoryPersistenceDescriptor: Descriptor;
    static FilePersistenceDescriptor: Descriptor;
    static MongoDbPersistenceDescriptor: Descriptor;
    static S3PersistenceDescriptor: Descriptor;
    static ControllerDescriptor: Descriptor;
    static HttpServiceDescriptor: Descriptor;
    constructor();
}
