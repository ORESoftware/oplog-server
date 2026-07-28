"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_1 = require("socket.io");
var io = new socket_io_1.Server(3000, {
    allowEIO3: true
});
exports.connections = new Map();
io.on('connection', function (c) {
    exports.connections.set(c, c);
    c.once('disconnect', function () {
        exports.connections.delete(c);
    });
});
