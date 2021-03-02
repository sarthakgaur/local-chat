import React, { Fragment } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';

const TopBar = () => {
  return (
    <Fragment>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">Local Chat</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
          </Nav>
          <Button variant="link">User List</Button>
        </Navbar.Collapse>
      </Navbar>
    </Fragment>
  );
};

export default TopBar;
