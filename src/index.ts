'use strict';

import { launch, LaunchedChrome } from 'chrome-launcher';
import * as CDP from 'chrome-remote-interface';
import Protocol from 'devtools-protocol';

import * as CompletionTrigger from './CompletionTriggers';
import { ConnectionLostError } from './ConnectionLostError';
import { CreateOptions } from './CreateOptions';
import { CreateResult } from './CreateResult';

const DEFAULT_CHROME_FLAGS = [
  '--disable-gpu',
  '--headless',
  '--hide-scrollbars',
];

export { CompletionTrigger, CreateOptions, CreateResult };

/**
 * Generates a PDF or screenshot from the given HTML string, launching Chrome as necessary.
 *
 * @export
 * @param {string} html the HTML string.
 * @param {Options} [options] the generation options.
 * @returns {Promise<CreateResult>} the generated PDF or screenshot data.
 */
export async function create(html: string, options?: CreateOptions): Promise<CreateResult> {
  const myOptions = normalizeCreateOptions(options);

  let chrome: LaunchedChrome;
  if (!myOptions.host && !myOptions.port) {
    chrome = await launchChrome(myOptions);
  }

  try {
    const tab = await CDP.New(myOptions);
    try {
      return await generate(html, myOptions, tab);
    } finally {
      if (!(myOptions._exitCondition instanceof ConnectionLostError)) {
        await CDP.Close({ ...myOptions, id: tab.id });
      }
    }
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

/**
 * Connects to Chrome and generates a PDF of screenshot from HTML or a URL.
 *
 * @param {string} html the HTML string or URL.
 * @param {CreateOptions} options the generation options.
 * @param {CDP.Target} tab the tab to use.
 * @returns {Promise<CreateResult>} the generated PDF or screenshot data.
 */
async function generate(html: string, options: CreateOptions, tab: CDP.Target): Promise<CreateResult> {
  await throwIfExitCondition(options);
  const client = await CDP({ ...options, target: tab });
  const connectionLostOrTimeout = new Promise<never>((_, reject) => {
    client.on('disconnect', () => {
      const error = new ConnectionLostError();
      options._exitCondition = error;
      reject(error);
    });
    if (options.timeout != null && options.timeout >= 0) {
      setTimeout(() => {
        const error = new Error('HtmlPdf.create() timed out.');
        options._exitCondition = error;
        reject(error);
      }, options.timeout);
    }
  });

  async function generateInternal() {
    try {
      await beforeNavigate(options, client);
      const {Page} = client;
      if (/^(https?|file|data):/i.test(html)) {
        await Promise.all([
          Page.navigate({url: html}),
          Page.loadEventFired(),
        ]); // Resolve order varies
      } else {
        const {frameTree} = await Page.getResourceTree();
        await Promise.all([
          Page.setDocumentContent({html, frameId: frameTree.frame.id}),
          Page.loadEventFired(),
        ]); // Resolve order varies
      }
      await afterNavigate(options, client);
      let base64Result: string;
      if (options.screenshotOptions) {
        // https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-captureScreenshot
        const screenshot = await Page.captureScreenshot(options.screenshotOptions)
        base64Result = screenshot.data
      } else {
        // https://chromedevtools.github.io/debugger-protocol-viewer/tot/Page/#method-printToPDF
        const pdf = await Page.printToPDF(options.printOptions);
        base64Result = pdf.data
      }
      await throwIfExitCondition(options);
      return new CreateResult(base64Result, options._mainRequestResponse);
    } finally {
      client.close();
    }
  }

  return Promise.race([
    connectionLostOrTimeout,
    generateInternal(),
  ]);
}

/**
 * Code to execute before the page navigation.
 *
 * @param {CreateOptions} options the generation options.
 * @param {CDP.Client} client the Chrome client.
 * @returns {Promise<void>} resolves if there we no errors or cancellations.
 */
async function beforeNavigate(options: CreateOptions, client: CDP.Client): Promise<void> {
  const {Emulation, Network, Page, Runtime} = client;
  await throwIfExitCondition(options);
  if (options.clearCache) {
    await Network.clearBrowserCache();
  }
  // Enable events to be used here, in generate(), or in afterNavigate().
  await Promise.all([
    Network.enable(),
    Page.enable(),
    Runtime.enable(),
  ]);
  if (options.runtimeConsoleHandler) {
    Runtime.consoleAPICalled(options.runtimeConsoleHandler);
  }
  if (options.runtimeExceptionHandler) {
    Runtime.exceptionThrown(options.runtimeExceptionHandler);
  }
  Network.requestWillBeSent((e: Protocol.Network.RequestWillBeSentEvent) => {
    options._mainRequestId = options._mainRequestId || e.requestId;
  });
  Network.loadingFailed((e: Protocol.Network.LoadingFailedEvent) => {
    if (e.requestId === options._mainRequestId) {
      options._exitCondition = new Error('HtmlPdf.create() page navigate failed.');
    }
  });
  Network.responseReceived((e: Protocol.Network.ResponseReceivedEvent) => {
    if (e.requestId === options._mainRequestId) {
      options._mainRequestResponse = e.response;
    }
  });
  if (options.extraHTTPHeaders) {
    Network.setExtraHTTPHeaders({headers: options.extraHTTPHeaders});
  }
  if (options.deviceMetrics) {
    Emulation.setDeviceMetricsOverride(options.deviceMetrics);
  }
  const promises = [throwIfExitCondition(options)];
  if (options.cookies) {
    promises.push(Network.setCookies({cookies: options.cookies}));
  }
  if (options.completionTrigger) {
    promises.push(options.completionTrigger.init(client));
  }
  await Promise.all(promises);
}

/**
 * Code to execute after the page navigation.
 *
 * @param {CreateOptions} options the generation options.
 * @param {CDP.Client} client the Chrome client.
 * @returns {Promise<void>} resolves if there we no errors or cancellations.
 */
async function afterNavigate(options: CreateOptions, client: CDP.Client): Promise<void> {
  if (options.completionTrigger) {
    await throwIfExitCondition(options);
    const waitResult = await options.completionTrigger.wait(client);
    if (waitResult && waitResult.exceptionDetails) {
      await throwIfExitCondition(options);
      throw new Error(waitResult.result.value);
    }
  }
  await throwIfExitCondition(options);
}

/**
 * Throws an exception if the operation has been canceled or the main page
 * navigation failed.
 *
 * @param {CreateOptions} options the options which track cancellation and failure.
 * @returns {Promise<void>} rejects if canceled or failed, resolves if not.
 */
async function throwIfExitCondition(options: CreateOptions): Promise<void> {
  if (options._exitCondition) {
    throw options._exitCondition;
  }
}

function normalizeCreateOptions(options: CreateOptions): CreateOptions {
  const myOptions = Object.assign({}, options); // clone

  // make sure these aren't set externally
  delete myOptions._exitCondition;
  delete myOptions._mainRequestId;
  delete myOptions._mainRequestResponse;

  return myOptions;
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
    chromeFlags: options.chromeFlags || DEFAULT_CHROME_FLAGS,
  });
  options.port = chrome.port;
  return chrome;
}
