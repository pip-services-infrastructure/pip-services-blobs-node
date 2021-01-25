"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
class BlobInfoV1Schema extends pip_services3_commons_node_1.ObjectSchema {
    constructor() {
        super();
        /* Identification */
        this.withOptionalProperty('id', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('group', pip_services3_commons_node_2.TypeCode.String);
        this.withRequiredProperty('name', pip_services3_commons_node_2.TypeCode.String);
        /* Content */
        this.withOptionalProperty('size', pip_services3_commons_node_2.TypeCode.Long);
        this.withOptionalProperty('content_type', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('create_time', null); //TypeCode.DateTime);
        this.withOptionalProperty('expire_time', null); //TypeCode.DateTime);
        this.withOptionalProperty('completed', pip_services3_commons_node_2.TypeCode.Boolean);
        /* Custom fields */
        this.withOptionalProperty('custom_hdr', null);
        this.withOptionalProperty('custom_dat', null);
    }
}
exports.BlobInfoV1Schema = BlobInfoV1Schema;
//# sourceMappingURL=BlobInfoV1Schema.js.map