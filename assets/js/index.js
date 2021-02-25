let socket = io();
let members = [];
let username = localStorage.getItem("username");

let messages = document.getElementById("messages");
let form = document.getElementById("form");
let input = document.getElementById("input");

let usernameInputForm = document.getElementById("usernameInputForm");
let usernameInput = document.getElementById("usernameInput");
let userList = document.getElementById("userList");

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
  let file = document.getElementById("file").files[0];
  if (input.value) {
    socket.emit("chatMessage", input.value);
    input.value = "";
  }
  if (file) {
    let formData = new FormData();
    let browse = document.getElementById("browse");
    let spinner = createSpinner();

    formData.append("chatFile", file);
    browse.textContent = "\u00A0Uploading...";
    browse.insertBefore(spinner, browse.firstChild);
    document.getElementById("file").value = "";

    let response = await fetch("/upload", { method: "POST", body: formData });
    if (response.status === 200) {
      browse.textContent = "Upload";
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
  card.classList.add("mb-3");
  card.classList.add("card-width");

  let config = {
    header: false,
    footer: false,
  };

  switch (event.type) {
    case "userConnected":
    case "userDisconnected":
      break;
    case "chatMessage":
    case "fileUpload":
      config.header = true;
      config.footer = true;
      break;
  }

  if (config.header) {
    let cardHeader = document.createElement("h5");
    cardHeader.classList.add("card-title");
    cardHeader.textContent = event.username;
    cardBody.appendChild(cardHeader);
  }

  let div  = document.createElement("div");
  div.appendChild(contentNode);
  cardBody.appendChild(div);
  cardBody.classList.add("card-body");
  card.appendChild(cardBody);

  if (config.footer) {
    let cardFooter = document.createElement("small");
    cardFooter.classList.add("text-muted");
    cardFooter.textContent = new Date(event.time).toLocaleTimeString();
    cardBody.appendChild(cardFooter);
  }

  return card;
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

socket.on("usernameError", () => {
  usernameInput.classList.add("is-invalid");
});

socket.on("userVerified", (event) => {
  usernameInput.classList.remove("is-invalid");
  usernameInput.classList.add("is-valid");
  $("#usernameInputModal").modal("hide");
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
