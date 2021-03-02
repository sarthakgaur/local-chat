import React, { Fragment } from 'react';
import Toast from 'react-bootstrap/Toast';

const FileUploadToast = () => {
  return (
    <Fragment>
      <Toast
        style={{
          width: '200px'
        }}
        show={false}
        >
        <Toast.Header>
          <strong className="mr-auto">
            File Uploaded!
          </strong>
        </Toast.Header>
      </Toast>
    </Fragment>
  );
};

export default FileUploadToast;
