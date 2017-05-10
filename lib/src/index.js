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
const CDP = require("chrome-remote-interface");
const chrome_launcher_1 = require("lighthouse/lighthouse-cli/chrome-launcher");
const random_port_1 = require("lighthouse/lighthouse-cli/random-port");
const CreateResult_1 = require("./CreateResult");
exports.CreateResult = CreateResult_1.CreateResult;
/**
 * Generates a PDF from the given HTML string.
 *
 * @export
 * @param {string} html the HTML string.
 * @param {Options} [options] the generation options.
 * @returns {Promise<CreateResult>} the generated PDF data.
 */
function create(html, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const myOptions = Object.assign({}, options);
        myOptions.port = myOptions.port || (yield random_port_1.getRandomPort());
        const chrome = yield launchChrome(myOptions.port);
        return new Promise((resolve, reject) => {
            CDP(myOptions, (client) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { Page } = client;
                    yield Page.enable(); // Enable Page events
                    yield Page.navigate({ url: `data:text/html,${html}` });
                    yield Page.loadEventFired();
                    // https://chromedevtools.github.io/debugger-protocol-viewer/tot/Page/#method-printToPDF
                    const pdf = yield Page.printToPDF(myOptions.printOptions);
                    return resolve(new CreateResult_1.CreateResult(pdf.data));
                }
                catch (err) {
                    reject(err);
                }
                finally {
                    client.close();
                }
            })).on('error', (err) => {
                reject(err);
            });
        }).then((createResult) => __awaiter(this, void 0, void 0, function* () {
            yield chrome.kill();
            return createResult;
        })).catch((err) => __awaiter(this, void 0, void 0, function* () {
            if (chrome) {
                yield chrome.kill();
            }
            return Promise.reject(err);
        }));
    });
}
exports.create = create;
/**
 * Launches Chrome and listens on the specified port.
 *
 * @param {number} port the port for the launched Chrome to listen on.
 * @returns {Promise<ChromeLauncher>} The launched ChromeLauncher instance.
 */
function launchChrome(port) {
    return __awaiter(this, void 0, void 0, function* () {
        const launcher = new chrome_launcher_1.ChromeLauncher({
            port,
            autoSelectChrome: true,
            additionalFlags: [
                '--disable-gpu',
                '--headless',
            ],
        });
        try {
            yield launcher.run();
            return launcher;
        }
        catch (err) {
            yield launcher.kill();
        }
    });
}

//# sourceMappingURL=index.js.map
