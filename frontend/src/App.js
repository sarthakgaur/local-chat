import React, { Fragment } from 'react';
import './App.css';

import TopBar from './components/topBar';
import Messages from './components/messages';
import UsernameInputModal from './components/usernameInputModal';
import UserListModal from './components/userListModal';
import FileUploadToast from './components/fileUploadToast';
import ChatInput from  "./components/chatInput";

function App() {
  return (
    <Fragment>
      <TopBar />
      <Messages />
      <UsernameInputModal />
      <UserListModal />
      <FileUploadToast />
      <ChatInput />
    </Fragment>
  );
}

export default App;
