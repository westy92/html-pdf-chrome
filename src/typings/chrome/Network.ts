'use strict';

/**
 * Chrome Network.setCookie() parameters.
 *
 * @export
 * @interface ChromeCookie
 */
export interface ChromeCookie {
  /**
   * Cookie name.
   *
   * @type {string}
   * @memberof ChromeCookie
   */
  name: string;

  /**
   * Cookie value.
   *
   * @type {string}
   * @memberof ChromeCookie
   */
  value: string;

  /**
   * The request-URI to associate with the setting of the cookie.
   * This value can affect the default domain and path values of
   * the created cookie.
   *
   * @type {string}
   * @memberof ChromeCookie
   */
  url?: string;

  /**
   * Cookie domain.
   *
   * @type {string}
   * @memberof ChromeCookie
   */
  domain?: string;

  /**
   * Cookie path.
   *
   * @type {string}
   * @memberof ChromeCookie
   */
  path?: string;

  /**
   * True if cookie is secure.
   *
   * @type {boolean}
   * @memberof ChromeCookie
   */
  secure?: boolean;

  /**
   * True if cookie is http-only.
   *
   * @type {boolean}
   * @memberof ChromeCookie
   */
  httpOnly?: boolean;

  /**
   * Cookie SameSite type.
   *
   * @type {CookieSameSite}
   * @memberof ChromeCookie
   */
  sameSite?: CookieSameSite;

  /**
   * Cookie expiration date, session cookie if not set.
   *
   * @type {TimeSinceEpoch}
   * @memberof ChromeCookie
   */
  expires?: TimeSinceEpoch;
}

/**
 * UTC time in seconds, counted from January 1, 1970.
 *
 * @export
 */
export type TimeSinceEpoch = number;

/**
 * Represents the cookie's 'SameSite' status:
 * https://tools.ietf.org/html/draft-west-first-party-cookies
 *
 * @export
 */
export type CookieSameSite = 'Strict' | 'Lax';
