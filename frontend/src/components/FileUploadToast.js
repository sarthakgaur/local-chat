import React from 'react';
import Toast from 'react-bootstrap/Toast';

const FileUploadToast = ({ handleFileUploadToast }) => {
  return (
    <>
      <Toast
        show={true}
        onClose={() => handleFileUploadToast()}
      >
        <Toast.Header className="p-2">
          File Uploaded!
        </Toast.Header>
      </Toast>
    </>
  );
};

export default FileUploadToast;
