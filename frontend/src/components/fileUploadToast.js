import React, { Fragment } from 'react';

const FileUploadToast = () => {
  return (
    <Fragment>
      <div id="toastWrapper">
        <div id="liveToast" className="toast hide" role="alert" data-delay="2000">
          <div className="alert alert-success mb-0" role="alert">
            File Uploaded!
            <button type="button" className="ml-2 mb-1 close" data-dismiss="toast">
              <span>&times;</span>
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default FileUploadToast;
