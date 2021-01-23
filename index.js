const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// TODO Add support for nicknames. Done.
// TODO Broadcast message when a user connects or disconnects. Done.

let connections = new Map();

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('userConnected', (username) => {
    connections.set(socket.id, username);
    io.emit('userConnected', username);
  });

  socket.on('chatMessage', (body) => {
    let time = Date.now();
    let username = connections.get(socket.id);
    io.emit('chatMessage', { time, username, body });
  });

  socket.on('disconnect', () => {
    let username = connections.get(socket.id);
    connections.delete(socket.id);
    io.emit('userDisconnected', username);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
