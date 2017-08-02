'use strict';

import * as CompletionTrigger from './CompletionTrigger';
import { CreateOptions } from './CreateOptions';
import { CreateResult } from './CreateResult';
import { Generator, PDFGenerator, ScreenshotGenerator } from './Generators';

export { CompletionTrigger, CreateOptions, CreateResult };

export type OutputType = 'pdf' | 'screenshot';

/**
 * Internal function used by all exported creator functions.
 *
 * @param {string} html The HTML string.
 * @param {Options} [options] The generation options.
 * @param {('pdf'|'screenshot')} [type=pdf] The type of document to generate.
 * @returns {Promise<CreateResult>} the generated data.
 */
function _create(html: string, options?: CreateOptions, what: OutputType = 'pdf'): Promise<CreateResult> {
  const generators: {[x in OutputType]: { new (html: string, options?: CreateOptions): Generator } } = {
    pdf: PDFGenerator,
    screenshot: ScreenshotGenerator,
  };
  const generator = new generators[what](html, options);
  return generator.create();
}

/**
 * Generates a PDF or screenshot from the given HTML string, launching Chrome as necessary.
 *
 * @export
 * @param {string} html The HTML string.
 * @param {Options} [options] The generation options.
 * @param {('pdf'|'screenshot')} [type=pdf] The type of document to generate.
 * @returns {Promise<CreateResult>} The generated data.
 */
export function create(html: string, options?: CreateOptions, type: OutputType = 'pdf'): Promise<CreateResult> {
  return _create(html, options, type);
}

/**
 * Generates a PDF from the given HTML string, launching Chrome as necessary.
 *
 * @export
 * @param {string} html the HTML string.
 * @param {Options} [options] the generation options.
 * @returns {Promise<CreateResult>} the generated PDF data.
 */
export function createPDF(html: string, options?: CreateOptions): Promise<CreateResult> {
  return _create(html, options, 'pdf');
}

/**
 * Generates a screenshot from the given HTML string, launching Chrome as necessary.
 *
 * @export
 * @param {string} html the HTML string.
 * @param {Options} [options] the generation options.
 * @returns {Promise<CreateResult>} the generated screenshot data.
 */
export function createScreenshot(html: string, options?: CreateOptions): Promise<CreateResult> {
  return _create(html, options, 'screenshot');
}
