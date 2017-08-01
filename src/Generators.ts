'use strict';

import { launch, LaunchedChrome } from 'chrome-launcher';
import * as CDP from 'chrome-remote-interface';
import { CreateOptions } from './CreateOptions';
import { CreateResult } from './CreateResult';

/**
 * Throws an exception if the operation has been canceled.
 *
 * @param {CreateOptions} options the options which track cancellation.
 * @returns {Promise<void>} reject if canceled, resolve if not.
 */
async function throwIfCanceled(options: CreateOptions): Promise<void> {
  if (options._canceled) {
    throw new Error('HtmlPdf.create() timed out.');
  }
}

/**
 * Launches Chrome with the specified options.
 *
 * @param {CreateOptions} options the options for Chrome.
 * @returns {Promise<LaunchedChrome>} The launched Chrome instance.
 */
async function launchChrome(options: CreateOptions): Promise<LaunchedChrome> {
  const chrome = await launch({
    port: options.port,
    chromePath: options.chromePath,
    chromeFlags: [
      '--disable-gpu',
      '--headless',
      '--hide-scrollbars',
    ],
  });
  options.port = chrome.port;
  return chrome;
}
/**
 * Base class for all Generators.
 */
export abstract class Generator {
  /**
   * Create a Generator.
   * @param {string} html The HTML string.
   * @param {Options} [options] The generation options.
   */
  public constructor(public html: string, public options?: CreateOptions) {}

  /**
   * Generates the document for the generator's instance type
   *
   * @returns {Promise<CreateResult>} The generated data.
   */
  public async create(): Promise<CreateResult> {
    const myOptions = Object.assign({}, this.options);
    let chrome: LaunchedChrome;

    myOptions._canceled = false;
    if (myOptions.timeout >= 0) {
      setTimeout(() => {
        myOptions._canceled = true;
      }, myOptions.timeout);
    }

    await throwIfCanceled(myOptions);
    if (!myOptions.host && !myOptions.port) {
      await throwIfCanceled(myOptions);
      chrome = await launchChrome(myOptions);
    }

    try {
      return await this.generate(myOptions);
    } finally {
      if (chrome) {
        await chrome.kill();
      }
    }
  }

  protected abstract async generate(options: CreateOptions): Promise<CreateResult>;

  protected get url(): string {
    return /^(https?|file|data):/i.test(this.html) ? this.html : `data:text/html,${this.html}`;
  }
}

/**
 * Generator for PDFs.
 */
export class PDFGenerator extends Generator {
  protected async generate(options: CreateOptions): Promise<CreateResult> {
    await throwIfCanceled(options);
    const client = await CDP(options);
    try {
      const {Page} = client;
      await Page.enable(); // Enable Page events
      await throwIfCanceled(options);
      await Page.navigate({url: this.url});
      await throwIfCanceled(options);
      await Page.loadEventFired();
      if (options.completionTrigger) {
        await throwIfCanceled(options);
        const waitResult = await options.completionTrigger.wait(client);
        if (waitResult && waitResult.exceptionDetails) {
          await throwIfCanceled(options);
          throw new Error(waitResult.result.value);
        }
      }
      await throwIfCanceled(options);
      // https://chromedevtools.github.io/debugger-protocol-viewer/tot/Page/#method-printToPDF
      const base64 = await Page.printToPDF(options.printOptions);
      await throwIfCanceled(options);
      return new CreateResult(base64.data);
    } finally {
      client.close();
    }
  }
}

/**
 * Generator for screenshots.
 * Code copied from https://github.com/schnerd/chrome-headless-screenshots/blob/master/index.js
 */
export class ScreenshotGenerator extends Generator {
  protected async generate(options: CreateOptions): Promise<CreateResult> {
    await throwIfCanceled(options);
    const client = await CDP(options);
    try {
      const {DOM, Emulation, Network, Page, Runtime} = client;

      await Page.enable();
      await DOM.enable();
      await Network.enable();

      await throwIfCanceled(options);

      const deviceMetrics = {
        width: 1920,
        height: 1080,
        deviceScaleFactor: 0,
        mobile: false,
        fitWindow: false,
        ...(options.screenshotOptions && options.screenshotOptions.deviceMetrics),
      };

      await Emulation.setDeviceMetricsOverride(deviceMetrics);
      await Emulation.setVisibleSize({
        width: deviceMetrics.width,
        height: deviceMetrics.height,
      });
      await throwIfCanceled(options);

      await Page.navigate({url: this.url});
      await throwIfCanceled(options);
      await Page.loadEventFired();

      if (options.screenshotOptions && options.screenshotOptions.fullPage) {
        const {root: {nodeId: documentNodeId}} = await DOM.getDocument();
        const {nodeId: bodyNodeId} = await DOM.querySelector({
          selector: 'body',
          nodeId: documentNodeId,
        });
        const {model} = await DOM.getBoxModel({nodeId: bodyNodeId});
        deviceMetrics.height = model.height;

        await Emulation.setVisibleSize({width: deviceMetrics.width, height: deviceMetrics.height});
        // This forceViewport call ensures that content outside the viewport is
        // rendered, otherwise it shows up as grey. Possibly a bug?
        await Emulation.forceViewport({x: 0, y: 0, scale: 1});
      }

      if (options.completionTrigger) {
        await throwIfCanceled(options);
        const waitResult = await options.completionTrigger.wait(client);
        if (waitResult && waitResult.exceptionDetails) {
          await throwIfCanceled(options);
          throw new Error(waitResult.result.value);
        }
      }
      await throwIfCanceled(options);

      const base64 = await Page.captureScreenshot(options.screenshotOptions && options.screenshotOptions.captureScreenShotOptions);
      await throwIfCanceled(options);
      return new CreateResult(base64.data);
    } finally {
      client.close();
    }
  }
}
