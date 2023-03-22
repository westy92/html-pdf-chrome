'use strict';

import Protocol from 'devtools-protocol';
import * as fs from 'fs';
import { Readable } from 'stream';

/**
 * Allows exporting of PDF or image data to multiple formats.
 *
 * @export
 * @class CreateResult
 */
export class CreateResult {

  /**
   * Writes the given data Buffer to the specified file location.
   *
   * @private
   * @static
   * @param {string} filename the file name to write to.
   * @param {Buffer} data the data to write.
   * @returns {Promise<void>}
   *
   * @memberof CreateResult
   */
  private static async writeFile(filename: string, data: Buffer): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(filename, data, (err) => {
        err ? reject(err) : resolve();
      });
    });
  }

  /**
   * Base64-encoded data.
   *
   * @private
   * @type {string}
   * @memberof CreateResult
   */
  private data: string;

  /**
   * The main page network response, if any.
   */
   readonly response?: Protocol.Network.Response;

  /**
   * Creates an instance of CreateResult.
   * @param {string} data base64 data
   * @param {Protocol.Network.Response} response the main page network response, if any.
   *
   * @memberof CreateResult
   */
  public constructor(data: string, response?: Protocol.Network.Response) {
    this.data = data;
    this.response = response;
  }

  /**
   * Get the base64 data.
   *
   * @returns {string} base64 data.
   *
   * @memberof CreateResult
   */
  public toBase64(): string {
    return this.data;
  }

  /**
   * Get a Buffer of the data.
   *
   * @returns {Buffer} data.
   *
   * @memberof CreateResult
   */
  public toBuffer(): Buffer {
    return Buffer.from(this.data, 'base64');
  }

  /**
   * Get a Stream (Readable) of the data.
   *
   * @returns {Readable} Stream of data.
   *
   * @memberof CreateResult
   */
  public toStream(): Readable {
    const stream = new Readable();
    stream.push(this.data, 'base64');
    stream.push(null);
    return stream;
  }

  /**
   * Saves the result to a file.
   *
   * @param {string} filename the filename.
   * @returns {Promise<void>} resolves upon successful create.
   *
   * @memberof CreateResult
   */
  public async toFile(filename: string): Promise<void> {
    await CreateResult.writeFile(filename, this.toBuffer());
  }

}
