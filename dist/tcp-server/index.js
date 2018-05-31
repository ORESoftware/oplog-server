"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var net = require("net");
var JSONStdio = require("json-stdio");
var oplog_1 = require("../oplog");
var bunion_1 = require("bunion");
var transform2JSON = JSONStdio.transformObject2JSON();
var t = oplog_1.oplog.getFilteredStream({}).pipe(transform2JSON);
bunion_1.default.info('beginning to stream oplog.');
exports.clientMap = new Map();
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
