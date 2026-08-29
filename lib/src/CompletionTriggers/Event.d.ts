import { CompletionTrigger } from './CompletionTrigger';
/**
 * Waits for an Event to fire.
 *
 * @export
 * @class Event
 * @extends {CompletionTrigger}
 */
export declare class Event extends CompletionTrigger {
    protected event: string;
    protected cssSelector?: string;
    /**
     * Creates an instance of the Event CompletionTrigger.
     * @param {string} event the name of the event to listen for.
     * @param {string} [cssSelector] the CSS selector of the element to listen on.
     *  Defaults to body.
     * @param {number} [timeout] ms to wait until timing out.
     * @memberof Event
     */
    constructor(event: string, cssSelector?: string, timeout?: number);
    wait(client: any): Promise<any>;
}
