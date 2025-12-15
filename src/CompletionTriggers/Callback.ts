'use strict';

import * as CDP from 'chrome-remote-interface';
import Protocol from 'devtools-protocol';

import { CompletionTrigger } from './CompletionTrigger';

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

  public async wait(client: CDP.Client): Promise<Protocol.Runtime.EvaluateResponse> {
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
