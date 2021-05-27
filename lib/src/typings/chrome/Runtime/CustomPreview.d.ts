import { RemoteObjectId } from './RemoteObjectId';
/**
 * @export
 * @interface CustomPreview
 */
export default interface CustomPreview {
    /**
     * @type {string}
     * @memberof CustomPreview
     */
    header: string;
    /**
     * @type {boolean}
     * @memberof CustomPreview
     */
    hasBody: boolean;
    /**
     * @type {RemoteObjectId}
     * @memberof CustomPreview
     */
    formatterObjectId: RemoteObjectId;
    /**
     * @type {RemoteObjectId}
     * @memberof CustomPreview
     */
    bindRemoteObjectFunctionId: RemoteObjectId;
    /**
     * @type {RemoteObjectId}
     * @memberof CustomPreview
     */
    configObjectId?: RemoteObjectId;
}
