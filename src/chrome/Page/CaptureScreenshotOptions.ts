'use strict';
import Viewport from './Viewport';
/**
 * Chrome Page.captureScreenshot options.
 * Note: these require Chrome >= 60.
 *
 * @export
 * @interface CaptureScreenshotOptions
 */
export default interface CaptureScreenshotOptions {
  /**
   * Image compression format (defaults to png). Allowed values: jpeg, png.
   *
   * @type {string}
   * @memberof CaptureScreenshotOptions
   */
  format?: 'jpeg' | 'png';

  /**
   * Compression quality from range [0..100] (jpeg only).
   *
   * @type {number}
   * @memberof CaptureScreenshotOptions
   */
  quality?: number;

  /**
   * Capture the screenshot of a given region only.
   *
   * @type {Viewport}
   * @memberof CaptureScreenshotOptions
   */
  clip?: Viewport;

  /**
   * Capture the screenshot from the surface, rather than the view. Defaults to true.
   *
   * @type {boolean}
   * @memberof CaptureScreenshotOptions
   */
  fromSurface?: boolean;
}
