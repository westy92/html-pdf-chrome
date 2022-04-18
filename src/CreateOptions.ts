'use strict';

import { Protocol } from 'devtools-protocol';
import { CompletionTrigger } from './CompletionTriggers';

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
   *
   * @type {Protocol.Page.PrintToPDFRequest}
   * @memberof CreateOptions
   */
  printOptions?: Protocol.Page.PrintToPDFRequest;

  /**
   * The options to pass to Chrome's Page.captureScreenshot.
   * 
   * @type {Protocol.Page.CaptureScreenshotRequest}
   * @memberof CreateOptions
   */
  screenshotOptions?: Protocol.Page.CaptureScreenshotRequest;

  /**
   * The options to pass to Chrome's Emulation.setDeviceMetricsOverride.
   * Used when generating screenshot images.
   */
  deviceMetrics?: Protocol.Emulation.SetDeviceMetricsOverrideRequest;

  /**
   * An optional CompletionTrigger to wait for before
   * printing the rendered page to a PDF or image.
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
   * @type {Protocol.Network.SetCookieRequest[]}
   * @memberof CreateOptions
   */
  cookies?: Protocol.Network.SetCookieRequest[];

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
  runtimeConsoleHandler?: (value: Protocol.Runtime.ConsoleAPICalledEvent) => void;

  /**
   * Set a callback to receive unhandled exceptions.
   *
   * @memberof CreateOptions
   */
  runtimeExceptionHandler?: (exception: Protocol.Runtime.ExceptionThrownEvent) => void;

  /**
   * A private variable to store the main page navigation requestId.
   *
   * @type {string}
   * @memberof CreateOptions
   */
  _mainRequestId?: string;

  /**
   * A private variable to store the main page navigation response.
   *
   * @type {Protocol.Network.Response}
   * @memberof CreateOptions
   */
  _mainRequestResponse?: Protocol.Network.Response;

  /**
   * A private flag to signify that generation failed or timed out.
   *
   * @type {Error}
   * @memberof CreateOptions
   */
  _exitCondition?: Error;
}
