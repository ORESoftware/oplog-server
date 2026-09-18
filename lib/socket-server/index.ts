'use strict';

import {Server, Socket} from 'socket.io';
import log from 'bunion';

export const io = new Server(3000, {
  allowEIO3: true
});

export const connections = new Map<Socket, Socket>();

io.on('connection', function (c) {

  log.debug('new client connection.');

  connections.set(c, c);

  c.once('disconnect', function () {
    log.debug('client disconnected.');
    connections.delete(c);
  });

});
