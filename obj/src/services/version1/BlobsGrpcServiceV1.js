"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let services = require('../../../../src/protos/blobs_v1_grpc_pb');
let messages = require('../../../../src/protos/blobs_v1_pb');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_grpc_node_1 = require("pip-services3-grpc-node");
const BlobsGrpcConverterV1_1 = require("./BlobsGrpcConverterV1");
class BlobsGrpcServiceV1 extends pip_services3_grpc_node_1.GrpcService {
    constructor() {
        super(services.BlobsService);
        this._dependencyResolver.put('controller', new pip_services3_commons_node_1.Descriptor("pip-services-blobs", "controller", "default", "*", "*"));
    }
    setReferences(references) {
        super.setReferences(references);
        this._controller = this._dependencyResolver.getOneRequired('controller');
    }
    getBlobsByFilter(call, callback) {
        let correlationId = call.request.getCorrelationId();
        let filter = new pip_services3_commons_node_2.FilterParams();
        BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.setMap(filter, call.request.getFilterMap());
        let paging = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toPagingParams(call.request.getPaging());
        this._controller.getBlobsByFilter(correlationId, filter, paging, (err, result) => {
            let error = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromError(err);
            let page = err == null ? BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromBlobInfoPage(result) : null;
            let response = new messages.BlobInfoPageReply();
            response.setError(error);
            response.setPage(page);
            callback(err, response);
        });
    }
    getBlobsByIds(call, callback) {
        let correlationId = call.request.getCorrelationId();
        let blobIds = call.request.getBlobIdsList();
        this._controller.getBlobsByIds(correlationId, blobIds, (err, result) => {
            let error = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromError(err);
            let blobs = err == null ? BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromBlobInfos(result) : null;
            let response = new messages.BlobInfoObjectsReply();
            response.setError(error);
            response.setBlobsList(blobs);
            callback(err, response);
        });
    }
    getBlobById(call, callback) {
        let correlationId = call.request.getCorrelationId();
        let blobId = call.request.getBlobId();
        this._controller.getBlobById(correlationId, blobId, (err, result) => {
            let error = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromError(err);
            let blob = err == null ? BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromBlobInfo(result) : null;
            let response = new messages.BlobInfoObjectReply();
            response.setError(error);
            response.setBlob(blob);
            callback(err, response);
        });
    }
    getBlobUriById(call, callback) {
        let correlationId = call.request.getCorrelationId();
        let blobId = call.request.getBlobId();
        this._controller.getBlobUriById(correlationId, blobId, (err, result) => {
            let error = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromError(err);
            let response = new messages.BlobUriReply();
            response.setError(error);
            response.setUri(result);
            callback(err, response);
        });
    }
    beginBlobWrite(call, callback) {
        let correlationId = call.request.getCorrelationId();
        let blob = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toBlobInfo(call.request.getBlob());
        this._controller.beginBlobWrite(correlationId, blob, (err, result) => {
            let error = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromError(err);
            let response = new messages.BlobTokenReply();
            response.setError(error);
            response.setToken(result);
            callback(err, response);
        });
    }
    writeBlobChunk(call, callback) {
        let correlationId = call.request.getCorrelationId();
        let token = call.request.getToken();
        let chunk = call.request.getChunk();
        this._controller.writeBlobChunk(correlationId, token, chunk, (err, result) => {
            let error = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromError(err);
            let response = new messages.BlobTokenReply();
            response.setError(error);
            response.setToken(result);
            callback(err, response);
        });
    }
    endBlobWrite(call, callback) {
        let correlationId = call.request.getCorrelationId();
        let token = call.request.getToken();
        let chunk = call.request.getChunk();
        this._controller.endBlobWrite(correlationId, token, chunk, (err, result) => {
            let error = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromError(err);
            let blob = err == null ? BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromBlobInfo(result) : null;
            let response = new messages.BlobInfoObjectReply();
            response.setError(error);
            response.setBlob(blob);
            callback(err, response);
        });
    }
    abortBlobWrite(call, callback) {
        let correlationId = call.request.getCorrelationId();
        let token = call.request.getToken();
        this._controller.abortBlobWrite(correlationId, token, (err) => {
            let error = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromError(err);
            let response = new messages.BlobEmptyReply();
            response.setError(error);
            callback(err, response);
        });
    }
    beginBlobRead(call, callback) {
        let correlationId = call.request.getCorrelationId();
        let blobId = call.request.getBlobId();
        this._controller.beginBlobRead(correlationId, blobId, (err, result) => {
            let error = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromError(err);
            let blob = err == null ? BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromBlobInfo(result) : null;
            let response = new messages.BlobInfoObjectReply();
            response.setError(error);
            response.setBlob(blob);
            callback(err, response);
        });
    }
    readBlobChunk(call, callback) {
        let correlationId = call.request.getCorrelationId();
        let blobId = call.request.getBlobId();
        let skip = call.request.getSkip();
        let take = call.request.getTake();
        this._controller.readBlobChunk(correlationId, blobId, skip, take, (err, result) => {
            let error = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromError(err);
            let response = new messages.BlobChunkReply();
            response.setError(error);
            response.setChunk(result);
            callback(err, response);
        });
    }
    endBlobRead(call, callback) {
        let correlationId = call.request.getCorrelationId();
        let blobId = call.request.getBlobId();
        this._controller.endBlobRead(correlationId, blobId, (err) => {
            let error = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromError(err);
            let response = new messages.BlobEmptyReply();
            response.setError(error);
            callback(err, response);
        });
    }
    updateBlobInfo(call, callback) {
        let correlationId = call.request.getCorrelationId();
        let blob = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toBlobInfo(call.request.getBlob());
        this._controller.updateBlobInfo(correlationId, blob, (err, result) => {
            let error = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromError(err);
            let blob = err == null ? BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromBlobInfo(result) : null;
            let response = new messages.BlobObjectReply();
            response.setError(error);
            if (result)
                response.setBlob(blob);
            callback(err, response);
        });
    }
    markBlobsCompleted(call, callback) {
        let correlationId = call.request.getCorrelationId();
        let blobIds = call.request.getBlobIdsList();
        this._controller.markBlobsCompleted(correlationId, blobIds, (err) => {
            let error = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromError(err);
            let response = new messages.BlobEmptyReply();
            response.setError(error);
            callback(err, response);
        });
    }
    deleteBlobById(call, callback) {
        let correlationId = call.request.getCorrelationId();
        let blobId = call.request.getBlobId();
        this._controller.deleteBlobById(correlationId, blobId, (err) => {
            let error = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromError(err);
            let response = new messages.BlobEmptyReply();
            response.setError(error);
            callback(err, response);
        });
    }
    deleteBlobsByIds(call, callback) {
        let correlationId = call.request.getCorrelationId();
        let blobIds = call.request.getBlobIdsList();
        this._controller.deleteBlobsByIds(correlationId, blobIds, (err) => {
            let error = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromError(err);
            let response = new messages.BlobEmptyReply();
            response.setError(error);
            callback(err, response);
        });
    }
    register() {
        this.registerMethod('get_blobs_by_filter', null, this.getBlobsByFilter);
        this.registerMethod('get_blobs_by_ids', null, this.getBlobsByIds);
        this.registerMethod('get_blob_by_id', null, this.getBlobById);
        this.registerMethod('get_blob_uri_by_id', null, this.getBlobUriById);
        this.registerMethod('begin_blob_write', null, this.beginBlobWrite);
        this.registerMethod('write_blob_chunk', null, this.writeBlobChunk);
        this.registerMethod('end_blob_write', null, this.endBlobWrite);
        this.registerMethod('abort_blob_write', null, this.abortBlobWrite);
        this.registerMethod('begin_blob_read', null, this.beginBlobRead);
        this.registerMethod('read_blob_chunk', null, this.readBlobChunk);
        this.registerMethod('end_blob_read', null, this.endBlobRead);
        this.registerMethod('update_blob_info', null, this.updateBlobInfo);
        this.registerMethod('mark_blobs_completed', null, this.markBlobsCompleted);
        this.registerMethod('delete_blob_by_id', null, this.deleteBlobById);
        this.registerMethod('delete_blobs_by_ids', null, this.deleteBlobsByIds);
    }
}
exports.BlobsGrpcServiceV1 = BlobsGrpcServiceV1;
//# sourceMappingURL=BlobsGrpcServiceV1.js.map