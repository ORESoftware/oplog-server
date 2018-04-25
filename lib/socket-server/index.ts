import * as Server from 'socket.io';
import {Socket} from "socket.io";

const io = Server();
io.listen(3000);

export const connections = new Map<Socket,Socket>();

io.on('connection', function (c) {
  
  connections.set(c, c);
  
  c.once('disconnect', function () {
    connections.delete(c);
  });
  
});
