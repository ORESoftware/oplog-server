"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var net = require("net");
var JSONStdio = require("json-stdio");
var oplog_rx_1 = require("oplog.rx");
var c = net.createConnection(6969, 'localhost');
var jsonParser = JSONStdio.createParser();
var strm = c.pipe(jsonParser);
var _a = oplog_rx_1.getOplogStreamInterpreter(strm), ops = _a.ops, emitter = _a.emitter;
emitter.on('update', function () {
    console.log('update happened.');
});
emitter.on('delete', function () {
    console.log('delete happened.');
});
emitter.on('insert', function () {
    console.log('insert happened.');
});
