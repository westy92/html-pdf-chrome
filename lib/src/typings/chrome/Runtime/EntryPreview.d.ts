import ObjectPreview from './ObjectPreview';
/**
 * @export
 * @interface EntryPreview
 */
export default interface EntryPreview {
    /**
     * Preview of the key. Specified for map-like collection entries.
     *
     * @type {ObjectPreview}
     * @memberof EntryPreview
     */
    key?: ObjectPreview;
    /**
     * Preview of the value.
     *
     * @type {ObjectPreview}
     * @memberof EntryPreview
     */
    value: ObjectPreview;
}
