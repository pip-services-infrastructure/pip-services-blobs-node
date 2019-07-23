import { IReferences } from 'pip-services3-commons-node';
import { GrpcService } from 'pip-services3-grpc-node';
export declare class BlobsGrpcServiceV1 extends GrpcService {
    private _controller;
    constructor();
    setReferences(references: IReferences): void;
    private getBlobsByFilter(call, callback);
    private getBlobsByIds(call, callback);
    private getBlobById(call, callback);
    private getBlobUriById(call, callback);
    private beginBlobWrite(call, callback);
    private writeBlobChunk(call, callback);
    private endBlobWrite(call, callback);
    private abortBlobWrite(call, callback);
    private beginBlobRead(call, callback);
    private readBlobChunk(call, callback);
    private endBlobRead(call, callback);
    private updateBlobInfo(call, callback);
    private markBlobsCompleted(call, callback);
    private deleteBlobById(call, callback);
    private deleteBlobsByIds(call, callback);
    register(): void;
}
