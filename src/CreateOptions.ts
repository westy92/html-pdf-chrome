'use strict';

import * as CompletionTrigger from './CompletionTrigger';
import { Network, Page, Runtime } from './typings/chrome';

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
   * The explicit path of the intended Chrome binary.
   *
   * @type {string}
   * @memberof CreateOptions
   */
  chromePath?: string;

  /**
   * The flags to pass to Chrome.
   *
   * @type {string[]}
   * @memberof CreateOptions
   */
  chromeFlags?: string[];

  /**
   * The options to pass to Chrome's Page.printToPDF.
   * Note: these require Chrome >= 60.
   *
   * @type {ChromePrintOptions}
   * @memberof CreateOptions
   */
  printOptions?: Page.ChromePrintOptions;

  /**
   * An optional CompletionTrigger to wait for before
   * printing the rendered page to a PDF.
   *
   * @type {CompletionTrigger.CompletionTrigger}
   * @memberof CreateOptions
   */
  completionTrigger?: CompletionTrigger.CompletionTrigger;

  /**
   * The time in milliseconds to wait until timing out.
   *
   * @type {number}
   * @memberof CreateOptions
   */
  timeout?: number;

  /**
   * Clears Chrome's cache before loading a page.
   *
   * @type {boolean}
   * @memberof CreateOptions
   */
  clearCache?: boolean;

  /**
   * Cookies to set.
   *
   * @type {ChromeCookie[]}
   * @memberof CreateOptions
   */
  cookies?: Network.ChromeCookie[];

  /**
   * Set a callback to receive console messages.
   *
   * @memberof CreateOptions
   */
  runtimeConsoleHandler?: (value: Runtime.ChromeConsoleApiMessage) => void;

  /**
   * Set a callback to receive unhandled exceptions.
   *
   * @memberof CreateOptions
   */
  runtimeExceptionHandler?: (exception: Runtime.ChromeRuntimeException) => void;

  /**
   * A private flag to signify the operation has been canceled.
   *
   * @type {boolean}
   * @memberof CreateOptions
   */
  _canceled?: boolean;
}
