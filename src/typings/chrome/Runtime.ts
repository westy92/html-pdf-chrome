'use strict';

/**
 * Issued when exception was thrown and unhandled.
 *
 * @export
 * @interface ChromeRuntimeException
 */
export interface ChromeRuntimeException {
  /**
   * Timestamp of the exception.
   *
   * @type {Timestamp}
   * @memberof ChromeRuntimeException
   */
  timestamp: Timestamp;

  /**
   * @type {ExceptionDetails}
   * @memberof ChromeRuntimeException
   */
  exceptionDetails: ExceptionDetails;
}

/**
 * Detailed information about exception (or error) that was thrown during script compilation or execution.
 *
 * @export
 * @interface ExceptionDetails
 */
export interface ExceptionDetails {
  /**
   * Exception id.
   *
   * @type {number}
   * @memberof ExceptionDetails
   */
  exceptionId: number;

  /**
   * Exception text, which should be used together with exception object when available.
   *
   * @type {string}
   * @memberof ExceptionDetails
   */
  text: string;

  /**
   * Line number of the exception location (0-based).
   *
   * @type {number}
   * @memberof ExceptionDetails
   */
  lineNumber: number;

  /**
   * Column number of the exception location (0-based).
   *
   * @type {number}
   * @memberof ExceptionDetails
   */
  columnNumber: number;

  /**
   * Script ID of the exception location.
   *
   * @type {ScriptId}
   * @memberof ExceptionDetails
   */
  scriptId?: ScriptId;

  /**
   * URL of the exception location, to be used when the script was not reported.
   *
   * @type {string}
   * @memberof ExceptionDetails
   */
  url?: string;

  /**
   * JavaScript stack trace if available.
   *
   * @type {StackTrace}
   * @memberof ExceptionDetails
   */
  stackTrace?: StackTrace;

  /**
   * Exception object if available.
   *
   * @type {RemoteObject}
   * @memberof ExceptionDetails
   */
  exception?: RemoteObject;

  /**
   * Identifier of the context where exception happened.
   *
   * @type {ExecutionContextId}
   * @memberof ExceptionDetails
   */
  executionContextId?: ExecutionContextId;
}

/**
 * Id of an execution context.
 *
 * @export
 */
export type ExecutionContextId = number;

/**
 * Call frames for assertions or error messages.
 *
 * @export
 * @interface StackTrace
 */
export interface StackTrace {
  /**
   * String label of this stack trace. For async traces this may
   * be a name of the function that initiated the async call.
   *
   * @type {string}
   * @memberof StackTrace
   */
  description?: string;

  /**
   * JavaScript function name.
   *
   * @type {CallFrame[]}
   * @memberof StackTrace
   */
  callFrames: CallFrame[];

  /**
   * Asynchronous JavaScript stack trace that preceded this stack, if available.
   *
   * @type {StackTrace}
   * @memberof StackTrace
   */
  parent?: StackTrace;

  /**
   * Creation frame of the Promise which produced the next synchronous trace when resolved, if available.
   *
   * @type {CallFrame}
   * @memberof StackTrace
   */
  promiseCreationFrame?: CallFrame;
}

/**
 * Stack entry for runtime errors and assertions.
 *
 * @export
 * @interface CallFrame
 */
export interface CallFrame {
  /**
   * JavaScript function name.
   *
   * @type {string}
   * @memberof CallFrame
   */
  functionName: string;

  /**
   * JavaScript script id.
   *
   * @type {ScriptId}
   * @memberof CallFrame
   */
  scriptId: ScriptId;

  /**
   * JavaScript script name or url.
   *
   * @type {string}
   * @memberof CallFrame
   */
  url: string;

  /**
   * JavaScript script line number (0-based).
   *
   * @type {integer}
   * @memberof CallFrame
   */
  lineNumber: number;

  /**
   * JavaScript script column number (0-based).
   *
   * @type {integer}
   * @memberof CallFrame
   */
  columnNumber: number;
}

export interface RemoteObject {
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

/**
 * @export
 * @interface CustomPreview
 */
export interface CustomPreview {
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

/**
 * Object containing abbreviated remote object value.
 *
 * @export
 * @interface ObjectPreview
 */
export interface ObjectPreview {
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
  subtype?: 'array' | 'null' | 'node' | 'regexp' |'date' | 'map' | 'set' | 'weakmap' | 'weakset' | 'iterator' | 'generator' | 'error';

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

/**
 * @export
 * @interface EntryPreview
 */
export interface EntryPreview {
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

/**
 * @export
 * @interface PropertyPreview
 */
export interface PropertyPreview {
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
  subtype?: 'array' | 'null' | 'node' | 'regexp' |'date' | 'map' | 'set' | 'weakmap' | 'weakset' | 'iterator' | 'generator' | 'error';
}

/**
 * Unique script identifier.
 *
 * @export
 */
export type ScriptId = string;

/**
 * Number of milliseconds since epoch.
 *
 * @export
 */
export type Timestamp = number;

/**
 * Primitive value which cannot be JSON-stringified.
 *
 * @export
 */
export type UnserializableValue = 'Infinity' | 'NaN' | '-Infinity' | '-0';

/**
 * Unique object identifier.
 *
 * @export
 */
export type RemoteObjectId = string;

/**
 * Issued when console API was called.
 *
 * @export
 * @interface ChromeConsoleApiMessage
 */
export interface ChromeConsoleApiMessage {

