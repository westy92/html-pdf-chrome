'use strict';

// tslint:disable:no-unused-expression

import * as chai from 'chai';
import * as fs from 'fs';
import { ChromeLauncher } from 'lighthouse/lighthouse-cli/chrome-launcher';
import * as mockFs from 'mock-fs';
import * as sinon from 'sinon';
import { Readable } from 'stream';

import * as HtmlPdf from '../src';

const expect = chai.expect;

describe('HtmlPdf', () => {

  describe('create', () => {
    it('should generate a PDF', async () => {
      const result = await HtmlPdf.create('<p>hello!</p>');
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
    });

    it('should generate a PDF with options', async () => {
      const options = {
        port: 9222,
      };
      const result = await HtmlPdf.create('<p>hello!</p>', options);
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
    });

    it('should generate a PDF with Chrome options', async () => {
      const options: HtmlPdf.CreateOptions = {
        printOptions: {
          landscape: true,
          displayHeaderFooter: true,
        },
      };
      const result = await HtmlPdf.create('<p>hello!</p>', options);
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
        expect(cr.toBuffer()).to.deep.equal(Buffer.from('dGVzdA==', 'base64'));
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
