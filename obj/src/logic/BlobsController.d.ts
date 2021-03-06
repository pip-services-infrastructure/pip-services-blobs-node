import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { ICommandable } from 'pip-services3-commons-node';
import { CommandSet } from 'pip-services3-commons-node';
import { BlobInfoV1 } from '../data/version1/BlobInfoV1';
import { IBlobsController } from './IBlobsController';
export declare class BlobsController implements IConfigurable, IReferenceable, ICommandable, IBlobsController {
    private static _defaultConfig;
    private _dependencyResolver;
    private _persistence;
    private _commandSet;
    configure(config: ConfigParams): void;
    setReferences(references: IReferences): void;
    getCommandSet(): CommandSet;
    getBlobsByFilter(correlationId: string, filter: FilterParams, paging: PagingParams, callback: (err: any, page: DataPage<BlobInfoV1>) => void): void;
    getBlobsByIds(correlationId: string, blobIds: string[], callback: (err: any, blobs: BlobInfoV1[]) => void): void;
    getBlobById(correlationId: string, blobId: string, callback: (err: any, blob: BlobInfoV1) => void): void;
    getBlobUriById(correlationId: string, blobId: string, callback: (err: any, uri: string) => void): void;
    private normalizeName;
    private fixBlob;
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
