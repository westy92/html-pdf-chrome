'use strict';

/**
 * Defines a trigger that signifies page render completion.
 *
 * @export
 * @abstract
 * @class CompletionTrigger
 */
export abstract class CompletionTrigger {

  /**
   * Creates an instance of CompletionTrigger.
   * @param {number} [timeout=1000] milliseconds until timing out.
   * @param {string} [timeoutMessage='CompletionTrigger timed out.'] The timeout message.
   * @memberof CompletionTrigger
   */
  constructor(
    protected timeout = 1000,
    protected timeoutMessage = 'CompletionTrigger timed out.',
  ) {}

  /**
   * Abstracts away the trigger logic.
   *
   * @abstract
   * @param {*} client the Chrome connection information.
   * @returns {Promise<any>} resolves if triggered, rejects on error or timeout.
   * @memberof CompletionTrigger
   */
  public abstract async wait(client: any): Promise<any>;
}

/**
 * Waits for a specified amount of time.
 *
 * @export
 * @class Timer
 * @extends {CompletionTrigger}
 */
export class Timer extends CompletionTrigger {

  /**
   * Creates an instance of the Timer CompletionTrigger.
   * @param {number} timeout ms to wait until timing out.
   * @memberof Timer
   */
  constructor(timeout: number) {
    super(timeout);
  }

  public async wait(client: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(resolve, this.timeout);
    });
  }
}

/**
 * Waits for an Event to fire.
 *
 * @export
 * @class Event
 * @extends {CompletionTrigger}
 */
export class Event extends CompletionTrigger {

  /**
   * Creates an instance of the Event CompletionTrigger.
   * @param {string} event the name of the event to listen for.
   * @param {string} [cssSelector] the CSS selector of the element to listen on.
   *  Defaults to body.
   * @param {number} [timeout] ms to wait until timing out.
   * @memberof Event
   */
  constructor(protected event: string, protected cssSelector?: string, timeout?: number) {
    super(timeout);
  }

  public async wait(client: any): Promise<any> {
    const {Runtime} = client;
    const selector = this.cssSelector ? `querySelector('${this.cssSelector}')` : 'body';
    return Runtime.evaluate({
      awaitPromise: true,
      expression: `
        new Promise((resolve, reject) => {
          document.${selector}.addEventListener('${this.event}', resolve, { once: true });
          setTimeout(() => reject('${this.timeoutMessage}'), ${this.timeout});
        })`,
    });
  }
}

/**
 * Waits for a callback to be called.
 *
 * @export
 * @class Callback
 * @extends {CompletionTrigger}
 */
export class Callback extends CompletionTrigger {

  /**
   * Creates an instance of the Callback CompletionTrigger.
   * @param {string} [callbackName] the name of the callback to listen for.
   *  Defaults to htmlPdfCb.
   * @param {number} [timeout] ms to wait until timing out.
   * @memberof Callback
   */
  constructor(protected callbackName?: string, timeout?: number) {
    super(timeout);
  }

  public async wait(client: any): Promise<any> {
    const {Runtime} = client;
    const cbName = this.callbackName || 'htmlPdfCb';
    return Runtime.evaluate({
      awaitPromise: true,
      expression: `
        new Promise((resolve, reject) => {
          ${cbName} = resolve;
          setTimeout(() => reject('${this.timeoutMessage}'), ${this.timeout});
        })`,
    });
  }
}

/**
 * Waits for a DOM element to appear.
 *
 * @export
 * @class Element
 * @extends {CompletionTrigger}
 */
export class Element extends CompletionTrigger {

  /**
   * Creates an instance of the Element CompletionTrigger.
   * @param {string} cssSelector the element to listen for.
   * @param {number} [timeout] ms to wait until timing out.
   * @memberof Element
   */
  constructor(protected cssSelector: string, timeout?: number) {
    super(timeout);
  }

  public async wait(client: any): Promise<any> {
    const {Runtime} = client;
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
  }
}

/**
 * Waits for a variable to be true.
 *
 * @export
 * @class Variable
 * @extends {CompletionTrigger}
 */
export class Variable extends CompletionTrigger {

  /**
   * Creates an instance of the Variable CompletionTrigger.
   * @param {string} [variableName] the variable to listen on.
   *  Defaults to htmlPdfDone.
   * @param {number} [timeout] ms to wait until timing out.
   * @memberof Variable
   */
  constructor(protected variableName?: string, timeout?: number) {
    super(timeout);
  }

  public async wait(client: any): Promise<any> {
    const {Runtime} = client;
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
  }
}
