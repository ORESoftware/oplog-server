"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var oplog_1 = require("./oplog");
var mongo_client_1 = require("./mongo-client");
var _a = oplog_1.oplog.getOps(), del = _a.del, insert = _a.insert, update = _a.update;
var getCollection = function (v) {
    return String(v.ns).split('.')[1];
};
var colls = {
    users: true,
    categories: true,
    roles: true,
    functionalTeams: true,
    workstreams: true,
    prompts: true,
    responses: true,
};
var db = mongo_client_1.client.db('local');
var getIdFromDoc = function (v) {
    return v && v.o && v.o._id;
};
del.subscribe(function (v) {
    var coll = getCollection(v);
});
insert.subscribe(function (v) {
    var coll = getCollection(v);
});
update.subscribe(function (v) {
    var coll = db.collection(getCollection(v));
    if (!colls[coll]) {
        return log.warn('collection was not a good one:', coll);
    }
    var id = getIdFromDoc(v);
    coll.findOne({ _id: id }, function (err, doc) {
        if (err) {
            log.error(err);
            return;
        }
    });
});
