import ObjectPreview from './ObjectPreview';
/**
 * @export
 * @interface PropertyPreview
 */
export default interface PropertyPreview {
    /**
     * Property name.
     *
     * @type {string}
     * @memberof PropertyPreview
     */
    name: string;
    /**
     * Object type. Accessor means that the property itself is an accessor property.
     *
     * @type {Allowed}
     * @memberof PropertyPreview
     */
    type: 'object' | 'function' | 'undefined' | 'string' | 'number' | 'boolean' | 'symbol' | 'accessor';
    /**
     * User-friendly property value string.
     *
     * @type {string}
     * @memberof PropertyPreview
     */
    value?: string;
    /**
     * Nested value preview.
     *
     * @type {ObjectPreview}
     * @memberof PropertyPreview
     */
    valuePreview?: ObjectPreview;
    /**
     * Object subtype hint. Specified for object type values only.
     *
     * @type {('array' | 'null' | 'node' | 'regexp' |'date' | 'map' | 'set' | 'weakmap' | 'weakset' | 'iterator' | 'generator' | 'error')}
     * @memberof PropertyPreview
     */
    subtype?: 'array' | 'null' | 'node' | 'regexp' | 'date' | 'map' | 'set' | 'weakmap' | 'weakset' | 'iterator' | 'generator' | 'error';
}
