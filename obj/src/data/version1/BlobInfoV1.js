"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BlobInfoV1 {
    constructor(id, group, name, size, content_type, expire_time) {
        this.id = id;
        this.group = group;
        this.name = name;
        this.size = size;
        this.content_type = content_type;
        this.create_time = new Date();
        this.expire_time = expire_time;
        this.completed = false;
    }
}
exports.BlobInfoV1 = BlobInfoV1;
//# sourceMappingURL=BlobInfoV1.js.map