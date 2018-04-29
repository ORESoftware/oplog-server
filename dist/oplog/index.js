'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var oplog_rx_1 = require("oplog.rx");
var bunion_1 = require("bunion");
exports.oplog = new oplog_rx_1.ObservableOplog();
var myLog = bunion_1.default.child({ myFirl: 'bar', glues: 'rabbit' });
var fields1 = bunion_1.default.getFields();
console.log('log fields:', fields1);
var fields2 = myLog.getFields();
console.log('myLog fields:', fields2);
setInterval(function () {
    var fields1 = bunion_1.default.getFields();
    myLog.info('log fields:', fields1);
    myLog.info('log fields:', new Error('rabbit'));
    myLog.info(new Error('rabbit'));
    if (Math.random() > 0.01) {
        console.log('mofos', 'agage');
    }
    var fields2 = myLog.getFields();
    myLog.debug('myLog fields:', fields2);
}, 10);
myLog.error(new Error('fooobar'));
myLog.infox({ varroooom: 'yup' }, 'shamrock');
myLog.debug('foobar is the newbar', { ron: 'jeremmaih' });
myLog.warn('foobar');
myLog.tracex({ ding: 'dong', zzz: 'zarrr', corner: 'case' }, 'foobaxxxxr');
exports.oplog.tail().then(function () {
    bunion_1.default.info('successfully started tailing the oplog.');
})
    .catch(function (err) {
    bunion_1.default.error('error while attempting to tail the oplog:', err.message || err);
});
