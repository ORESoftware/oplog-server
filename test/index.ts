import net = require('net');
import JSONStdio = require('json-stdio');
import {getOplogStreamInterpreter} from 'oplog.rx';

const c = net.createConnection(6969, 'localhost');

const jsonParser = JSONStdio.createParser();
const strm = c.pipe(jsonParser);
const {ops, emitter} = getOplogStreamInterpreter(strm);


// ops.delete.subscribe(v => {
//   console.log('delete happened.');
// });
//
// ops.insert.subscribe(v => {
//   console.log('insert happened.');
// });
//
// ops.update.subscribe(v => {
//   console.log('update happened.');
// });


emitter.on('update', function(){
  console.log('update happened.');
});

emitter.on('delete', function () {
  console.log('delete happened.');
});

emitter.on('insert', function () {
  console.log('insert happened.');
  
});