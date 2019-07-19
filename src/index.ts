'use strict';

import { launch, LaunchedChrome } from 'chrome-launcher';
import * as CDP from 'chrome-remote-interface';

import * as CompletionTrigger from './CompletionTriggers';
import { CreateOptions } from './CreateOptions';
import { CreateResult } from './CreateResult';

const DEFAULT_CHROME_FLAGS = [
  '--disable-gpu',
  '--headless',
  '--hide-scrollbars',
];

export { CompletionTrigger, CreateOptions, CreateResult };

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
  if (myOptions.timeout != null && myOptions.timeout >= 0) {
    setTimeout(() => {
      myOptions._canceled = true;
    }, myOptions.timeout);
  }

  await throwIfCanceledOrFailed(myOptions);
  if (!myOptions.host && !myOptions.port) {
    chrome = await launchChrome(myOptions);
  }

  try {
    const tab = await CDP.New(myOptions);
    try {
      return await generate(html, myOptions, tab);
    } finally {
      await CDP.Close({ ...myOptions, id: tab.id });
    }
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
 * @param {any} tab the tab to use.
 * @returns {Promise<CreateResult>} the generated PDF data.
 */
async function generate(html: string, options: CreateOptions, tab: any): Promise<CreateResult>  {
  await throwIfCanceledOrFailed(options);
  const client = await CDP({ ...options, target: tab });
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
    // https://chromedevtools.github.io/debugger-protocol-viewer/tot/Page/#method-printToPDF
    const pdf = await Page.printToPDF(options.printOptions);
    await throwIfCanceledOrFailed(options);
    return new CreateResult(pdf.data);
  } finally {
    client.close();
  }
}

/**
 * Code to execute before the page navigation.
 *
 * @param {CreateOptions} options the generation options.
 * @param {*} client the Chrome client.
 * @returns {Promise<void>} resolves if there we no errors or cancellations.
 */
async function beforeNavigate(options: CreateOptions, client: any): Promise<void> {
  const {Network, Page, Runtime} = client;
  await throwIfCanceledOrFailed(options);
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
  Network.requestWillBeSent((e) => {
    options._mainRequestId = options._mainRequestId || e.requestId;
  });
  Network.loadingFailed((e) => {
    if (e.requestId === options._mainRequestId) {
      options._navigateFailed = true;
    }
  });
  if (options.extraHTTPHeaders) {
    Network.setExtraHTTPHeaders({headers: options.extraHTTPHeaders});
  }
  if (options.cookies) {
    await throwIfCanceledOrFailed(options);
    await Network.setCookies({cookies: options.cookies});
  }
  await throwIfCanceledOrFailed(options);
}

/**
 * Code to execute after the page navigation.
 *
 * @param {CreateOptions} options the generation options.
 * @param {*} client the Chrome client.
 * @returns {Promise<void>} resolves if there we no errors or cancellations.
 */
async function afterNavigate(options: CreateOptions, client: any): Promise<void> {
  if (options.completionTrigger) {
    await throwIfCanceledOrFailed(options);
    const waitResult = await options.completionTrigger.wait(client);
    if (waitResult && waitResult.exceptionDetails) {
      await throwIfCanceledOrFailed(options);
      throw new Error(waitResult.result.value);
    }
  }
  await throwIfCanceledOrFailed(options);
}

/**
 * Throws an exception if the operation has been canceled or the main page
 * navigation failed.
 *
 * @param {CreateOptions} options the options which track cancellation and failure.
 * @returns {Promise<void>} rejects if canceled or failed, resolves if not.
 */
async function throwIfCanceledOrFailed(options: CreateOptions): Promise<void> {
  if (options._canceled) {
    throw new Error('HtmlPdf.create() timed out.');
  }
  if (options._navigateFailed) {
    throw new Error('HtmlPdf.create() page navigate failed.');
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
    chromeFlags: options.chromeFlags || DEFAULT_CHROME_FLAGS,
  });
  options.port = chrome.port;
  return chrome;
}
