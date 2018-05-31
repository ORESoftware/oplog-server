"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Server = require("socket.io");
var bunion_1 = require("bunion");
var io = Server();
io.listen(3000);
exports.connections = new Map();
io.on('connection', function (c) {
    bunion_1.default.debug('new client connection.');
    exports.connections.set(c, c);
    c.once('disconnect', function () {
        bunion_1.default.debug('client disconnected.');
        exports.connections.delete(c);
    });
});
