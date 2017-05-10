'use strict';

import * as fs from 'fs';
import { Readable, Stream } from 'stream';

/**
 * Allows exporting of PDF data to multiple formats.
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
   * Base64-encoded PDF data.
   *
   * @private
   * @type {string}
   * @memberof CreateResult
   */
  private data: string;

  /**
   * Creates an instance of CreateResult.
   * @param {string} data base64 PDF data
   *
   * @memberof CreateResult
   */
  public constructor(data: string) {
    this.data = data;
  }

  /**
   * Get the base64 PDF data.
   *
   * @returns {string} base64 PDF data.
   *
   * @memberof CreateResult
   */
  public toBase64(): string {
    return this.data;
  }

  /**
   * Get a Buffer of the PDF data.
   *
   * @returns {Buffer} PDF data.
   *
   * @memberof CreateResult
   */
  public toBuffer(): Buffer {
    return Buffer.from(this.data, 'base64');
  }

  /**
   * Get a Stream of the PDF data.
   *
   * @returns {Stream} Stream of PDF data.
   *
   * @memberof CreateResult
   */
  public toStream(): Stream {
    const stream = new Readable();
    stream.push(this.data, 'base64');
    stream.push(null);
    return stream;
  }

  /**
   * Saves the PDF to a file.
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
