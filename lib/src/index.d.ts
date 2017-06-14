import { ChromePrintOptions } from './ChromePrintOptions';
import { CreateResult } from './CreateResult';
export { CreateResult };
/**
 * PDF generation options.
 *
 * @export
 * @interface CreateOptions
 */
export interface CreateOptions {
    /**
     * The host to connect to Chrome at.
     * If set, it attempts to connect to Chrome.
     * If this and port are not set, it spawns
     * Chrome for the duration of the PDF generation.
     *
     * @type {string}
     * @memberof CreateOptions
     */
    host?: string;
    /**
     * The port to connect to Chrome with.
     * If set, it attempts to connect to Chrome.
     * If this and host are not set, it spawns
     * Chrome for the duration of the PDF generation.
     *
     * @type {number}
     * @memberof CreateOptions
     */
    port?: number;
    /**
     * The options to pass to Chrome's Page.printToPDF.
     * Note: these require Chrome >= 60.
     *
     * @type {ChromePrintOptions}
     * @memberof CreateOptions
     */
    printOptions?: ChromePrintOptions;
}
/**
 * Generates a PDF from the given HTML string, launching Chrome as necessary.
 *
 * @export
 * @param {string} html the HTML string.
 * @param {Options} [options] the generation options.
 * @returns {Promise<CreateResult>} the generated PDF data.
 */
export declare function create(html: string, options?: CreateOptions): Promise<CreateResult>;
