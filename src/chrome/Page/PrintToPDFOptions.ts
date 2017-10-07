'use strict';

/**
 * Chrome Page.printToPDF options.
 * Note: these require Chrome >= 60.
 *
 * @export
 * @interface PrintToPDFOptions
 */
export default interface PrintToPDFOptions {
  /**
   * Paper orientation. Defaults to false.
   *
   * @type {boolean}
   * @memberof PrintToPDFOptions
   */
  landscape?: boolean;

  /**
   * Display header and footer. Defaults to false.
   *
   * @type {boolean}
   * @memberof PrintToPDFOptions
   */
  displayHeaderFooter?: boolean;

  /**
   * Print background graphics. Defaults to false.
   *
   * @type {boolean}
   * @memberof PrintToPDFOptions
   */
  printBackground?: boolean;

  /**
   * Scale of the webpage rendering. Defaults to 1.
   *
   * @type {number}
   * @memberof PrintToPDFOptions
   */
  scale?: number;

  /**
   * Paper width in inches. Defaults to 8.5 inches.
   *
   * @type {number}
   * @memberof PrintToPDFOptions
   */
  paperWidth?: number;

  /**
   * Paper height in inches. Defaults to 11 inches.
   *
   * @type {number}
   * @memberof PrintToPDFOptions
   */
  paperHeight?: number;

  /**
   * Top margin in inches. Defaults to 1cm (~0.4 inches).
   *
   * @type {number}
   * @memberof PrintToPDFOptions
   */
  marginTop?: number;

  /**
   * Bottom margin in inches. Defaults to 1cm (~0.4 inches).
   *
   * @type {number}
   * @memberof PrintToPDFOptions
   */
  marginBottom?: number;

  /**
   * Left margin in inches. Defaults to 1cm (~0.4 inches).
   *
   * @type {number}
   * @memberof PrintToPDFOptions
   */
  marginLeft?: number;

  /**
   * Right margin in inches. Defaults to 1cm (~0.4 inches).
   *
   * @type {number}
   * @memberof PrintToPDFOptions
   */
  marginRight?: number;

  /**
   * Paper ranges to print, e.g., '1-5, 8, 11-13'.
   * Defaults to the empty string, which means print all pages.
   *
   * @type {string}
   * @memberof PrintToPDFOptions
   */
  pageRanges?: string;
}
