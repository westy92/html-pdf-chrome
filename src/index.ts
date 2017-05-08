'use strict';

import * as CDP from 'chrome-remote-interface';
import * as fs from 'fs';
import { ChromeLauncher } from 'lighthouse/lighthouse-cli/chrome-launcher';
import { getRandomPort } from 'lighthouse/lighthouse-cli/random-port';
import { Readable, Stream } from 'stream';

export interface Options {
  port?: number;
}

export async function create(html: string, options?: Options): Promise<CreateResult> {
  const myOptions = Object.assign({}, options);
  myOptions.port = myOptions.port || await getRandomPort();
  const chrome = await launchChrome(myOptions.port);
  return new Promise<CreateResult>((resolve, reject) => {
    CDP(myOptions, async (client) => {
      try {
        const {Page} = client;
        await Page.enable(); // Enable Page events
        await Page.navigate({url: `data:text/html,${html}`});
        await Page.loadEventFired();
        // https://chromedevtools.github.io/debugger-protocol-viewer/tot/Page/#method-printToPDF
        const pdf = await Page.printToPDF();
        return resolve(new CreateResult(pdf.data));
      } catch (err) {
        reject(err);
      } finally {
        client.close();
      }
    }).on('error', (err) => {
      reject(err);
    });
  }).then(async (createResult) => {
    if (chrome) {
      await chrome.kill();
    }
    return createResult;
  }).catch(async (err) => {
    if (chrome) {
      await chrome.kill();
    }
    return Promise.reject(err);
  });
}

async function launchChrome(port: number) {
  const launcher = new ChromeLauncher({
    port,
    autoSelectChrome: true,
    additionalFlags: [
      '--disable-gpu',
      '--headless',
    ],
  });
  try {
    await launcher.run();
    return launcher;
  } catch (err) {
    await launcher.kill();
  }
}

export class CreateResult {

  private static async writeFile(filename: string, data: Buffer) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filename, data, (err) => {
        err ? reject(err) : resolve();
      });
    });
  }

  /**
   * Base64-encoded PDF data.
   */
  private data: string;

  public constructor(data: string) {
    this.data = data;
  }

  public toBase64(): string {
    return this.data;
  }

  public toBuffer(): Buffer {
    return Buffer.from(this.data, 'base64');
  }

  public toStream(): Stream {
    const stream = new Readable();
    stream.push(this.data);
    stream.push(null);
    return stream;
  }

  public async toFile(filename: string): Promise<void> {
    await CreateResult.writeFile(filename, this.toBuffer());
  }

}
