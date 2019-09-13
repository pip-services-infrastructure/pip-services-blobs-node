"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const BlobsCommandSet_1 = require("./BlobsCommandSet");
class BlobsController {
    constructor() {
        this._dependencyResolver = new pip_services3_commons_node_2.DependencyResolver(BlobsController._defaultConfig);
    }
    configure(config) {
        this._dependencyResolver.configure(config);
    }
    setReferences(references) {
        this._dependencyResolver.setReferences(references);
        this._persistence = this._dependencyResolver.getOneRequired('persistence');
    }
    getCommandSet() {
        if (this._commandSet == null)
            this._commandSet = new BlobsCommandSet_1.BlobsCommandSet(this);
        return this._commandSet;
    }
    getBlobsByFilter(correlationId, filter, paging, callback) {
        this._persistence.getPageByFilter(correlationId, filter, paging, callback);
    }
    getBlobsByIds(correlationId, blobIds, callback) {
        this._persistence.getListByIds(correlationId, blobIds, callback);
    }
    getBlobById(correlationId, blobId, callback) {
        this._persistence.getOneById(correlationId, blobId, callback);
    }
    getBlobUriById(correlationId, blobId, callback) {
        this._persistence.getUri(correlationId, blobId, callback);
    }
    normalizeName(name) {
        if (name == null)
            return null;
        name = name.replace('\\', '/');
        let pos = name.lastIndexOf('/');
        if (pos >= 0)
            name = name.substring(pos + 1);
        return name;
    }
    beginBlobWrite(correlationId, blob, callback) {
        blob.id = blob.id || pip_services3_commons_node_3.IdGenerator.nextLong();
        blob.name = this.normalizeName(blob.name);
        this._persistence.beginWrite(correlationId, blob, callback);
    }
    writeBlobChunk(correlationId, token, chunk, callback) {
        chunk = chunk || "";
        this._persistence.writeChunk(correlationId, token, chunk, callback);
    }
    endBlobWrite(correlationId, token, chunk, callback) {
        chunk = chunk || "";
        this._persistence.endWrite(correlationId, token, chunk, callback);
    }
    abortBlobWrite(correlationId, token, callback) {
        this._persistence.abortWrite(correlationId, token, callback);
    }
    beginBlobRead(correlationId, blobId, callback) {
        this._persistence.beginRead(correlationId, blobId, callback);
    }
    readBlobChunk(correlationId, blobId, skip, take, callback) {
        this._persistence.readChunk(correlationId, blobId, skip, take, callback);
    }
    endBlobRead(correlationId, blobId, callback) {
        this._persistence.endRead(correlationId, blobId, callback);
    }
    updateBlobInfo(correlationId, blob, callback) {
        this._persistence.update(correlationId, blob, callback);
    }
    markBlobsCompleted(correlationId, blobIds, callback) {
        this._persistence.markCompleted(correlationId, blobIds, callback);
    }
    deleteBlobById(correlationId, blobId, callback) {
        this._persistence.deleteById(correlationId, blobId, callback);
    }
    deleteBlobsByIds(correlationId, blobIds, callback) {
        this._persistence.deleteByIds(correlationId, blobIds, callback);
    }
}
exports.BlobsController = BlobsController;
BlobsController._defaultConfig = pip_services3_commons_node_1.ConfigParams.fromTuples('dependencies.persistence', 'pip-services-blobs:persistence:*:*:1.0');
//# sourceMappingURL=BlobsController.js.map