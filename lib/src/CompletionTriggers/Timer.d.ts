import { CompletionTrigger } from './CompletionTrigger';
/**
 * Waits for a specified amount of time.
 *
 * @export
 * @class Timer
 * @extends {CompletionTrigger}
 */
export declare class Timer extends CompletionTrigger {
    /**
     * Creates an instance of the Timer CompletionTrigger.
     * @param {number} timeout ms to wait until timing out.
     * @memberof Timer
     */
    constructor(timeout: number);
    wait(): Promise<void>;
}
