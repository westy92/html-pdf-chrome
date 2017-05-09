# html-pdf-chrome

[![npm version](https://badge.fury.io/js/html-pdf-chrome.svg)](https://badge.fury.io/js/html-pdf-chrome)
[![Build Status](https://travis-ci.org/westy92/html-pdf-chrome.svg)](https://travis-ci.org/westy92/html-pdf-chrome/)
[![Dependency Status](https://david-dm.org/westy92/html-pdf-chrome.svg)](https://david-dm.org/westy92/html-pdf-chrome)
[![Known Vulnerabilities](https://snyk.io/test/github/westy92/html-pdf-chrome/badge.svg)](https://snyk.io/test/github/westy92/html-pdf-chrome)


HTML to PDF converter via Chrome/Chromium.

## Notice
html-pdf-chrome is in an alpha phase.  Chrome/Chromium headless mode is [still being developed](https://bugs.chromium.org/p/chromium/issues/list?can=2&q=label:Proj-Headless).

## Prerequisites
* Chrome/Chromium 59 or higher (still in beta)
* Linux or macOS
* Node.js v6 or later

## Installation
```bash
npm install --save html-pdf-chrome
```

## Usage

TypeScript:
```ts
import * as htmlPdf from 'html-pdf-chrome';

const html = `<p>Hello world!</p>`;

// async
const pdf = await htmlPdf.create(html);
await pdf.toFile('test.pdf');
const base64 = pdf.toBase64();
const buffer = pdf.toBuffer();

// Promise
htmlPdf.create(html).then((pdf) => pdf.toFile('test.pdf'));
htmlPdf.create(html).then((pdf) => pdf.toBase64());
htmlPdf.create(html).then((pdf) => pdf.toBuffer());
```

JavaScript:
```js
const htmlPdf = require('html-pdf-chrome');

const html = `<p>Hello world!</p>`;

htmlPdf.create(html).then((pdf) => pdf.toFile('test.pdf'));
htmlPdf.create(html).then((pdf) => pdf.toBase64());
htmlPdf.create(html).then((pdf) => pdf.toBuffer());
```

View the full documentation in the source code.

## License
html-pdf-chrome is released under the MIT License.
