import { ConfigParams } from 'pip-services-commons-node';
import { JsonFilePersister } from 'pip-services-data-node';
import { BlobsMemoryPersistence } from './BlobsMemoryPersistence';
import { BlobInfoV1 } from '../data/version1/BlobInfoV1';
import { TempBlobStorage } from './TempBlobStorage';
export declare class BlobsFilePersistence extends BlobsMemoryPersistence {
    protected _persister: JsonFilePersister<BlobInfoV1>;
    protected _path: string;
    protected _index: string;
    protected _maxBlobSize: number;
    protected _storage: TempBlobStorage;
    constructor(path?: string, index?: string);
    configure(config: ConfigParams): void;
    open(correlationId: string, callback?: (err: any) => void): void;
    close(correlationId: string, callback?: (err: any) => void): void;
    protected makeFileName(id: string): string;
    isUriSupported(): boolean;
    getUri(correlationId: string, id: string, callback: (err: any, uri: string) => void): void;
    beginWrite(correlationId: string, item: BlobInfoV1, callback: (err: any, token: string) => void): void;
    writeChunk(correlationId: string, token: string, chunk: string, callback: (err: any, token: string) => void): void;
    endWrite(correlationId: string, token: string, chunk: string, callback?: (err: any, item: BlobInfoV1) => void): void;
    abortWrite(correlationId: string, token: string, callback?: (err: any) => void): void;
    beginRead(correlationId: string, id: string, callback: (err: any, item: BlobInfoV1) => void): void;
    readChunk(correlationId: string, id: string, skip: number, take: number, callback: (err: any, chunk: string) => void): void;
    endRead(correlationId: string, id: string, callback?: (err: any) => void): void;
    deleteById(correlationId: string, id: string, callback?: (err: any, item: BlobInfoV1) => void): void;
    deleteByIds(correlationId: string, ids: string[], callback?: (err: any) => void): void;
    clear(correlationId: string, callback?: (err: any) => void): void;
}
