// package: blobs_v1
// file: blobs_v1.proto

import * as jspb from "google-protobuf";

export class ErrorDescription extends jspb.Message {
  getType(): string;
  setType(value: string): void;

  getCategory(): string;
  setCategory(value: string): void;

  getCode(): string;
  setCode(value: string): void;

  getCorrelationId(): string;
  setCorrelationId(value: string): void;

  getStatus(): string;
  setStatus(value: string): void;

  getMessage(): string;
  setMessage(value: string): void;

  getCause(): string;
  setCause(value: string): void;

  getStackTrace(): string;
  setStackTrace(value: string): void;

  getDetailsMap(): jspb.Map<string, string>;
  clearDetailsMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ErrorDescription.AsObject;
  static toObject(includeInstance: boolean, msg: ErrorDescription): ErrorDescription.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ErrorDescription, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ErrorDescription;
  static deserializeBinaryFromReader(message: ErrorDescription, reader: jspb.BinaryReader): ErrorDescription;
}

export namespace ErrorDescription {
  export type AsObject = {
    type: string,
    category: string,
    code: string,
    correlationId: string,
    status: string,
    message: string,
    cause: string,
    stackTrace: string,
    detailsMap: Array<[string, string]>,
  }
}

export class PagingParams extends jspb.Message {
  getSkip(): number;
  setSkip(value: number): void;

  getTake(): number;
  setTake(value: number): void;

  getTotal(): boolean;
  setTotal(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PagingParams.AsObject;
  static toObject(includeInstance: boolean, msg: PagingParams): PagingParams.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PagingParams, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PagingParams;
  static deserializeBinaryFromReader(message: PagingParams, reader: jspb.BinaryReader): PagingParams;
}

export namespace PagingParams {
  export type AsObject = {
    skip: number,
    take: number,
    total: boolean,
  }
}

export class BlobInfo extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getGroup(): string;
  setGroup(value: string): void;

  getName(): string;
  setName(value: string): void;

  getSize(): number;
  setSize(value: number): void;

  getContentType(): string;
  setContentType(value: string): void;

  getCreateTime(): string;
  setCreateTime(value: string): void;

  getExpireTime(): string;
  setExpireTime(value: string): void;

  getCompleted(): boolean;
  setCompleted(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlobInfo.AsObject;
  static toObject(includeInstance: boolean, msg: BlobInfo): BlobInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BlobInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlobInfo;
  static deserializeBinaryFromReader(message: BlobInfo, reader: jspb.BinaryReader): BlobInfo;
}

export namespace BlobInfo {
  export type AsObject = {
    id: string,
    group: string,
    name: string,
    size: number,
    contentType: string,
    createTime: string,
    expireTime: string,
    completed: boolean,
  }
}

export class BlobInfoPage extends jspb.Message {
  getTotal(): number;
  setTotal(value: number): void;

  clearDataList(): void;
  getDataList(): Array<BlobInfo>;
  setDataList(value: Array<BlobInfo>): void;
  addData(value?: BlobInfo, index?: number): BlobInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlobInfoPage.AsObject;
  static toObject(includeInstance: boolean, msg: BlobInfoPage): BlobInfoPage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BlobInfoPage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlobInfoPage;
  static deserializeBinaryFromReader(message: BlobInfoPage, reader: jspb.BinaryReader): BlobInfoPage;
}

export namespace BlobInfoPage {
  export type AsObject = {
    total: number,
    dataList: Array<BlobInfo.AsObject>,
  }
}

export class BlobInfoPageRequest extends jspb.Message {
  getCorrelationId(): string;
  setCorrelationId(value: string): void;

  getFilterMap(): jspb.Map<string, string>;
  clearFilterMap(): void;
  hasPaging(): boolean;
  clearPaging(): void;
  getPaging(): PagingParams | undefined;
  setPaging(value?: PagingParams): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlobInfoPageRequest.AsObject;
  static toObject(includeInstance: boolean, msg: BlobInfoPageRequest): BlobInfoPageRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BlobInfoPageRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlobInfoPageRequest;
  static deserializeBinaryFromReader(message: BlobInfoPageRequest, reader: jspb.BinaryReader): BlobInfoPageRequest;
}

export namespace BlobInfoPageRequest {
  export type AsObject = {
    correlationId: string,
    filterMap: Array<[string, string]>,
    paging?: PagingParams.AsObject,
  }
}

export class BlobInfoPageReply extends jspb.Message {
  hasError(): boolean;
  clearError(): void;
  getError(): ErrorDescription | undefined;
  setError(value?: ErrorDescription): void;

