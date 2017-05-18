'use strict';

// tslint:disable:no-unused-expression

import * as chai from 'chai';
import * as fs from 'fs';
import { ChromeLauncher } from 'lighthouse/lighthouse-cli/chrome-launcher';
import { getRandomPort } from 'lighthouse/lighthouse-cli/random-port';
import * as mockFs from 'mock-fs';
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
    let launcher: ChromeLauncher;

    before(async () => {
      try {
        // Start Chrome and wait for it to start listening for connections.
        port = await getRandomPort();
        launcher = new ChromeLauncher({
          port,
          autoSelectChrome: true,
          additionalFlags: [
            '--disable-gpu',
            '--headless',
          ],
        });
        await launcher.run();
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
      let runStub: sinon.SinonStub;
      let killStub: sinon.SinonStub;
      const error = new Error('failed!');
      try {
        runStub = sinon.stub(ChromeLauncher.prototype, 'run').callsFake(() => Promise.reject(error));
        killStub = sinon.stub(ChromeLauncher.prototype, 'kill').callsFake(() => Promise.resolve());
        const result = await HtmlPdf.create('<p>hello!</p>');
        expect.fail();
      } catch (err) {
        expect(killStub).to.have.been.called;
        expect(err).to.equal(error);
      } finally {
        runStub.restore();
        killStub.restore();
      }
    });

    it('should use running Chrome to generate a PDF', async () => {
      const runStub = sinon.stub(ChromeLauncher.prototype, 'run');
      try {
        const result = await HtmlPdf.create('<p>hello!</p>', {port});
        expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
        expect(runStub).to.not.have.been.called;
        const pdfText = await getPdfText(result.toBuffer());
        expect(pdfText).startsWith('hello!');
      } finally {
        runStub.restore();
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
            <meta charset="utf-8">
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
      const pdfText = await getPdfText(result.toBuffer());
      expect(pdfText).startsWith('Passed!');
    });

    it('should generate a PDF with external CSS', async () => {
      // #test:before{content:'Passed!';}
      const html = `
        <html>
          <head>
            <meta charset="utf-8">
            <link rel="stylesheet" href="data:text/css;charset=utf-8;base64,I3Rlc3Q6YmVmb3Jle2NvbnRlbnQ6J1Bhc3NlZCEnO30=">
          </head>
          <body>
            <div id="test"></div>
          </body>
        </html>
      `;
      const result = await HtmlPdf.create(html, {port});
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
      const pdfText = await getPdfText(result.toBuffer());
      expect(pdfText).startsWith('Passed!');
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

async function getPdfText(buffer: Buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);
    pdfParser.on('pdfParser_dataError', (err) => reject(err.parserError));
    pdfParser.on('pdfParser_dataReady', () => resolve(pdfParser.getRawTextContent()));
    pdfParser.parseBuffer(buffer);
  });
}
