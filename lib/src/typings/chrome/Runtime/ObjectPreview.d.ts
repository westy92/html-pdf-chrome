import EntryPreview from './EntryPreview';
import PropertyPreview from './PropertyPreview';
/**
 * Object containing abbreviated remote object value.
 *
 * @export
 * @interface ObjectPreview
 */
export default interface ObjectPreview {
    /**
     * Object type.
     *
     * @type {('object' | 'function' | 'undefined' | 'string' | 'number' | 'boolean' | 'symbol')}
     * @memberof ObjectPreview
     */
    type: 'object' | 'function' | 'undefined' | 'string' | 'number' | 'boolean' | 'symbol';
    /**
     * Object subtype hint. Specified for object type values only.
     *
     * @type {('array' | 'null' | 'node' | 'regexp' |'date' | 'map' | 'set' | 'weakmap' | 'weakset' | 'iterator' | 'generator' | 'error')}
     * @memberof ObjectPreview
     */
    subtype?: 'array' | 'null' | 'node' | 'regexp' | 'date' | 'map' | 'set' | 'weakmap' | 'weakset' | 'iterator' | 'generator' | 'error';
    /**
     * String representation of the object.
     *
     * @type {string}
     * @memberof ObjectPreview
     */
    description?: string;
    /**
     * True iff some of the properties or entries of the original object did not fit.
     *
     * @type {boolean}
     * @memberof ObjectPreview
     */
    overflow: boolean;
    /**
     * List of the properties.
     *
     * @type {PropertyPreview[]}
     * @memberof ObjectPreview
     */
    properties: PropertyPreview[];
    /**
     * List of the entries. Specified for map and set subtype values only.
     *
     * @type {EntryPreview[]}
     * @memberof ObjectPreview
     */
    entries?: EntryPreview[];
}
