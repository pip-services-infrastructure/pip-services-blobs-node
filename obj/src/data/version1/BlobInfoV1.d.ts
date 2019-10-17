export declare class BlobInfoV1 {
    constructor(id: string, group: string, name: string, size?: number, content_type?: string, expire_time?: Date);
    id: string;
    group: string;
    name: string;
    size: number;
    content_type: string;
    create_time: Date;
    expire_time: Date;
    completed: boolean;
}
