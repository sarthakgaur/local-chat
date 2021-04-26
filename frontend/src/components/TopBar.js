import React, { useContext, useEffect, useRef, useState } from "react";
import SocketContext from "../context/socket";

import UserListModal from "../components/UserListModal";

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";

const TopBar = () => {
  const socket = useContext(SocketContext);
  const [users, setUsers] = useState([]);
  const [userTypingMessage, setUserTypingMessage] = useState(null);
  const [showUserListModal, setShowUserListModal] = useState(false);
  const timeoutScheduled = useRef(null);

  const handleUserListModal = () => {
    setShowUserListModal(!showUserListModal);
  };

  useEffect(() => {
    const setNewUsers = (event) => {
      setUsers(event.info.userList);
    };

    const handleUserTyping = (username) => {
      clearTimeout(timeoutScheduled.current);
      setUserTypingMessage(`${username} is typing...`);
      timeoutScheduled.current = setTimeout(() => {
        setUserTypingMessage(null);
      }, 1000);
    };

    socket.on("userConnected", setNewUsers);
    socket.on("userDisconnected", setNewUsers);
    socket.on("userTyping", handleUserTyping);

    return () => {
      socket.off("userConnected", setNewUsers);
      socket.off("userDisconnected", setNewUsers);
      socket.off("userTyping", handleUserTyping);
    };
  }, [socket]);

  return (
    <>
      <Navbar bg="light" expand="lg" className="fixed-top">
        <Navbar.Brand>Local Chat</Navbar.Brand>
        <small className="text-muted ml-2">{userTypingMessage}</small>
        <Navbar.Toggle />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto"></Nav>
          <Button variant="link" onClick={handleUserListModal}>
            User List
          </Button>
        </Navbar.Collapse>
      </Navbar>
      {showUserListModal && (
        <UserListModal
          users={users}
          handleUserListModal={handleUserListModal}
        />
      )}
    </>
  );
};

export default TopBar;
