"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var net = require("net");
var JSONStdio = require("json-stdio");
var oplog_rx_1 = require("oplog.rx");
var c = net.connect(6969, 'localhost');
var jsonParser = JSONStdio.createParser();
var strm = c.pipe(jsonParser);
var _a = oplog_rx_1.getOplogStreamInterpreter(strm), _b = _a.ops, del = _b.del, insert = _b.insert, update = _b.update, emitter = _a.emitter;
del.subscribe(function (v) {
    console.log('delete happened 1.');
});
insert.subscribe(function (v) {
    console.log('insert happened 1.');
});
update.subscribe(function (v) {
    console.log('update happened 1.');
});
emitter.on('update', function (v) {
    console.log('update happened 2.', v);
});
emitter.on('delete', function (v) {
    console.log('delete happened 2.', v);
});
emitter.on('insert', function (v) {
    console.log('insert happened 2.', v);
});
