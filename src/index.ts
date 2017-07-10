'use strict';

import { launch, LaunchedChrome } from 'chrome-launcher';
import { getRandomPort } from 'chrome-launcher/random-port';
import * as CDP from 'chrome-remote-interface';
import * as fs from 'fs';
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

  /**
   * The time in milliseconds to wait until timing out.
   */
  timeout?: number;

  /**
   * A private flag to signify the operation has been canceled.
   */
  _canceled?: boolean;
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
  let chrome: LaunchedChrome;

  myOptions._canceled = false;
  if (myOptions.timeout >= 0) {
    setTimeout(() => {
      myOptions._canceled = true;
    }, myOptions.timeout);
  }

  await throwIfCanceled(myOptions);
  if (!myOptions.host && !myOptions.port) {
    myOptions.port = await getRandomPort();
    await throwIfCanceled(myOptions);
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
  let client: any;
  try {
    await throwIfCanceled(options);
    client = await CDP(options);
    const {Page} = client;
    await Page.enable(); // Enable Page events
    const url = /^(https?|file|data):/i.test(html) ? html : `data:text/html,${html}`;
    await throwIfCanceled(options);
    await Page.navigate({url});
    await throwIfCanceled(options);
    await Page.loadEventFired();
    if (options.completionTrigger) {
      await throwIfCanceled(options);
      const waitResult = await options.completionTrigger.wait(client);
      if (waitResult && waitResult.exceptionDetails) {
        throw new Error(waitResult.result.value);
      }
    }
    await throwIfCanceled(options);
    // https://chromedevtools.github.io/debugger-protocol-viewer/tot/Page/#method-printToPDF
    const pdf = await Page.printToPDF(options.printOptions);
    await throwIfCanceled(options);
    return new CreateResult(pdf.data);
  } finally {
    if (client) {
      client.close();
    }
  }
}

/**
 * Throws an exception if the operation has been canceled.
 *
 * @param {CreateOptions} options the options which track cancellation.
 * @returns {Promise<void>} reject if cancelled, resolve if not.
 */
async function throwIfCanceled(options: CreateOptions): Promise<void> {
  if (options._canceled) {
    throw new Error('HtmlPdf.create() timed out.');
  }
}

/**
 * Launches Chrome and listens on the specified port.
 *
 * @param {number} port the port for the launched Chrome to listen on.
 * @returns {Promise<LaunchedChrome>} The launched Chrome instance.
 */
async function launchChrome(port: number): Promise<LaunchedChrome> {
  return launch({
    port,
    chromeFlags: [
      '--disable-gpu',
      '--headless',
    ],
  });
}
