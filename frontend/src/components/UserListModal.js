import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const UserListModal = ({ members, handleUserListModal }) => {
  return (
    <Modal show={true} onHide={() => handleUserListModal()}>
      <Modal.Header closeButton>
        <Modal.Title>Online Users</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {members.map((member, index) => (
          <div key={`${index}-${member}`}>{`${index + 1}. ${member}`}</div>
        ))}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => handleUserListModal()}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserListModal;
