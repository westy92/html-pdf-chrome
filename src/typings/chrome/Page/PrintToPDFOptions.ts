'use strict';

/**
 * Chrome Page.printToPDF options.
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

  /**
   * Whether to silently ignore invalid but successfully parsed
   * page ranges, such as '3-2'. Defaults to false.
   *
   * @type {boolean}
   * @memberof PrintToPDFOptions
   */
  ignoreInvalidPageRanges?: boolean;

  /**
   * HTML template for the print header.
   * Should be valid HTML markup with following classes used to inject printing values into them:
   * - `date` formatted print date
   * - `title` document title
   * - `url` document location
   * - `pageNumber` current page number
   * - `totalPages` total pages in the document
   *
   * For example, `<span class="title"></span>` would generate a span containing the title.
   *
   * @type {string}
   * @memberof PrintToPDFOptions
   */
  headerTemplate?: string;

  /**
   * HTML template for the print footer. Should use the same format as the `headerTemplate`.
   *
   * @type {string}
   * @memberof PrintToPDFOptions
   */
  footerTemplate?: string;

  /**
   * Whether or not to prefer page size as defined by css.
   * Defaults to false, in which case the content will be scaled to fit the paper size.
   *
   * @type {boolean}
   * @memberof PrintToPDFOptions
   */
  preferCSSPageSize?: boolean;
}
