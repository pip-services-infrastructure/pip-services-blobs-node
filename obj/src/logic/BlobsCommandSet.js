"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const pip_services3_commons_node_4 = require("pip-services3-commons-node");
const pip_services3_commons_node_5 = require("pip-services3-commons-node");
const pip_services3_commons_node_6 = require("pip-services3-commons-node");
const pip_services3_commons_node_7 = require("pip-services3-commons-node");
const pip_services3_commons_node_8 = require("pip-services3-commons-node");
const pip_services3_commons_node_9 = require("pip-services3-commons-node");
const BlobInfoV1Schema_1 = require("../data/version1/BlobInfoV1Schema");
class BlobsCommandSet extends pip_services3_commons_node_1.CommandSet {
    constructor(logic) {
        super();
        this._logic = logic;
        this.addCommand(this.makeGetBlobsByFilterCommand());
        this.addCommand(this.makeGetBlobsByIdsCommand());
        this.addCommand(this.makeGetBlobByIdCommand());
        this.addCommand(this.makeGetBlobUriByIdCommand());
        this.addCommand(this.makeBeginBlobWriteCommand());
        this.addCommand(this.makeWriteBlobChunkCommand());
        this.addCommand(this.makeEndBlobWriteCommand());
        this.addCommand(this.makeAbortBlobWriteCommand());
        this.addCommand(this.makeBeginBlobReadCommand());
        this.addCommand(this.makeReadBlobChunkCommand());
        this.addCommand(this.makeEndBlobReadCommand());
        this.addCommand(this.makeUpdateBlobInfoCommand());
        this.addCommand(this.makeMarkBlobsCompletedCommand());
        this.addCommand(this.makeDeleteBlobByIdCommand());
        this.addCommand(this.makeDeleteBlobsByIdsCommand());
    }
    makeGetBlobsByFilterCommand() {
        return new pip_services3_commons_node_2.Command("get_blobs_by_filter", new pip_services3_commons_node_5.ObjectSchema(true)
            .withOptionalProperty("filter", new pip_services3_commons_node_8.FilterParamsSchema())
            .withOptionalProperty("paging", new pip_services3_commons_node_9.PagingParamsSchema()), (correlationId, args, callback) => {
            let filter = pip_services3_commons_node_3.FilterParams.fromValue(args.get("filter"));
            let paging = pip_services3_commons_node_4.PagingParams.fromValue(args.get("paging"));
            this._logic.getBlobsByFilter(correlationId, filter, paging, callback);
        });
    }
    makeGetBlobsByIdsCommand() {
        return new pip_services3_commons_node_2.Command("get_blobs_by_ids", new pip_services3_commons_node_5.ObjectSchema(true)
            .withRequiredProperty("blob_ids", new pip_services3_commons_node_6.ArraySchema(pip_services3_commons_node_7.TypeCode.String)), (correlationId, args, callback) => {
            let temp = args.getAsString("blob_ids");
            let blobIds = temp.split(',');
            this._logic.getBlobsByIds(correlationId, blobIds, callback);
        });
    }
    makeGetBlobByIdCommand() {
        return new pip_services3_commons_node_2.Command("get_blob_by_id", new pip_services3_commons_node_5.ObjectSchema(true)
            .withRequiredProperty("blob_id", pip_services3_commons_node_7.TypeCode.String), (correlationId, args, callback) => {
            let blobId = args.getAsNullableString("blob_id");
            this._logic.getBlobById(correlationId, blobId, callback);
        });
    }
    makeGetBlobUriByIdCommand() {
        return new pip_services3_commons_node_2.Command("get_blob_uri_by_id", new pip_services3_commons_node_5.ObjectSchema(true)
            .withRequiredProperty("blob_id", pip_services3_commons_node_7.TypeCode.String), (correlationId, args, callback) => {
            let blobId = args.getAsNullableString("blob_id");
            this._logic.getBlobUriById(correlationId, blobId, callback);
        });
    }
    makeBeginBlobWriteCommand() {
        return new pip_services3_commons_node_2.Command("begin_blob_write", new pip_services3_commons_node_5.ObjectSchema(true)
            .withRequiredProperty("blob", new BlobInfoV1Schema_1.BlobInfoV1Schema()), (correlationId, args, callback) => {
            let blob = args.get("blob");
            this._logic.beginBlobWrite(correlationId, blob, callback);
        });
    }
    makeWriteBlobChunkCommand() {
        return new pip_services3_commons_node_2.Command("write_blob_chunk", new pip_services3_commons_node_5.ObjectSchema(true)
            .withRequiredProperty("token", pip_services3_commons_node_7.TypeCode.String)
            .withRequiredProperty("chunk", pip_services3_commons_node_7.TypeCode.String), (correlationId, args, callback) => {
            let token = args.getAsNullableString("token");
            let chunk = args.getAsNullableString("chunk");
            this._logic.writeBlobChunk(correlationId, token, chunk, callback);
        });
    }
    makeEndBlobWriteCommand() {
        return new pip_services3_commons_node_2.Command("end_blob_write", new pip_services3_commons_node_5.ObjectSchema(true)
            .withRequiredProperty("token", pip_services3_commons_node_7.TypeCode.String)
            .withOptionalProperty("chunk", pip_services3_commons_node_7.TypeCode.String), (correlationId, args, callback) => {
            let token = args.getAsNullableString("token");
            let chunk = args.getAsNullableString("chunk");
            this._logic.endBlobWrite(correlationId, token, chunk, callback);
        });
    }
    makeAbortBlobWriteCommand() {
        return new pip_services3_commons_node_2.Command("abort_blob_write", new pip_services3_commons_node_5.ObjectSchema(true)
            .withRequiredProperty("token", pip_services3_commons_node_7.TypeCode.String), (correlationId, args, callback) => {
            let token = args.getAsNullableString("token");
            this._logic.abortBlobWrite(correlationId, token, (err) => {
                callback(err, null);
            });
        });
    }
    makeBeginBlobReadCommand() {
        return new pip_services3_commons_node_2.Command("begin_blob_read", new pip_services3_commons_node_5.ObjectSchema(true)
            .withRequiredProperty("blob_id", pip_services3_commons_node_7.TypeCode.String), (correlationId, args, callback) => {
            let blobId = args.getAsNullableString("blob_id");
            this._logic.beginBlobRead(correlationId, blobId, callback);
        });
    }
    makeReadBlobChunkCommand() {
        return new pip_services3_commons_node_2.Command("read_blob_chunk", new pip_services3_commons_node_5.ObjectSchema(true)
            .withRequiredProperty("blob_id", pip_services3_commons_node_7.TypeCode.String)
            .withRequiredProperty("skip", pip_services3_commons_node_7.TypeCode.Long)
            .withRequiredProperty("take", pip_services3_commons_node_7.TypeCode.Long), (correlationId, args, callback) => {
            let blobId = args.getAsNullableString("blob_id");
            let skip = args.getAsNullableLong("skip");
            let take = args.getAsNullableLong("take");
            this._logic.readBlobChunk(correlationId, blobId, skip, take, callback);
        });
    }
    makeEndBlobReadCommand() {
        return new pip_services3_commons_node_2.Command("end_blob_read", new pip_services3_commons_node_5.ObjectSchema(true)
            .withRequiredProperty("blob_id", pip_services3_commons_node_7.TypeCode.String), (correlationId, args, callback) => {
            let blobId = args.getAsNullableString("blob_id");
            this._logic.endBlobRead(correlationId, blobId, (err) => {
                callback(err, null);
            });
        });
    }
    makeUpdateBlobInfoCommand() {
        return new pip_services3_commons_node_2.Command("update_blob_info", new pip_services3_commons_node_5.ObjectSchema(true)
            .withRequiredProperty("blob", new BlobInfoV1Schema_1.BlobInfoV1Schema()), (correlationId, args, callback) => {
            let blob = args.get("blob");
            this._logic.updateBlobInfo(correlationId, blob, callback);
        });
    }
    makeMarkBlobsCompletedCommand() {
        return new pip_services3_commons_node_2.Command("mark_blobs_completed", new pip_services3_commons_node_5.ObjectSchema(true)
            .withRequiredProperty("blob_ids", new pip_services3_commons_node_6.ArraySchema(pip_services3_commons_node_7.TypeCode.String)), (correlationId, args, callback) => {
            let blobIds = args.get("blob_ids");
            this._logic.markBlobsCompleted(correlationId, blobIds, (err) => {
                callback(err, null);
            });
        });
    }
    makeDeleteBlobByIdCommand() {
        return new pip_services3_commons_node_2.Command("delete_blob_by_id", new pip_services3_commons_node_5.ObjectSchema(true)
            .withRequiredProperty("blob_id", pip_services3_commons_node_7.TypeCode.String), (correlationId, args, callback) => {
            let blobId = args.getAsNullableString("blob_id");
            this._logic.deleteBlobById(correlationId, blobId, (err) => {
                callback(err, null);
            });
        });
    }
    makeDeleteBlobsByIdsCommand() {
        return new pip_services3_commons_node_2.Command("delete_blobs_by_ids", new pip_services3_commons_node_5.ObjectSchema(true)
            .withRequiredProperty("blob_ids", new pip_services3_commons_node_6.ArraySchema(pip_services3_commons_node_7.TypeCode.String)), (correlationId, args, callback) => {
            let blobIds = args.get("blob_ids");
            this._logic.deleteBlobsByIds(correlationId, blobIds, (err) => {
                callback(err, null);
            });
        });
    }
}
exports.BlobsCommandSet = BlobsCommandSet;
//# sourceMappingURL=BlobsCommandSet.js.map