  hasPage(): boolean;
  clearPage(): void;
  getPage(): BlobInfoPage | undefined;
  setPage(value?: BlobInfoPage): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlobInfoPageReply.AsObject;
  static toObject(includeInstance: boolean, msg: BlobInfoPageReply): BlobInfoPageReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BlobInfoPageReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlobInfoPageReply;
  static deserializeBinaryFromReader(message: BlobInfoPageReply, reader: jspb.BinaryReader): BlobInfoPageReply;
}

export namespace BlobInfoPageReply {
  export type AsObject = {
    error?: ErrorDescription.AsObject,
    page?: BlobInfoPage.AsObject,
  }
}

export class BlobIdsRequest extends jspb.Message {
  getCorrelationId(): string;
  setCorrelationId(value: string): void;

  clearBlobIdsList(): void;
  getBlobIdsList(): Array<string>;
  setBlobIdsList(value: Array<string>): void;
  addBlobIds(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlobIdsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: BlobIdsRequest): BlobIdsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BlobIdsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlobIdsRequest;
  static deserializeBinaryFromReader(message: BlobIdsRequest, reader: jspb.BinaryReader): BlobIdsRequest;
}

export namespace BlobIdsRequest {
  export type AsObject = {
    correlationId: string,
    blobIdsList: Array<string>,
  }
}

export class BlobIdRequest extends jspb.Message {
  getCorrelationId(): string;
  setCorrelationId(value: string): void;

  getBlobId(): string;
  setBlobId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlobIdRequest.AsObject;
  static toObject(includeInstance: boolean, msg: BlobIdRequest): BlobIdRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BlobIdRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlobIdRequest;
  static deserializeBinaryFromReader(message: BlobIdRequest, reader: jspb.BinaryReader): BlobIdRequest;
}

export namespace BlobIdRequest {
  export type AsObject = {
    correlationId: string,
    blobId: string,
  }
}

export class BlobInfoObjectRequest extends jspb.Message {
  getCorrelationId(): string;
  setCorrelationId(value: string): void;

  hasBlob(): boolean;
  clearBlob(): void;
  getBlob(): BlobInfo | undefined;
  setBlob(value?: BlobInfo): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlobInfoObjectRequest.AsObject;
  static toObject(includeInstance: boolean, msg: BlobInfoObjectRequest): BlobInfoObjectRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BlobInfoObjectRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlobInfoObjectRequest;
  static deserializeBinaryFromReader(message: BlobInfoObjectRequest, reader: jspb.BinaryReader): BlobInfoObjectRequest;
}

export namespace BlobInfoObjectRequest {
  export type AsObject = {
    correlationId: string,
    blob?: BlobInfo.AsObject,
  }
}

export class BlobInfoObjectsReply extends jspb.Message {
  hasError(): boolean;
  clearError(): void;
  getError(): ErrorDescription | undefined;
  setError(value?: ErrorDescription): void;

  clearBlobsList(): void;
  getBlobsList(): Array<BlobInfo>;
  setBlobsList(value: Array<BlobInfo>): void;
  addBlobs(value?: BlobInfo, index?: number): BlobInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlobInfoObjectsReply.AsObject;
  static toObject(includeInstance: boolean, msg: BlobInfoObjectsReply): BlobInfoObjectsReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BlobInfoObjectsReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlobInfoObjectsReply;
  static deserializeBinaryFromReader(message: BlobInfoObjectsReply, reader: jspb.BinaryReader): BlobInfoObjectsReply;
}

export namespace BlobInfoObjectsReply {
  export type AsObject = {
    error?: ErrorDescription.AsObject,
    blobsList: Array<BlobInfo.AsObject>,
  }
}

export class BlobInfoObjectReply extends jspb.Message {
  hasError(): boolean;
  clearError(): void;
  getError(): ErrorDescription | undefined;
  setError(value?: ErrorDescription): void;

  hasBlob(): boolean;
  clearBlob(): void;
  getBlob(): BlobInfo | undefined;
  setBlob(value?: BlobInfo): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlobInfoObjectReply.AsObject;
  static toObject(includeInstance: boolean, msg: BlobInfoObjectReply): BlobInfoObjectReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BlobInfoObjectReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlobInfoObjectReply;
  static deserializeBinaryFromReader(message: BlobInfoObjectReply, reader: jspb.BinaryReader): BlobInfoObjectReply;
}

export namespace BlobInfoObjectReply {
  export type AsObject = {
    error?: ErrorDescription.AsObject,
    blob?: BlobInfo.AsObject,
  }
}

export class BlobUriReply extends jspb.Message {
  hasError(): boolean;
  clearError(): void;
  getError(): ErrorDescription | undefined;
  setError(value?: ErrorDescription): void;

