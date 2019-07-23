// GENERATED CODE -- DO NOT EDIT!

// Original file comments:
// Copyright 2015 gRPC authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
'use strict';
var grpc = require('grpc');
var blobs_v1_pb = require('./blobs_v1_pb.js');

function serialize_blobs_v1_BlobChunkReply(arg) {
  if (!(arg instanceof blobs_v1_pb.BlobChunkReply)) {
    throw new Error('Expected argument of type blobs_v1.BlobChunkReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_blobs_v1_BlobChunkReply(buffer_arg) {
  return blobs_v1_pb.BlobChunkReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_blobs_v1_BlobEmptyReply(arg) {
  if (!(arg instanceof blobs_v1_pb.BlobEmptyReply)) {
    throw new Error('Expected argument of type blobs_v1.BlobEmptyReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_blobs_v1_BlobEmptyReply(buffer_arg) {
  return blobs_v1_pb.BlobEmptyReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_blobs_v1_BlobIdRequest(arg) {
  if (!(arg instanceof blobs_v1_pb.BlobIdRequest)) {
    throw new Error('Expected argument of type blobs_v1.BlobIdRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_blobs_v1_BlobIdRequest(buffer_arg) {
  return blobs_v1_pb.BlobIdRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_blobs_v1_BlobIdsRequest(arg) {
  if (!(arg instanceof blobs_v1_pb.BlobIdsRequest)) {
    throw new Error('Expected argument of type blobs_v1.BlobIdsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_blobs_v1_BlobIdsRequest(buffer_arg) {
  return blobs_v1_pb.BlobIdsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_blobs_v1_BlobInfoObjectReply(arg) {
  if (!(arg instanceof blobs_v1_pb.BlobInfoObjectReply)) {
    throw new Error('Expected argument of type blobs_v1.BlobInfoObjectReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_blobs_v1_BlobInfoObjectReply(buffer_arg) {
  return blobs_v1_pb.BlobInfoObjectReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_blobs_v1_BlobInfoObjectRequest(arg) {
  if (!(arg instanceof blobs_v1_pb.BlobInfoObjectRequest)) {
    throw new Error('Expected argument of type blobs_v1.BlobInfoObjectRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_blobs_v1_BlobInfoObjectRequest(buffer_arg) {
  return blobs_v1_pb.BlobInfoObjectRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_blobs_v1_BlobInfoObjectsReply(arg) {
  if (!(arg instanceof blobs_v1_pb.BlobInfoObjectsReply)) {
    throw new Error('Expected argument of type blobs_v1.BlobInfoObjectsReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_blobs_v1_BlobInfoObjectsReply(buffer_arg) {
  return blobs_v1_pb.BlobInfoObjectsReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_blobs_v1_BlobInfoPageReply(arg) {
  if (!(arg instanceof blobs_v1_pb.BlobInfoPageReply)) {
    throw new Error('Expected argument of type blobs_v1.BlobInfoPageReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_blobs_v1_BlobInfoPageReply(buffer_arg) {
  return blobs_v1_pb.BlobInfoPageReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_blobs_v1_BlobInfoPageRequest(arg) {
  if (!(arg instanceof blobs_v1_pb.BlobInfoPageRequest)) {
    throw new Error('Expected argument of type blobs_v1.BlobInfoPageRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_blobs_v1_BlobInfoPageRequest(buffer_arg) {
  return blobs_v1_pb.BlobInfoPageRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_blobs_v1_BlobReadRequest(arg) {
  if (!(arg instanceof blobs_v1_pb.BlobReadRequest)) {
    throw new Error('Expected argument of type blobs_v1.BlobReadRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_blobs_v1_BlobReadRequest(buffer_arg) {
  return blobs_v1_pb.BlobReadRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_blobs_v1_BlobTokenReply(arg) {
  if (!(arg instanceof blobs_v1_pb.BlobTokenReply)) {
    throw new Error('Expected argument of type blobs_v1.BlobTokenReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_blobs_v1_BlobTokenReply(buffer_arg) {
  return blobs_v1_pb.BlobTokenReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_blobs_v1_BlobTokenRequest(arg) {
  if (!(arg instanceof blobs_v1_pb.BlobTokenRequest)) {
    throw new Error('Expected argument of type blobs_v1.BlobTokenRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_blobs_v1_BlobTokenRequest(buffer_arg) {
  return blobs_v1_pb.BlobTokenRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_blobs_v1_BlobTokenWithChunkRequest(arg) {
  if (!(arg instanceof blobs_v1_pb.BlobTokenWithChunkRequest)) {
    throw new Error('Expected argument of type blobs_v1.BlobTokenWithChunkRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_blobs_v1_BlobTokenWithChunkRequest(buffer_arg) {
  return blobs_v1_pb.BlobTokenWithChunkRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_blobs_v1_BlobUriReply(arg) {
  if (!(arg instanceof blobs_v1_pb.BlobUriReply)) {
    throw new Error('Expected argument of type blobs_v1.BlobUriReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_blobs_v1_BlobUriReply(buffer_arg) {
  return blobs_v1_pb.BlobUriReply.deserializeBinary(new Uint8Array(buffer_arg));
}


// The blobs service definition.
var BlobsService = exports.BlobsService = {
  get_blobs_by_filter: {
    path: '/blobs_v1.Blobs/get_blobs_by_filter',
    requestStream: false,
    responseStream: false,
    requestType: blobs_v1_pb.BlobInfoPageRequest,
    responseType: blobs_v1_pb.BlobInfoPageReply,
    requestSerialize: serialize_blobs_v1_BlobInfoPageRequest,
    requestDeserialize: deserialize_blobs_v1_BlobInfoPageRequest,
    responseSerialize: serialize_blobs_v1_BlobInfoPageReply,
    responseDeserialize: deserialize_blobs_v1_BlobInfoPageReply,
  },
  get_blobs_by_ids: {
    path: '/blobs_v1.Blobs/get_blobs_by_ids',
    requestStream: false,
    responseStream: false,
    requestType: blobs_v1_pb.BlobIdsRequest,
    responseType: blobs_v1_pb.BlobInfoObjectsReply,
    requestSerialize: serialize_blobs_v1_BlobIdsRequest,
    requestDeserialize: deserialize_blobs_v1_BlobIdsRequest,
    responseSerialize: serialize_blobs_v1_BlobInfoObjectsReply,
    responseDeserialize: deserialize_blobs_v1_BlobInfoObjectsReply,
  },
  get_blob_by_id: {
    path: '/blobs_v1.Blobs/get_blob_by_id',
    requestStream: false,
    responseStream: false,
    requestType: blobs_v1_pb.BlobIdRequest,
    responseType: blobs_v1_pb.BlobInfoObjectReply,
    requestSerialize: serialize_blobs_v1_BlobIdRequest,
    requestDeserialize: deserialize_blobs_v1_BlobIdRequest,
    responseSerialize: serialize_blobs_v1_BlobInfoObjectReply,
    responseDeserialize: deserialize_blobs_v1_BlobInfoObjectReply,
  },
  get_blob_uri_by_id: {
    path: '/blobs_v1.Blobs/get_blob_uri_by_id',
    requestStream: false,
    responseStream: false,
    requestType: blobs_v1_pb.BlobIdRequest,
    responseType: blobs_v1_pb.BlobUriReply,
    requestSerialize: serialize_blobs_v1_BlobIdRequest,
    requestDeserialize: deserialize_blobs_v1_BlobIdRequest,
    responseSerialize: serialize_blobs_v1_BlobUriReply,
    responseDeserialize: deserialize_blobs_v1_BlobUriReply,
  },
  begin_blob_write: {
    path: '/blobs_v1.Blobs/begin_blob_write',
    requestStream: false,
    responseStream: false,
    requestType: blobs_v1_pb.BlobInfoObjectRequest,
    responseType: blobs_v1_pb.BlobTokenReply,
    requestSerialize: serialize_blobs_v1_BlobInfoObjectRequest,
    requestDeserialize: deserialize_blobs_v1_BlobInfoObjectRequest,
    responseSerialize: serialize_blobs_v1_BlobTokenReply,
    responseDeserialize: deserialize_blobs_v1_BlobTokenReply,
  },
  write_blob_chunk: {
    path: '/blobs_v1.Blobs/write_blob_chunk',
    requestStream: false,
    responseStream: false,
    requestType: blobs_v1_pb.BlobTokenWithChunkRequest,
    responseType: blobs_v1_pb.BlobTokenReply,
    requestSerialize: serialize_blobs_v1_BlobTokenWithChunkRequest,
    requestDeserialize: deserialize_blobs_v1_BlobTokenWithChunkRequest,
    responseSerialize: serialize_blobs_v1_BlobTokenReply,
    responseDeserialize: deserialize_blobs_v1_BlobTokenReply,
  },
  end_blob_write: {
    path: '/blobs_v1.Blobs/end_blob_write',
    requestStream: false,
    responseStream: false,
    requestType: blobs_v1_pb.BlobTokenWithChunkRequest,
    responseType: blobs_v1_pb.BlobInfoObjectReply,
    requestSerialize: serialize_blobs_v1_BlobTokenWithChunkRequest,
    requestDeserialize: deserialize_blobs_v1_BlobTokenWithChunkRequest,
    responseSerialize: serialize_blobs_v1_BlobInfoObjectReply,
    responseDeserialize: deserialize_blobs_v1_BlobInfoObjectReply,
  },
  abort_blob_write: {
    path: '/blobs_v1.Blobs/abort_blob_write',
    requestStream: false,
    responseStream: false,
    requestType: blobs_v1_pb.BlobTokenRequest,
    responseType: blobs_v1_pb.BlobEmptyReply,
    requestSerialize: serialize_blobs_v1_BlobTokenRequest,
    requestDeserialize: deserialize_blobs_v1_BlobTokenRequest,
    responseSerialize: serialize_blobs_v1_BlobEmptyReply,
    responseDeserialize: deserialize_blobs_v1_BlobEmptyReply,
  },
  begin_blob_read: {
    path: '/blobs_v1.Blobs/begin_blob_read',
    requestStream: false,
    responseStream: false,
    requestType: blobs_v1_pb.BlobIdRequest,
    responseType: blobs_v1_pb.BlobInfoObjectReply,
    requestSerialize: serialize_blobs_v1_BlobIdRequest,
    requestDeserialize: deserialize_blobs_v1_BlobIdRequest,
    responseSerialize: serialize_blobs_v1_BlobInfoObjectReply,
    responseDeserialize: deserialize_blobs_v1_BlobInfoObjectReply,
  },
  read_blob_chunk: {
    path: '/blobs_v1.Blobs/read_blob_chunk',
    requestStream: false,
    responseStream: false,
    requestType: blobs_v1_pb.BlobReadRequest,
    responseType: blobs_v1_pb.BlobChunkReply,
    requestSerialize: serialize_blobs_v1_BlobReadRequest,
    requestDeserialize: deserialize_blobs_v1_BlobReadRequest,
    responseSerialize: serialize_blobs_v1_BlobChunkReply,
    responseDeserialize: deserialize_blobs_v1_BlobChunkReply,
  },
  end_blob_read: {
    path: '/blobs_v1.Blobs/end_blob_read',
    requestStream: false,
    responseStream: false,
    requestType: blobs_v1_pb.BlobIdRequest,
    responseType: blobs_v1_pb.BlobEmptyReply,
    requestSerialize: serialize_blobs_v1_BlobIdRequest,
    requestDeserialize: deserialize_blobs_v1_BlobIdRequest,
    responseSerialize: serialize_blobs_v1_BlobEmptyReply,
    responseDeserialize: deserialize_blobs_v1_BlobEmptyReply,
  },
  update_blob_info: {
    path: '/blobs_v1.Blobs/update_blob_info',
    requestStream: false,
    responseStream: false,
    requestType: blobs_v1_pb.BlobInfoObjectRequest,
    responseType: blobs_v1_pb.BlobInfoObjectReply,
    requestSerialize: serialize_blobs_v1_BlobInfoObjectRequest,
    requestDeserialize: deserialize_blobs_v1_BlobInfoObjectRequest,
    responseSerialize: serialize_blobs_v1_BlobInfoObjectReply,
    responseDeserialize: deserialize_blobs_v1_BlobInfoObjectReply,
  },
  mark_blobs_completed: {
    path: '/blobs_v1.Blobs/mark_blobs_completed',
    requestStream: false,
    responseStream: false,
    requestType: blobs_v1_pb.BlobIdsRequest,
    responseType: blobs_v1_pb.BlobEmptyReply,
    requestSerialize: serialize_blobs_v1_BlobIdsRequest,
    requestDeserialize: deserialize_blobs_v1_BlobIdsRequest,
    responseSerialize: serialize_blobs_v1_BlobEmptyReply,
    responseDeserialize: deserialize_blobs_v1_BlobEmptyReply,
  },
  delete_blob_by_id: {
    path: '/blobs_v1.Blobs/delete_blob_by_id',
    requestStream: false,
    responseStream: false,
    requestType: blobs_v1_pb.BlobIdRequest,
    responseType: blobs_v1_pb.BlobEmptyReply,
    requestSerialize: serialize_blobs_v1_BlobIdRequest,
    requestDeserialize: deserialize_blobs_v1_BlobIdRequest,
    responseSerialize: serialize_blobs_v1_BlobEmptyReply,
    responseDeserialize: deserialize_blobs_v1_BlobEmptyReply,
  },
  delete_blobs_by_ids: {
    path: '/blobs_v1.Blobs/delete_blobs_by_ids',
    requestStream: false,
    responseStream: false,
    requestType: blobs_v1_pb.BlobIdsRequest,
    responseType: blobs_v1_pb.BlobEmptyReply,
    requestSerialize: serialize_blobs_v1_BlobIdsRequest,
    requestDeserialize: deserialize_blobs_v1_BlobIdsRequest,
    responseSerialize: serialize_blobs_v1_BlobEmptyReply,
    responseDeserialize: deserialize_blobs_v1_BlobEmptyReply,
  },
};

exports.BlobsClient = grpc.makeGenericClientConstructor(BlobsService);
