import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IOpenable } from 'pip-services3-commons-node';
import { ICleanable } from 'pip-services3-commons-node';
export declare class TempBlobStorage implements IConfigurable, IOpenable, ICleanable {
    private _path;
    private _maxBlobSize;
    private _minChunkSize;
    private _cleanupTimeout;
    private _writeTimeout;
    private _cleanupInterval;
    private _opened;
    constructor(path?: string);
    configure(config: ConfigParams): void;
    isOpen(): boolean;
    open(correlationId: string, callback?: (err: any) => void): void;
    close(correlationId: string, callback?: (err: any) => void): void;
    makeFileName(id: string): string;
    getChunksSize(correlationId: string, id: string, callback: (err: any, size: number) => void): void;
    appendChunk(correlationId: string, id: string, buffer: Buffer, callback: (err: any, size: number) => void): void;
    readChunks(correlationId: string, id: string, callback: (err: any, buffer: Buffer) => void): void;
    deleteChunks(correlationId: string, id: string, callback: (err: any) => void): void;
    cleanup(correlationId: string, callback?: (err: any) => void): void;
    clear(correlationId: string, callback?: (err: any) => void): void;
}
