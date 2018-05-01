import net = require('net');
import JSONStdio = require('json-stdio');
import {oplog} from "../oplog";
import log from 'bunion';

// *** Open A Change Stream ***
// You can only open a change stream against replica sets or sharded clusters.
// For a sharded cluster, you must issue the open change stream operation against the mongos.
// https://docs.mongodb.com/manual/changeStreams/




const transform2JSON = JSONStdio.transformObject2JSON();
const t = oplog.getFilteredStream({}).pipe(transform2JSON);

log.info('beginning to stream oplog.');

export const clientMap = new Map();

export const s = net.createServer(function (socket) {
  
  console.log('client connected.');
  
  clientMap.set(socket, socket);
  t.pipe(socket);
  
  socket.once('close', function () {
    console.log('client closed.');
    clientMap.delete(socket);
  });
});


s.listen(6969);





