import { IOpenable } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { IReferenceable } from 'pip-services-commons-node';
import { IReferences } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { CompositeLogger } from 'pip-services-components-node';
import { CompositeCounters } from 'pip-services-components-node';
import { DependencyResolver } from 'pip-services-commons-node';
import { FilterParams } from 'pip-services-commons-node';
import { PagingParams } from 'pip-services-commons-node';
import { DataPage } from 'pip-services-commons-node';
import { AwsConnectionResolver } from 'pip-services-aws-node';
import { AwsConnectionParams } from 'pip-services-aws-node';
import { BlobInfoV1 } from '../data/version1/BlobInfoV1';
import { IBlobsPersistence } from './IBlobsPersistence';
import { TempBlobStorage } from './TempBlobStorage';
export declare class BlobsS3Persistence implements IOpenable, IConfigurable, IReferenceable, IBlobsPersistence {
    private static readonly _defaultConfig;
    protected _s3: any;
    protected _opened: boolean;
    protected _connection: AwsConnectionParams;
    protected _bucket: string;
    protected _connectTimeout: number;
    protected _minChunkSize: number;
    protected _maxBlobSize: number;
    protected _reducedRedundancy: boolean;
    protected _maxPageSize: number;
    protected _dependencyResolver: DependencyResolver;
    protected _connectionResolver: AwsConnectionResolver;
    protected _logger: CompositeLogger;
    protected _counters: CompositeCounters;
    protected _storage: TempBlobStorage;
    configure(config: ConfigParams): void;
    setReferences(references: IReferences): void;
    isOpen(): boolean;
    open(correlationId: string, callback: (err?: any) => void): void;
    close(correlationId: string, callback?: (err?: any) => void): void;
    private dataToInfo;
    private encodeString;
    private decodeString;
    private matchString;
    private matchSearch;
    private composeFilter;
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams, callback: (err: any, page: DataPage<BlobInfoV1>) => void): void;
    getListByIds(correlationId: string, ids: string[], callback: (err: any, items: BlobInfoV1[]) => void): void;
    getOneById(correlationId: string, id: string, callback: (err: any, item: BlobInfoV1) => void): void;
    update(correlationId: string, item: BlobInfoV1, callback: (err: any, item: BlobInfoV1) => void): void;
    markCompleted(correlationId: string, ids: string[], callback: (err: any) => void): void;
    isUriSupported(): boolean;
    getUri(correlationId: string, id: string, callback: (err: any, uri: string) => void): void;
    beginWrite(correlationId: string, item: BlobInfoV1, callback: (err: any, token: string) => void): void;
    private uploadPart;
    private uploadAndDeleteChunks;
    writeChunk(correlationId: string, token: string, chunk: string, callback: (err: any, token: string) => void): void;
    endWrite(correlationId: string, token: string, chunk: string, callback?: (err: any, item: BlobInfoV1) => void): void;
    abortWrite(correlationId: string, token: string, callback?: (err: any) => void): void;
    beginRead(correlationId: string, id: string, callback: (err: any, item: BlobInfoV1) => void): void;
    readChunk(correlationId: string, id: string, skip: number, take: number, callback: (err: any, chunk: string) => void): void;
    endRead(correlationId: string, id: string, callback?: (err: any) => void): void;
    deleteById(correlationId: string, id: string, callback?: (err: any) => void): void;
    deleteByIds(correlationId: string, ids: string[], callback?: (err: any) => void): void;
    clear(correlationId: string, callback?: (err: any) => void): void;
}
