'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chrome_launcher_1 = require("chrome-launcher");
const CDP = require("chrome-remote-interface");
const CompletionTrigger = require("./CompletionTrigger");
exports.CompletionTrigger = CompletionTrigger;
const CreateResult_1 = require("./CreateResult");
exports.CreateResult = CreateResult_1.CreateResult;
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
        if (myOptions.timeout >= 0) {
            setTimeout(() => {
                myOptions._canceled = true;
            }, myOptions.timeout);
        }
        yield throwIfCanceled(myOptions);
        if (!myOptions.host && !myOptions.port) {
            yield throwIfCanceled(myOptions);
            chrome = yield launchChrome();
            myOptions.port = chrome.port;
        }
        try {
            return yield generate(html, myOptions);
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
 * @returns {Promise<CreateResult>} the generated PDF data.
 */
function generate(html, options) {
    return __awaiter(this, void 0, void 0, function* () {
        yield throwIfCanceled(options);
        const client = yield CDP(options);
        try {
            const { Page } = client;
            yield Page.enable(); // Enable Page events
            const url = /^(https?|file|data):/i.test(html) ? html : `data:text/html,${html}`;
            yield throwIfCanceled(options);
            yield Page.navigate({ url });
            yield throwIfCanceled(options);
            yield Page.loadEventFired();
            if (options.completionTrigger) {
                yield throwIfCanceled(options);
                const waitResult = yield options.completionTrigger.wait(client);
                if (waitResult && waitResult.exceptionDetails) {
                    throw new Error(waitResult.result.value);
                }
            }
            yield throwIfCanceled(options);
            // https://chromedevtools.github.io/debugger-protocol-viewer/tot/Page/#method-printToPDF
            const pdf = yield Page.printToPDF(options.printOptions);
            yield throwIfCanceled(options);
            return new CreateResult_1.CreateResult(pdf.data);
        }
        finally {
            client.close();
        }
    });
}
/**
 * Throws an exception if the operation has been canceled.
 *
 * @param {CreateOptions} options the options which track cancellation.
 * @returns {Promise<void>} reject if cancelled, resolve if not.
 */
function throwIfCanceled(options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (options._canceled) {
            throw new Error('HtmlPdf.create() timed out.');
        }
    });
}
/**
 * Launches Chrome and listens on the specified or selected port.
 *
 * @param {number} [port] the port for the launched Chrome to listen on.
 * @returns {Promise<LaunchedChrome>} The launched Chrome instance.
 */
function launchChrome(port) {
    return __awaiter(this, void 0, void 0, function* () {
        return chrome_launcher_1.launch({
            port,
            chromeFlags: [
                '--disable-gpu',
                '--headless',
            ],
        });
    });
}

//# sourceMappingURL=index.js.map
