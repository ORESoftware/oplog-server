"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_1 = require("socket.io");
var bunion_1 = require("bunion");
var io = new socket_io_1.Server(3000, {
    allowEIO3: true
});
exports.connections = new Map();
io.on('connection', function (c) {
    bunion_1.default.debug('new client connection.');
    exports.connections.set(c, c);
    c.once('disconnect', function () {
        bunion_1.default.debug('client disconnected.');
        exports.connections.delete(c);
    });
});
