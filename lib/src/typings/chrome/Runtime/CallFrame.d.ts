import { ScriptId } from './ScriptId';
/**
 * Stack entry for runtime errors and assertions.
 *
 * @export
 * @interface CallFrame
 */
export default interface CallFrame {
    /**
     * JavaScript function name.
     *
     * @type {string}
     * @memberof CallFrame
     */
    functionName: string;
    /**
     * JavaScript script id.
     *
     * @type {ScriptId}
     * @memberof CallFrame
     */
    scriptId: ScriptId;
    /**
     * JavaScript script name or url.
     *
     * @type {string}
     * @memberof CallFrame
     */
    url: string;
    /**
     * JavaScript script line number (0-based).
     *
     * @type {integer}
     * @memberof CallFrame
     */
    lineNumber: number;
    /**
     * JavaScript script column number (0-based).
     *
     * @type {integer}
     * @memberof CallFrame
     */
    columnNumber: number;
}
