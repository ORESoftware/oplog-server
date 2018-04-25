'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var oplog_1 = require("./oplog");
var socket_server_1 = require("./socket-server");
var mongo_client_1 = require("./mongo-client");
var bunion_1 = require("bunion");
var _a = oplog_1.oplog.getOps(), del = _a.del, insert = _a.insert, update = _a.update;
var getCollection = function (v) {
    return String(v.ns).split('.')[1];
};
bunion_1.default.info('loading the oplog');
var validColls = {
    users: true,
    categories: true,
    roles: true,
    functionalTeams: true,
    workstreams: true,
    prompts: true,
    responses: true,
    assignments: true
};
var getIdFromDoc = function (v) {
    return v && v.o && v.o._id;
};
var ops = {
    'i': 'insert',
    'u': 'uddate',
    'd': 'delete'
};
var getOperation = function (v) {
    return v && ops[v.op] || 'unknown';
};
mongo_client_1.client.once('connect', function () {
    var db = mongo_client_1.client.db('local');
    del.subscribe(function (v) {
        var collName = getCollection(v);
        var op = getOperation(v);
        var id = getIdFromDoc(v);
        if (op !== 'delete') {
            bunion_1.default.error('operation was expected to be a "delete", but was not:', op);
            return;
        }
        socket_server_1.connections.forEach(function (v, k, m) {
            v.send({
                operation: op,
                collection: collName,
                value: id
            });
        });
    });
    insert.subscribe(function (doc) {
        var collName = getCollection(doc);
        var op = getOperation(doc);
        var id = getIdFromDoc(doc);
        if (op !== 'insert') {
            bunion_1.default.error('operation was expected to be an insert, but was not:', op);
        }
        socket_server_1.connections.forEach(function (v, k, m) {
            v.send({
                operation: op,
                collection: collName,
                value: doc.o
            });
        });
    });
    update.subscribe(function (doc) {
        var collName = getCollection(doc);
        var coll = db.collection(collName);
        var op = getOperation(doc);
        var id = getIdFromDoc(doc);
        if (op !== 'update') {
            bunion_1.default.error('operation was expected to be an update, but was not:', op);
            return;
        }
        if (!validColls[collName]) {
            bunion_1.default.warn('collection was not a good one:', coll);
            return;
        }
        coll.findOne({ _id: id }, function (err, m) {
            if (err) {
                bunion_1.default.error(err);
                return;
            }
            socket_server_1.connections.forEach(function (v, k) {
                v.send({
                    operation: op,
                    collection: collName,
                    value: m
                });
            });
        });
    });
});
