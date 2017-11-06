'use strict';

// tslint:disable:no-unused-expression

import * as chai from 'chai';
import * as chromeLauncher from 'chrome-launcher';
import * as fs from 'fs';
import * as mockFs from 'mock-fs';
import * as path from 'path';
import * as PDFParser from 'pdf2json';
import * as sinon from 'sinon';
import { Readable } from 'stream';
import * as tcpPortUsed from 'tcp-port-used';

import * as HtmlPdf from '../src';
import { Runtime } from '../src/typings/chrome';

// tslint:disable:no-var-requires
chai.use(require('chai-string'));
chai.use(require('sinon-chai'));
// tslint:enable:no-var-requires
const expect = chai.expect;

describe('HtmlPdf', () => {

  describe('create', () => {
    let port: number;
    let chrome: chromeLauncher.LaunchedChrome;

    before(async () => {
      try {
        // Start Chrome and wait for it to start listening for connections.
        chrome = await chromeLauncher.launch({
          chromeFlags: [
            '--disable-gpu',
            '--headless',
          ],
        });
        port = chrome.port;
        await tcpPortUsed.waitUntilUsed(port);
      } catch (err) {
        await chrome.kill();
        throw err;
      }
    });

    after(async () => {
      await chrome.kill();
    });

    it('should spawn Chrome and generate a PDF', async () => {
      const result = await HtmlPdf.create('<p>hello!</p>');
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
    });

    it('should handle a Chrome launch failure', async () => {
      let launchStub: sinon.SinonStub;
      const error = new Error('failed!');
      try {
        launchStub = sinon.stub(chromeLauncher, 'launch').callsFake(() => Promise.reject(error));
        await HtmlPdf.create('<p>hello!</p>');
        expect.fail();
      } catch (err) {
        expect(err).to.equal(error);
      } finally {
        launchStub.restore();
      }
    });

    it('should use running Chrome to generate a PDF (specify port)', async () => {
      const launchStub = sinon.stub(chromeLauncher, 'launch');
      try {
        const result = await HtmlPdf.create('<p>hello!</p>', {port});
        expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
        expect(launchStub).to.not.have.been.called;
        const pdf = await getParsedPdf(result.toBuffer());
        expect(pdf.getRawTextContent()).to.startWith('hello!');
      } finally {
        launchStub.restore();
      }
    });

    it('should use running Chrome to generate a PDF (specify host and port)', async () => {
      const launchStub = sinon.stub(chromeLauncher, 'launch');
      try {
        const result = await HtmlPdf.create('<p>hello!</p>', {host: 'localhost', port});
        expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
        expect(launchStub).to.not.have.been.called;
        const pdf = await getParsedPdf(result.toBuffer());
        expect(pdf.getRawTextContent()).to.startWith('hello!');
      } finally {
        launchStub.restore();
      }
    });

    it('should generate a PDF with Chrome options', async () => {
      const options: HtmlPdf.CreateOptions = {
        port,
        clearCache: true,
        printOptions: {
          landscape: true,
          displayHeaderFooter: true,
        },
      };
      const result = await HtmlPdf.create('<p>hello!</p>', options);
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
    });

    it('should generate a PDF with cookies', async () => {
      const options: HtmlPdf.CreateOptions = {
        port,
        cookies: [
          {
            name: 'status',
            value: 'Passed!',
            domain: 'westy92.github.io',
          },
        ],
      };
      const result = await HtmlPdf.create('https://westy92.github.io/html-pdf-chrome/test/cookie.html', options);
      const pdf = await getParsedPdf(result.toBuffer());
      expect(pdf.getRawTextContent()).to.startWith('Cookies:status=Passed!');
    });

    it('should proxy console messages', async () => {
      const events: Runtime.ChromeConsoleApiMessage[] = [];
      const options: HtmlPdf.CreateOptions = {
        port,
        runtimeConsoleHandler: (event: Runtime.ChromeConsoleApiMessage) => events.push(event),
      };
      const html = `
        <html>
          <body>
            <script>
              console.log('a');
              console.warn({b: 5});
            </script>
          </body>
        </html>
      `;
      const result = await HtmlPdf.create(html, options);
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
      expect(events.length).to.equal(2);
      expect(events[0]).to.have.property('type', 'log');
      expect(events[0]).to.have.deep.property('args', [ { type: 'string', value: 'a' } ]);
      expect(events[1]).to.have.property('type', 'warning');
    });

    it('should proxy unhandled exceptions', async () => {
      const now = Date.now();
      let caughtException: Runtime.ChromeRuntimeException;
      const options: HtmlPdf.CreateOptions = {
        port,
        runtimeExceptionHandler: (event: Runtime.ChromeRuntimeException) => { caughtException = event; },
      };
      const html = `
        <html>
          <body>
            <script>
              throw new Error('Oh no!');
            </script>
          </body>
        </html>
      `;
      const result = await HtmlPdf.create(html, options);
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
      expect(caughtException).to.not.be.undefined;
      expect(caughtException.timestamp).to.be.greaterThan(now);
    });

    it('should timeout', async () => {
      const options: HtmlPdf.CreateOptions = {
        port,
        timeout: 0,
      };
      try {
        await HtmlPdf.create('<p>hello!</p>', options);
        expect.fail();
      } catch (err) {
        expect(err.message).to.equal('HtmlPdf.create() timed out.');
      }
    });

    it('should generate a PDF with external JavaScript', async () => {
      const html = `
        <html>
          <head>
            <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"></script>
          </head>
          <body>
            <div id="test">Failed!</div>
            <script>
              $('#test').text('Passed!');
            </script>
          </body>
        </html>
      `;
      const result = await HtmlPdf.create(html, {port});
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
      const pdf = await getParsedPdf(result.toBuffer());
      expect(pdf.getRawTextContent()).to.startWith('Passed!');
    });

    it('should generate a PDF with external CSS', async () => {
      // #test:before{content:'Passed!';}
      const html = `
        <html>
          <head>
            <link rel="stylesheet" href="data:text/css;charset=utf-8;base64,I3Rlc3Q6YmVmb3Jle2NvbnRlbnQ6J1Bhc3NlZCEnO30=">
          </head>
          <body>
            <div id="test"></div>
          </body>
        </html>
      `;
      const result = await HtmlPdf.create(html, {port});
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
      const pdf = await getParsedPdf(result.toBuffer());
      expect(pdf.getRawTextContent()).to.startWith('Passed!');
    });

    it('should generate a PDF with multiple pages', async () => {
      const html = `
        <html>
          <body>
            <div style="page-break-after:always">Page 1</div>
            <div>Page 2</div>
          </body>
        </html>
      `;
      const result = await HtmlPdf.create(html, {port});
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
      const pdf = await getParsedPdf(result.toBuffer());
      expect(pdf.getRawTextContent()).to.contain('Page (0) Break').and.to.contain('Page (1) Break');
    });

    it('should generate a PDF from a local file', async () => {
      const filePath = path.join('file://', __dirname, '../../test/test.html');
      const result = await HtmlPdf.create(filePath, {port});
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
      const pdf = await getParsedPdf(result.toBuffer());
      expect(pdf.getRawTextContent()).to.startWith('Passed!');
    });

    it('should generate a PDF from an external site', async () => {
      const result = await HtmlPdf.create('https://m.facebook.com/', {port});
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
      const pdf = await getParsedPdf(result.toBuffer());
      expect(pdf.getRawTextContent()).to.contain('Facebook');
    });

    describe('CompletionTrigger', () => {

      const timeoutErrorMessage = 'CompletionTrigger timed out.';

      describe('Timer', () => {

        const html = `
          <html>
            <body>
              <div id="test">Failed!</div>
              <script>
                setTimeout(() => {
                  document.getElementById('test').innerHTML = 'Passed!';
                }, 200);
              </script>
            </body>
          </html>
        `;

        it('should generate prematurely without a CompletionTrigger', async () => {
          const result = await HtmlPdf.create(html, {port});
          expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
          const pdf = await getParsedPdf(result.toBuffer());
          expect(pdf.getRawTextContent()).startsWith('Failed!');
        });

        it('should generate correctly after being triggered', async () => {
          const options: HtmlPdf.CreateOptions = {
            port,
            completionTrigger: new HtmlPdf.CompletionTrigger.Timer(300),
          };
          const result = await HtmlPdf.create(html, options);
          expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
          const pdf = await getParsedPdf(result.toBuffer());
          expect(pdf.getRawTextContent()).startsWith('Passed!');
        });

      });

      describe('Event', () => {

        const html = `
          <html>
            <body>
              <div id="test">Failed!</div>
              <script>
                setTimeout(() => {
                  document.getElementById('test').innerHTML = 'Passed!';
                  document.body.dispatchEvent(new Event('myEvent'));
                }, 100);
              </script>
            </body>
          </html>
        `;

        it('should generate prematurely without a CompletionTrigger', async () => {
          const result = await HtmlPdf.create(html, {port});
          expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
          const pdf = await getParsedPdf(result.toBuffer());
          expect(pdf.getRawTextContent()).startsWith('Failed!');
        });

        it('should time out', async () => {
          const options: HtmlPdf.CreateOptions = {
            port,
            completionTrigger: new HtmlPdf.CompletionTrigger.Event('myEvent', null, 1),
          };
          try {
            await HtmlPdf.create(html, options);
            expect.fail();
          } catch (err) {
            expect(err.message).to.equal(timeoutErrorMessage);
          }
        });

        it('should time out from listening to the wrong event', async () => {
          const options: HtmlPdf.CreateOptions = {
            port,
            completionTrigger: new HtmlPdf.CompletionTrigger.Event('myEvent', '#test', 200),
          };
          try {
            await HtmlPdf.create(html, options);
            expect.fail();
          } catch (err) {
            expect(err.message).to.equal(timeoutErrorMessage);
          }
        });

        it('should generate correctly after being triggered', async () => {
          const options: HtmlPdf.CreateOptions = {
            port,
            completionTrigger: new HtmlPdf.CompletionTrigger.Event('myEvent'),
          };
          const result = await HtmlPdf.create(html, options);
          expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
          const pdf = await getParsedPdf(result.toBuffer());
          expect(pdf.getRawTextContent()).startsWith('Passed!');
        });

      });

      describe('Callback', () => {

        const html = `
          <html>
            <body>
              <div id="test">Failed!</div>
              <script>
                setTimeout(() => {
                  document.getElementById('test').innerHTML = 'Timeout!';
                  if (window.htmlPdfCb) {
                    document.getElementById('test').innerHTML = 'Callback!';
                    htmlPdfCb();
                  }
                }, 100);
              </script>
            </body>
          </html>
        `;

        it('should generate prematurely without a CompletionTrigger', async () => {
          const result = await HtmlPdf.create(html, {port});
          expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
          const pdf = await getParsedPdf(result.toBuffer());
          expect(pdf.getRawTextContent()).startsWith('Failed!');
        });

        it('should time out', async () => {
          const options: HtmlPdf.CreateOptions = {
            port,
            completionTrigger: new HtmlPdf.CompletionTrigger.Callback(null, 1),
          };
          try {
            await HtmlPdf.create(html, options);
            expect.fail();
          } catch (err) {
            expect(err.message).to.equal(timeoutErrorMessage);
          }
        });

        it('should time out from listening to the wrong callback', async () => {
          const options: HtmlPdf.CreateOptions = {
            port,
            completionTrigger: new HtmlPdf.CompletionTrigger.Callback('wrongCb', 200),
          };
          try {
            await HtmlPdf.create(html, options);
            expect.fail();
          } catch (err) {
            expect(err.message).to.equal(timeoutErrorMessage);
          }
        });

        it('should generate correctly after being triggered', async () => {
          const options: HtmlPdf.CreateOptions = {
            port,
            completionTrigger: new HtmlPdf.CompletionTrigger.Callback(),
          };
          const result = await HtmlPdf.create(html, options);
          expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
          const pdf = await getParsedPdf(result.toBuffer());
          expect(pdf.getRawTextContent()).startsWith('Callback!');
        });

      });

      describe('Element', () => {

        const html = `
          <html>
            <body>
              <div id="test">Failed!</div>
              <script>
                setTimeout(() => {
                  const inserted = document.createElement('div');
                  inserted.id = 'inserted';
                  inserted.innerText = 'Passed!';
                  document.body.insertBefore(inserted, document.getElementById('test'));
                }, 100);
              </script>
            </body>
          </html>
        `;

        it('should generate prematurely without a CompletionTrigger', async () => {
          const result = await HtmlPdf.create(html, {port});
          expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
          const pdf = await getParsedPdf(result.toBuffer());
          expect(pdf.getRawTextContent()).startsWith('Failed!');
        });

        it('should time out', async () => {
          const options: HtmlPdf.CreateOptions = {
            port,
            completionTrigger: new HtmlPdf.CompletionTrigger.Element('div#inserted', 1),
          };
          try {
            await HtmlPdf.create(html, options);
            expect.fail();
          } catch (err) {
            expect(err.message).to.equal(timeoutErrorMessage);
          }
        });

        it('should time out from listening for the wrong element', async () => {
          const options: HtmlPdf.CreateOptions = {
            port,
            completionTrigger: new HtmlPdf.CompletionTrigger.Element('div#derp', 200),
          };
          try {
            await HtmlPdf.create(html, options);
            expect.fail();
          } catch (err) {
            expect(err.message).to.equal(timeoutErrorMessage);
          }
        });

        it('should generate correctly after being triggered', async () => {
          const options: HtmlPdf.CreateOptions = {
            port,
            completionTrigger: new HtmlPdf.CompletionTrigger.Element('div#inserted'),
          };
          const result = await HtmlPdf.create(html, options);
          expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
          const pdf = await getParsedPdf(result.toBuffer());
          expect(pdf.getRawTextContent()).startsWith('Passed!');
        });

      });

      describe('Variable', () => {

        const html = `
          <html>
            <body>
              <div id="test">Failed!</div>
              <script>
                setTimeout(() => {
                  document.getElementById('test').innerHTML = 'Variable!';
                  htmlPdfDone = true;
                }, 100);
              </script>
            </body>
          </html>
        `;

        it('should generate prematurely without a CompletionTrigger', async () => {
          const result = await HtmlPdf.create(html, {port});
          expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
          const pdf = await getParsedPdf(result.toBuffer());
          expect(pdf.getRawTextContent()).startsWith('Failed!');
        });

        it('should time out', async () => {
          const options: HtmlPdf.CreateOptions = {
            port,
            completionTrigger: new HtmlPdf.CompletionTrigger.Variable(null, 1),
          };
          try {
            await HtmlPdf.create(html, options);
            expect.fail();
          } catch (err) {
            expect(err.message).to.equal(timeoutErrorMessage);
          }
        });

        it('should time out from listening to the wrong variable', async () => {
          const options: HtmlPdf.CreateOptions = {
            port,
            completionTrigger: new HtmlPdf.CompletionTrigger.Variable('wrongVar', 200),
          };
          try {
            await HtmlPdf.create(html, options);
            expect.fail();
          } catch (err) {
            expect(err.message).to.equal(timeoutErrorMessage);
          }
        });

        it('should generate correctly after being triggered', async () => {
          const options: HtmlPdf.CreateOptions = {
            port,
            completionTrigger: new HtmlPdf.CompletionTrigger.Variable(),
          };
          const result = await HtmlPdf.create(html, options);
          expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
          const pdf = await getParsedPdf(result.toBuffer());
          expect(pdf.getRawTextContent()).startsWith('Variable!');
        });

      });

    });

  });

  describe('CreateResult', () => {

    describe('constructor', () => {
      it('should instanciate', () => {
        const result = new HtmlPdf.CreateResult('');
        expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
      });
    });

    describe('toBase64', () => {
      it('should output a base64 string', () => {
        const cr = new HtmlPdf.CreateResult('dGVzdA==');
        expect(cr.toBase64()).to.equal('dGVzdA==');
      });
    });

    describe('toBuffer', () => {
      it('should output a Buffer', () => {
        const cr = new HtmlPdf.CreateResult('dGVzdA==');
        expect(cr.toBuffer()).to.deep.equal(Buffer.from('test'));
      });
    });

    describe('toStream', () => {
      it('should output a Readable Stream', () => {
        const cr = new HtmlPdf.CreateResult('dGVzdA==');
        const stream = cr.toStream();
        expect(stream).to.be.an.instanceOf(Readable);
      });

      it('should output a valid Stream', (done) => {
        const cr = new HtmlPdf.CreateResult('dGVzdA==');
        const stream = cr.toStream();
        let bytes = new Buffer('');
        stream.on('data', (chunk) => {
          bytes = Buffer.concat([bytes, chunk]);
        });
        stream.on('end', () => {
          try {
            expect(bytes).to.deep.equal(cr.toBuffer());
            done();
          } catch (err) {
            done(err);
          }
        });
      });
    });

    describe('toFile', () => {
      it('should output a file', async () => {
        try {
          mockFs({
            myDir: {},
          });
          const cr = new HtmlPdf.CreateResult('dGVzdA==');
          const filePath = 'myDir/file.pdf';
          await cr.toFile(filePath);
          const stats = fs.statSync(filePath);
          expect(stats.isFile()).to.be.true;
          expect(stats.isDirectory()).to.be.false;
          expect(stats.size).to.be.greaterThan(0);
        } finally {
          mockFs.restore();
        }
      });

      it('should fail output to a nonexistent directory', async () => {
        try {
          mockFs();
          const cr = new HtmlPdf.CreateResult('dGVzdA==');
          await cr.toFile('myDir/file.pdf');
          expect.fail();
        } catch (err) {
          expect(err.message).to.contain('no such file or directory');
        } finally {
          mockFs.restore();
        }
      });
    });

  });

});

async function getParsedPdf(buffer: Buffer): Promise<any> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);
    pdfParser.on('pdfParser_dataError', (err) => reject(err.parserError));
    pdfParser.on('pdfParser_dataReady', () => resolve(pdfParser));
    pdfParser.parseBuffer(buffer);
  });
}
