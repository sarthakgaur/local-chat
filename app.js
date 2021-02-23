const express = require("express");
const ejs = require("ejs");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const pool = require("./config/database");
const path = require("path");
const fs = require("fs");

// TODO Add support for nicknames. Done.
// TODO Broadcast message when a user connects or disconnects. Done.
// TODO Add option to get a list of connected users. Done
// TODO Fix the layout in mobile devices. Done.
// TODO Save username in the localStorage. Done.
// TODO Allow uploading of files. Done.
// TODO View images in chat. Done.
// TODO Fix upload button. Done.
// TODO add Multer. Done.
// TODO Setup Views. Done.
// TODO Add a link if chat message contains a url. Done.
// TODO Add a database to save last 100 messages. Done.
// TODO Uploaded files and images should be rendered along with messages. Done.

let connections = new Map();
let lastFileUploaded;

// Set Storage Engine
const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: (req, file, cb) => {
    let basename = path.basename(file.originalname);
    let time = Date.now();
    let extension = path.extname(file.originalname);
    let name = `${basename}-${time}${extension}`;
    lastFileUploaded = { name, type: file.mimetype };
    cb(null, name);
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
app.use(express.static("./public"));

// Static Files
app.use("/assets", express.static("assets"));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      res.status(500).send({ message: "File upload failed." });
    } else if (req.file == undefined) {
      res.status(500).send({ message: "No file Selected." });
    } else {
      let time = Date.now();
      let username = connections.get(req.cookies["socket_id"]);
      let link = `/uploads/${lastFileUploaded.name}`;
      await insertEvent(time, username, "fileUpload", { link, type: lastFileUploaded.type });
      res.status(200).send({ message: "File uploaded successfully." });
      io.emit("fileUpload", { time, username, info: { link, type: lastFileUploaded.type } });
    }
  });
});

io.on("connection", (socket) => {
  socket.on("userConnected", async (username) => {
    let time = Date.now();
    let userList = getUsersList();
    connections.set(socket.id, username);
    await sendOldMessages(socket);
    await insertEvent(time, username, "userConnected", { userList });
    io.emit("userConnected", { username, info: { userList } });
  });

  socket.on("disconnect", async () => {
    let time = Date.now();
    let username = connections.get(socket.id);
    let userList = getUsersList();
    connections.delete(socket.id);
    await insertEvent(time, username, "disconnect", { userList })
    io.emit("userDisconnected", { username, info: { userList } });
  });

  socket.on("chatMessage", async (body) => {
    let time = Date.now();
    let username = connections.get(socket.id);
    await insertEvent(time, username, "chatMessage", { body })
    io.emit("chatMessage", { time, username, info: { body } });
  });
});

async function sendOldMessages(socket) {
  try {
    let query = `
      SELECT event_time AS time,
        event_user AS username,
        event_type AS type, 
        event_info AS info
      FROM events;
    `;
    let oldMessages = await pool.query(query);
    console.log(oldMessages.rows);
    socket.emit("oldMessages", oldMessages.rows);
  } catch (error) {
    console.error(error.message);
  }
}

async function insertEvent(time, username, type, info) {
  try {
    let query = `
      INSERT INTO events (event_time, event_user, event_type, event_info)
      VALUES (to_timestamp($1 / 1000.0), $2, $3, $4)
      RETURNING *;
    `;
    await pool.query(query, [time, username, type, info]);
  } catch (error) {
    console.error(error.message);
  }
}

http.listen(3000, () => {
  console.log("listening on *:3000");
});

function getUsersList() {
  return Array.from(connections.values());
}
