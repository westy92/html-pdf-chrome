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
 * Waits for a DOM element to appear.
 *
 * @export
 * @class Element
 * @extends {CompletionTrigger}
 */
class Element extends CompletionTrigger_1.CompletionTrigger {
    /**
     * Creates an instance of the Element CompletionTrigger.
     * @param {string} cssSelector the element to listen for.
     * @param {number} [timeout] ms to wait until timing out.
     * @memberof Element
     */
    constructor(cssSelector, timeout) {
        super(timeout);
        this.cssSelector = cssSelector;
    }
    wait(client) {
        return __awaiter(this, void 0, void 0, function* () {
            const { Runtime } = client;
            return Runtime.evaluate({
                awaitPromise: true,
                expression: `
        new Promise((resolve, reject) => {
          new MutationObserver((mutations, observer) => {
            mutations.forEach((mutation) => {
              if ([...mutation.addedNodes].find((node) => node.matches('${this.cssSelector}'))) {
                observer.disconnect();
                resolve();
              }
            });
          }).observe(document.body, { childList: true });
          setTimeout(() => reject('${this.timeoutMessage}'), ${this.timeout});
        })`,
            });
        });
    }
}
exports.Element = Element;

//# sourceMappingURL=Element.js.map
