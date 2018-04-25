import {OplogDoc} from 'oplog.rx';
import {oplog} from './oplog';
import {connections} from "./socket-server";
import {client} from "./mongo-client";

const {del, insert, update} = oplog.getOps();

const getCollection = function (v: OplogDoc) {
  return String(v.ns).split('.')[1];
};

const colls = {
  users: true,
  categories: true,
  roles: true,
  functionalTeams: true,
  workstreams: true,
  prompts: true,
  responses: true,
  
};

const db = client.db('local');

const getIdFromDoc = function (v: OplogDoc) {
  return v && v.o && v.o._id;
};

del.subscribe(function (v: OplogDoc) {
  
  const coll = getCollection(v);
  
});

insert.subscribe(function (v: OplogDoc) {
  
  const coll = getCollection(v);
  
});

update.subscribe(function (v: OplogDoc) {
  
  const coll = db.collection(getCollection(v));
  
  if (!colls[coll]) {
    return log.warn('collection was not a good one:', coll);
  }
  const id = getIdFromDoc(v);
  
  coll.findOne({_id: id}, function (err, doc) {
      if(err){
        log.error(err);
        return;
      }
  });
  
});
