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
 * Waits for an Event to fire.
 *
 * @export
 * @class Event
 * @extends {CompletionTrigger}
 */
class Event extends CompletionTrigger_1.CompletionTrigger {
    /**
     * Creates an instance of the Event CompletionTrigger.
     * @param {string} event the name of the event to listen for.
     * @param {string} [cssSelector] the CSS selector of the element to listen on.
     *  Defaults to body.
     * @param {number} [timeout] ms to wait until timing out.
     * @memberof Event
     */
    constructor(event, cssSelector, timeout) {
        super(timeout);
        this.event = event;
        this.cssSelector = cssSelector;
    }
    wait(client) {
        return __awaiter(this, void 0, void 0, function* () {
            const { Runtime } = client;
            const selector = this.cssSelector ? `querySelector('${this.cssSelector}')` : 'body';
            return Runtime.evaluate({
                awaitPromise: true,
                expression: `
        new Promise((resolve, reject) => {
          document.${selector}.addEventListener('${this.event}', resolve, { once: true });
          setTimeout(() => reject('${this.timeoutMessage}'), ${this.timeout});
        })`,
            });
        });
    }
}
exports.Event = Event;

//# sourceMappingURL=Event.js.map
