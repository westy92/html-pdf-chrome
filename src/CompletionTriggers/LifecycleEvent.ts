'use strict';

import * as CDP from 'chrome-remote-interface';
import Protocol from 'devtools-protocol';

import { CompletionTrigger } from './CompletionTrigger';

/**
 * Waits for a Chrome page lifecycle event.
 * Some examples include:
 *  - init
 *  - DOMContentLoaded
 *  - load
 *  - firstPaint
 *  - firstContentfulPaint
 *  - firstMeaningfulPaintCandidate
 *  - networkAlmostIdle
 *  - firstMeaningfulPaint
 *  - networkIdle
 *
 * @export
 * @class LifecycleEvent
 * @extends {CompletionTrigger}
 */
export class LifecycleEvent extends CompletionTrigger {

  /**
   * Creates an instance of the LifecycleEvent CompletionTrigger.
   * @param {string} [eventName] the name of the event to listen for.
   *  Defaults to `firstMeaningfulPaint`.
   * @param {number} [timeout] ms to wait until timing out.
   * @memberof LifecycleEvent
   */
  constructor(protected eventName?: string, timeout?: number) {
    super(timeout);
  }

  #eventPromise: Promise<void>;

  public async init(client: CDP.Client): Promise<void> {
    const eName = this.eventName || 'firstMeaningfulPaint';
    const {Page} = client;
    await Page.setLifecycleEventsEnabled({ enabled: true });
    this.#eventPromise = new Promise((resolve) => {
      Page.lifecycleEvent((args: Protocol.Page.LifecycleEventEvent) => {
        if (args.name === eName) {
          resolve();
        }
      });
    });
  }

  public async wait(_client: CDP.Client): Promise<void> {
    return Promise.race([
      this.#eventPromise,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error(this.timeoutMessage)), this.timeout)),
    ]);
  }

}
