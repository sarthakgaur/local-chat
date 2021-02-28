let socket = io();
let members = [];
let username = localStorage.getItem("username");

let messages = document.getElementById("messages");
let form = document.getElementById("form");
let input = document.getElementById("input");

let usernameInputForm = document.getElementById("usernameInputForm");
let usernameInput = document.getElementById("usernameInput");

usernameInputForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (usernameInput.value) {
    username = usernameInput.value;
    socket.emit("userConnected", username);
  } else {
    usernameInput.classList.add("is-invalid");
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let selectFileButton = document.getElementById("selectFileButton");
  let file = selectFileButton.files[0];

  if (input.value) {
    socket.emit("chatMessage", input.value);
    input.value = "";
  }

  if (file) {
    let uploadButton = document.getElementById("uploadButton");
    let spinner = createSpinner();
    let formData = new FormData();

    formData.append("chatFile", file);
    uploadButton.textContent = "\u00A0Uploading...";
    uploadButton.insertBefore(spinner, uploadButton.firstChild);
    selectFileButton.value = "";

    let response = await fetch("/upload", { method: "POST", body: formData });

    if (response.status === 200) {
      uploadButton.textContent = "Upload";
      $("#liveToast").toast("show");
    }
  }
});

function createSpinner() {
  let spinner = document.createElement("span");
  spinner.classList.add("spinner-border");
  spinner.classList.add("spinner-border-sm");
  return spinner;
}

function createCard(event, contentNode) {
  let card = document.createElement("div");
  let cardBody = document.createElement("div");

  card.classList.add("card");
  card.classList.add("bg-light");
  card.classList.add("border-top-0")
  cardBody.classList.add("card-body");

  let config = {
    title: false,
    time: false,
  };

  switch (event.type) {
    case "chatMessage":
    case "fileUpload":
      config.title = true;
      config.time = true;
      break;
  }

  if (config.title) {
    let cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title");
    cardTitle.classList.add("d-inline");
    cardTitle.textContent = event.username;
    cardBody.appendChild(cardTitle);
  }

  if (config.time) {
    let cardTime = document.createElement("small");
    cardTime.classList.add("text-muted");
    cardTime.classList.add("ml-2");
    cardTime.textContent = new Date(event.time).toLocaleTimeString();
    cardBody.appendChild(cardTime);
  }

  let div = document.createElement("div");
  div.classList.add("py-2");
  div.appendChild(contentNode);
  cardBody.appendChild(div);
  card.appendChild(cardBody);

  return card;
}

function handleUploadButton() {
  document.getElementById("selectFileButton").click();
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

function handleUploadButtonLabel() {
  let selectFileButton = document.getElementById("selectFileButton");
  let uploadButton = document.getElementById("uploadButton");

  if (selectFileButton.files.length > 0) {
    uploadButton.textContent = "1 File Selected"
  } else {
    uploadButton.textContent = "Upload";
  }
}

function displayUsers() {
  let userList = document.getElementById("userList");
  userList.textContent = "";

  for (let i = 0; i < members.length; i++) {
    let li = document.createElement("li");
    li.classList.add("list-group-item");
    li.textContent = `${i + 1}. ${members[i]}`;
    userList.appendChild(li);
  }

  $("#userListModal").modal("show");
}

function handleUserConnected(event) {
  members = event.info.userList;
  let contentNode = document.createTextNode(`${event.username} has joined the chat.`);
  let card = createCard(event, contentNode);
  messages.appendChild(card);
  window.scrollTo(0, document.body.scrollHeight);
}

function handleUserDisconnected(event) {
  members = event.info.userList;
  let contentNode = document.createTextNode(`${event.username} has left the chat.`);
  let card = createCard(event, contentNode);
  messages.appendChild(card);
  window.scrollTo(0, document.body.scrollHeight);
}

function handleChatMessage(event) {
  let contentNode = createMessageBody(event.info.body);
  let card = createCard(event, contentNode);
  messages.appendChild(card);
  window.scrollTo(0, document.body.scrollHeight);
}

function handleFileUpload(event) {
  let contentNode = document.createElement("a");
  contentNode.href = event.info.link;
  contentNode.target = "_blank";

  if (event.info.type.split("/")[0] === "image") {
    let img = document.createElement("img");
    img.classList.add("img-fluid");
    img.classList.add("width-250");
    img.src = event.info.link;
    contentNode.appendChild(img);
  } else {
    contentNode.textContent = "Uploaded a file.";
  }

  let card = createCard(event, contentNode)
  messages.appendChild(card);
  window.scrollTo(0, document.body.scrollHeight);
}

socket.on("connect", () => {
  if (username) {
    socket.emit("userConnected", username);
  } else {
    $("#usernameInputModal").modal("show");
  }
});

socket.on("invalidUsername", () => {
  $("#usernameInputModal").modal("show");
  usernameInput.classList.add("is-invalid");
});

socket.on("userVerified", (event) => {
  usernameInput.classList.remove("is-invalid");
  $("#usernameInputModal").modal("hide");
  username = event.username;
  document.cookie = `socket_id=${socket.id};SameSite=Strict`;
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
