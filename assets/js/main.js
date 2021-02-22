let socket = io();

let messages = document.getElementById('messages');
let form = document.getElementById('form');
let input = document.getElementById('input');
let username = localStorage.getItem('username') || window.prompt("Username:");
let members = [];

function handleBrowse() {
  document.getElementById("file").click();
}

function handleFileSelect() {
  let fileInput = document.getElementById('file');
  let browseButton = document.getElementById('browse');
  if (fileInput.files.length > 0) {
    browseButton.textContent = "1 File Selected"
  } else {
    browseButton.textContent = "Browse";
  }
}

function displayUsers() {
  let userList = "\n\n"
  for (let i = 0; i < members.length; i++) {
    userList += `${i + 1}. ${members[i]}\n`;
  }
  let message = `Users List: ${userList}`;
  window.alert(message);
}

if (username) {
  localStorage.setItem('username', username);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let file = document.getElementById('file').files[0];
    if (input.value) {
      socket.emit('chatMessage', input.value);
      input.value = '';
    }
    if (file) {
      let formData = new FormData();
      formData.append("chatFile", file);
      fetch("/upload", {
        method: "POST",
        body: formData
      });
      document.getElementById('file').value = '';
    }
    handleFileSelect();
  });

  socket.on('connect', () => {
    document.cookie = `socket_id=${socket.id}`
    socket.emit('userConnected', username);
  });

  socket.on('userConnected', (message) => {
    let item = document.createElement('li');
    members = message.userList;
    item.textContent = `${message.username} has joined the chat.`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });

  socket.on('userDisconnected', (message) => {
    let item = document.createElement('li');
    members = message.userList;
    item.textContent = `${message.username} has left the chat.`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });

  socket.on('chatMessage', (message) => {
    let item = document.createElement('li');
    let time = new Date(message.time).toLocaleTimeString();
    item.textContent = `${time} > ${message.username}: ${message.body}`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });

  socket.on('fileUpload', (message) => {
    let item = document.createElement('li');
    let time = new Date(message.time).toLocaleTimeString();
    let a = document.createElement('a');
    a.href = message.link;
    a.target = "_blank";
    if (message.type.split('/')[0] === 'image') {
      item.textContent = `${time} > ${message.username}: `;
      let img = document.createElement('img');
      img.src = message.link;
      a.appendChild(img);
    } else {
      item.textContent = `${time} > ${message.username} uploaded a\u00A0`;
      a.textContent = "file";
    }

    item.appendChild(a);
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });
}
