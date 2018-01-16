'use strict';

/**
 * Primitive value which cannot be JSON-stringified.
 *
 * @export
 */
export type UnserializableValue = 'Infinity' | 'NaN' | '-Infinity' | '-0';
