import React, { useContext, useEffect, useRef, useState } from "react";
import SocketContext from "../context/socket";

import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const UsernameInputModal = () => {
  const socket = useContext(SocketContext);
  const [verificationStage, setVerificationStage] = useState();
  const usernameInput = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    const username = usernameInput.current.value;

    if (username) {
      socket.emit("userConnected", username);
    } else {
      setVerificationStage("failed");
    }
  };

  useEffect(() => {
    const handleInvalidUsername = () => {
      setVerificationStage("failed");
    };

    const handleUserVerified = (event) => {
      document.cookie = `socket_id=${socket.id};SameSite=Strict`;
      localStorage.setItem("username", event.username);
      setVerificationStage("success");
    };

    socket.on("invalidUsername", handleInvalidUsername);
    socket.on("userVerified", handleUserVerified);

    return () => {
      socket.off("invalidUsername", handleInvalidUsername);
      socket.off("userVerified", handleUserVerified);
    };
  }, [socket]);

  const showFeedback = () => {
    if (verificationStage === "failed") {
      return (
        <small className="mt-2 mb-0 text-danger d-block">
          Invalid Username!
        </small>
      );
    }
    return null;
  };

  return (
    <>
      {verificationStage !== "success" && (
        <Modal show={true} backdrop="static" keyboard={false}>
          <Modal.Header>
            <Modal.Title>Local Chat</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" required ref={usernameInput} />
              {showFeedback()}
              <Button className="mt-2" type="submit">
                Enter Chat
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default UsernameInputModal;
