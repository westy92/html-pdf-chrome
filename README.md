# html-pdf-chrome

[![npm version](https://badge.fury.io/js/html-pdf-chrome.svg)](https://www.npmjs.com/package/html-pdf-chrome)
[![Build Status](https://github.com/westy92/html-pdf-chrome/actions/workflows/github-actions.yml/badge.svg)](https://github.com/westy92/html-pdf-chrome/actions/workflows/github-actions.yml?query=branch%3Amaster)
[![Maintainability](https://api.codeclimate.com/v1/badges/9395ded652937f958a41/maintainability)](https://codeclimate.com/github/westy92/html-pdf-chrome/maintainability)
[![Code Coverage](https://codecov.io/gh/westy92/html-pdf-chrome/branch/master/graph/badge.svg)](https://codecov.io/gh/westy92/html-pdf-chrome)
[![Known Vulnerabilities](https://snyk.io/test/github/westy92/html-pdf-chrome/badge.svg)](https://snyk.io/test/github/westy92/html-pdf-chrome)
[![Funding Status](https://img.shields.io/github/sponsors/westy92)](https://github.com/sponsors/westy92)

HTML to PDF or image (jpeg, png, webp) converter via Chrome/Chromium.

## Prerequisites

* Latest Chrome/Chromium
* Windows, macOS, or Linux
* A [currently supported version of Node.js](https://nodejs.org/en/about/releases/)

## Installation

```bash
npm install --save html-pdf-chrome
```

## Security

This library is **_NOT_** meant to accept untrusted user input. Doing so may have serious security risks such as Server-Side Request Forgery (SSRF).

### CORS

If you run into CORS issues, try using the `--disable-web-security` Chrome flag, either when you start Chrome externally, or in `options.chromeFlags`. This option should only be used if you fully trust the code you are executing during a print job!

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
const stream = pdf.toStream();

// Promise
htmlPdf.create(html, options).then((pdf) => pdf.toFile('test.pdf'));
htmlPdf.create(html, options).then((pdf) => pdf.toBase64());
htmlPdf.create(html, options).then((pdf) => pdf.toBuffer());
htmlPdf.create(html, options).then((pdf) => pdf.toStream());
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
htmlPdf.create(html, options).then((pdf) => pdf.toStream());
```

View the full documentation in the source code.

### Saving as a Screenshot

By default, pages are saved as a PDF. To save as a screenshot instead, supply `screenshotOptions`.
All supported options can be viewed [here](https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-captureScreenshot).

```js
const htmlPdf = require('html-pdf-chrome');

const html = '<p>Hello, world!</p>';
const options = {
  port: 9222, // port Chrome is listening on
  screenshotOptions: {
    format: 'png', // png, jpeg, or webp. Optional, defaults to png.
    // quality: 100, // Optional, quality percent (jpeg only)

    // optional, defaults to entire window
    clip: {
      x: 0,
      y: 0,
      width: 100,
      height: 200,
      scale: 1,
    },
  },
  // Optional. Options here: https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setDeviceMetricsOverride
  deviceMetrics: {
    width: 1000,
    height: 1000,
    deviceScaleFactor: 0,
    mobile: false,
  },
};

htmlPdf.create(html, options).then((pdf) => pdf.toFile('test.png'));
```

### Using an External Site

```js
import * as htmlPdf from 'html-pdf-chrome';

const options: htmlPdf.CreateOptions = {
  port: 9222, // port Chrome is listening on
};

const url = 'https://github.com/westy92/html-pdf-chrome';
const pdf = await htmlPdf.create(url, options);
```

### Using Markdown

```js
import * as htmlPdf from 'html-pdf-chrome';
import * as marked from 'marked';

const options: htmlPdf.CreateOptions = {
  port: 9222, // port Chrome is listening on
};

const html = marked('# Hello [World](https://www.google.com/)!');
const pdf = await htmlPdf.create(html, options);
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

### HTTP Headers

Specify additional headers you wish to send with your request via `CreateOptions.extraHTTPHeaders`.

```js
const options: HtmlPdf.CreateOptions = {
  port: 9222, // port Chrome is listening on
  extraHTTPHeaders: {
    'Authorization': 'Bearer 123',
    'X-Custom-Test-Header': 'This is great!',
  },
};

const pdf = await HtmlPdf.create('https://httpbin.org/headers', options);
```

### Custom Headers and Footers

_Note: Requires Chrome 65 or later._

You can optionally provide an HTML template for a custom header and/or footer.

A few classes can be used to inject printing values:

* `date` - formatted print date
* `title` - document title
* `url` - document location
* `pageNumber` - current page number
* `totalPages` - total pages in the document

You can tweak the margins with the `printOptions` of `marginTop`, `marginBottom`, `marginLeft`, and `marginRight`.

At this time, you must inline any images using [base64 encoding](http://www.bigfastblog.com/embed-base64-encoded-images-inline-in-html).

You can view how Chrome lays out the templates [here](https://cs.chromium.org/chromium/src/components/printing/resources/print_preview_page.html).

#### Example

```js
const pdf = await htmlPdf.create(html, {
  port,
  printOptions: {
    displayHeaderFooter: true,
    headerTemplate: `
      <div class="text center">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>
    `,
    footerTemplate: '<div class="text center">Custom footer!</div>',
  },
});
```

### Trigger Render Completion

There are a few `CompletionTrigger` types that wait for something to occur before triggering PDF printing.

* Callback - waits for a callback to be called
* Element - waits for an element to be injected into the DOM
* Event - waits for an Event to fire
* Timer - waits a specified amount of time
* LifecycleEvent - waits for a Chrome page lifecycle event
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

new htmlPdf.CompletionTrigger.LifecycleEvent(
  'networkIdle', // name of the Chrome lifecycle event to listen for. Defaults to 'firstMeaningfulPaint'.
  5000 // optional timeout (milliseconds)
),

new htmlPdf.CompletionTrigger.Variable(
  'myVarName', // optional, name of the variable to wait for.  Defaults to 'htmlPdfDone'
  5000 // optional, timeout (milliseconds)
),
```

## License

html-pdf-chrome is released under the MIT License.
