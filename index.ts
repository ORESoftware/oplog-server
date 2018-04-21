import net = require('net');
export const clientMap = new Map();
import {ObservableOplog} from 'oplog.rx';
import JSONStdio = require('json-stdio');

// *** Open A Change Stream ***
// You can only open a change stream against replica sets or sharded clusters.
// For a sharded cluster, you must issue the open change stream operation against the mongos.
// https://docs.mongodb.com/manual/changeStreams/

const oplog = new ObservableOplog();

oplog.tail().then(function () {
  console.log('successfully started tailing the oplog.');
})
.catch(function (err: any) {
  console.error('error while attempting to tail the oplog:', err.message || err);
});

const transform2JSON = JSONStdio.transformObject2JSON();
const t = oplog.getFilteredStream({}).pipe(transform2JSON);

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





