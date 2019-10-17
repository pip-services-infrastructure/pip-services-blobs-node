import { IReferences } from 'pip-services3-commons-node';
import { GrpcService } from 'pip-services3-grpc-node';
export declare class BlobsGrpcServiceV1 extends GrpcService {
    private _controller;
    constructor();
    setReferences(references: IReferences): void;
    private getBlobsByFilter;
    private getBlobsByIds;
    private getBlobById;
    private getBlobUriById;
    private beginBlobWrite;
    private writeBlobChunk;
    private endBlobWrite;
    private abortBlobWrite;
    private beginBlobRead;
    private readBlobChunk;
    private endBlobRead;
    private updateBlobInfo;
    private markBlobsCompleted;
    private deleteBlobById;
    private deleteBlobsByIds;
    register(): void;
}
