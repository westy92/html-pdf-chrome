'use strict';

import { CookieSameSite } from './CookieSameSite';
import { TimeSinceEpoch } from './TimeSinceEpoch';

/**
 * Chrome Network.setCookie() parameters.
 *
 * @export
 * @interface SetCookieOptions
 */
export default interface SetCookieOptions {
  /**
   * Cookie name.
   *
   * @type {string}
   * @memberof SetCookieOptions
   */
  name: string;

  /**
   * Cookie value.
   *
   * @type {string}
   * @memberof SetCookieOptions
   */
  value: string;

  /**
   * The request-URI to associate with the setting of the cookie.
   * This value can affect the default domain and path values of
   * the created cookie.
   *
   * @type {string}
   * @memberof SetCookieOptions
   */
  url?: string;

  /**
   * Cookie domain.
   *
   * @type {string}
   * @memberof SetCookieOptions
   */
  domain?: string;

  /**
   * Cookie path.
   *
   * @type {string}
   * @memberof SetCookieOptions
   */
  path?: string;

  /**
   * True if cookie is secure.
   *
   * @type {boolean}
   * @memberof SetCookieOptions
   */
  secure?: boolean;

  /**
   * True if cookie is http-only.
   *
   * @type {boolean}
   * @memberof SetCookieOptions
   */
  httpOnly?: boolean;

  /**
   * Cookie SameSite type.
   *
   * @type {CookieSameSite}
   * @memberof SetCookieOptions
   */
  sameSite?: CookieSameSite;

  /**
   * Cookie expiration date, session cookie if not set.
   *
   * @type {TimeSinceEpoch}
   * @memberof SetCookieOptions
   */
  expires?: TimeSinceEpoch;
}
