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
