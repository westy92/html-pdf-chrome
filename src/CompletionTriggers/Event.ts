'use strict';

import * as CDP from 'chrome-remote-interface';
import Protocol from 'devtools-protocol';

import { CompletionTrigger } from './CompletionTrigger';

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

  public async wait(client: CDP.Client): Promise<Protocol.Runtime.EvaluateResponse> {
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
