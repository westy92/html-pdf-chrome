'use strict';

import { CompletionTrigger } from './CompletionTrigger';

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
          if (window[${JSON.stringify(varName)}] === true) {
            // Already done
            resolve();
            return;
          }
          Object.defineProperty(window, ${JSON.stringify(varName)}, {
            set: (val) => { if (val === true) resolve(); }
          });
          setTimeout(() => reject(${JSON.stringify(this.timeoutMessage)}), ${this.timeout});
        })`,
    });
  }

}
