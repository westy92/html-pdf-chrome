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
const fs = require("fs");
const chrome_launcher_1 = require("lighthouse/lighthouse-cli/chrome-launcher");
const random_port_1 = require("lighthouse/lighthouse-cli/random-port");
const stream_1 = require("stream");
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
                    const pdf = yield Page.printToPDF();
                    return resolve(new CreateResult(pdf.data));
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
            if (chrome) {
                yield chrome.kill();
            }
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
/**
 * Allows exporting of PDF data to multiple formats.
 *
 * @export
 * @class CreateResult
 */
class CreateResult {
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
    static writeFile(filename, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs.writeFile(filename, data, (err) => {
                    err ? reject(err) : resolve();
                });
            });
        });
    }
    /**
     * Creates an instance of CreateResult.
     * @param {string} data base64 PDF data
     *
     * @memberof CreateResult
     */
    constructor(data) {
        this.data = data;
    }
    /**
     * Get the base64 PDF data.
     *
     * @returns {string} base64 PDF data.
     *
     * @memberof CreateResult
     */
    toBase64() {
        return this.data;
    }
    /**
     * Get a Buffer of the PDF data.
     *
     * @returns {Buffer} PDF data.
     *
     * @memberof CreateResult
     */
    toBuffer() {
        return Buffer.from(this.data, 'base64');
    }
    /**
     * Get a Stream of the PDF data.
     *
     * @returns {Stream} Stream of PDF data.
     *
     * @memberof CreateResult
     */
    toStream() {
        const stream = new stream_1.Readable();
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
    toFile(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            yield CreateResult.writeFile(filename, this.toBuffer());
        });
    }
}
exports.CreateResult = CreateResult;

//# sourceMappingURL=index.js.map
