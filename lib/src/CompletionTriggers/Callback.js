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
const CompletionTrigger_1 = require("./CompletionTrigger");
/**
 * Waits for a callback to be called.
 *
 * @export
 * @class Callback
 * @extends {CompletionTrigger}
 */
class Callback extends CompletionTrigger_1.CompletionTrigger {
    /**
     * Creates an instance of the Callback CompletionTrigger.
     * @param {string} [callbackName] the name of the callback to listen for.
     *  Defaults to htmlPdfCb.
     * @param {number} [timeout] ms to wait until timing out.
     * @memberof Callback
     */
    constructor(callbackName, timeout) {
        super(timeout);
        this.callbackName = callbackName;
    }
    wait(client) {
        return __awaiter(this, void 0, void 0, function* () {
            const { Runtime } = client;
            const cbName = this.callbackName || 'htmlPdfCb';
            return Runtime.evaluate({
                awaitPromise: true,
                expression: `
        new Promise((resolve, reject) => {
          ${cbName} = resolve;
          setTimeout(() => reject('${this.timeoutMessage}'), ${this.timeout});
        })`,
            });
        });
    }
}
exports.Callback = Callback;

//# sourceMappingURL=Callback.js.map
