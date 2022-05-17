'use strict';

import { Timestamp } from '../Runtime/Timestamp';

/*
{
  requestId: '133.704',
  loaderId: '47D78175A76F2A4326F94BC8C9019FDB',
  timestamp: 562321.892531,
  type: 'Fetch',
  response: {
    url: 'https://interaktiv.waz.de/corona-multi-teaser/data/rki.kreise.topo.json',
    status: 200,
    statusText: '',
    headers: {
      date: 'Tue, 17 May 2022 05:24:11 GMT',
      'content-encoding': 'gzip',
      'x-original-content-length': '76084',
      server: 'Funke Digital Cloud - SpeedCDN <speed@funkedigital.de>',
      'x-key': 'httpsorigin-interaktiv.waz.de/corona-multi-teaser/data/rki.kreise.topo.json',
      vary: 'Accept-Encoding',
      'access-control-allow-methods': 'GET, OPTIONS',
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-expose-headers': 'Content-Length,Content-Range,Etag,Last-Modified',
      'x-cache': 'HIT',
      'access-control-allow-headers': 'DNT,User-Agent,X-Requested-With,If-None-Match,If-Modified-Since,Cache-Control,Content-Type,Range,Accept-Encoding',
      'content-length': '19526'
    },
    mimeType: 'application/json',
    connectionReused: true,
    connectionId: 11,
    remoteIPAddress: '213.239.228.188',
    remotePort: 443,
    fromDiskCache: false,
    fromServiceWorker: false,
    fromPrefetchCache: false,
    encodedDataLength: 479,
    timing: {
      requestTime: 562321.54482,
      proxyStart: -1,
      proxyEnd: -1,
      dnsStart: -1,
      dnsEnd: -1,
      connectStart: -1,
      connectEnd: -1,
      sslStart: -1,
      sslEnd: -1,
      workerStart: -1,
      workerReady: -1,
      workerFetchStart: -1,
      workerRespondWithSettled: -1,
      sendStart: 7.271,
      sendEnd: 14.509,
      pushStart: 0,
      pushEnd: 0,
      receiveHeadersEnd: 346.004
    },
    responseTime: 1652765051248.628,
    protocol: 'h2',
    securityState: 'secure',
    securityDetails: {
      protocol: 'TLS 1.3',
      keyExchange: '',
      keyExchangeGroup: 'P-384',
      cipher: 'AES_256_GCM',
      certificateId: 0,
      subjectName: 'funkedigital.de',
      sanList: [Array],
      issuer: 'R3',
      validFrom: 1649367984,
      validTo: 1657143983,
      signedCertificateTimestampList: [],
      certificateTransparencyCompliance: 'unknown'
    }
  },
  frameId: '0F55219B6020CB44A5F831B2D87A7921'
}*/

/**
 * Chrome Network.ResponseReceived event
 *
 * @export
 * @interface ResponseReceived
 */
export default interface ResponseReceived {
  /**
   * Network Request ID
   *
   * @type {string}
   * @memberof ResponseReceived
   */
  requestId: string;

  /**
   * Timestamp of the request
   *
   * @type {Timestamp}
   * @memberof ResponseReceived
   */
  timestamp: Timestamp;

  /**
   * Response object
   *
   * @type {number}
   * @memberof ResponseReceived
   */
   response: any;
}
