'use strict';

import {ObservableOplog} from 'oplog.rx';
import log from 'bunion';

//project
export const oplog = new ObservableOplog();

// log.info(new Error('fooobar'));
log.error(new Error('fooobar'));
log.infox({varroooom:'yup'},'shamrock');
log.debug('foobar is the newbar', {ron:'jeremmaih'});
log.warn('foobar');
log.tracex({ding: 'dong', zzz:'zarrr', corner:'case'},'foobaxxxxr');
// log.info('{}P{}{{');


oplog.tail().then(function () {
  log.info('successfully started tailing the oplog.');
})
.catch(function (err: any) {
  log.error('error while attempting to tail the oplog:', err.message || err);
});