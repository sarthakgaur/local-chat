import React, { useEffect, useContext } from "react";
import SocketContext from "./context/socket";

import TopBar from "./components/TopBar";
import Messages from "./components/Messages";
import UsernameInputModal from "./components/UsernameInputModal";
import ChatInput from "./components/ChatInput";

const App = () => {
  const socket = useContext(SocketContext);

  useEffect(() => {
    socket.on("connect", () => {
      const username = localStorage.getItem("username");
      if (username) {
        socket.emit("userConnected", username);
      }
    });
  }, [socket]);

  return (
    <>
      <TopBar />
      <Messages />
      <UsernameInputModal />
      <ChatInput />
    </>
  );
};

export default App;
