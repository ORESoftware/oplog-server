'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var oplog_rx_1 = require("oplog.rx");
exports.oplog = new oplog_rx_1.ObservableOplog();
exports.oplog.tail().then(function () {
    console.log('successfully started tailing the oplog.');
})
    .catch(function (err) {
    console.error('error while attempting to tail the oplog:', err.message || err);
});
