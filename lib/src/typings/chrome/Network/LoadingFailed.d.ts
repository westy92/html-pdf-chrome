import { Timestamp } from '../Runtime/Timestamp';
import { BlockedReason } from './BlockedReason';
import { ResourceType } from './ResourceType';
/**
 * Chrome Network.LoadingFailed event
 *
 * @export
 * @interface LoadingFailed
 */
export default interface LoadingFailed {
    /**
     * Network Request ID
     *
     * @type {string}
     * @memberof LoadingFailed
     */
    requestId: string;
    /**
     * Timestamp of the request
     *
     * @type {Timestamp}
     * @memberof LoadingFailed
     */
    timestamp: Timestamp;
    /**
     * Type of resource requested
     *
     * @type {ResourceType}
     * @memberof LoadingFailed
     */
    type: ResourceType;
    /**
     * True if loading was canceled.
     *
     * @type {boolean}
     * @memberof LoadingFailed
     */
    canceled?: boolean;
    /**
     * The reason why loading was blocked, if any.
     *
     * @type {BlockedReason}
     * @memberof LoadingFailed
     */
    blockedReason?: BlockedReason;
}
