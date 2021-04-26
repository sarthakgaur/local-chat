import React, { useContext, useRef, useState } from "react";

import SocketContext from "../context/socket";
import debounce from "../utils/debounce";
import FileUploadToast from "./FileUploadToast";

import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

const ChatInput = () => {
  const socket = useContext(SocketContext);

  const [fileUploadLabel, setfileUploadLabel] = useState("Upload");
  const [showFileUploadToast, setShowFileUploadToast] = useState(false);

  const chatInput = useRef();
  const chatFileInput = useRef();

  const handleFileUploadToast = () => {
    setShowFileUploadToast(!showFileUploadToast);
  };

  const handleChatInputChange = debounce(() => {
    socket.emit("userTyping");
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const value = chatInput.current.value;
    const file = chatFileInput.current.files[0];

    if (value) {
      socket.emit("chatMessage", value);
    }

    if (file) {
      const formData = new FormData();
      formData.append("chatFile", file);
      setfileUploadLabel(
        <>
          <Spinner animation="border" variant="light" size="sm" />
          <span> Uploading...</span>
        </>
      );

      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      if (response.status === 200) {
        setShowFileUploadToast(true);
        setTimeout(() => {
          setShowFileUploadToast(false);
        }, 2000);
      }
      setfileUploadLabel("Upload");
    }

    chatInput.current.value = "";
    chatFileInput.current.value = "";
  };

  const handleFileInput = () => {
    if (chatFileInput.current.files.length > 0) {
      setfileUploadLabel("1 File Selected");
    } else {
      setfileUploadLabel("Upload");
    }
  };

  return (
    <>
      {showFileUploadToast && (
        <FileUploadToast handleFileUploadToast={handleFileUploadToast} />
      )}
      <Form className="fixed-bottom" onSubmit={handleSubmit}>
        <InputGroup>
          <FormControl
            ref={chatInput}
            onChange={handleChatInputChange}
          ></FormControl>
          <InputGroup.Append>
            <Button
              className="btn-secondary"
              onClick={() => {
                chatFileInput.current.click();
              }}
            >
              {fileUploadLabel}
            </Button>
            <input
              type="file"
              className="d-none"
              onInput={handleFileInput}
              ref={chatFileInput}
            />
            <Button className="btn-primary" type="submit">
              Send
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </Form>
    </>
  );
};

export default ChatInput;
