import { DataPage } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { BlobInfoV1 } from '../../data/version1/BlobInfoV1';
export declare class BlobsGrpcConverterV1 {
    static fromError(err: any): any;
    static toError(obj: any): any;
    static setMap(map: any, values: any): void;
    static getMap(map: any): any;
    private static toJson;
    private static fromJson;
    static fromPagingParams(paging: PagingParams): any;
    static toPagingParams(obj: any): PagingParams;
    static fromBlobInfo(blob: BlobInfoV1): any;
    static toBlobInfo(obj: any): BlobInfoV1;
    static fromBlobInfoPage(page: DataPage<BlobInfoV1>): any;
    static toBlobInfoPage(obj: any): DataPage<BlobInfoV1>;
    static fromBlobInfos(blobs: BlobInfoV1[]): any;
    static toBlobInfos(obj: any): BlobInfoV1[];
}
