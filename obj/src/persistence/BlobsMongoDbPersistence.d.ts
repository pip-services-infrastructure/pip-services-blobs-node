import { ConfigParams } from 'pip-services-commons-node';
import { MongoDbPersistence } from 'pip-services-data-node';
import { FilterParams } from 'pip-services-commons-node';
import { PagingParams } from 'pip-services-commons-node';
import { DataPage } from 'pip-services-commons-node';
import { BlobInfoV1 } from '../data/version1/BlobInfoV1';
import { IBlobsPersistence } from './IBlobsPersistence';
import { TempBlobStorage } from './TempBlobStorage';
export declare class BlobsMongoDbPersistence extends MongoDbPersistence implements IBlobsPersistence {
    protected _GridStore: any;
    protected _storage: TempBlobStorage;
    protected _maxBlobSize: number;
    protected _maxPageSize: number;
    constructor();
    configure(config: ConfigParams): void;
    open(correlationId: string, callback?: (err: any) => void): void;
    close(correlationId: string, callback?: (err: any) => void): void;
    private composeFilter(filter);
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams, callback: (err: any, page: DataPage<BlobInfoV1>) => void): void;
    getListByIds(correlationId: string, ids: string[], callback: (err: any, items: BlobInfoV1[]) => void): void;
    getOneById(correlationId: string, id: string, callback: (err: any, item: BlobInfoV1) => void): void;
    update(correlationId: string, item: BlobInfoV1, callback: (err: any, item: BlobInfoV1) => void): void;
    markCompleted(correlationId: string, ids: string[], callback: (err: any) => void): void;
    isUriSupported(): boolean;
    getUri(correlationId: string, id: string, callback: (err: any, uri: string) => void): void;
    private infoToToken(item);
    private tokenToInfo(token);
    beginWrite(correlationId: string, item: BlobInfoV1, callback: (err: any, token: string) => void): void;
    writeChunk(correlationId: string, token: string, chunk: string, callback: (err: any, token: string) => void): void;
    endWrite(correlationId: string, token: string, chunk: string, callback?: (err: any, item: BlobInfoV1) => void): void;
    abortWrite(correlationId: string, token: string, callback?: (err: any) => void): void;
    private gridToInfo(gs);
    beginRead(correlationId: string, id: string, callback: (err: any, item: BlobInfoV1) => void): void;
    readChunk(correlationId: string, id: string, skip: number, take: number, callback: (err: any, chunk: string) => void): void;
    endRead(correlationId: string, id: string, callback?: (err: any) => void): void;
    deleteById(correlationId: string, id: string, callback?: (err: any) => void): void;
    deleteByIds(correlationId: string, ids: string[], callback?: (err: any) => void): void;
    clear(correlationId: string, callback?: (err: any) => void): void;
}
