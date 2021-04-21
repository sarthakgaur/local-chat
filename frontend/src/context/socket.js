import React from 'react';
import socketio from "socket.io-client";

export const socket = socketio.connect("http://localhost:3001");
const SocketContext = React.createContext();

export default SocketContext;
