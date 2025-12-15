'use strict';

// https://stackoverflow.com/a/41429145/453314

/**
 * An Error signifying that the connection to Chrome was lost.
 *
 * @export
 */
export class ConnectionLostError extends Error {
  constructor() {
    super('HtmlPdf.create() connection lost.');
    Object.setPrototypeOf(this, ConnectionLostError.prototype);
  }
}
