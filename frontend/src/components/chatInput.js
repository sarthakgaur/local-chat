import React, { Fragment } from 'react';

const ChatInput = () => {
  return (
    <Fragment>
      <form id="chatForm" className="fixed-bottom">
        <div className="input-group">
          <input id="chatInput" className="form-control" autoComplete="off" />
          <input id="selectFileButton" type="file" className="d-none" />
          <div className="input-group-append" role="group">
            <button id="uploadButton" className="btn btn-secondary" type="button">Upload</button>
            <input className="btn btn-primary" type="submit" value="Send" />
          </div>
        </div>
      </form>
    </Fragment>
  );
};

export default ChatInput;
