'use strict';

/**
 * Viewport for capturing screenshot.
 *
 * @export
 * @interface Viewport
 */
export default interface Viewport {
  /**
   * X offset in CSS pixels.
   *
   * @type {number}
   * @memberof Viewport
   */
  x: number;

  /**
   * Y offset in CSS pixels.
   *
   * @type {number}
   * @memberof Viewport
   */
  y: number;

  /**
   * Rectangle width in CSS pixels.
   *
   * @type {number}
   * @memberof Viewport
   */
  width: number;

  /**
   * Rectangle height in CSS pixels.
   *
   * @type {number}
   * @memberof Viewport
   */
  height: number;

  /**
   * Page scale factor.
   *
   * @type {number}
   * @memberof Viewport
   */
  scale: number;
}
