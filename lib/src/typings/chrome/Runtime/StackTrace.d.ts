import CallFrame from './CallFrame';
/**
 * Call frames for assertions or error messages.
 *
 * @export
 * @interface StackTrace
 */
export default interface StackTrace {
    /**
     * String label of this stack trace. For async traces this may
     * be a name of the function that initiated the async call.
     *
     * @type {string}
     * @memberof StackTrace
     */
    description?: string;
    /**
     * JavaScript function name.
     *
     * @type {CallFrame[]}
     * @memberof StackTrace
     */
    callFrames: CallFrame[];
    /**
     * Asynchronous JavaScript stack trace that preceded this stack, if available.
     *
     * @type {StackTrace}
     * @memberof StackTrace
     */
    parent?: StackTrace;
    /**
     * Creation frame of the Promise which produced the next synchronous trace when resolved, if available.
     *
     * @type {CallFrame}
     * @memberof StackTrace
     */
    promiseCreationFrame?: CallFrame;
}
