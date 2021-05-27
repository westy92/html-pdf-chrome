'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chrome_launcher_1 = require("chrome-launcher");
const CDP = require("chrome-remote-interface");
const CompletionTrigger = require("./CompletionTriggers");
exports.CompletionTrigger = CompletionTrigger;
const CreateResult_1 = require("./CreateResult");
exports.CreateResult = CreateResult_1.CreateResult;
const DEFAULT_CHROME_FLAGS = [
    '--disable-gpu',
    '--headless',
    '--hide-scrollbars',
];
/**
 * Generates a PDF from the given HTML string, launching Chrome as necessary.
 *
 * @export
 * @param {string} html the HTML string.
 * @param {Options} [options] the generation options.
 * @returns {Promise<CreateResult>} the generated PDF data.
 */
function create(html, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const myOptions = Object.assign({}, options);
        let chrome;
        myOptions._canceled = false;
        if (myOptions.timeout != null && myOptions.timeout >= 0) {
            setTimeout(() => {
                myOptions._canceled = true;
            }, myOptions.timeout);
        }
        yield throwIfCanceledOrFailed(myOptions);
        if (!myOptions.host && !myOptions.port) {
            chrome = yield launchChrome(myOptions);
        }
        try {
            const tab = yield CDP.New(myOptions);
            try {
                return yield generate(html, myOptions, tab);
            }
            finally {
                yield CDP.Close(Object.assign(Object.assign({}, myOptions), { id: tab.id }));
            }
        }
        finally {
            if (chrome) {
                yield chrome.kill();
            }
        }
    });
}
exports.create = create;
/**
 * Connects to Chrome and generates a PDF from HTML or a URL.
 *
 * @param {string} html the HTML string or URL.
 * @param {CreateOptions} options the generation options.
 * @param {any} tab the tab to use.
 * @returns {Promise<CreateResult>} the generated PDF data.
 */
function generate(html, options, tab) {
    return __awaiter(this, void 0, void 0, function* () {
        yield throwIfCanceledOrFailed(options);
        const client = yield CDP(Object.assign(Object.assign({}, options), { target: tab }));
        try {
            yield beforeNavigate(options, client);
            const { Page } = client;
            if (/^(https?|file|data):/i.test(html)) {
                yield Promise.all([
                    Page.navigate({ url: html }),
                    Page.loadEventFired(),
                ]); // Resolve order varies
            }
            else {
                const { frameTree } = yield Page.getResourceTree();
                yield Promise.all([
                    Page.setDocumentContent({ html, frameId: frameTree.frame.id }),
                    Page.loadEventFired(),
                ]); // Resolve order varies
            }
            yield afterNavigate(options, client);
            // https://chromedevtools.github.io/debugger-protocol-viewer/tot/Page/#method-printToPDF
            const pdf = yield Page.printToPDF(options.printOptions);
            yield throwIfCanceledOrFailed(options);
            return new CreateResult_1.CreateResult(pdf.data);
        }
        finally {
            client.close();
        }
    });
}
/**
 * Code to execute before the page navigation.
 *
 * @param {CreateOptions} options the generation options.
 * @param {*} client the Chrome client.
 * @returns {Promise<void>} resolves if there we no errors or cancellations.
 */
function beforeNavigate(options, client) {
    return __awaiter(this, void 0, void 0, function* () {
        const { Network, Page, Runtime } = client;
        yield throwIfCanceledOrFailed(options);
        if (options.clearCache) {
            yield Network.clearBrowserCache();
        }
        // Enable events to be used here, in generate(), or in afterNavigate().
        yield Promise.all([
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
            if (options.requestWillBeSentHandler) {
                options.requestWillBeSentHandler(e);
            }
        });
        Network.loadingFailed((e) => {
            if (e.requestId === options._mainRequestId) {
                options._navigateFailed = true;
            }
            if (options.loadingFailedHandler) {
                options.loadingFailedHandler(e);
            }
        });
        Network.responseReceived((e) => {
            if (e.requestId === options._mainRequestId) {
                options._responseStatusCode = e.response.status;
            }
        });
        if (options.extraHTTPHeaders) {
            Network.setExtraHTTPHeaders({ headers: options.extraHTTPHeaders });
        }
        if (options.cookies) {
            yield throwIfCanceledOrFailed(options);
            yield Network.setCookies({ cookies: options.cookies });
        }
        yield throwIfCanceledOrFailed(options);
    });
}
/**
 * Code to execute after the page navigation.
 *
 * @param {CreateOptions} options the generation options.
 * @param {*} client the Chrome client.
 * @returns {Promise<void>} resolves if there we no errors or cancellations.
 */
function afterNavigate(options, client) {
    return __awaiter(this, void 0, void 0, function* () {
        if (options.completionTrigger) {
            yield throwIfCanceledOrFailed(options);
            const waitResult = yield options.completionTrigger.wait(client);
            if (waitResult && waitResult.exceptionDetails) {
                yield throwIfCanceledOrFailed(options);
                throw new Error(waitResult.result.value);
            }
        }
        yield throwIfCanceledOrFailed(options);
    });
}
/**
 * Throws an exception if the operation has been canceled or the main page
 * navigation failed.
 *
 * @param {CreateOptions} options the options which track cancellation and failure.
 * @returns {Promise<void>} rejects if canceled or failed, resolves if not.
 */
function throwIfCanceledOrFailed(options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (options._canceled) {
            throw new Error('HtmlPdf.create() timed out.');
        }
        if (options._navigateFailed) {
            throw new Error('HtmlPdf.create() page navigate failed.');
        }
        if (options._responseStatusCode !== null && false !== options.failOnHTTP4xx && options._responseStatusCode >= 400 && options._responseStatusCode <= 499) {
            throw new Error('HtmlPdf.create() status code ' + options._responseStatusCode);
        }
        if (options._responseStatusCode != null && false !== options.failOnHTTP5xx && options._responseStatusCode >= 500 && options._responseStatusCode <= 599) {
            throw new Error('HtmlPdf.create() status code ' + options._responseStatusCode);
        }
    });
}
/**
 * Launches Chrome with the specified options.
 *
 * @param {CreateOptions} options the options for Chrome.
 * @returns {Promise<LaunchedChrome>} The launched Chrome instance.
 */
function launchChrome(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const chrome = yield chrome_launcher_1.launch({
            port: options.port,
            chromePath: options.chromePath,
            chromeFlags: options.chromeFlags || DEFAULT_CHROME_FLAGS,
        });
        options.port = chrome.port;
        return chrome;
    });
}

//# sourceMappingURL=index.js.map
