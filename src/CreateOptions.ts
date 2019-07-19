'use strict';

import { CompletionTrigger } from './CompletionTriggers';
import SetCookieOptions from './typings/chrome/Network/SetCookieOptions';
import PrintToPDFOptions from './typings/chrome/Page/PrintToPDFOptions';
import ConsoleAPICalled from './typings/chrome/Runtime/ConsoleAPICalled';
import ExceptionThrown from './typings/chrome/Runtime/ExceptionThrown';

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
   * @type {PrintToPDFOptions}
   * @memberof CreateOptions
   */
  printOptions?: PrintToPDFOptions;

  /**
   * An optional CompletionTrigger to wait for before
   * printing the rendered page to a PDF.
   *
   * @type {CompletionTrigger}
   * @memberof CreateOptions
   */
  completionTrigger?: CompletionTrigger;

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
   * @type {SetCookieOptions[]}
   * @memberof CreateOptions
   */
  cookies?: SetCookieOptions[];

  /**
   * Extra HTTP headers to send when making a request.
   *
   * @type {[key: string]: string}
   * @memberof CreateOptions
   */
  extraHTTPHeaders?: { [key: string]: string; };

  /**
   * Set a callback to receive console messages.
   *
   * @memberof CreateOptions
   */
  runtimeConsoleHandler?: (value: ConsoleAPICalled) => void;

  /**
   * Set a callback to receive unhandled exceptions.
   *
   * @memberof CreateOptions
   */
  runtimeExceptionHandler?: (exception: ExceptionThrown) => void;

  /**
   * A private flag to signify the operation has been canceled.
   *
   * @type {boolean}
   * @memberof CreateOptions
   */
  _canceled?: boolean;

  /**
   * A private variable to store the main page navigation requestId.
   *
   * @type {string}
   * @memberof CreateOptions
   */
  _mainRequestId?: string;

  /**
   * A private flag to signify the main page navigation failed.
   *
   * @type {boolean}
   * @memberof CreateOptions
   */
  _navigateFailed?: boolean;
}
