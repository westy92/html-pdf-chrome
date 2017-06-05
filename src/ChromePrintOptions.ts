'use strict';

/**
 * Chrome Page.printToPDF options.
 * Note: these require Chrome >= 60.
 *
 * @export
 * @interface ChromePrintOptions
 */
export interface ChromePrintOptions {
  /**
   * Paper orientation. Defaults to false.
   *
   * @type {boolean}
   * @memberof ChromePrintOptions
   */
  landscape?: boolean;

  /**
   * Display header and footer. Defaults to false.
   *
   * @type {boolean}
   * @memberof ChromePrintOptions
   */
  displayHeaderFooter?: boolean;

  /**
   * Print background graphics. Defaults to false.
   *
   * @type {boolean}
   * @memberof ChromePrintOptions
   */
  printBackground?: boolean;

  /**
   * Scale of the webpage rendering. Defaults to 1.
   *
   * @type {number}
   * @memberof ChromePrintOptions
   */
  scale?: number;

  /**
   * Paper width in inches. Defaults to 8.5 inches.
   *
   * @type {number}
   * @memberof ChromePrintOptions
   */
  paperWidth?: number;

  /**
   * Paper height in inches. Defaults to 11 inches.
   *
   * @type {number}
   * @memberof ChromePrintOptions
   */
  paperHeight?: number;

  /**
   * Top margin in inches. Defaults to 1cm (~0.4 inches).
   *
   * @type {number}
   * @memberof ChromePrintOptions
   */
  marginTop?: number;

  /**
   * Bottom margin in inches. Defaults to 1cm (~0.4 inches).
   *
   * @type {number}
   * @memberof ChromePrintOptions
   */
  marginBottom?: number;

  /**
   * Left margin in inches. Defaults to 1cm (~0.4 inches).
   *
   * @type {number}
   * @memberof ChromePrintOptions
   */
  marginLeft?: number;

  /**
   * Right margin in inches. Defaults to 1cm (~0.4 inches).
   *
   * @type {number}
   * @memberof ChromePrintOptions
   */
  marginRight?: number;

  /**
   * Paper ranges to print, e.g., '1-5, 8, 11-13'.
   * Defaults to the empty string, which means print all pages.
   *
   * @type {string}
   * @memberof ChromePrintOptions
   */
  pageRanges?: string;
}
