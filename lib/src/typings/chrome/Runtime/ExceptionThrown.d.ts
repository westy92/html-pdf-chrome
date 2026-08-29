import ExceptionDetails from './ExceptionDetails';
import { Timestamp } from './Timestamp';
/**
 * Issued when exception was thrown and unhandled.
 *
 * @export
 * @interface ExceptionThrown
 */
export default interface ExceptionThrown {
    /**
     * Timestamp of the exception.
     *
     * @type {Timestamp}
     * @memberof ExceptionThrown
     */
    timestamp: Timestamp;
    /**
     * @type {ExceptionDetails}
     * @memberof ExceptionThrown
     */
    exceptionDetails: ExceptionDetails;
}
