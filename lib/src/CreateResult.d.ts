/// <reference types="node" />
import { Stream } from 'stream';
/**
 * Allows exporting of PDF data to multiple formats.
 *
 * @export
 * @class CreateResult
 */
export declare class CreateResult {
    /**
     * Writes the given data Buffer to the specified file location.
     *
     * @private
     * @static
     * @param {string} filename the file name to write to.
     * @param {Buffer} data the data to write.
     * @returns {Promise<void>}
     *
     * @memberof CreateResult
     */
    private static writeFile(filename, data);
    /**
     * Base64-encoded PDF data.
     *
     * @private
     * @type {string}
     * @memberof CreateResult
     */
    private data;
    /**
     * Creates an instance of CreateResult.
     * @param {string} data base64 PDF data
     *
     * @memberof CreateResult
     */
    constructor(data: string);
    /**
     * Get the base64 PDF data.
     *
     * @returns {string} base64 PDF data.
     *
     * @memberof CreateResult
     */
    toBase64(): string;
    /**
     * Get a Buffer of the PDF data.
     *
     * @returns {Buffer} PDF data.
     *
     * @memberof CreateResult
     */
    toBuffer(): Buffer;
    /**
     * Get a Stream of the PDF data.
     *
     * @returns {Stream} Stream of PDF data.
     *
     * @memberof CreateResult
     */
    toStream(): Stream;
    /**
     * Saves the PDF to a file.
     *
     * @param {string} filename the filename.
     * @returns {Promise<void>} resolves upon successful create.
     *
     * @memberof CreateResult
     */
    toFile(filename: string): Promise<void>;
}
