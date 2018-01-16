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
