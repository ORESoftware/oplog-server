"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var net = require("net");
var JSONStdio = require("json-stdio");
var transform2JSON = JSONStdio.transformObject2JSON();
var t = oplog.getFilteredStream({}).pipe(transform2JSON);
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
