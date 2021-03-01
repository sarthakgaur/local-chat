import React, { Fragment } from 'react';

const UserListModal = () => {
  return (
    <Fragment>
      <div className="modal fade" id="userListModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Online Users</h5>
              <button type="button" className="close" data-dismiss="modal">
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <ol id="userList" className="list-group list-group-flush"></ol>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default UserListModal;