  /**
   * Type of the call.
   *
   * @type {('log' | 'debug' | 'info' | 'error' | 'warning' | 'dir' | 'dirxml' | 'table' | 'trace' | 'clear' | 'startGroup' | 'startGroupCollapsed' | 'endGroup' | 'assert' | 'profile' | 'profileEnd' | 'count' | 'timeEnd')}
   * @memberof ChromeConsoleApiMessage
   */
  type: 'log' | 'debug' | 'info' | 'error' | 'warning' | 'dir' | 'dirxml' | 'table' | 'trace' | 'clear' | 'startGroup' | 'startGroupCollapsed' | 'endGroup' | 'assert' | 'profile' | 'profileEnd' | 'count' | 'timeEnd';

  /**
   * Call arguments.
   *
   * @type {RemoteObject[]}
   * @memberof ChromeConsoleApiMessage
   */
  args: RemoteObject[];

  /**
   * Identifier of the context where the call was made.
   *
   * @type {ExecutionContextId}
   * @memberof ChromeConsoleApiMessage
   */
  executionContextId: ExecutionContextId;

  /**
   * Call timestamp.
   *
   * @type {Timestamp}
   * @memberof ChromeConsoleApiMessage
   */
  timestamp: Timestamp;

  /**
   * Stack trace captured when the call was made.
   *
   * @type {StackTrace}
   * @memberof ChromeConsoleApiMessage
   */
  stackTrace?: StackTrace;

  /**
   * Console context descriptor for calls on non-default console context (not console.*):
   * 'anonymous#unique-logger-id' for call on unnamed context,
   * 'name#unique-logger-id' for call on named context.
   *
   * @type {string}
   * @memberof ChromeConsoleApiMessage
   */
  context?: string;
}

/**
 * Call frames for assertions or error messages.
 *
 * @export
 * @interface StackTrace
 */
export interface StackTrace {
  /**
   * String label of this stack trace. For async traces this may
   * be a name of the function that initiated the async call.
   *
   * @type {string}
   * @memberof StackTrace
   */
  description?: string;

  /**
   * JavaScript function name.
   *
   * @type {CallFrame[]}
   * @memberof StackTrace
   */
  callFrames: CallFrame[];

  /**
   * Asynchronous JavaScript stack trace that preceded this stack, if available.
   *
   * @type {StackTrace}
   * @memberof StackTrace
   */
  parent?: StackTrace;

  /**
   * Creation frame of the Promise which produced the next synchronous trace when resolved, if available.
   *
   * @type {CallFrame}
   * @memberof StackTrace
   */
  promiseCreationFrame?: CallFrame;
}

/**
 * Stack entry for runtime errors and assertions.
 *
 * @export
 * @interface CallFrame
 */
export interface CallFrame {
  /**
   * JavaScript function name.
   *
   * @type {string}
   * @memberof CallFrame
   */
  functionName: string;

  /**
   * JavaScript script id.
   *
   * @type {ScriptId}
   * @memberof CallFrame
   */
  scriptId: ScriptId;

  /**
   * JavaScript script name or url.
   *
   * @type {string}
   * @memberof CallFrame
   */
  url: string;

  /**
   * JavaScript script line number (0-based).
   *
   * @type {integer}
   * @memberof CallFrame
   */
  lineNumber: number;

  /**
   * JavaScript script column number (0-based).
   *
   * @type {integer}
   * @memberof CallFrame
   */
  columnNumber: number;
}

export interface RemoteObject {
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

/**
 * @export
 * @interface CustomPreview
 */
export interface CustomPreview {
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

/**
 * Object containing abbreviated remote object value.
 *
 * @export
 * @interface ObjectPreview
 */
export interface ObjectPreview {
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
  subtype?: 'array' | 'null' | 'node' | 'regexp' |'date' | 'map' | 'set' | 'weakmap' | 'weakset' | 'iterator' | 'generator' | 'error';

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

/**
 * @export
 * @interface EntryPreview
 */
export interface EntryPreview {
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

/**
 * @export
 * @interface PropertyPreview
 */
export interface PropertyPreview {
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
  subtype?: 'array' | 'null' | 'node' | 'regexp' |'date' | 'map' | 'set' | 'weakmap' | 'weakset' | 'iterator' | 'generator' | 'error';
}
