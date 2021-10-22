'use strict';

// tslint:disable:no-unused-expression

import 'source-map-support/register';

import * as chai from 'chai';
import * as chromeLauncher from 'chrome-launcher';
import * as Chrome from 'chrome-remote-interface/lib/chrome';
import { Protocol } from 'devtools-protocol';
import * as fs from 'fs';
import * as getPort from 'get-port';
import * as mockFs from 'mock-fs';
import * as path from 'path';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import { Readable } from 'stream';

import * as HtmlPdf from '../src';

/* eslint-disable @typescript-eslint/no-var-requires */
chai.use(require('chai-string'));
chai.use(require('sinon-chai'));
/* eslint-enable @typescript-eslint/no-var-requires */
const expect = chai.expect;

describe('HtmlPdf', () => {

  describe('create', () => {
    let port: number;
    let chrome: chromeLauncher.LaunchedChrome;

    before(async () => {
      // Start Chrome and wait for it to start listening for connections.
      chrome = await chromeLauncher.launch({
        chromeFlags: [
          '--disable-gpu',
          '--headless',
        ],
        // uncomment if using Chrome Beta
        // chromePath: '/usr/bin/google-chrome-beta',
        connectionPollInterval: 250,
        logLevel: 'error',
        maxConnectionRetries: 50,
      });
      port = chrome.port;
    });

    after(async () => {
      try {
        await chrome.kill();
      } catch (err) {
        // safe to ignore 
      }
    });

    it('should spawn Chrome and generate a PDF', async () => {
      const result = await HtmlPdf.create('<p>hello!</p>');
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
    });

    it('should not hang if connection to Chrome is lost', async () => {
      const launchStub = sinon.stub(Chrome.prototype, 'send').callsFake(function (method)  {
        // eslint-disable-next-line prefer-rest-params
        const result = Chrome.prototype.send.wrappedMethod.apply(this, arguments);
        if (method === 'Network.clearBrowserCache') {
          return myChrome.kill().then(() => result);
        } else {
          return result;
        }
      });

      const myChrome = await chromeLauncher.launch({
        chromeFlags: [
          '--disable-gpu',
          '--headless',
        ],
      });

      const options: HtmlPdf.CreateOptions = {
        port: myChrome.port,
        clearCache: true, // trigger chrome to die with method override
      };

      try {
        await HtmlPdf.create('<p>hello!</p>', options);
        expect.fail();
      } catch (err) {
        expect(err.message).to.equal('HtmlPdf.create() connection lost.');
      } finally {
        launchStub.restore();
      }
    });

    it('should handle a Chrome launch failure', async () => {
      const error = new Error('failed!');
      try {
        const mockedHtmlPdf = proxyquire('../src', {
          'chrome-launcher': {
            launch: sinon.stub().rejects(error)
          }
        });
        await mockedHtmlPdf.create('<p>hello!</p>');
        expect.fail();
      } catch (err) {
        expect(err).to.equal(error);
      }
    });

    it('should use running Chrome to generate a PDF (specify port)', async () => {
      const launchStub = sinon.stub();
      const mockedHtmlPdf = proxyquire('../src', {
        'chrome-launcher': {
          launch: launchStub,
        }
      });
      const result = await mockedHtmlPdf.create('<p>hello!</p>', {port});
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
      expect(launchStub).to.not.have.been.called;
      const pdf = await getParsedPdf(result.toBuffer());
      expect(pdf[0]).to.startWith('hello!');
    });

    it('should use running Chrome to generate a PDF (specify host and port)', async () => {
      const launchStub = sinon.stub();
      const mockedHtmlPdf = proxyquire('../src', {
        'chrome-launcher': {
          launch: launchStub,
        }
      });
      const result = await mockedHtmlPdf.create('<p>hello!</p>', {host: 'localhost', port});
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
      expect(launchStub).to.not.have.been.called;
      const pdf = await getParsedPdf(result.toBuffer());
      expect(pdf[0]).to.startWith('hello!');
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

    it('should generate without a response object if not using a path', async () => {
      const result = await HtmlPdf.create('<p>hello!</p>', { port });
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
      expect(result.response).to.be.undefined;
    });

    it('should generate with a response object if using a path', async () => {
      const url = 'https://www.google.com/';
      const result = await HtmlPdf.create(url, { port });
      expect(result.response.url).to.equal(url);
      expect(result.response.status).to.equal(200);
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
      expect(pdf[0]).to.startWith('Cookies:status=Passed!');
    });

    it('should generate a PDF and send extra HTTP headers', async () => {
      const options: HtmlPdf.CreateOptions = {
        port,
        extraHTTPHeaders: {
          'Authorization': 'Bearer',
          'X-Custom-Test-Header': 'Passed1!',
        },
      };

      const result = await HtmlPdf.create('https://httpbin.org/headers', options);
      const pdf = await getParsedPdf(result.toBuffer());

      expect(pdf[0]).to.contain('"Authorization": "Bearer"');
      expect(pdf[0]).to.contain('"X-Custom-Test-Header": "Passed1!"');
    });

    it('should proxy console messages', async () => {
      const events: Protocol.Runtime.ConsoleAPICalledEvent[] = [];
      const options: HtmlPdf.CreateOptions = {
        port,
        runtimeConsoleHandler: (event: Protocol.Runtime.ConsoleAPICalledEvent) => events.push(event),
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
      let caughtException: Protocol.Runtime.ExceptionThrownEvent;
      const options: HtmlPdf.CreateOptions = {
        port,
        runtimeExceptionHandler: (event: Protocol.Runtime.ExceptionThrownEvent) => { caughtException = event; },
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

    it('should fail to reach an invalid page', async () => {
      const options: HtmlPdf.CreateOptions = {
        port,
      };
      try {
        const freePort = await getPort();
        await HtmlPdf.create(`http://127.0.0.1:${freePort}`, options);
        expect.fail();
      } catch (err) {
        expect(err.message).to.equal('HtmlPdf.create() page navigate failed.');
      }
    });

    it('should generate a PDF with external JavaScript', async () => {
      const html = `
        <html>
          <head>
            <script src="https://code.jquery.com/jquery-3.6.0.slim.min.js"></script>
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
      expect(pdf[0]).to.startWith('Passed!');
    });

    it('should generate a PDF with external CSS', async () => {
      const css = "#test:before{content:'Passed!'}";
      const html = `
        <html>
          <head>
            <link rel="stylesheet" href="data:text/css;charset=utf-8;base64,${Buffer.from(css).toString('base64')}">
          </head>
          <body>
            <div id="test"></div>
          </body>
        </html>
      `;
      const result = await HtmlPdf.create(html, {port});
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
      const pdf = await getParsedPdf(result.toBuffer());
      expect(pdf[0]).to.startWith('Passed!');
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
      expect(pdf.length).to.equal(2);
      expect(pdf[0]).to.contain('Page 1');
      expect(pdf[1]).to.contain('Page 2');
    });

    it('should generate a PDF with custom headers and footers', async () => {
      const html = `
        <html>
          <head>
            <title>TITLE</title>
          </head>
          <body>
            <div style="page-break-after:always">P1</div>
            <div>P2</div>
          </body>
        </html>
      `;
      const result = await HtmlPdf.create(html, {
        port,
        printOptions: {
          displayHeaderFooter: true,
          headerTemplate: `
            <div class="text center" style="color:red;">
              Custom <b>header</b>!
              Page <span class="pageNumber"></span> of <span class="totalPages"></span>.
              Title: <span class="title"></span>.
            </div>
          `,
          footerTemplate: '<div class="text center" style="color:green">Custom <i>footer</i>!</div>',
        },
      });
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
      const pdf = await getParsedPdf(result.toBuffer());
      expect(pdf.length).to.equal(2);
      expect(pdf[0]).to.contain('Custom header!').and.to.contain('Custom footer!');
      expect(pdf[0]).to.contain('Title: TITLE.');
      expect(pdf[0]).to.contain('P1');
      expect(pdf[1]).to.contain('Custom header!').and.to.contain('Custom footer!');
      expect(pdf[1]).to.contain('Title: TITLE.');
      expect(pdf[1]).to.contain('P2');
    });

    it('should generate a PDF from a local file', async () => {
      const filePath = path.join('file://', __dirname, 'test.html');
      const result = await HtmlPdf.create(filePath, {port});
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
      const pdf = await getParsedPdf(result.toBuffer());
      expect(pdf[0]).to.startWith('Passed!');
    });

    it('should generate a PDF from an external site', async () => {
      const result = await HtmlPdf.create('https://m.facebook.com/', {port});
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
      const pdf = await getParsedPdf(result.toBuffer());
      expect(pdf[0]).to.contain('Facebook');
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
          expect(pdf[0]).startsWith('Failed!');
        });

        it('should generate correctly after being triggered', async () => {
          const options: HtmlPdf.CreateOptions = {
            port,
            completionTrigger: new HtmlPdf.CompletionTrigger.Timer(300),
          };
          const result = await HtmlPdf.create(html, options);
          expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
          const pdf = await getParsedPdf(result.toBuffer());
          expect(pdf[0]).startsWith('Passed!');
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
                }, 200);
              </script>
            </body>
          </html>
        `;

        it('should generate prematurely without a CompletionTrigger', async () => {
          const result = await HtmlPdf.create(html, {port});
          expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
          const pdf = await getParsedPdf(result.toBuffer());
          expect(pdf[0]).startsWith('Failed!');
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
            completionTrigger: new HtmlPdf.CompletionTrigger.Event('myEvent', '#test', 300),
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
          expect(pdf[0]).startsWith('Passed!');
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
                }, 200);
              </script>
            </body>
          </html>
        `;

        it('should generate prematurely without a CompletionTrigger', async () => {
          const result = await HtmlPdf.create(html, {port});
          expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
          const pdf = await getParsedPdf(result.toBuffer());
          expect(pdf[0]).startsWith('Failed!');
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
            completionTrigger: new HtmlPdf.CompletionTrigger.Callback('wrongCb', 300),
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
          expect(pdf[0]).startsWith('Callback!');
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
                }, 200);
              </script>
            </body>
          </html>
        `;

        it('should generate prematurely without a CompletionTrigger', async () => {
          const result = await HtmlPdf.create(html, {port});
          expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
          const pdf = await getParsedPdf(result.toBuffer());
          expect(pdf[0]).startsWith('Failed!');
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
            completionTrigger: new HtmlPdf.CompletionTrigger.Element('div#derp', 300),
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
          expect(pdf[0]).startsWith('Passed!');
        });

      });

      describe('LifecycleEvent', () => {

        const html = `
          <html>
            <body>
              <div id="test">Passed!</div>
            </body>
          </html>
        `;

        it('should time out', async () => {
          const options: HtmlPdf.CreateOptions = {
            port,
            completionTrigger: new HtmlPdf.CompletionTrigger.LifecycleEvent('networkIdle', 1),
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
            completionTrigger: new HtmlPdf.CompletionTrigger.LifecycleEvent('invalidEvent', 300),
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
            completionTrigger: new HtmlPdf.CompletionTrigger.LifecycleEvent('firstContentfulPaint'),
          };
          const result = await HtmlPdf.create(html, options);
          expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
          const pdf = await getParsedPdf(result.toBuffer());
          expect(pdf[0]).startsWith('Passed!');
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
                }, 200);
              </script>
            </body>
          </html>
        `;

        it('should generate prematurely without a CompletionTrigger', async () => {
          const result = await HtmlPdf.create(html, {port});
          expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
          const pdf = await getParsedPdf(result.toBuffer());
          expect(pdf[0]).startsWith('Failed!');
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
            completionTrigger: new HtmlPdf.CompletionTrigger.Variable('wrongVar', 300),
          };
          try {
            await HtmlPdf.create(html, options);
            expect.fail();
          } catch (err) {
            expect(err.message).to.equal(timeoutErrorMessage);
          }
        });

        it('should not time out if the variable is already set', async () => {
          const alreadySetHtml = `
            <html>
              <body>
                <div id="test">Failed!</div>
                <script>
                  document.getElementById('test').innerHTML = 'Variable!';
                  alreadySet = true;
                </script>
              </body>
            </html>
          `;
          const options: HtmlPdf.CreateOptions = {
            port,
            completionTrigger: new HtmlPdf.CompletionTrigger.Variable('alreadySet', 300),
          };
          const result = await HtmlPdf.create(alreadySetHtml, options);
          expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
          const pdf = await getParsedPdf(result.toBuffer());
          expect(pdf[0]).startsWith('Variable!');
        });

        it('should generate correctly after being triggered', async () => {
          const options: HtmlPdf.CreateOptions = {
            port,
            completionTrigger: new HtmlPdf.CompletionTrigger.Variable(),
          };
          const result = await HtmlPdf.create(html, options);
          expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
          const pdf = await getParsedPdf(result.toBuffer());
          expect(pdf[0]).startsWith('Variable!');
        });

      });

    });

    describe('Concurrent PDF generation', function() {
      this.timeout(25000);
      async function createAndParse(index: string): Promise<string> {
        const html = `<p>${index}</p>`;
        const result = await HtmlPdf.create(html, { port });
        const parsed = await getParsedPdf(result.toBuffer());
        const regex = /^(\d+)$/;
        return (regex.exec(parsed[0]) || [])[1];
      }

      const length = 10;
      it(`should concurrently generate ${length} PDFs`, async () => {
        const input = Array.from({length}, (_, i) => `${i}`);
        const results = await Promise.all(input.map(createAndParse));
        expect(results).to.deep.equal(input);
      });
    });

  });

  describe('CreateResult', () => {

    const testBase64 = Buffer.from('test').toString('base64');

    describe('constructor', () => {
      it('should instanciate', () => {
        const result = new HtmlPdf.CreateResult('');
        expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
      });
    });

    describe('toBase64', () => {
      it('should output a base64 string', () => {
        const cr = new HtmlPdf.CreateResult(testBase64);
        expect(cr.toBase64()).to.equal(testBase64);
      });
    });

    describe('toBuffer', () => {
      it('should output a Buffer', () => {
        const cr = new HtmlPdf.CreateResult(testBase64);
        expect(cr.toBuffer()).to.deep.equal(Buffer.from('test'));
      });
    });

    describe('toStream', () => {
      it('should output a Readable Stream', () => {
        const cr = new HtmlPdf.CreateResult(testBase64);
        const stream = cr.toStream();
        expect(stream).to.be.an.instanceOf(Readable);
      });

      it('should output a valid Stream', (done) => {
        const cr = new HtmlPdf.CreateResult(testBase64);
        const stream = cr.toStream();
        let bytes = Buffer.from('');
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
          const cr = new HtmlPdf.CreateResult(testBase64);
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
          const cr = new HtmlPdf.CreateResult(testBase64);
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

async function getParsedPdf(buffer: Buffer): Promise<Array<string>> {
  const pdf = await pdfjs.getDocument(buffer).promise;
  const pages = await Promise.all(Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1)))
  const textPages = await Promise.all(pages.map((page) => page.getTextContent()));
  return textPages.map(({ items }) => (items as Array<TextItem>).map(({ str }) => str).join(''));
}
