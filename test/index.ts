import net = require('net');
import JSONStdio = require('json-stdio');
import {getOplogStreamInterpreter} from 'oplog.rx';

const c = net.connect(6969, 'localhost');
const jsonParser = JSONStdio.createParser();
const strm = c.pipe(jsonParser);
const {ops: {del,insert,update}, emitter} = getOplogStreamInterpreter(strm);


del.subscribe(v => {
  console.log('delete happened 1.');
});

insert.subscribe(v => {
  console.log('insert happened 1.');
});

update.subscribe(v => {
  console.log('update happened 1.');
});


emitter.on('update', function(v){
  console.log('update happened 2.',v);
});

emitter.on('delete', function (v) {
  console.log('delete happened 2.',v);
});

emitter.on('insert', function (v) {
  console.log('insert happened 2.',v);
});