'use strict';

import * as CDP from 'chrome-remote-interface';
import * as fs from 'fs';
import { ChromeLauncher } from 'lighthouse/lighthouse-cli/chrome-launcher';
import { getRandomPort } from 'lighthouse/lighthouse-cli/random-port';
import { Readable, Stream } from 'stream';

/**
 * PDF generation options.
 *
 * @export
 * @interface CreateOptions
 */
export interface CreateOptions {
  port?: number;
  printOptions?: ChromePrintOptions;
}

/**
 * Chrome Page.printToPDF options.
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

/**
 * Generates a PDF from the given HTML string.
 *
 * @export
 * @param {string} html the HTML string.
 * @param {Options} [options] the generation options.
 * @returns {Promise<CreateResult>} the generated PDF data.
 */
export async function create(html: string, options?: CreateOptions): Promise<CreateResult> {
  const myOptions = Object.assign({}, options);
  myOptions.port = myOptions.port || await getRandomPort();
  const chrome = await launchChrome(myOptions.port);
  return new Promise<CreateResult>((resolve, reject) => {
    CDP(myOptions, async (client) => {
      try {
        const {Page} = client;
        await Page.enable(); // Enable Page events
        await Page.navigate({url: `data:text/html,${html}`});
        await Page.loadEventFired();
        // https://chromedevtools.github.io/debugger-protocol-viewer/tot/Page/#method-printToPDF
        const pdf = await Page.printToPDF(myOptions.printOptions);
        return resolve(new CreateResult(pdf.data));
      } catch (err) {
        reject(err);
      } finally {
        client.close();
      }
    }).on('error', (err) => {
      reject(err);
    });
  }).then(async (createResult) => {
    if (chrome) {
      await chrome.kill();
    }
    return createResult;
  }).catch(async (err) => {
    if (chrome) {
      await chrome.kill();
    }
    return Promise.reject(err);
  });
}

/**
 * Launches Chrome and listens on the specified port.
 *
 * @param {number} port the port for the launched Chrome to listen on.
 * @returns {Promise<ChromeLauncher>} The launched ChromeLauncher instance.
 */
async function launchChrome(port: number): Promise<ChromeLauncher> {
  const launcher = new ChromeLauncher({
    port,
    autoSelectChrome: true,
    additionalFlags: [
      '--disable-gpu',
      '--headless',
    ],
  });
  try {
    await launcher.run();
    return launcher;
  } catch (err) {
    await launcher.kill();
  }
}

/**
 * Allows exporting of PDF data to multiple formats.
 *
 * @export
 * @class CreateResult
 */
export class CreateResult {

  /**
   * Writes the given data Buffer to the specified file location.
   *
   * @private
   * @static
   * @param {string} filename the file name to write to.
   * @param {Buffer} data the data to write.
   * @returns {Promise<void>}
   *
   * @memberof CreateResult
   */
  private static async writeFile(filename: string, data: Buffer): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(filename, data, (err) => {
        err ? reject(err) : resolve();
      });
    });
  }

  /**
   * Base64-encoded PDF data.
   *
   * @private
   * @type {string}
   * @memberof CreateResult
   */
  private data: string;

  /**
   * Creates an instance of CreateResult.
   * @param {string} data base64 PDF data
   *
   * @memberof CreateResult
   */
  public constructor(data: string) {
    this.data = data;
  }

  /**
   * Get the base64 PDF data.
   *
   * @returns {string} base64 PDF data.
   *
   * @memberof CreateResult
   */
  public toBase64(): string {
    return this.data;
  }

  /**
   * Get a Buffer of the PDF data.
   *
   * @returns {Buffer} PDF data.
   *
   * @memberof CreateResult
   */
  public toBuffer(): Buffer {
    return Buffer.from(this.data, 'base64');
  }

  /**
   * Get a Stream of the PDF data.
   *
   * @returns {Stream} Stream of PDF data.
   *
   * @memberof CreateResult
   */
  public toStream(): Stream {
    const stream = new Readable();
    stream.push(this.data, 'base64');
    stream.push(null);
    return stream;
  }

  /**
   * Saves the PDF to a file.
   *
   * @param {string} filename the filename.
   * @returns {Promise<void>} resolves upon successful create.
   *
   * @memberof CreateResult
   */
  public async toFile(filename: string): Promise<void> {
    await CreateResult.writeFile(filename, this.toBuffer());
  }

}
