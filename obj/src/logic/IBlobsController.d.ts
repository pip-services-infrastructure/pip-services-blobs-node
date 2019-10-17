import { DataPage } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { BlobInfoV1 } from '../data/version1/BlobInfoV1';
export interface IBlobsController {
    getBlobsByFilter(correlationId: string, filter: FilterParams, paging: PagingParams, callback: (err: any, page: DataPage<BlobInfoV1>) => void): void;
    getBlobsByIds(correlationId: string, blobIds: string[], callback: (err: any, blobs: BlobInfoV1[]) => void): void;
    getBlobById(correlationId: string, blobId: string, callback: (err: any, blob: BlobInfoV1) => void): void;
    getBlobUriById(correlationId: string, blobId: string, callback: (err: any, uri: string) => void): void;
    beginBlobWrite(correlationId: string, blob: BlobInfoV1, callback: (err: any, token: string) => void): void;
    writeBlobChunk(correlationId: string, token: string, chunk: string, callback: (err: any, token: string) => void): void;
    endBlobWrite(correlationId: string, token: string, chunk: string, callback?: (err: any, blob: BlobInfoV1) => void): void;
    abortBlobWrite(correlationId: string, token: string, callback?: (err: any) => void): void;
    beginBlobRead(correlationId: string, blobId: string, callback: (err: any, blob: BlobInfoV1) => void): void;
    readBlobChunk(correlationId: string, blobId: string, skip: number, take: number, callback: (err: any, chunk: string) => void): void;
    endBlobRead(correlationId: string, blobId: string, callback?: (err: any) => void): void;
    updateBlobInfo(correlationId: string, blob: BlobInfoV1, callback: (err: any, item: BlobInfoV1) => void): void;
    markBlobsCompleted(correlationId: string, blobIds: string[], callback: (err: any) => void): void;
    deleteBlobById(correlationId: string, blobId: string, callback?: (err: any) => void): void;
    deleteBlobsByIds(correlationId: string, blobIds: string[], callback?: (err: any) => void): void;
}
