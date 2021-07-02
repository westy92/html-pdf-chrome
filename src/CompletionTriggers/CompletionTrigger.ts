'use strict';

import * as CDP from 'chrome-remote-interface';

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
    protected timeout: number = 1000,
    protected timeoutMessage: string = 'CompletionTrigger timed out.',
  ) {}

  /**
   * Optional hook to initialize the CompletionTrigger before navigation.
   * @param {CDP.Client} _client the Chrome connection information.
   * @returns {Promise<void>} resolves if initialized, rejects on error.
   * @memberof CompletionTrigger
   */
  public init(_client: CDP.Client): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Abstracts away the trigger logic.
   *
   * @abstract
   * @param {CDP.Client} client the Chrome connection information.
   * @returns {Promise<any>} resolves if triggered, rejects on error or timeout.
   * @memberof CompletionTrigger
   */
  public abstract wait(client: CDP.Client): Promise<any>;

}
