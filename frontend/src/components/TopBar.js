import React, { useContext, useEffect, useState } from "react";
import SocketContext from "../context/socket";

import UserListModal from "../components/UserListModal";

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";

const TopBar = () => {
  const socket = useContext(SocketContext);
  const [users, setUsers] = useState([]);
  const [showUserListModal, setShowUserListModal] = useState(false);

  const handleUserListModal = () => {
    setShowUserListModal(!showUserListModal);
  };

  useEffect(() => {
    const setNewUsers = (event) => {
      setUsers(event.info.userList);
    };

    socket.on("userConnected", setNewUsers);
    socket.on("userDisconnected", setNewUsers);

    return () => {
      socket.off("userConnected", setNewUsers);
      socket.off("userDisconnected", setNewUsers);
    };
  }, [socket]);

  return (
    <>
      <Navbar bg="light" expand="lg" className="fixed-top">
        <Navbar.Brand>Local Chat</Navbar.Brand>
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
