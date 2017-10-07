'use strict';
import ScreenOrientation from './ScreenOrientation';

/**
 * https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setDeviceMetricsOverride
 */
export default interface DeviceMetricsOverride {
  /**
   * Overriding width value in pixels (minimum 0, maximum 10000000). 0 disables the override.
   */
  width: number;

  /**
   * Overriding height value in pixels (minimum 0, maximum 10000000). 0 disables the override.
   */
  height: number;

  /**
   * Overriding device scale factor value. 0 disables the override.
   */
  deviceScaleFactor: number;

  /**
   * Whether to emulate mobile device. This includes viewport meta tag, overlay scrollbars, text autosizing and more.
   */
  mobile: boolean;

  /**
   * Scale to apply to resulting view image. Ignored in |fitWindow| mode.
   */
  scale?: number;

  /**
   * Overriding screen width value in pixels (minimum 0, maximum 10000000). Only used for |mobile==true|.
   */
  screenWidth?: number;

  /**
   * Overriding screen height value in pixels (minimum 0, maximum 10000000). Only used for |mobile==true|.
   */
  screenHeight?: number;

  /**
   * Overriding view X position on screen in pixels (minimum 0, maximum 10000000). Only used for |mobile==true|.
   */
  positionX?: number;

  /**
   * Overriding view Y position on screen in pixels (minimum 0, maximum 10000000). Only used for |mobile==true|.
   */
  positionY?: number;

  /**
   * Do not set visible view size, rely upon explicit setVisibleSize call.
   */
  dontSetVisibileSize?: boolean;

  /**
   * Screen orientation override.
   */
  screenOrientation?: ScreenOrientation;
}
