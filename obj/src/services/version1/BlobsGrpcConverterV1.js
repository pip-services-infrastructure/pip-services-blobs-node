"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let messages = require('../../../../src/protos/blobs_v1_pb');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const pip_services3_commons_node_4 = require("pip-services3-commons-node");
const pip_services3_commons_node_5 = require("pip-services3-commons-node");
class BlobsGrpcConverterV1 {
    static fromError(err) {
        if (err == null)
            return null;
        let description = pip_services3_commons_node_4.ErrorDescriptionFactory.create(err);
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
    static toError(obj) {
        if (obj == null || (obj.getCategory() == "" && obj.getMessage() == ""))
            return null;
        let description = {
            type: obj.getType(),
            category: obj.getCategory(),
            code: obj.getCode(),
            correlation_id: obj.getCorrelationId(),
            status: obj.getStatus(),
            message: obj.getMessage(),
            cause: obj.getCause(),
            stack_trace: obj.getStackTrace(),
            details: BlobsGrpcConverterV1.getMap(obj.getDetailsMap())
        };
        return pip_services3_commons_node_5.ApplicationExceptionFactory.create(description);
    }
    static setMap(map, values) {
        if (values == null)
            return;
        if (_.isFunction(values.toObject))
            values = values.toObject();
        if (_.isArray(values)) {
            for (let entry of values) {
                if (_.isArray(entry))
                    map[entry[0]] = entry[1];
            }
        }
        else {
            if (_.isFunction(map.set)) {
                for (let propName in values) {
                    if (values.hasOwnProperty(propName))
                        map.set(propName, values[propName]);
                }
            }
            else {
                for (let propName in values) {
                    if (values.hasOwnProperty(propName))
                        map[propName] = values[propName];
                }
            }
        }
    }
    static getMap(map) {
        let values = {};
        BlobsGrpcConverterV1.setMap(values, map);
        return values;
    }
    static toJson(value) {
        if (value == null || value == "")
            return null;
        return JSON.stringify(value);
    }
    static fromJson(value) {
        if (value == null || value == "")
            return null;
        return JSON.parse(value);
    }
    static fromPagingParams(paging) {
        if (paging == null)
            return null;
        let obj = new messages.PagingParams();
        obj.setSkip(paging.skip);
        obj.setTake(paging.take);
        obj.setTotal(paging.total);
        return obj;
    }
    static toPagingParams(obj) {
        if (obj == null)
            return null;
        let paging = new pip_services3_commons_node_1.PagingParams(obj.getSkip(), obj.getTake(), obj.getTotal());
        return paging;
    }
    static fromBlobInfo(blob) {
        if (blob == null)
            return null;
        let obj = new messages.BlobInfo();
        obj.setId(blob.id);
        obj.setGroup(blob.group);
        obj.setName(blob.name);
        obj.setSize(blob.size);
        obj.setContentType(blob.content_type);
        obj.setCreateTime(pip_services3_commons_node_2.StringConverter.toString(blob.create_time));
        obj.setExpireTime(pip_services3_commons_node_2.StringConverter.toString(blob.expire_time));
        obj.setCompleted(blob.completed);
        return obj;
    }
    static toBlobInfo(obj) {
        if (obj == null)
            return null;
        let blob = {
            id: obj.getId(),
            group: obj.getGroup(),
            name: obj.getName(),
            size: obj.getSize(),
            content_type: obj.getContentType(),
            create_time: pip_services3_commons_node_3.DateTimeConverter.toDateTime(obj.getCreateTime()),
            expire_time: pip_services3_commons_node_3.DateTimeConverter.toDateTime(obj.getExpireTime()),
            completed: obj.getCompleted()
        };
        return blob;
    }
    static fromBlobInfoPage(page) {
        if (page == null)
            return null;
        let obj = new messages.BlobInfoPage();
        obj.setTotal(page.total);
        let data = _.map(page.data, BlobsGrpcConverterV1.fromBlobInfo);
        obj.setDataList(data);
        return obj;
    }
    static toBlobInfoPage(obj) {
        if (obj == null)
            return null;
        let data = _.map(obj.getDataList(), BlobsGrpcConverterV1.toBlobInfo);
        let page = {
            total: obj.getTotal(),
            data: data
        };
        return page;
    }
    static fromBlobInfos(blobs) {
        if (blobs == null)
            return null;
        let data = _.map(blobs, BlobsGrpcConverterV1.fromBlobInfo);
        return data;
    }
    static toBlobInfos(obj) {
        if (obj == null)
            return null;
        let data = _.map(obj, BlobsGrpcConverterV1.toBlobInfo);
        return data;
    }
}
exports.BlobsGrpcConverterV1 = BlobsGrpcConverterV1;
//# sourceMappingURL=BlobsGrpcConverterV1.js.map