'use strict';

import {MongoClient} from 'mongodb';
import log from 'bunion';

const url = 'mongodb://localhost';

// {
//   uri: url,
//     url: url,
//   server: {
//   url: url,
//     reconnectTries: Number.MAX_VALUE,
//     autoReconnect: true
// }
// }

export const client = new MongoClient(url, {
  server: {
    url: url,
    reconnectTries: Number.MAX_VALUE,
    autoReconnect: true
  }
});

// client.startSession({
//   server: {
//     url: url,
//     reconnectTries: Number.MAX_VALUE,
//     autoReconnect: true
//   }
// });

client.connect(function (err: Error) {
  if (err) throw err;
  log.info('mongo client connected.');
});