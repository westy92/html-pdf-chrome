import { Timestamp } from '../Runtime/Timestamp';
/**
 * Chrome Network.ResponseReceived event
 *
 * @export
 * @interface ResponseReceived
 */
export default interface ResponseReceived {
    /**
     * Network Request ID
     *
     * @type {string}
     * @memberof ResponseReceived
     */
    requestId: string;
    /**
     * Timestamp of the request
     *
     * @type {Timestamp}
     * @memberof ResponseReceived
     */
    timestamp: Timestamp;
    /**
     * Response object
     *
     * @type {number}
     * @memberof ResponseReceived
     */
    response: any;
}
