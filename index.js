const express = require('express');
const ejs = require('ejs');
const multer = require("multer");
const cookieParser = require("cookie-parser");
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require("path");
const fs = require('fs');

// TODO Add support for nicknames. Done.
// TODO Broadcast message when a user connects or disconnects. Done.
// TODO Add option to get a list of connected users. Done
// TODO Fix the layout in mobile devices. Done.
// TODO Save username in the localStorage. Done.
// TODO Allow uploading of files. Done.
// TODO View images in chat. Done.
// TODO Fix upload button. Done.
// TODO add Multer. Done.
// Setup Views. Done.

let connections = new Map();
let lastFileUploaded;

// Set Storage Engine
const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: (req, file, cb) => {
    let basename = path.basename(file.originalname);
    let time = Date.now();
    let extension = path.extname(file.originalname);
    let nameOfFile = `${basename}-${time}${extension}`;
    lastFileUploaded = { name: nameOfFile, type: file.mimetype }
    cb(null, nameOfFile);
  }
});

// Init Upload
const upload = multer({
  storage: storage
}).single("chatFile");

// EJS
app.set("view engine", "ejs")

// Parse Browser cookies
app.use(cookieParser());

// Public Folder
app.use(express.static('./public'));

// Static Files
app.use("/assets", express.static("assets"));

app.get('/', (req, res) => {
  res.render("index");
});

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(500).send({ message: "File upload failed." });
    } else if (req.file == undefined) {
      res.status(500).send({ message: "No file Selected." });
    } else {
      let time = Date.now();
      let username = connections.get(req.cookies["socket_id"]);
      let link = `/uploads/${lastFileUploaded.name}`;
      res.status(200).send({ message: "File uploaded successfully." });
      io.emit('fileUpload', { time, username, link, type: lastFileUploaded.type });
    }
  });
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
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

function getUsersList() {
  return Array.from(connections.values());
}
