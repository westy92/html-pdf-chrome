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
/**
 * Defines a trigger that signifies page render completion.
 *
 * @export
 * @abstract
 * @class CompletionTrigger
 */
class CompletionTrigger {
    /**
     * Creates an instance of CompletionTrigger.
     * @param {number} [timeout=1000] milliseconds until timing out.
     * @param {string} [timeoutMessage='CompletionTrigger timed out.'] The timeout message.
     * @memberof CompletionTrigger
     */
    constructor(timeout = 1000, timeoutMessage = 'CompletionTrigger timed out.') {
        this.timeout = timeout;
        this.timeoutMessage = timeoutMessage;
    }
}
exports.CompletionTrigger = CompletionTrigger;
/**
 * Waits for a specified amount of time.
 *
 * @export
 * @class Timer
 * @extends {CompletionTrigger}
 */
class Timer extends CompletionTrigger {
    /**
     * Creates an instance of the Timer CompletionTrigger.
     * @param {number} timeout ms to wait until timing out.
     * @memberof Timer
     */
    constructor(timeout) {
        super(timeout);
    }
    wait(client) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                setTimeout(resolve, this.timeout);
            });
        });
    }
}
exports.Timer = Timer;
/**
 * Waits for an Event to fire.
 *
 * @export
 * @class Event
 * @extends {CompletionTrigger}
 */
class Event extends CompletionTrigger {
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
/**
 * Waits for a callback to be called.
 *
 * @export
 * @class Callback
 * @extends {CompletionTrigger}
 */
class Callback extends CompletionTrigger {
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
/**
 * Waits for a DOM element to appear.
 *
 * @export
 * @class Element
 * @extends {CompletionTrigger}
 */
class Element extends CompletionTrigger {
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
/**
 * Waits for a variable to be true.
 *
 * @export
 * @class Variable
 * @extends {CompletionTrigger}
 */
class Variable extends CompletionTrigger {
    /**
     * Creates an instance of the Variable CompletionTrigger.
     * @param {string} [variableName] the variable to listen on.
     *  Defaults to htmlPdfDone.
     * @param {number} [timeout] ms to wait until timing out.
     * @memberof Variable
     */
    constructor(variableName, timeout) {
        super(timeout);
        this.variableName = variableName;
    }
    wait(client) {
        return __awaiter(this, void 0, void 0, function* () {
            const { Runtime } = client;
            const varName = this.variableName || 'htmlPdfDone';
            return Runtime.evaluate({
                awaitPromise: true,
                expression: `
        new Promise((resolve, reject) => {
          Object.defineProperty(window, '${varName}', {
            set: (val) => { if (val === true) resolve(); }
          });
          setTimeout(() => reject('${this.timeoutMessage}'), ${this.timeout});
        })`,
            });
        });
    }
}
exports.Variable = Variable;

//# sourceMappingURL=CompletionTrigger.js.map
