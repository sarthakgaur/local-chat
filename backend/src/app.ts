import express, { Request, Response } from "express";
import http from "http";
import path from "path";

import socketio from "socket.io";

import multer from "multer";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import * as db from "./db/index";

const app = express();
const httpServer = http.createServer(app);
const io = new socketio.Server();
io.attach(httpServer);

// Logger Setup
app.use(morgan("common"));

// Parse Browser cookies
app.use(cookieParser());

// Public Folder
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Build folder
app.use(express.static(path.join(__dirname, "../build")));

// Bootstrap Files
app.use(
  "/css",
  express.static(path.join(__dirname, "../node_modules/bootstrap/dist/css"))
);

httpServer.listen(3001, () => {
  console.log("listening on *:3001");
});

interface ConnectionInfo {
  username: string;
  oldestRowId?: number;
}

interface EventInfo {
  userList?: Array<string>;
  body?: string;
  link?: string;
  type?: string;
}

interface Event {
  username: string;
  time: number;
  type: string;
  info: EventInfo;
  uuid?: string;
}

const connections: Map<string, ConnectionInfo> = new Map();

function getUsersSet() {
  const usernameList: Array<string> = [];
  connections.forEach((value: ConnectionInfo) =>
    usernameList.push(value.username)
  );
  return new Set(usernameList);
}

// Set Storage Engine
const storage = multer.diskStorage({
  destination: "./uploads",
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
  res.sendFile(path.join(__dirname, "../build/index.html"));
});

app.post("/upload", (req, res) => {
  upload(req, res, (err: any) => {
    if (err) {
      res.status(500).send({ message: "File upload failed." });
    } else if (req.file == undefined) {
      res.status(500).send({ message: "No file Selected." });
    } else {
      handleFileUpload(req, res);
    }
  });
});

io.on("connection", (socket: socketio.Socket) => {
  socket.on("userConnected", (username: string) => {
    handleUserConnected(socket, username);
  });
});

function isValidUsername(username: string) {
  if (!username) {
    return false;
  } else if (getUsersSet().has(username)) {
    return false;
  } else {
    return true;
  }
}

async function handleUserConnected(socket: socketio.Socket, username: string) {
  if (isValidUsername(username)) {
    connections.set(socket.id, { username });

    const time = Date.now();
    const type = "userConnected";
    const userList = Array.from(getUsersSet());
    const info = { userList };
    const event: Event = { time, username, type, info };

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

async function handleDisconnect(socket: socketio.Socket) {
  const { username } = connections.get(socket.id) as ConnectionInfo;
  connections.delete(socket.id);

  const time = Date.now();
  const type = "userDisconnected";
  const userList = Array.from(getUsersSet());
  const info = { userList };
  const event: Event = { time, username, type, info };

  event.uuid = (await insertEvent(event)).event_uuid;
  io.to("chatRoom").emit("userDisconnected", event);
}

async function handleChatMessage(socket: socketio.Socket, body: string) {
  const time = Date.now();
  const { username } = connections.get(socket.id) as ConnectionInfo;
  const type = "chatMessage";
  const info = { body };
  const event: Event = { time, username, type, info };

  event.uuid = (await insertEvent(event)).event_uuid;
  io.to("chatRoom").emit("chatMessage", event);
}

async function handleFileUpload(req: Request, res: Response) {
  const time = Date.now();
  const { username } = connections.get(
    req.cookies["socket_id"]
  ) as ConnectionInfo;
  const type = "fileUpload";
  const link = `/uploads/${req.file.filename}`;
  const info = { link, type: req.file.mimetype };
  const event: Event = { time, username, type, info };

  event.uuid = (await insertEvent(event)).event_uuid;
  res.status(200).send({ message: "File uploaded successfully." });
  io.to("chatRoom").emit("fileUpload", event);
}

function handleUserTyping(socket: socketio.Socket) {
  const { username } = connections.get(socket.id) as ConnectionInfo;
  socket.to("chatRoom").emit("userTyping", username);
}

async function sendRecentEvents(socket: socketio.Socket) {
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
    const connection = connections.get(socket.id) as ConnectionInfo;
    connection.oldestRowId = recentEvents.rows[0].id || 0;
    socket.emit("recentEvents", recentEvents.rows);
  } catch (error) {
    console.error(error.message);
  }
}

async function sendOldEvents(socket: socketio.Socket) {
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
    const connection = connections.get(socket.id) as ConnectionInfo;
    const oldEvents = await db.query(query, [connection.oldestRowId]);
    connection.oldestRowId = oldEvents.rows[0].id || connection.oldestRowId;
    socket.emit("oldEvents", oldEvents?.rows || []);
  } catch (error) {
    console.error(error.message);
  }
}

async function insertEvent({ time, username, type, info }: Event) {
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
