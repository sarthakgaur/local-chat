import React, { useRef } from "react";

import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

const ChatInput = ({
  onChatInputSubmit,
  fileUploadLabel,
  handleFileUpload,
}) => {
  const chatInput = useRef();
  const chatFileInput = useRef();

  const setUploadLabel = () => {
    if (fileUploadLabel === "selected") {
      return "1 File Selected";
    } else if (fileUploadLabel === "spinner") {
      return (
        <>
          <Spinner animation="border" variant="light" size="sm" />
          <span> Uploading...</span>
        </>
      );
    }
    return "Upload";
  };

  const changeUploadLabel = () => {
    if (chatFileInput.current.files.length > 0) {
      handleFileUpload("selected");
    } else {
      handleFileUpload("upload");
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    onChatInputSubmit({
      value: chatInput.current.value,
      file: chatFileInput.current.files[0],
    });
    chatInput.current.value = "";
    chatFileInput.current.value = "";
  };

  return (
    <Form className="fixed-bottom" onSubmit={onSubmit}>
      <InputGroup>
        <FormControl ref={chatInput}></FormControl>
        <InputGroup.Append>
          <Button
            className="btn-secondary"
            onClick={() => {
              chatFileInput.current.click();
            }}
          >
            {setUploadLabel()}
          </Button>
          <input
            type="file"
            className="d-none"
            onInput={() => {
              changeUploadLabel();
            }}
            ref={chatFileInput}
          />
          <Button className="btn-primary" type="submit">
            Send
          </Button>
        </InputGroup.Append>
      </InputGroup>
    </Form>
  );
};

export default ChatInput;
