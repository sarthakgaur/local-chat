import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const UserListModal = ({ users, handleUserListModal }) => {
  return (
    <Modal show={true} onHide={handleUserListModal}>
      <Modal.Header closeButton>
        <Modal.Title>Online Users</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {users.map((user, index) => (
          <div key={`${index}-${user}`}>{`${index + 1}. ${user}`}</div>
        ))}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleUserListModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserListModal;
