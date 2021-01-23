const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// TODO Add support for nicknames

let connections = new Map();

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('username', (username) => {
    connections.set(socket.id, username);
  });

  socket.on('chat message', (body) => {
    let time = Date.now();
    let username = connections.get(socket.id);

    io.emit('chat message', { time, username, body });
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
