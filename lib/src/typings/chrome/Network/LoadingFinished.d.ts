import { Timestamp } from '../Runtime/Timestamp';
/**
 * Chrome Network.LoadingFinished event
 *
 * @export
 * @interface LoadingFinished
 */
export default interface LoadingFinished {
    /**
     * Network Request ID
     *
     * @type {string}
     * @memberof LoadingFinished
     */
    requestId: string;
    /**
     * Timestamp of the request
     *
     * @type {Timestamp}
     * @memberof LoadingFinished
     */
    timestamp: Timestamp;
    /**
     * Number of bytes received (in encoded format)
     *
     * @type {number}
     * @memberof LoadingFinished
     */
    encodedDataLength: number;
    /**
     * Dunno what shouldReportCorbBlocking is
     *
     * @type {boolean}
     * @memberof LoadingFinished
     */
    shouldReportCorbBlocking?: boolean;
}
