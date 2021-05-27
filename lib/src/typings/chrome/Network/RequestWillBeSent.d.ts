import { Timestamp } from '../Runtime/Timestamp';
import { ResourceType } from './ResourceType';
import { TimeSinceEpoch } from './TimeSinceEpoch';
/**
 * Chrome Network.requestWillBeSent event
 *
 * @export
 * @interface RequestWillBeSent
 */
export default interface RequestWillBeSent {
    /**
     * Network Request ID
     *
     * @type {string}
     * @memberof RequestWillBeSent
     */
    requestId: string;
    /**
     * Network Loader ID
     *
     * @type {string}
     * @memberof RequestWillBeSent
     */
    loaderId: string;
    /**
     * Request Data as per https://chromedevtools.github.io/devtools-protocol/tot/Network#type-Request
     *
     * @type {any}
     * @memberof RequestWillBeSent
     */
    request: any;
    /**
     * Timestamp of the request
     *
     * @type {Timestamp}
     * @memberof RequestWillBeSent
     */
    timestamp: Timestamp;
    /**
     * Timestamp of the request in TimeSinceEpoch format
     *
     * @type {TimeSinceEpoch}
     * @memberof RequestWillBeSent
     */
    wallTime: TimeSinceEpoch;
    /**
     * Initiator of the request as per https://chromedevtools.github.io/devtools-protocol/tot/Network#type-Initiator
     *
     * @type {any}
     * @memberof RequestWillBeSent
     */
    initiator: any;
    /**
     * Redirect Response data as per https://chromedevtools.github.io/devtools-protocol/tot/Network#type-Response
     *
     * @type {any}
     * @memberof RequestWillBeSent
     */
    redirectResponse?: any;
    /**
     * Type of resource requested
     *
     * @type {ResourceType}
     * @memberof RequestWillBeSent
     */
    resourceType?: ResourceType;
    /**
     * Frame ID
     *
     * @type {string}
     * @memberof RequestWillBeSent
     */
    frameId?: string;
    /**
     * Whether the request is initiated by a user gesture.
     *
     * @type {boolean}
     * @memberof RequestWillBeSent
     */
    hasUserGesture?: boolean;
}
