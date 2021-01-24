const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');

// TODO Add support for nicknames. Done.
// TODO Broadcast message when a user connects or disconnects. Done.
// TODO Add option to get a list of connected users. Done
// TODO Fix the layout in mobile devices. Done.
// TODO Save username in the localStorage. Done.
// TODO Allow uploading of files. Done.
// TODO View images in chat. Done.
// TODO Fix upload button. Done.

app.use(express.static(__dirname + '/public'));

let connections = new Map();

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('userConnected', (username) => {
    connections.set(socket.id, username);
    io.emit('userConnected', { username, userList: getUsersList() });
  });

  socket.on('chatMessage', (body) => {
    let time = Date.now();
    let username = connections.get(socket.id);
    io.emit('chatMessage', { time, username, body });
  });

  socket.on('disconnect', () => {
    let username = connections.get(socket.id);
    connections.delete(socket.id);
    io.emit('userDisconnected', { username, userList: getUsersList() });
  });

  socket.on('fileUpload', (file) => {
    let time = Date.now();
    let username = connections.get(socket.id);
    fs.promises.writeFile(`./public/${file.name}`, file.buffer)
      .then(() => {
        let link = `/${file.name}`;
        io.emit('fileUpload', { time, username, link, type: file.type });
      })
      .catch(console.error)
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

function getUsersList() {
  return Array.from(connections.values());
}
