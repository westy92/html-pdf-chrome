'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Defines a trigger that signifies page render completion.
 *
 * @export
 * @abstract
 * @class CompletionTrigger
 */
class CompletionTrigger {
    /**
     * Creates an instance of CompletionTrigger.
     * @param {number} [timeout=1000] milliseconds until timing out.
     * @param {string} [timeoutMessage='CompletionTrigger timed out.'] The timeout message.
     * @memberof CompletionTrigger
     */
    constructor(timeout = 1000, timeoutMessage = 'CompletionTrigger timed out.') {
        this.timeout = timeout;
        this.timeoutMessage = timeoutMessage;
    }
}
exports.CompletionTrigger = CompletionTrigger;

//# sourceMappingURL=CompletionTrigger.js.map
