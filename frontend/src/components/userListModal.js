import React, { Fragment } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const UserListModal = () => {
  return (
    <Fragment>
      <Modal
        show={false}>
        <Modal.Dialog>
          <Modal.Header closeButton>
            <Modal.Title>Online Users</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <ol id="userList" className="list-group list-group-flush"></ol>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary">Close</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal>
    </Fragment>
  );
};

export default UserListModal;
