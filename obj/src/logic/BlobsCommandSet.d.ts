import { CommandSet } from 'pip-services3-commons-node';
import { IBlobsController } from './IBlobsController';
export declare class BlobsCommandSet extends CommandSet {
    private _logic;
    constructor(logic: IBlobsController);
    private makeGetBlobsByFilterCommand;
    private makeGetBlobsByIdsCommand;
    private makeGetBlobByIdCommand;
    private makeGetBlobUriByIdCommand;
    private makeBeginBlobWriteCommand;
    private makeWriteBlobChunkCommand;
    private makeEndBlobWriteCommand;
    private makeAbortBlobWriteCommand;
    private makeBeginBlobReadCommand;
    private makeReadBlobChunkCommand;
    private makeEndBlobReadCommand;
    private makeUpdateBlobInfoCommand;
    private makeMarkBlobsCompletedCommand;
    private makeDeleteBlobByIdCommand;
    private makeDeleteBlobsByIdsCommand;
    private fixBlob;
}
