'use strict';

import {ObservableOplog} from 'oplog.rx';

//project
export const oplog = new ObservableOplog();

oplog.tail().then(function () {
  console.log('successfully started tailing the oplog.');
})
.catch(function (err: any) {
  console.error('error while attempting to tail the oplog:', err.message || err);
});