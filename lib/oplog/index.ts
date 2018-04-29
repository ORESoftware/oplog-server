'use strict';

import {ObservableOplog} from 'oplog.rx';
import log from 'bunion';

//project
export const oplog = new ObservableOplog();

const myLog = log.child({myFirl: 'bar', glues: 'rabbit'});

const fields1 = log.getFields();
console.log('log fields:', fields1);

const fields2 = myLog.getFields();
console.log('myLog fields:', fields2);

setInterval(function () {
  const fields1 = log.getFields();
  myLog.info('log fields:', fields1);
  
  myLog.info('log fields:', new Error('rabbit'));
  myLog.info(new Error('rabbit'));
  
  if(Math.random() > 0.01){
    console.log('mofos', 'agage');
  }
  
  const fields2 = myLog.getFields();
  myLog.debug('myLog fields:', fields2);
}, 10);

// log.info(new Error('fooobar'));
myLog.error(new Error('fooobar'));
myLog.infox({varroooom: 'yup'}, 'shamrock');
myLog.debug('foobar is the newbar', {ron: 'jeremmaih'});
myLog.warn('foobar');
myLog.tracex({ding: 'dong', zzz: 'zarrr', corner: 'case'}, 'foobaxxxxr');
// log.info('{}P{}{{');

oplog.tail().then(function () {
  log.info('successfully started tailing the oplog.');
})
.catch(function (err: any) {
  log.error('error while attempting to tail the oplog:', err.message || err);
});