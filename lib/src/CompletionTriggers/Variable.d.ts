import { CompletionTrigger } from './CompletionTrigger';
/**
 * Waits for a variable to be true.
 *
 * @export
 * @class Variable
 * @extends {CompletionTrigger}
 */
export declare class Variable extends CompletionTrigger {
    protected variableName?: string;
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
