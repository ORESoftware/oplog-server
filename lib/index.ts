'use strict';

import {OplogDoc} from 'oplog.rx';
import {oplog} from './oplog';
import {connections} from "./socket-server";
import {client} from "./mongo-client";
import log from 'bunion';

const {del, insert, update} = oplog.getOps();

const getCollection = function (v: OplogDoc) {
  return String(v.ns).split('.')[1];
};

log.info('loading the oplog');

const validColls = <{ [key: string]: boolean }>{
  users: true,
  categories: true,
  roles: true,
  functionalTeams: true,
  workstreams: true,
  prompts: true,
  responses: true,
  assignments: true
};

const getIdFromDoc = function (v: OplogDoc) {
  return v && v.o && v.o._id;
};

const ops = {
  'i': 'insert',
  'u': 'uddate',
  'd': 'delete'
};

const getOperation = function (v: OplogDoc) {
  return v && ops[v.op] || 'unknown';
};

client.once('connect', function () {
  
  const db = client.db('local');
  
  del.subscribe(function (v: OplogDoc) {
    
    const collName = getCollection(v);
    const op = getOperation(v);
    const id = getIdFromDoc(v);
  
    if(op !== 'delete'){
      log.error('operation was expected to be a "delete", but was not:', op);
      return;
    }
  
    connections.forEach(function (v, k, m) {
      v.send({
        operation: op,
        collection: collName,
        value: id
      });
    });
  
  });
  
  insert.subscribe(function (doc: OplogDoc) {
    
    const collName = getCollection(doc);
    const op = getOperation(doc);
    const id = getIdFromDoc(doc);
    
    if(op !== 'insert'){
      log.error('operation was expected to be an insert, but was not:', op);
    }
  
    connections.forEach(function (v, k, m) {
      v.send({
        operation: op,
        collection: collName,
        value: doc.o
      });
    });
  
  
  });
  
  update.subscribe(function (doc: OplogDoc) {
    
    const collName = getCollection(doc);
    const coll = db.collection(collName);
    const op = getOperation(doc);
    const id = getIdFromDoc(doc);
  
  
    if(op !== 'update'){
      log.error('operation was expected to be an update, but was not:', op);
      return;
    }
    
    if (!validColls[collName]) {
      log.warn('collection was not a good one:', coll);
      return;
    }
    
    coll.findOne({_id: id}, function (err: any, m: any) {
      
      if (err) {
        log.error(err);
        return;
      }
      
      connections.forEach(function (v, k) {
        v.send({
          operation: op,
          collection: collName,
          value: m
        });
      });
      
    });
    
  });
  
});






