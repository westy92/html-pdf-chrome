'use strict';

import * as chai from 'chai';

import * as HtmlPdf from '../src';

const expect = chai.expect;

describe('HtmlPdf', () => {

  describe('create', () => {
    it('should generate a PDF', async () => {
      const result = await HtmlPdf.create('<p>hello!</p>');
      expect(result).to.be.an.instanceOf(HtmlPdf.CreateResult);
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

  });

});
