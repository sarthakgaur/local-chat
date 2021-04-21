import React from 'react';
import socketio from "socket.io-client";

export const socket = socketio.connect("/");
const SocketContext = React.createContext();

export default SocketContext;
