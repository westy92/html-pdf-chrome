/// <reference types="node" />
import { Stream } from 'stream';
export interface Options {
    port?: number;
}
export declare function create(html: string, options?: Options): Promise<CreateResult>;
export declare class CreateResult {
    private static writeFile(filename, data);
    /**
     * Base64-encoded PDF data.
     */
    private data;
    constructor(data: string);
    toBase64(): string;
    toBuffer(): Buffer;
    toStream(): Stream;
    toFile(filename: string): Promise<void>;
}
