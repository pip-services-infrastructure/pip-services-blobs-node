let _ = require('lodash');
let messages = require('../../../../src/protos/blobs_v1_pb');

import { DataPage } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { StringConverter } from 'pip-services3-commons-node';
import { DateTimeConverter } from 'pip-services3-commons-node';
import { ErrorDescriptionFactory } from 'pip-services3-commons-node';
import { ErrorDescription } from 'pip-services3-commons-node';
import { ApplicationExceptionFactory } from 'pip-services3-commons-node';

import { BlobInfoV1 } from '../../data/version1/BlobInfoV1';

export class BlobsGrpcConverterV1 {

    public static fromError(err: any): any {
        if (err == null) return null;

        let description = ErrorDescriptionFactory.create(err);
        let obj = new messages.ErrorDescription();

        obj.setType(description.type);
        obj.setCategory(description.category);
        obj.setCode(description.code);
        obj.setCorrelationId(description.correlation_id);
        obj.setStatus(description.status);
        obj.setMessage(description.message);
        obj.setCause(description.cause);
        obj.setStackTrace(description.stack_trace);
        BlobsGrpcConverterV1.setMap(obj.getDetailsMap(), description.details);

        return obj;
    }

    public static toError(obj: any): any {
        if (obj == null || (obj.getCategory() == "" && obj.getMessage() == ""))
            return null;

        let description: ErrorDescription = {
            type: obj.getType(),
            category: obj.getCategory(),
            code: obj.getCode(),
            correlation_id: obj.getCorrelationId(),
            status: obj.getStatus(),
            message: obj.getMessage(),
            cause: obj.getCause(),
            stack_trace: obj.getStackTrace(),
            details: BlobsGrpcConverterV1.getMap(obj.getDetailsMap())
        }

        return ApplicationExceptionFactory.create(description);
    }

    public static setMap(map: any, values: any): void {
        if (values == null) return;

        if (_.isFunction(values.toObject))
            values = values.toObject();

        if (_.isArray(values)) {
            for (let entry of values) {
                if (_.isArray(entry))
                    map[entry[0]] = entry[1];
            }
        } else {
            if (_.isFunction(map.set)) {
                for (let propName in values) {
                    if (values.hasOwnProperty(propName))
                        map.set(propName, values[propName]);
                }
            } else {
                for (let propName in values) {
                    if (values.hasOwnProperty(propName))
                        map[propName] = values[propName];
                }
            }
        }
    }

    public static getMap(map: any): any {
        let values = {};
        BlobsGrpcConverterV1.setMap(values, map);
        return values;
    }

    private static toJson(value: any): string {
        if (value == null || value == "") return null;
        return JSON.stringify(value);
    }

    private static fromJson(value: string): any {
        if (value == null || value == "") return null;
        return JSON.parse(value);
    }

    public static fromPagingParams(paging: PagingParams): any {
        if (paging == null) return null;

        let obj = new messages.PagingParams();

        obj.setSkip(paging.skip);
        obj.setTake(paging.take);
        obj.setTotal(paging.total);

        return obj;
    }

    public static toPagingParams(obj: any): PagingParams {
        if (obj == null)
            return null;

        let paging: PagingParams = new PagingParams(
            obj.getSkip(),
            obj.getTake(),
            obj.getTotal()
        );

        return paging;
    }

    public static fromBlobInfo(blob: BlobInfoV1): any {
        if (blob == null) return null;

        let obj = new messages.BlobInfo();

        obj.setId(blob.id);
        obj.setGroup(blob.group);
        obj.setName(blob.name);

        obj.setSize(blob.size);
        obj.setContentType(blob.content_type);
        obj.setCreateTime(StringConverter.toString(blob.create_time))
        obj.setExpireTime(StringConverter.toString(blob.expire_time))
        obj.setCompleted(blob.completed);

        return obj;
    }

    public static toBlobInfo(obj: any): BlobInfoV1 {
        if (obj == null) return null;

        let blob: BlobInfoV1 = {
            id: obj.getId(),
            group: obj.getGroup(),
            name: obj.getName(),
            size: obj.getSize(),
            content_type: obj.getContentType(),
            create_time: DateTimeConverter.toDateTime(obj.getCreateTime()),
            expire_time: DateTimeConverter.toDateTime(obj.getExpireTime()),
            completed: obj.getCompleted()
        };

        return blob;
    }

    public static fromBlobInfoPage(page: DataPage<BlobInfoV1>): any {
        if (page == null) return null;

        let obj = new messages.BlobInfoPage();

        obj.setTotal(page.total);
        let data = _.map(page.data, BlobsGrpcConverterV1.fromBlobInfo);
        obj.setDataList(data);

        return obj;
    }

    public static toBlobInfoPage(obj: any): DataPage<BlobInfoV1> {
        if (obj == null) return null;

        let data = _.map(obj.getDataList(), BlobsGrpcConverterV1.toBlobInfo);
        let page: DataPage<BlobInfoV1> = {
            total: obj.getTotal(),
            data: data
        };

        return page;
    }

    public static fromBlobInfos(blobs: BlobInfoV1[]): any {
        if (blobs == null) return null;

        let data = _.map(blobs, BlobsGrpcConverterV1.fromBlobInfo);

        return data;
    }

    public static toBlobInfos(obj: any): BlobInfoV1[] {
        if (obj == null) return null;

        let data = _.map(obj, BlobsGrpcConverterV1.toBlobInfo);

        return data;
    }    
}