import * as CompletionTrigger from './CompletionTriggers';
import { CreateOptions } from './CreateOptions';
import { CreateResult } from './CreateResult';
export { CompletionTrigger, CreateOptions, CreateResult };
/**
 * Generates a PDF from the given HTML string, launching Chrome as necessary.
 *
 * @export
 * @param {string} html the HTML string.
 * @param {Options} [options] the generation options.
 * @returns {Promise<CreateResult>} the generated PDF data.
 */
export declare function create(html: string, options?: CreateOptions): Promise<CreateResult>;
