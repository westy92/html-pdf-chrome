import { ExecutionContextId } from './ExecutionContextId';
import RemoteObject from './RemoteObject';
import { ScriptId } from './ScriptId';
import StackTrace from './StackTrace';
/**
 * Detailed information about exception (or error) that was thrown during script compilation or execution.
 *
 * @export
 * @interface ExceptionDetails
 */
export default interface ExceptionDetails {
    /**
     * Exception id.
     *
     * @type {number}
     * @memberof ExceptionDetails
     */
    exceptionId: number;
    /**
     * Exception text, which should be used together with exception object when available.
     *
     * @type {string}
     * @memberof ExceptionDetails
     */
    text: string;
    /**
     * Line number of the exception location (0-based).
     *
     * @type {number}
     * @memberof ExceptionDetails
     */
    lineNumber: number;
    /**
     * Column number of the exception location (0-based).
     *
     * @type {number}
     * @memberof ExceptionDetails
     */
    columnNumber: number;
    /**
     * Script ID of the exception location.
     *
     * @type {ScriptId}
     * @memberof ExceptionDetails
     */
    scriptId?: ScriptId;
    /**
     * URL of the exception location, to be used when the script was not reported.
     *
     * @type {string}
     * @memberof ExceptionDetails
     */
    url?: string;
    /**
     * JavaScript stack trace if available.
     *
     * @type {StackTrace}
     * @memberof ExceptionDetails
     */
    stackTrace?: StackTrace;
    /**
     * Exception object if available.
     *
     * @type {RemoteObject}
     * @memberof ExceptionDetails
     */
    exception?: RemoteObject;
    /**
     * Identifier of the context where exception happened.
     *
     * @type {ExecutionContextId}
     * @memberof ExceptionDetails
     */
    executionContextId?: ExecutionContextId;
}