  getUri(): string;
  setUri(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlobUriReply.AsObject;
  static toObject(includeInstance: boolean, msg: BlobUriReply): BlobUriReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BlobUriReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlobUriReply;
  static deserializeBinaryFromReader(message: BlobUriReply, reader: jspb.BinaryReader): BlobUriReply;
}

export namespace BlobUriReply {
  export type AsObject = {
    error?: ErrorDescription.AsObject,
    uri: string,
  }
}

export class BlobTokenRequest extends jspb.Message {
  getCorrelationId(): string;
  setCorrelationId(value: string): void;

  getToken(): string;
  setToken(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlobTokenRequest.AsObject;
  static toObject(includeInstance: boolean, msg: BlobTokenRequest): BlobTokenRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BlobTokenRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlobTokenRequest;
  static deserializeBinaryFromReader(message: BlobTokenRequest, reader: jspb.BinaryReader): BlobTokenRequest;
}

export namespace BlobTokenRequest {
  export type AsObject = {
    correlationId: string,
    token: string,
  }
}

export class BlobTokenWithChunkRequest extends jspb.Message {
  getCorrelationId(): string;
  setCorrelationId(value: string): void;

  getToken(): string;
  setToken(value: string): void;

  getChunk(): string;
  setChunk(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlobTokenWithChunkRequest.AsObject;
  static toObject(includeInstance: boolean, msg: BlobTokenWithChunkRequest): BlobTokenWithChunkRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BlobTokenWithChunkRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlobTokenWithChunkRequest;
  static deserializeBinaryFromReader(message: BlobTokenWithChunkRequest, reader: jspb.BinaryReader): BlobTokenWithChunkRequest;
}

export namespace BlobTokenWithChunkRequest {
  export type AsObject = {
    correlationId: string,
    token: string,
    chunk: string,
  }
}

export class BlobTokenReply extends jspb.Message {
  hasError(): boolean;
  clearError(): void;
  getError(): ErrorDescription | undefined;
  setError(value?: ErrorDescription): void;

  getToken(): string;
  setToken(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlobTokenReply.AsObject;
  static toObject(includeInstance: boolean, msg: BlobTokenReply): BlobTokenReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BlobTokenReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlobTokenReply;
  static deserializeBinaryFromReader(message: BlobTokenReply, reader: jspb.BinaryReader): BlobTokenReply;
}

export namespace BlobTokenReply {
  export type AsObject = {
    error?: ErrorDescription.AsObject,
    token: string,
  }
}

export class BlobEmptyReply extends jspb.Message {
  hasError(): boolean;
  clearError(): void;
  getError(): ErrorDescription | undefined;
  setError(value?: ErrorDescription): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlobEmptyReply.AsObject;
  static toObject(includeInstance: boolean, msg: BlobEmptyReply): BlobEmptyReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BlobEmptyReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlobEmptyReply;
  static deserializeBinaryFromReader(message: BlobEmptyReply, reader: jspb.BinaryReader): BlobEmptyReply;
}

export namespace BlobEmptyReply {
  export type AsObject = {
    error?: ErrorDescription.AsObject,
  }
}

export class BlobReadRequest extends jspb.Message {
  getCorrelationId(): string;
  setCorrelationId(value: string): void;

  getBlobId(): string;
  setBlobId(value: string): void;

  getSkip(): number;
  setSkip(value: number): void;

  getTake(): number;
  setTake(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlobReadRequest.AsObject;
  static toObject(includeInstance: boolean, msg: BlobReadRequest): BlobReadRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BlobReadRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlobReadRequest;
  static deserializeBinaryFromReader(message: BlobReadRequest, reader: jspb.BinaryReader): BlobReadRequest;
}

export namespace BlobReadRequest {
  export type AsObject = {
    correlationId: string,
    blobId: string,
    skip: number,
    take: number,
  }
}

export class BlobChunkReply extends jspb.Message {
  hasError(): boolean;
  clearError(): void;
  getError(): ErrorDescription | undefined;
  setError(value?: ErrorDescription): void;

  getChunk(): string;
  setChunk(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlobChunkReply.AsObject;
  static toObject(includeInstance: boolean, msg: BlobChunkReply): BlobChunkReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BlobChunkReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlobChunkReply;
  static deserializeBinaryFromReader(message: BlobChunkReply, reader: jspb.BinaryReader): BlobChunkReply;
}

export namespace BlobChunkReply {
  export type AsObject = {
    error?: ErrorDescription.AsObject,
    chunk: string,
  }
}

