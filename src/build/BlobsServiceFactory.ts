import { Factory } from 'pip-services3-components-node';
import { Descriptor } from 'pip-services3-commons-node';

import { BlobsMongoDbPersistence } from '../persistence/BlobsMongoDbPersistence';
import { BlobsFilePersistence } from '../persistence/BlobsFilePersistence';
import { BlobsMemoryPersistence } from '../persistence/BlobsMemoryPersistence';
import { BlobsS3Persistence } from '../persistence/BlobsS3Persistence';

import { BlobsController } from '../logic/BlobsController';
import { BlobsHttpServiceV1 } from '../services/version1/BlobsHttpServiceV1';
import { BlobsCommandableGrpcServiceV1 } from '../services/version1/BlobsCommandableGrpcServiceV1';
import { BlobsGrpcServiceV1 } from '../services/version1/BlobsGrpcServiceV1';

export class BlobsServiceFactory extends Factory {
	public static Descriptor = new Descriptor("pip-services-blobs", "factory", "default", "default", "1.0");

	public static MemoryPersistenceDescriptor = new Descriptor("pip-services-blobs", "persistence", "memory", "*", "1.0");
	public static FilePersistenceDescriptor = new Descriptor("pip-services-blobs", "persistence", "file", "*", "1.0");
	public static MongoDbPersistenceDescriptor = new Descriptor("pip-services-blobs", "persistence", "mongodb", "*", "1.0");
	public static S3PersistenceDescriptor = new Descriptor("pip-services-blobs", "persistence", "s3", "*", "1.0");

	public static ControllerDescriptor = new Descriptor("pip-services-blobs", "controller", "default", "*", "1.0");
	public static HttpServiceDescriptor = new Descriptor("pip-services-blobs", "service", "http", "*", "1.0");
	public static CommandableGrpcServiceDescriptor = new Descriptor("pip-services-blobs", "service", "commandable-grpc", "*", "1.0");
	public static GrpcServiceDescriptor = new Descriptor("pip-services-blobs", "service", "grpc", "*", "1.0");
	
	constructor() {
		super();
		this.registerAsType(BlobsServiceFactory.MemoryPersistenceDescriptor, BlobsMemoryPersistence);
		this.registerAsType(BlobsServiceFactory.FilePersistenceDescriptor, BlobsFilePersistence);
		this.registerAsType(BlobsServiceFactory.MongoDbPersistenceDescriptor, BlobsMongoDbPersistence);
		this.registerAsType(BlobsServiceFactory.S3PersistenceDescriptor, BlobsMongoDbPersistence);

		this.registerAsType(BlobsServiceFactory.ControllerDescriptor, BlobsController);
		this.registerAsType(BlobsServiceFactory.HttpServiceDescriptor, BlobsHttpServiceV1);
		this.registerAsType(BlobsServiceFactory.CommandableGrpcServiceDescriptor, BlobsCommandableGrpcServiceV1);
		this.registerAsType(BlobsServiceFactory.GrpcServiceDescriptor, BlobsGrpcServiceV1);
	}
	
}
