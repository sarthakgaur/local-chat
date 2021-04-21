import React, { useRef } from 'react';

import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const UsernameInputModal = ({ validated, handleUserNameSubmit }) => {
  const usernameInput = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUserNameSubmit(usernameInput.current.value);
  };

  return (
    <>
      <Modal
        show={true}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title>Local Chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit} noValidate validated={validated}>
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" required ref={usernameInput} />
            <Form.Control.Feedback type="invalid">Invalid Username!</Form.Control.Feedback>
            <Button className="mt-3" type="submit">Enter Chat</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default UsernameInputModal;
