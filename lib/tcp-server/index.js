"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var net = require("net");
exports.clientMap = new Map();
var oplog_rx_1 = require("oplog.rx");
var JSONStdio = require("json-stdio");
var oplog = new oplog_rx_1.ObservableOplog();
oplog.tail().then(function () {
    console.log('successfully started tailing the oplog.');
})
    .catch(function (err) {
    console.error('error while attempting to tail the oplog:', err.message || err);
});
var transform2JSON = JSONStdio.transformObject2JSON();
var t = oplog.getFilteredStream({}).pipe(transform2JSON);
exports.s = net.createServer(function (socket) {
    console.log('client connected.');
    exports.clientMap.set(socket, socket);
    t.pipe(socket);
    socket.once('close', function () {
        console.log('client closed.');
        exports.clientMap.delete(socket);
    });
});
exports.s.listen(6969);
