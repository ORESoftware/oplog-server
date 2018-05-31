'use strict';

import {ObservableOplog} from 'oplog.rx';
import log from 'bunion';

//project
export const oplog = new ObservableOplog();

oplog.tail().then(function () {
  log.info('successfully started tailing the oplog.');
})
.catch(function (err: any) {
  log.error('error while attempting to tail the oplog:', err.message || err);
});