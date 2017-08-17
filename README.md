# html-pdf-chrome

[![npm version](https://badge.fury.io/js/html-pdf-chrome.svg)](https://badge.fury.io/js/html-pdf-chrome)
[![Linux & Mac Build Status](https://travis-ci.org/westy92/html-pdf-chrome.svg?branch=master)](https://travis-ci.org/westy92/html-pdf-chrome/)
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/westy92/html-pdf-chrome?branch=master&svg=true)](https://ci.appveyor.com/project/westy92/html-pdf-chrome)
[![Code Coverage](https://codecov.io/gh/westy92/html-pdf-chrome/branch/master/graph/badge.svg)](https://codecov.io/gh/westy92/html-pdf-chrome)
[![Dependency Status](https://david-dm.org/westy92/html-pdf-chrome.svg)](https://david-dm.org/westy92/html-pdf-chrome)
[![Known Vulnerabilities](https://snyk.io/test/github/westy92/html-pdf-chrome/badge.svg)](https://snyk.io/test/github/westy92/html-pdf-chrome)

HTML to PDF converter via Chrome/Chromium.

## Prerequisites

* Chrome/Chromium 59 or higher (60 or higher for some features)
* Windows, macOS, or Linux
* Node.js v6 or later

## Installation

```bash
npm install --save html-pdf-chrome
```

## Usage

__Note:__ It is _strongly_ recommended that you keep Chrome running side-by-side with Node.js.  There is significant overhead starting up Chrome for each PDF generation which can be easily avoided.

It's suggested to use [pm2](http://pm2.keymetrics.io/) to ensure Chrome continues to run.  If it crashes, it will restart automatically.

As of this writing, headless Chrome uses about 65mb of RAM while idle.

```bash
# install pm2 globally
npm install -g pm2
# start Chrome and be sure to specify a port to use in the html-pdf-chrome options.
pm2 start google-chrome \
  --interpreter none \
  -- \
  --headless \
  --disable-gpu \
  --disable-translate \
  --disable-extensions \
  --disable-background-networking \
  --safebrowsing-disable-auto-update \
  --disable-sync \
  --metrics-recording-only \
  --disable-default-apps \
  --no-first-run \
  --mute-audio \
  --hide-scrollbars \
  --remote-debugging-port=<port goes here>
# run your Node.js app.
```

TypeScript:

```js
import * as htmlPdf from 'html-pdf-chrome';

const html = '<p>Hello, world!</p>';
const options: htmlPdf.CreateOptions = {
  port: 9222, // port Chrome is listening on
};

// async
const pdf = await htmlPdf.create(html, options);
await pdf.toFile('test.pdf');
const base64 = pdf.toBase64();
const buffer = pdf.toBuffer();

// Promise
htmlPdf.create(html, options).then((pdf) => pdf.toFile('test.pdf'));
htmlPdf.create(html, options).then((pdf) => pdf.toBase64());
htmlPdf.create(html, options).then((pdf) => pdf.toBuffer());
```

JavaScript:

```js
const htmlPdf = require('html-pdf-chrome');

const html = '<p>Hello, world!</p>';
const options = {
  port: 9222, // port Chrome is listening on
};

htmlPdf.create(html, options).then((pdf) => pdf.toFile('test.pdf'));
htmlPdf.create(html, options).then((pdf) => pdf.toBase64());
htmlPdf.create(html, options).then((pdf) => pdf.toBuffer());
```

View the full documentation in the source code.

### Using an External Site

```js
import * as htmlPdf from 'html-pdf-chrome';

const options: htmlPdf.CreateOptions = {
  port: 9222, // port Chrome is listening on
};

const url = 'https://github.com/westy92/html-pdf-chrome';
const pdf = await htmlPdf.create(url, options);
```

### Using a Template Engine

Pug (formerly known as Jade)

```js
import * as htmlPdf from 'html-pdf-chrome';
import * as pug from 'pug';

const template = pug.compile('p Hello, #{noun}!');
const templateData = {
  noun: 'world',
};
const options: htmlPdf.CreateOptions = {
  port: 9222, // port Chrome is listening on
};

const html = template(templateData);
const pdf = await htmlPdf.create(html, options);
```

### Trigger Render Completion

There are a few `CompletionTrigger` types that wait for something to occur before triggering PDF printing.

* Callback - waits for a callback to be called
* Element - waits for an element to be injected into the DOM
* Event - waits for an Event to fire
* Timer - waits a specified amount of time
* Variable - waits for a variable to be set to `true`
* Custom - extend `htmlPdf.CompletionTrigger.CompletionTrigger`

```js
const options: htmlPdf.CreateOptions = {
  port: 9222, // port Chrome is listening on
  completionTrigger: new htmlPdf.CompletionTrigger.Timer(5000), // milliseconds
};

// Alternative completionTrigger options:
new htmlPdf.CompletionTrigger.Callback(
  'cbName', // optional, name of the callback to define for the browser to call when finished rendering.  Defaults to 'htmlPdfCb'.
  5000 // optional, timeout (milliseconds)
),

new htmlPdf.CompletionTrigger.Element(
  'div#myElement', // name of the DOM element to wait for
  5000 // optional, timeout (milliseconds)
),

new htmlPdf.CompletionTrigger.Event(
  'myEvent', // name of the event to listen for
  '#myElement', // optional DOM element CSS selector to listen on, defaults to body
  5000 // optional timeout (milliseconds)
),

new htmlPdf.CompletionTrigger.Variable(
  'myVarName', // optional, name of the variable to wait for.  Defaults to 'htmlPdfDone'
  5000 // optional, timeout (milliseconds)
),
```

## License

html-pdf-chrome is released under the MIT License.
