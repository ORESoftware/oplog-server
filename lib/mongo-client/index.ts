'use strict';

import {MongoClient} from 'mongodb';
import log from 'bunion';

const url = 'mongodb://localhost';

export const client = new (MongoClient as any)(url);

client.connect(function (err: Error) {
  if(err){
    return log.error(err);
  }
 log.info('mongo client connected.');
});