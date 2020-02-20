'use strict';

// tslint:disable:no-unused-expression

import * as chai from 'chai';
import * as chromeLauncher from 'chrome-launcher';
import * as fs from 'fs';
import getPort = require('get-port');
import * as mockFs from 'mock-fs';
import * as path from 'path';
import * as PDFParser from 'pdf2json';
import * as sinon from 'sinon';
import { Readable } from 'stream';

import * as HtmlPdf from '../src';
import ConsoleAPICalled from '../src/typings/chrome/Runtime/ConsoleAPICalled';
import ExceptionThrown from '../src/typings/chrome/Runtime/ExceptionThrown';

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
      await chrome.kill();
    });

    it('should spawn Chrome and generate a PDF', async () => {
      const result = await HtmlPdf.create('<p>hello!</p>');
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
    });

    it('should handle a Chrome launch failure', async () => {
      const error = new Error('failed!');
      const launchStub = sinon.stub(chromeLauncher, 'launch').callsFake(() => Promise.reject(error));
      try {
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
      const rawTextContent = pdf.getRawTextContent();

      expect(rawTextContent).to.contain('Authorization').and.to.contain('Bearer');
      expect(rawTextContent).to.contain('X-Custom-Test-Header').and.to.contain('Passed1!');
    });

    it('should proxy console messages', async () => {
      const events: ConsoleAPICalled[] = [];
      const options: HtmlPdf.CreateOptions = {
        port,
        runtimeConsoleHandler: (event: ConsoleAPICalled) => events.push(event),
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
      let caughtException: ExceptionThrown;
      const options: HtmlPdf.CreateOptions = {
        port,
        runtimeExceptionHandler: (event: ExceptionThrown) => { caughtException = event; },
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
      const pdfText = pdf.getRawTextContent();
      expect(pdfText).to.contain('Custom header!').and.to.contain('Custom footer!');
      expect(pdfText).to.contain('Page 1 of 2.').and.to.contain('Page 2 of 2.');
      expect(pdfText).to.contain('P1').and.to.contain('P2');
      expect(pdfText).to.contain('Title: TITLE.');
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

    describe('Http', async () => {

      const baseOptions: HtmlPdf.CreateOptions = {
        port,
      };

      const mockServer = require('mockttp').getLocal(); // {debug: true}
      const mockServerPort = await getPort();
      const mockUrl = `http://127.0.0.1:${mockServerPort}/mocked-path`;

      before(() => {
        mockServer.start(mockServerPort);
      });
      after(() => {
        mockServer.stop();
      });

      it('should trigger loadingFailedHandler', (done) => {
        const myOptions = Object.assign({}, baseOptions);
        let alreadyReceivedLoadingFailedHandler = false;

        myOptions.loadingFailedHandler = (e) => {
          expect(e.requestId).to.not.be.null;
          expect(e.timestamp).to.not.be.null;
          expect(e.type).to.not.be.null;
          alreadyReceivedLoadingFailedHandler = true;
          done();
        };

        const html = `
          <html>
            <body>
              <img src="http://thisdomaindoesnotexistforsureibelieveatleast.com/blah.png">
            </body>
          </html>
        `;

        mockServer.get('/mocked-path')
          .thenReply(200, html)
          .then(async () => {

            await HtmlPdf.create(mockUrl, myOptions).catch((err) => {
              done(err);
            }).then(() => {
              if (!alreadyReceivedLoadingFailedHandler) {
                done('Did not receive loadingFailedHandler call');
              }
            });

          });

      });

      const statusCodeBasedTest = async (statusCodeToSend: number, expectFail: boolean, options: HtmlPdf.CreateOptions) => {

        const myOptions = Object.assign({}, options);

        const p = new Promise(async (resolve, reject) =>  {

          mockServer.get('/mocked-path').thenReply(statusCodeToSend, 'A mocked response').then(async () => {
            let alreadyFailed = false;

            await HtmlPdf.create(mockUrl, myOptions).catch((err) => {
              alreadyFailed = true;
              if (!expectFail) {
                reject(`Did not expect failure: ${err}`);
              } else {
                resolve();
              }
            }).then(() => {
              if (alreadyFailed) {
                return;
              }
              if (expectFail) {
                reject(`create was supposed to fail but did not`);
              } else {
                resolve();
              }
            });

          });

        });

        return p;
      };

      it('should fail on HTTP 4xx', (done) => {
        statusCodeBasedTest(403, true, baseOptions)
          .then(() => { done(); })
          .catch((err) => { done(err); });
      });

      it('should fail on HTTP 5xx', (done) => {
        statusCodeBasedTest(500, true, baseOptions)
          .then(() => { done(); })
          .catch((err) => { done(err); });
      });

      it('should NOT fail on HTTP 4xx if failOnHTTP5xx is false', (done) => {
        baseOptions.failOnHTTP5xx = false;
        statusCodeBasedTest(500, false, baseOptions)
          .then(() => { done(); })
          .catch((err) => { done(err); });
      });

      it('should NOT fail on HTTP 4xx if failOnHTTP4xx is false', (done) => {
        baseOptions.failOnHTTP4xx = false;
        statusCodeBasedTest(403, false, baseOptions)
          .then(() => { done(); })
          .catch((err) => { done(err); });
      });

      it('should trigger requestWillBeSentHandler', (done) => {
        const myOptions = Object.assign({}, baseOptions);
        let alreadyReceivedRequestWillBeSentHandler = false;
        myOptions.requestWillBeSentHandler = (e) => {
          expect(e.initiator).to.not.null;
          expect(e.requestId).to.not.null;
          expect(e.loaderId).to.not.null;
          expect(e.timestamp).to.not.null;
          expect(e.wallTime).to.not.null;
          expect(e.request).to.not.null;
          done();
          alreadyReceivedRequestWillBeSentHandler = true;
        };

        mockServer.get('/mocked-path')
          .thenReply(200, 'A mocked response')
          .then(async () => {

            await HtmlPdf.create(mockUrl, myOptions).catch((err) => {
              done(err);
            }).then(() => {
              if (!alreadyReceivedRequestWillBeSentHandler) {
                done('Did not receive requestWillBeSentHandler call');
              }
            });
          });

      });

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

    describe('Concurrent PDF generation', function() {
      this.timeout(25000);
      async function createAndParse(index: string): Promise<string> {
        const html = `<p>${index}</p>`;
        const result = await HtmlPdf.create(html, { port });
        const parsed = await getParsedPdf(result.toBuffer());
        const regex = /^(\d+)\r\n----------------Page \(0\) Break----------------\r\n$/;
        return (regex.exec(parsed.getRawTextContent()) || [])[1];
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

async function getParsedPdf(buffer: Buffer): Promise<any> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);
    pdfParser.on('pdfParser_dataError', (err) => reject(err.parserError));
    pdfParser.on('pdfParser_dataReady', () => resolve(pdfParser));
    pdfParser.parseBuffer(buffer);
  });
}
