import React, { Fragment } from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

const ChatInput = () => {
  return (
    <Fragment>
      <Form className="fixed-bottom">
        <InputGroup>
          <FormControl></FormControl>
          <InputGroup.Append>
            <button id="uploadButton" className="btn btn-secondary" type="button">Upload</button>
            <input className="btn btn-primary" type="submit" value="Send" />
          </InputGroup.Append>
        </InputGroup>
      </Form>
    </Fragment>
  );
};

export default ChatInput;
