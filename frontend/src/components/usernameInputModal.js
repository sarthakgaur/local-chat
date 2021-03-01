import React, { Fragment } from 'react';

const UsernameInputModal = () => {
  return (
    <Fragment>
      <div className="modal fade" id="usernameInputModal" data-backdrop="static" data-keyboard="false" tabIndex="-1" >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Local Chat</h5>
            </div>
            <div className="modal-body">
              <form id="usernameInputForm" noValidate>
                <div className="form-group">
                  <label id="usernameInputLabel" htmlFor="usernameInput">Username</label>
                  <input id="usernameInput" className="form-control" required />
                  <div className="invalid-feedback">Invalid Username!</div>
                </div>
                <input type="submit" className="btn btn-primary" value="Enter Chat" />
              </form>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default UsernameInputModal;
