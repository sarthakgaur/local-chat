import React from 'react';

function createMessageBody(text) {
  let urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  let textBuffer = "";
  let children = [];
  let matches = [];
  let match;

  while (match = urlRegex.exec(text)) {
    matches.push({ text: match[0], index: match.index });
  }

  for (let i = 0, matchIndex = 0; i < text.length; i++) {
    if (matchIndex < matches.length && i === matches[matchIndex].index) {
      if (textBuffer) {
        children.push(textBuffer);
        textBuffer = "";
      }
      let textContent = matches[matchIndex].text;
      let element = React.createElement('a', { href: textContent }, textContent);
      children.push(element);
      matchIndex++;
      i += textContent.length - 1;
    } else {
      textBuffer += text[i] === " " ? "\u00A0" : text[i];
    }
  }

  if (textBuffer) {
    children.push(textBuffer);
  }

  return React.createElement('span', {}, children);
}

function createFileUploadMessage(event) {
  let child;

  if (event.info.type.split('/')[0] === "image") {
    child = React.createElement('img', {
      className: "img-fluid width-250",
      src: event.info.link
    });
  } else {
    child = 'Uploaded a file.';
  }

  return React.createElement('a', {
    href: process.env.REACT_APP_SERVER_URL + event.info.link,
    target: '_blank'
  }, child);
};

const Message = ({ event }) => {
  let time;
  let title;
  let message;

  switch (event.type) {
    case 'chatMessage':
    case 'fileUpload':
      title = true;
      time = true;
      break;
    default:
      break;
  }

  switch (event.type) {
    case 'userConnected':
      message = `${event.username} has joined the chat.`;
      break;
    case 'userDisconnected':
      message = `${event.username} has left the chat.`
      break;
    case 'chatMessage':
      message = createMessageBody(event.info.body);
      break;
    case 'fileUpload':
      message = createFileUploadMessage(event);
      break;
    default:
      break;
  }

  return (
    <>
      <div className="card bg-light border-top-0">
        <div className="card-body">
          {
            title &&
            <h5 className="card-title d-inline">{event.username}</h5>
          }
          {
            time &&
            <small className="text-muted ml-2">{new Date(event.time).toLocaleTimeString()}</small>
          }
          <div className="py-2">
            {message}
          </div>
        </div>
      </div>
    </>
  );
};

export default Message;
