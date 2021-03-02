import React, { Fragment, useEffect } from 'react';
import './App.css';

import TopBar from './components/topBar';
import Messages from './components/messages';
import UsernameInputModal from './components/usernameInputModal';
import UserListModal from './components/userListModal';
import FileUploadToast from './components/fileUploadToast';
import ChatInput from './components/chatInput';

import { SocketContext, socket } from './context/socket';

const App = () => {

  useEffect(() => {
    socket.on('connect', () => {
      console.log("Connected!");
    });
  }, []);

  return (
    <Fragment>
      <SocketContext.Provider value={socket}>
        <TopBar />
        <Messages />
        <UsernameInputModal />
        <UserListModal />
        <FileUploadToast />
        <ChatInput />
      </SocketContext.Provider>
    </Fragment >
  );
};

export default App;
