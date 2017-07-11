/**
 * Defines a trigger that signifies page render completion.
 *
 * @export
 * @abstract
 * @class CompletionTrigger
 */
export declare abstract class CompletionTrigger {
    protected timeout: number;
    protected timeoutMessage: string;
    /**
     * Creates an instance of CompletionTrigger.
     * @param {number} [timeout=1000] milliseconds until timing out.
     * @param {string} [timeoutMessage='CompletionTrigger timed out.'] The timeout message.
     * @memberof CompletionTrigger
     */
    constructor(timeout?: number, timeoutMessage?: string);
    /**
     * Abstracts away the trigger logic.
     *
     * @abstract
     * @param {*} client the Chrome connection information.
     * @returns {Promise<any>} resolves if triggered, rejects on error or timeout.
     * @memberof CompletionTrigger
     */
    abstract wait(client: any): Promise<any>;
}
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
    wait(client: any): Promise<any>;
}
/**
 * Waits for an Event to fire.
 *
 * @export
 * @class Event
 * @extends {CompletionTrigger}
 */
export declare class Event extends CompletionTrigger {
    protected event: string;
    protected cssSelector: string;
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
/**
 * Waits for a callback to be called.
 *
 * @export
 * @class Callback
 * @extends {CompletionTrigger}
 */
export declare class Callback extends CompletionTrigger {
    protected callbackName: string;
    /**
     * Creates an instance of the Callback CompletionTrigger.
     * @param {string} [callbackName] the name of the callback to listen for.
     *  Defaults to htmlPdfCb.
     * @param {number} [timeout] ms to wait until timing out.
     * @memberof Callback
     */
    constructor(callbackName?: string, timeout?: number);
    wait(client: any): Promise<any>;
}
/**
 * Waits for a DOM element to appear.
 *
 * @export
 * @class Element
 * @extends {CompletionTrigger}
 */
export declare class Element extends CompletionTrigger {
    protected cssSelector: string;
    /**
     * Creates an instance of the Element CompletionTrigger.
     * @param {string} cssSelector the element to listen for.
     * @param {number} [timeout] ms to wait until timing out.
     * @memberof Element
     */
    constructor(cssSelector: string, timeout?: number);
    wait(client: any): Promise<any>;
}
/**
 * Waits for a variable to be true.
 *
 * @export
 * @class Variable
 * @extends {CompletionTrigger}
 */
export declare class Variable extends CompletionTrigger {
    protected variableName: string;
    /**
     * Creates an instance of the Variable CompletionTrigger.
     * @param {string} [variableName] the variable to listen on.
     *  Defaults to htmlPdfDone.
     * @param {number} [timeout] ms to wait until timing out.
     * @memberof Variable
     */
    constructor(variableName?: string, timeout?: number);
    wait(client: any): Promise<any>;
}
