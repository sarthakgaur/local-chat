import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";

const TopBar = ({ handleUserListModal }) => {
  return (
    <Navbar bg="light" expand="lg" className="fixed-top">
      <Navbar.Brand>Local Chat</Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto"></Nav>
        <Button variant="link" onClick={() => handleUserListModal()}>
          User List
        </Button>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default TopBar;
