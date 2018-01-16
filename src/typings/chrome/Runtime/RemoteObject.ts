'use strict';

import CustomPreview from './CustomPreview';
import ObjectPreview from './ObjectPreview';
import { RemoteObjectId } from './RemoteObjectId';
import { UnserializableValue } from './UnserializableValue';

/**
 * Mirror object referencing original JavaScript object.
 *
 * @export
 * @interface RemoteObject
 */
export default interface RemoteObject {
  /**
   * Object type.
   *
   * @type {('object' | 'function' | 'undefined' | 'string' | 'number' | 'boolean' | 'symbol')}
   * @memberof RemoteObject
   */
  type: 'object' | 'function' | 'undefined' | 'string' | 'number' | 'boolean' | 'symbol';

  /**
   * Object subtype hint. Specified for object type values only.
   *
   * @type {('array' | 'null' | 'node' | 'regexp' |'date' | 'map' | 'set' | 'weakmap' | 'weakset' | 'iterator' | 'generator' | 'error' | 'proxy' | 'promise' | 'typedarray')}
   * @memberof RemoteObject
   */
  subtype?: 'array' | 'null' | 'node' | 'regexp' |'date' | 'map' | 'set' | 'weakmap' | 'weakset' | 'iterator' | 'generator' | 'error' | 'proxy' | 'promise' | 'typedarray';

  /**
   * Object class (constructor) name. Specified for object type values only.
   *
   * @type {string}
   * @memberof RemoteObject
   */
  className?: string;

  /**
   * Remote object value in case of primitive values or JSON values (if it was requested).
   *
   * @type {*}
   * @memberof RemoteObject
   */
  value?: any;

  /**
   * Primitive value which can not be JSON-stringified does not have value, but gets this property.
   *
   * @type {UnserializableValue}
   * @memberof RemoteObject
   */
  unserializableValue?: UnserializableValue;

  /**
   * String representation of the object.
   *
   * @type {string}
   * @memberof RemoteObject
   */
  description?: string;

  /**
   * Unique object identifier (for non-primitive values).
   *
   * @type {RemoteObjectId}
   * @memberof RemoteObject
   */
  objectId?: RemoteObjectId;

  /**
   * Preview containing abbreviated property values. Specified for object type values only.
   *
   * @type {ObjectPreview}
   * @memberof RemoteObject
   */
  preview?: ObjectPreview;

  /**
   * @type {CustomPreview}
   * @memberof RemoteObject
   */
  customPreview?: CustomPreview;
}
