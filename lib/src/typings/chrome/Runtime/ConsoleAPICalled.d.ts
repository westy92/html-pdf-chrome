import { ExecutionContextId } from './ExecutionContextId';
import RemoteObject from './RemoteObject';
import StackTrace from './StackTrace';
import { Timestamp } from './Timestamp';
/**
 * Issued when console API was called.
 *
 * @export
 * @interface ConsoleAPICalled
 */
export default interface ConsoleAPICalled {
    /**
     * Type of the call.
     *
     * @type {('log' | 'debug' | 'info' | 'error' | 'warning' | 'dir' | 'dirxml' | 'table' | 'trace' | 'clear' | 'startGroup' | 'startGroupCollapsed' | 'endGroup' | 'assert' | 'profile' | 'profileEnd' | 'count' | 'timeEnd')}
     * @memberof ConsoleAPICalled
     */
    type: 'log' | 'debug' | 'info' | 'error' | 'warning' | 'dir' | 'dirxml' | 'table' | 'trace' | 'clear' | 'startGroup' | 'startGroupCollapsed' | 'endGroup' | 'assert' | 'profile' | 'profileEnd' | 'count' | 'timeEnd';
    /**
     * Call arguments.
     *
     * @type {RemoteObject[]}
     * @memberof ConsoleAPICalled
     */
    args: RemoteObject[];
    /**
     * Identifier of the context where the call was made.
     *
     * @type {ExecutionContextId}
     * @memberof ConsoleAPICalled
     */
    executionContextId: ExecutionContextId;
    /**
     * Call timestamp.
     *
     * @type {Timestamp}
     * @memberof ConsoleAPICalled
     */
    timestamp: Timestamp;
    /**
     * Stack trace captured when the call was made.
     *
     * @type {StackTrace}
     * @memberof ConsoleAPICalled
     */
    stackTrace?: StackTrace;
    /**
     * Console context descriptor for calls on non-default console context (not console.*):
     * 'anonymous#unique-logger-id' for call on unnamed context,
     * 'name#unique-logger-id' for call on named context.
     *
     * @type {string}
     * @memberof ConsoleAPICalled
     */
    context?: string;
}
