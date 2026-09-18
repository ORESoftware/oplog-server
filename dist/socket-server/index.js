"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connections = exports.io = void 0;
var socket_io_1 = require("socket.io");
var bunion_1 = require("bunion");
exports.io = new socket_io_1.Server(3000, {
    allowEIO3: true
});
exports.connections = new Map();
exports.io.on('connection', function (c) {
    bunion_1.default.debug('new client connection.');
    exports.connections.set(c, c);
    c.once('disconnect', function () {
        bunion_1.default.debug('client disconnected.');
        exports.connections.delete(c);
    });
});
