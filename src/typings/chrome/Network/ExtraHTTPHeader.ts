'use strict';

/**
 * Chrome Network.setExtraHTTPHeaders() parameters.
 *
 * @export
 * @interface SetCookieOptions
 */
export default interface ExtraHTTPHeader {
  /**
   * Header name.
   *
   * @type {string}
   * @memberof ExtraHTTPHeader
   */
  name: string;

  /**
   * Header value.
   *
   * @type {string}
   * @memberof ExtraHTTPHeader
   */
  value: string;
}
