'use strict';

import * as Server from 'socket.io';
import {Socket} from "socket.io";
import log from 'bunion';

const io = Server();
io.listen(3000);

export const connections = new Map<Socket, Socket>();

io.on('connection', function (c) {
  
  log.debug('new client connection.');
  
  connections.set(c, c);
  
  c.once('disconnect', function () {
    log.debug('client disconnected.');
    connections.delete(c);
  });
  
});
