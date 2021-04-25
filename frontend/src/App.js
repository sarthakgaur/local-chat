import React, { useEffect, useContext, useState } from "react";
import SocketContext from "./context/socket";

import TopBar from "./components/TopBar";
import Messages from "./components/Messages";
import UsernameInputModal from "./components/UsernameInputModal";
import ChatInput from "./components/ChatInput";

const App = () => {
  const socket = useContext(SocketContext);
  const [verificationStage, setVerificationStage] = useState();

  const handleUserNameSubmit = (username) => {
    if (username) {
      socket.emit("userConnected", username);
    } else {
      setVerificationStage("failed");
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      const username = localStorage.getItem("username");
      if (username) {
        socket.emit("userConnected", username);
      }
    });

    socket.on("invalidUsername", () => {
      setVerificationStage("failed");
    });

    socket.on("userVerified", (event) => {
      document.cookie = `socket_id=${socket.id};SameSite=Strict`;
      localStorage.setItem("username", event.username);
      setVerificationStage("success");
    });
  }, []);

  return (
    <>
      <TopBar />
      <Messages />
      {verificationStage !== "success" && (
        <UsernameInputModal
          verificationStage={verificationStage}
          handleUserNameSubmit={handleUserNameSubmit}
        />
      )}
      <ChatInput />
    </>
  );
};

export default App;
