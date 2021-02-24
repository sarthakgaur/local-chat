let socket = io();
let messages = document.getElementById("messages");
let form = document.getElementById("form");
let input = document.getElementById("input");
let username = localStorage.getItem("username") || getUsername(true);
let members = [];

function getUsername(firstTime) {
  let message = firstTime ? "Username:" : "Username not valid.\n\nUsername:";
  return window.prompt(message);
}

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

function handleUserConnected(event) {
  let item = document.createElement("li");
  members = event.info.userList;
  item.textContent = `${event.username} has joined the chat.`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
}

function handleUserDisconnected(event) {
  let item = document.createElement("li");
  members = event.info.userList;
  item.textContent = `${event.username} has left the chat.`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
}

function handleChatMessage(event) {
  let item = document.createElement("li");
  let time = new Date(event.time).toLocaleTimeString();
  let node = createMessageBody(event.info.body);
  item.textContent = `${time} > ${event.username}:\u00A0`;
  item.appendChild(node);
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
}

function handleFileUpload(event) {
  let item = document.createElement("li");
  let time = new Date(event.time).toLocaleTimeString();
  let a = document.createElement("a");
  a.href = event.info.link;
  a.target = "_blank";
  if (event.info.type.split("/")[0] === "image") {
    item.textContent = `${time} > ${event.username}: `;
    let img = document.createElement("img");
    img.src = event.info.link;
    a.appendChild(img);
  } else {
    item.textContent = `${time} > ${event.username} uploaded a\u00A0`;
    a.textContent = "file";
  }

  item.appendChild(a);
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let file = document.getElementById("file").files[0];
  if (input.value) {
    socket.emit("chatMessage", input.value);
    input.value = "";
  }
  if (file) {
    let formData = new FormData();
    formData.append("chatFile", file); fetch("/upload", {
      method: "POST",
      body: formData
    });
    document.getElementById("file").value = "";
  }
  handleFileSelect();
});

socket.on("connect", () => {
  socket.emit("userConnected", username);
});

socket.on("usernameError", () => {
  username = getUsername(false);
  socket.emit("userConnected", username);
})

socket.on("userVerified", (event) => {
  document.cookie = `socket_id=${socket.id};SameSite=Strict`;
  username = event.username;
  localStorage.setItem("username", username);
});

socket.on("oldEvents", (events) => {
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
    }
  });
});

socket.on("userConnected", (event) => {
  handleUserConnected(event);
});

socket.on("userDisconnected", (event) => {
  handleUserDisconnected(event);
});

socket.on("chatMessage", (event) => {
  handleChatMessage(event);
});

socket.on("fileUpload", (event) => {
  handleFileUpload(event)
});
