import React, { useEffect, useContext, useState } from "react";
import SocketContext from "./context/socket";

import TopBar from "./components/TopBar";
import Messages from "./components/Messages";
import UsernameInputModal from "./components/UsernameInputModal";
import UserListModal from "./components/UserListModal";
import ChatInput from "./components/ChatInput";

const App = () => {
  const socket = useContext(SocketContext);

  const [showUserListModal, setShowUserListModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [verificationStage, setVerificationStage] = useState();

  const handleUserListModal = () => {
    setShowUserListModal(!showUserListModal);
  };

  const handleUserNameSubmit = (username) => {
    if (username) {
      socket.emit("userConnected", username);
    } else {
      setVerificationStage("failed");
    }
  };

  useEffect(() => {
    const handleUserConnected = (event) => {
      setMembers(event.info.userList);
    };

    const handleUserDisconnected = (event) => {
      setMembers(event.info.userList);
    };

    socket.on("connect", () => {
      const username = localStorage.getItem("username");
      if (username) {
        socket.emit("userConnected", username);
      }
    });

    socket.on("userConnected", handleUserConnected);
    socket.on("userDisconnected", handleUserDisconnected);

    socket.on("invalidUsername", () => {
      setVerificationStage("failed");
    });

    socket.on("userVerified", (event) => {
      document.cookie = `socket_id=${socket.id};SameSite=Strict`;
      localStorage.setItem("username", event.username);
      setVerificationStage("success");
    });

    socket.on("oldEvents", (events) => {
      events.forEach((event) => {
        switch (event.type) {
          case "userConnected":
            handleUserConnected(event);
            break;
          case "userDisconnected":
            handleUserDisconnected(event);
            break;
          default:
            break;
        }
      });
    });
  }, []);

  return (
    <>
      <TopBar handleUserListModal={handleUserListModal} />
      {showUserListModal && (
        <UserListModal
          members={members}
          handleUserListModal={handleUserListModal}
        />
      )}
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
