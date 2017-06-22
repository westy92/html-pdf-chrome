'use strict';

// tslint:disable:no-unused-expression

import * as chai from 'chai';
import { Launcher } from 'chrome-launcher';
import { getRandomPort } from 'chrome-launcher/random-port';
import * as fs from 'fs';
import * as mockFs from 'mock-fs';
import * as path from 'path';
import * as PDFParser from 'pdf2json';
import * as sinon from 'sinon';
import { Readable } from 'stream';
import * as tcpPortUsed from 'tcp-port-used';

import * as HtmlPdf from '../src';

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-string'));
const expect = chai.expect;

describe('HtmlPdf', () => {

  describe('create', () => {
    let port: number;
    let launcher: Launcher;

    before(async () => {
      try {
        // Start Chrome and wait for it to start listening for connections.
        port = await getRandomPort();
        launcher = new Launcher({
          port,
          chromeFlags: [
            '--disable-gpu',
            '--headless',
          ],
        });
        await launcher.launch();
        await tcpPortUsed.waitUntilUsed(port);
      } catch (err) {
        await launcher.kill();
        throw err;
      }
    });

    after(async () => {
      await launcher.kill();
    });

    it('should spawn Chrome and generate a PDF', async () => {
      const result = await HtmlPdf.create('<p>hello!</p>');
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
    });

    it('should handle a Chrome launch failure', async () => {
      let launchStub: sinon.SinonStub;
      let killStub: sinon.SinonStub;
      const error = new Error('failed!');
      try {
        launchStub = sinon.stub(Launcher.prototype, 'launch').callsFake(() => Promise.reject(error));
        killStub = sinon.stub(Launcher.prototype, 'kill').callsFake(() => Promise.resolve());
        const result = await HtmlPdf.create('<p>hello!</p>');
        expect.fail();
      } catch (err) {
        expect(killStub).to.have.been.called;
        expect(err).to.equal(error);
      } finally {
        launchStub.restore();
        killStub.restore();
      }
    });

    it('should use running Chrome to generate a PDF (specify port)', async () => {
      const launchStub = sinon.stub(Launcher.prototype, 'launch');
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
      const launchStub = sinon.stub(Launcher.prototype, 'launch');
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
        printOptions: {
          landscape: true,
          displayHeaderFooter: true,
        },
      };
      const result = await HtmlPdf.create('<p>hello!</p>', options);
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
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

      const timeoutError = new Error('CompletionTrigger timed out.');

      describe('Timer', () => {

        const html = `
          <html>
            <body>
              <div id="test">Failed!</div>
              <script>
                setTimeout(() => {
                  document.getElementById('test').innerHTML = 'Passed!';
                }, 50);
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
            completionTrigger: new HtmlPdf.CompletionTrigger.Timer(60),
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
                }, 50);
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
            expect(err).to.deep.equal(timeoutError);
          }
        });

        it('should time out from listening to the wrong event', async () => {
          const options: HtmlPdf.CreateOptions = {
            port,
            completionTrigger: new HtmlPdf.CompletionTrigger.Event('myEvent', '#test', 75),
          };
          try {
            await HtmlPdf.create(html, options);
            expect.fail();
          } catch (err) {
            expect(err).to.deep.equal(timeoutError);
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
                }, 50);
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
            expect(err).to.deep.equal(timeoutError);
          }
        });

        it('should time out from listening to the wrong callback', async () => {
          const options: HtmlPdf.CreateOptions = {
            port,
            completionTrigger: new HtmlPdf.CompletionTrigger.Callback('wrongCb', 75),
          };
          try {
            await HtmlPdf.create(html, options);
            expect.fail();
          } catch (err) {
            expect(err).to.deep.equal(timeoutError);
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
                }, 50);
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
            expect(err).to.deep.equal(timeoutError);
          }
        });

        it('should time out from listening for the wrong element', async () => {
          const options: HtmlPdf.CreateOptions = {
            port,
            completionTrigger: new HtmlPdf.CompletionTrigger.Element('div#derp', 75),
          };
          try {
            await HtmlPdf.create(html, options);
            expect.fail();
          } catch (err) {
            expect(err).to.deep.equal(timeoutError);
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
          const path = 'myDir/file.pdf';
          await cr.toFile(path);
          const stats = fs.statSync(path);
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
