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
// TODO Username must be unique. Done.
// TODO Add modal to client. Done.
// TODO Add modal to list users. Done.
// TODO Add bootstrap.
// TODO Add logging support.

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

// Bootstrap Files
app.use("/js", express.static("./node_modules/bootstrap/dist/js"));
app.use("/js", express.static("./node_modules/jquery/dist"));
app.use("/css", express.static("./node_modules/bootstrap/dist/css"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(500).send({ message: "File upload failed." });
    } else if (req.file == undefined) {
      res.status(500).send({ message: "No file Selected." });
    } else {
      handleFileUpload(req, res);
    }
  });
});

io.on("connection", (socket) => {
  socket.on("userConnected", async (username) => {
    if (isValidUsername(socket, username)) {
      let time = Date.now();
      let type = "userConnected";
      connections.set(socket.id, username);
      let userList = Array.from(getUsersSet());
      let info = { userList };
      let event = { time, username, type, info };
      socket.join("chatRoom");
      socket.on("disconnect", () => { handleDisconnect(socket); });
      socket.on("chatMessage", (body) => { handleChatMessage(socket, body); });
      socket.emit("userVerified", event);
      await sendOldEvents(socket);
      await insertEvent(event);
      io.to("chatRoom").emit("userConnected", event);
    } else {
      socket.emit("usernameError", { username });
    }
  });
});

function isValidUsername(socket, username) {
  if (!username) {
    return false;
  }

  if (getUsersSet().has(username)) {
    if (connections.get(socket.id) === username) {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
}

async function handleDisconnect(socket) {
  let time = Date.now();
  let username = connections.get(socket.id);
  let type = "disconnect";
  connections.delete(socket.id);
  let userList = Array.from(getUsersSet());
  let info = { userList };
  let event = { time, username, type, info };
  await insertEvent(event)
  io.to("chatRoom").emit("userDisconnected", event);
}

async function handleChatMessage(socket, body) {
  let time = Date.now();
  let username = connections.get(socket.id);
  let type = "chatMessage";
  let info = { body };
  let event = { time, username, type, info };
  await insertEvent(event)
  io.to("chatRoom").emit("chatMessage", event);
}

async function handleFileUpload(req, res) {
  let time = Date.now();
  let username = connections.get(req.cookies["socket_id"]);
  let link = `/uploads/${lastFileUploaded.name}`;
  let type = "fileUpload";
  let info = { link, type: lastFileUploaded.type };
  let event = { time, username, type, info };
  await insertEvent(event);
  res.status(200).send({ message: "File uploaded successfully." });
  io.to("chatRoom").emit("fileUpload", event);
}

async function sendOldEvents(socket) {
  try {
    let query = `
      SELECT event_time AS time,
        event_user AS username,
        event_type AS type, 
        event_info AS info
      FROM events;
    `;
    let oldEvents = await pool.query(query);
    socket.emit("oldEvents", oldEvents.rows);
  } catch (error) {
    console.error(error.message);
  }
}

async function insertEvent({ time, username, type, info }) {
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

function getUsersSet() {
  return new Set(connections.values());
}
