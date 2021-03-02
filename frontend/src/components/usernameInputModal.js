import React, { Fragment } from 'react';
import Modal from 'react-bootstrap/Modal';

const UsernameInputModal = () => {
  return (
    <Fragment>
      <Modal
        show={false}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title>Local Chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form id="usernameInputForm" noValidate>
            <div className="form-group">
              <label id="usernameInputLabel" htmlFor="usernameInput">Username</label>
              <input id="usernameInput" className="form-control" required />
              <div className="invalid-feedback">Invalid Username!</div>
            </div>
            <input type="submit" className="btn btn-primary" value="Enter Chat" />
          </form>
        </Modal.Body>
      </Modal>
    </Fragment>
  );
};

export default UsernameInputModal;
