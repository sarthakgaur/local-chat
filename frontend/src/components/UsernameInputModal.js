import React, { useRef } from "react";

import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const UsernameInputModal = ({ verificationStage, handleUserNameSubmit }) => {
  const usernameInput = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUserNameSubmit(usernameInput.current.value);
  };

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
  );
};

export default UsernameInputModal;
