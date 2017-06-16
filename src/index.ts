'use strict';

import * as CDP from 'chrome-remote-interface';
import * as fs from 'fs';
import { Launcher } from 'lighthouse/chrome-launcher/chrome-launcher';
import { getRandomPort } from 'lighthouse/chrome-launcher/random-port';
import { Readable, Stream } from 'stream';

import { ChromePrintOptions } from './ChromePrintOptions';
import * as CompletionTrigger from './CompletionTrigger';
import { CreateResult } from './CreateResult';

export { CompletionTrigger, CreateResult };

/**
 * PDF generation options.
 *
 * @export
 * @interface CreateOptions
 */
export interface CreateOptions {
  /**
   * The host to connect to Chrome at.
   * If set, it attempts to connect to Chrome.
   * If this and port are not set, it spawns
   * Chrome for the duration of the PDF generation.
   *
   * @type {string}
   * @memberof CreateOptions
   */
  host?: string;

  /**
   * The port to connect to Chrome with.
   * If set, it attempts to connect to Chrome.
   * If this and host are not set, it spawns
   * Chrome for the duration of the PDF generation.
   *
   * @type {number}
   * @memberof CreateOptions
   */
  port?: number;

  /**
   * The options to pass to Chrome's Page.printToPDF.
   * Note: these require Chrome >= 60.
   *
   * @type {ChromePrintOptions}
   * @memberof CreateOptions
   */
  printOptions?: ChromePrintOptions;

  /**
   * An optional CompletionTrigger to wait for before
   * printing the rendered page to a PDF.
   *
   * @type {CompletionTrigger.CompletionTrigger}
   * @memberof CreateOptions
   */
  completionTrigger?: CompletionTrigger.CompletionTrigger;
}

/**
 * Generates a PDF from the given HTML string, launching Chrome as necessary.
 *
 * @export
 * @param {string} html the HTML string.
 * @param {Options} [options] the generation options.
 * @returns {Promise<CreateResult>} the generated PDF data.
 */
export async function create(html: string, options?: CreateOptions): Promise<CreateResult> {
  const myOptions = Object.assign({}, options);
  let chrome: Launcher;
  if (!myOptions.host && !myOptions.port) {
    myOptions.port = await getRandomPort();
    chrome = await launchChrome(myOptions.port);
  }
  try {
    return await generate(html, myOptions);
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

/**
 * Connects to Chrome and generates a PDF from HTML or a URL.
 *
 * @param {string} html the HTML string or URL.
 * @param {CreateOptions} options the generation options.
 * @returns {Promise<CreateResult>} the generated PDF data.
 */
async function generate(html: string, options: CreateOptions): Promise<CreateResult>  {
  const client = await CDP(options);
  try {
    const {Page} = client;
    await Page.enable(); // Enable Page events
    const url = html.toLowerCase().startsWith('http') ? html : `data:text/html,${html}`;
    await Page.navigate({url});
    await Page.loadEventFired();
    if (options.completionTrigger) {
      await options.completionTrigger.wait(client);
    }
    // https://chromedevtools.github.io/debugger-protocol-viewer/tot/Page/#method-printToPDF
    const pdf = await Page.printToPDF(options.printOptions);
    return new CreateResult(pdf.data);
  } finally {
    client.close();
  }
}

/**
 * Launches Chrome and listens on the specified port.
 *
 * @param {number} port the port for the launched Chrome to listen on.
 * @returns {Promise<Launcher>} The launched Launcher instance.
 */
async function launchChrome(port: number): Promise<Launcher> {
  const launcher = new Launcher({
    port,
    chromeFlags: [
      '--disable-gpu',
      '--headless',
    ],
  });
  try {
    await launcher.launch();
    return launcher;
  } catch (err) {
    await launcher.kill();
    return Promise.reject(err);
  }
}
