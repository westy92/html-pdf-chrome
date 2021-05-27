import { CompletionTrigger } from './CompletionTrigger';
/**
 * Waits for a callback to be called.
 *
 * @export
 * @class Callback
 * @extends {CompletionTrigger}
 */
export declare class Callback extends CompletionTrigger {
    protected callbackName?: string;
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
