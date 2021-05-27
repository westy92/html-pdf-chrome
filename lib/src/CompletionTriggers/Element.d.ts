import { CompletionTrigger } from './CompletionTrigger';
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
