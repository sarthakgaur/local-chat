import React, { useEffect, useContext, useState } from 'react';
import SocketContext from './context/socket';

import TopBar from './components/TopBar';
import Messages from './components/Messages';
import UsernameInputModal from './components/UsernameInputModal';
import UserListModal from './components/UserListModal';
import FileUploadToast from './components/FileUploadToast';
import ChatInput from './components/ChatInput';

const App = () => {
  const socket = useContext(SocketContext);

  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [showUserListModal, setShowUserListModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [validated, setValidated] = useState(false);
  const [showFileUploadToast, setShowFileUploadToast] = useState(false);
  const [fileUploadLabel, setfileUploadLabel] = useState('upload');

  const handleFileUpload = (type) => {
    setfileUploadLabel(type);
  };

  const handleUserListModal = () => {
    setShowUserListModal(!showUserListModal);
  };

  const handleUserNameSubmit = (username) => {
    if (username) {
      socket.emit('userConnected', username);
    } else {
      setValidated(true);
    }
  };

  const onChatInputSubmit = async (input) => {
    if (input.value) {
      socket.emit('chatMessage', input.value);
    }

    if (input.file) {
      const formData = new FormData();
      formData.append("chatFile", input.file);
      setfileUploadLabel('spinner');

      const response = await fetch("/upload", { method: "POST", body: formData });

      if (response.status === 200) {
        setShowFileUploadToast(true);
        setTimeout(() => { setShowFileUploadToast(false) }, 2000);
      }
      setfileUploadLabel('upload');
    }
  };

  const handleFileUploadToast = () => {
    setShowFileUploadToast(!showFileUploadToast);
  };

  useEffect(() => {
    const handleUserConnected = (event) => {
      setMembers(event.info.userList);
      setEvents((events) => events.concat(event));
    };

    const handleUserDisconnected = (event) => {
      setMembers(event.info.userList);
      setEvents((events) => events.concat(event));
    };

    const handleChatMessage = (event) => {
      setEvents((events) => events.concat(event));
    };

    const handleFileUpload = (event) => {
      setEvents((events) => events.concat(event));
    }

    socket.on('connect', () => {
      if (username) {
        socket.emit("userConnected", username);
      }
    });

    socket.on('userConnected', handleUserConnected);

    socket.on('userDisconnected', handleUserDisconnected);

    socket.on('chatMessage', handleChatMessage);

    socket.on('fileUpload', handleFileUpload);

    socket.on('invalidUsername', () => {
      setUsername('');
      setValidated(true);
    });

    socket.on('userVerified', (event) => {
      document.cookie = `socket_id=${socket.id};SameSite=Strict`;
      localStorage.setItem('username', event.username);
      setUsername(event.username);
    });

    socket.on('oldEvents', (events) => {
      events.forEach((event) => {
        switch (event.type) {
          case "userConnected":
            handleUserConnected(event);
            break;
          case "userDisconnected":
            handleUserDisconnected(event);
            break;
          case "chatMessage":
            handleChatMessage(event);
            break;
          case "fileUpload":
            handleFileUpload(event);
            break;
          default:
            break;
        }
      });
    });
  }, []);

  return (
    <>
      <TopBar handleUserListModal={handleUserListModal} />
      {
        showUserListModal &&
        < UserListModal
          members={members}
          handleUserListModal={handleUserListModal}
        />
      }
      <Messages events={events} />
      {
        !username &&
        <UsernameInputModal
          validated={validated}
          handleUserNameSubmit={handleUserNameSubmit}
        />
      }
      {showFileUploadToast && <FileUploadToast handleFileUploadToast={handleFileUploadToast} />}
      <ChatInput
        onChatInputSubmit={onChatInputSubmit}
        fileUploadLabel={fileUploadLabel}
        handleFileUpload={handleFileUpload}
      />
    </>
  );
};

export default App;
