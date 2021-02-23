let messages = document.getElementById("messages");
let form = document.getElementById("form");
let input = document.getElementById("input");
let username = localStorage.getItem("username") || window.prompt("Username:");
let members = [];

function handleBrowse() {
  document.getElementById("file").click();
}

function createMessageBody(text) {
  let urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  let container = document.createElement("span");
  let textBuffer = "";
  let matches = [];
  let match;

  while (match = urlRegex.exec(text)) {
    matches.push({ text: match[0], index: match.index });
  }

  for (let i = 0, matchIndex = 0; i < text.length; i++) {
    if (matchIndex < matches.length && i === matches[matchIndex].index) {
      if (textBuffer) {
        let textNode = document.createTextNode(textBuffer);
        container.appendChild(textNode);
        textBuffer = "";
      }
      let link = document.createElement("a");
      let textContent = matches[matchIndex].text;
      link.href = textContent;
      link.textContent = textContent;
      container.append(link);
      matchIndex++;
      i += textContent.length - 1;
    } else {
      textBuffer += text[i] === " " ? "\u00A0" : text[i];
    }
  }

  if (textBuffer) {
    let textNode = document.createTextNode(textBuffer);
    container.appendChild(textNode);
  }

  return container;
}

function handleFileSelect() {
  let fileInput = document.getElementById("file");
  let browseButton = document.getElementById("browse");
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

function appendMessage(message) {
  let item = document.createElement("li");
  let time = new Date(message.time).toLocaleTimeString();
  let node = createMessageBody(message.body);
  item.textContent = `${time} > ${message.username}:\u00A0`;
  item.appendChild(node);
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
}

if (username) {
  let socket = io();

  localStorage.setItem("username", username);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let file = document.getElementById("file").files[0];
    if (input.value) {
      socket.emit("chatMessage", input.value);
      input.value = "";
    }
    if (file) {
      let formData = new FormData();
      formData.append("chatFile", file); fetch("/upload", { method: "POST",
        body: formData
      });
      document.getElementById("file").value = "";
    }
    handleFileSelect();
  });

  socket.on("connect", () => {
    document.cookie = `socket_id=${socket.id};SameSite=Strict`;
    socket.emit("userConnected", username);
  });

  socket.on("userConnected", (message) => {
    let item = document.createElement("li");
    members = message.userList;
    item.textContent = `${message.username} has joined the chat.`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });

  socket.on("userDisconnected", (message) => {
    let item = document.createElement("li");
    members = message.userList;
    item.textContent = `${message.username} has left the chat.`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });

  socket.on("oldMessages", (messages) => {
    messages.forEach(appendMessage);
  });

  socket.on("chatMessage", (message) => {
    appendMessage(message);
  });

  socket.on("fileUpload", (message) => {
    let item = document.createElement("li");
    let time = new Date(message.time).toLocaleTimeString();
    let a = document.createElement("a");
    a.href = message.link;
    a.target = "_blank";
    if (message.type.split("/")[0] === "image") {
      item.textContent = `${time} > ${message.username}: `;
      let img = document.createElement("img");
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
