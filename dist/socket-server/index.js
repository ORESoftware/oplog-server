"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Server = require("socket.io");
var io = Server();
io.listen(3000);
exports.connections = new Map();
io.on('connection', function (c) {
    exports.connections.set(c, c);
    c.once('disconnect', function () {
        exports.connections.delete(c);
    });
});
