const express = require("express");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const morgan = require("morgan");

const db = require("./db/index");

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// Logger Setup
app.use(morgan("common"));

// Parse Browser cookies
app.use(cookieParser());

// Public Folder
app.use("/public", express.static("public"));

// Build folder
app.use(express.static(path.join(__dirname, "build")));

// Bootstrap Files
app.use("/css", express.static("./node_modules/bootstrap/dist/css"));

http.listen(3001, () => {
  console.log("listening on *:3001");
});

const connections = new Map();

function getUsersSet() {
  const usernameList = [];
  connections.forEach((value) => usernameList.push(value.username));
  console.log("usernameList", usernameList);
  return new Set(usernameList);
}

// Set Storage Engine
const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: (_, file, cb) => {
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    const time = Date.now();
    const name = `${basename}-${time}${extension}`;
    cb(null, name);
  },
});

// Init Upload
const upload = multer({
  storage: storage,
}).single("chatFile");

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
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
  socket.on("userConnected", (username) => {
    handleUserConnected(socket, username);
  });
});

function isValidUsername(username) {
  if (!username) {
    return false;
  } else if (getUsersSet().has(username)) {
    return false;
  } else {
    return true;
  }
}

async function handleUserConnected(socket, username) {
  if (isValidUsername(username)) {
    connections.set(socket.id, { username });

    const time = Date.now();
    const type = "userConnected";
    const userList = Array.from(getUsersSet());
    const info = { userList };
    const event = { time, username, type, info };

    socket.join("chatRoom");
    socket.on("disconnect", () => {
      handleDisconnect(socket);
    });
    socket.on("chatMessage", (body) => {
      handleChatMessage(socket, body);
    });
    socket.on("oldEvents", () => {
      sendOldEvents(socket);
    });
    socket.on("userTyping", () => {
      handleUserTyping(socket);
    });
    socket.emit("userVerified", event);

    await sendRecentEvents(socket);
    event.uuid = (await insertEvent(event)).event_uuid;
    io.to("chatRoom").emit("userConnected", event);
  } else {
    socket.emit("invalidUsername", { username });
  }
}

async function handleDisconnect(socket) {
  const { username } = connections.get(socket.id);
  connections.delete(socket.id);

  const time = Date.now();
  const type = "userDisconnected";
  const userList = Array.from(getUsersSet());
  const info = { userList };
  const event = { time, username, type, info };

  event.uuid = (await insertEvent(event)).event_uuid;
  io.to("chatRoom").emit("userDisconnected", event);
}

async function handleChatMessage(socket, body) {
  const time = Date.now();
  const { username } = connections.get(socket.id);
  const type = "chatMessage";
  const info = { body };
  const event = { time, username, type, info };

  event.uuid = (await insertEvent(event)).event_uuid;
  io.to("chatRoom").emit("chatMessage", event);
}

async function handleFileUpload(req, res) {
  const time = Date.now();
  const { username } = connections.get(req.cookies["socket_id"]);
  const type = "fileUpload";
  const link = `/public/uploads/${req.file.filename}`;
  const info = { link, type: req.file.mimetype };
  const event = { time, username, type, info };

  event.uuid = (await insertEvent(event)).event_uuid;
  res.status(200).send({ message: "File uploaded successfully." });
  io.to("chatRoom").emit("fileUpload", event);
}

function handleUserTyping(socket) {
  const { username } = connections.get(socket.id);
  socket.to("chatRoom").emit("userTyping", username);
}

async function sendRecentEvents(socket) {
  try {
    const query = `
    SELECT *
    FROM (SELECT 
      event_id AS id,
      event_uuid AS uuid,
      event_time AS time,
      event_user AS username,
      event_type AS type, 
      event_info AS info
      FROM events
      ORDER BY event_id DESC
      LIMIT 100) AS derived_table
    ORDER BY id ASC;
    `;
    const recentEvents = await db.query(query);
    const connection = connections.get(socket.id);
    connection.oldestRowId = recentEvents?.rows?.[0]?.id || 0;
    socket.emit("recentEvents", recentEvents.rows);
  } catch (error) {
    console.error(error.message);
  }
}

async function sendOldEvents(socket) {
  try {
    const query = `
      SELECT *
      FROM (SELECT 
        event_id AS id,
        event_uuid AS uuid,
        event_time AS time,
        event_user AS username,
        event_type AS type, 
        event_info AS info
        FROM events
        WHERE event_id < $1
        ORDER BY event_id DESC
        LIMIT 100) AS derived_table
      ORDER BY id ASC;
    `;
    const connection = connections.get(socket.id);
    const oldEvents = await db.query(query, [connection.oldestRowId]);
    connection.oldestRowId = oldEvents?.rows?.[0]?.id || connection.oldestRowId;
    socket.emit("oldEvents", oldEvents?.rows || []);
  } catch (error) {
    console.error(error.message);
  }
}

async function insertEvent({ time, username, type, info }) {
  try {
    const query = `
      INSERT INTO events (event_time, event_user, event_type, event_info)
      VALUES (to_timestamp($1 / 1000.0), $2, $3, $4)
      RETURNING *;
    `;
    return (await db.query(query, [time, username, type, info])).rows[0];
  } catch (error) {
    console.error(error.message);
  }
}
