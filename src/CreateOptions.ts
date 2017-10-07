'use strict';

import DeviceMetricsOverrideOptions from './chrome/Emulation/DeviceMetricsOverrideOptions';
import CaptureScreenshotOptions from './chrome/Page/CaptureScreenshotOptions';
import PrintToPDFOptions from './chrome/Page/PrintToPDFOptions';
import * as CompletionTrigger from './CompletionTrigger';

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
  printOptions?: PrintToPDFOptions;

  screenshotOptions?: {
    /**
     * The options to pass to Chrome's Page.captureScreenshot.
     *
     * @type {ChromeCaptureScreenshotOptions}
     */
    captureScreenShotOptions?: CaptureScreenshotOptions;

    /**
     * The options to pass to Chrome's Emulation.setDeviceMetricsOverride.
     *
     * @type {DeviceMetricsOverrideOptions}
     */
    deviceMetrics?: DeviceMetricsOverrideOptions;

    /**
     * Wether to capture a full-page screenshot.
     *
     * @type {boolean}
     */
    fullPage?: boolean;
  };

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
   * A private flag to signify the operation has been canceled.
   *
   * @type {boolean}
   * @memberof CreateOptions
   */
  _canceled?: boolean;
}
