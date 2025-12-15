'use strict';

import * as CDP from 'chrome-remote-interface';
import Protocol from 'devtools-protocol';

import { CompletionTrigger } from './CompletionTrigger';

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

  public async wait(client: CDP.Client): Promise<Protocol.Runtime.EvaluateResponse> {
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
