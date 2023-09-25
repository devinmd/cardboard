const socket = io({ autoConnect: false });

currentBoardIndex = -1;
currentBoardData = {};
boardsData = {};
editIndex = -1;

function submitPassword() {
  // try and authorize
  console.log("attempting to authorize with server");
  socket.auth = { password: document.querySelector("#password-input").value };
  socket.connect();

  // listen for connect
  socket.on("connect", () => {
    console.log(`connected as ${socket.id}`);
    document.querySelector("#password-input-container").remove();
  });
}

socket.on("connect_error", (error) => {
  console.log("access denied to server: " + error.message);
});

socket.on("board_data", (data) => {
  // received the data for a board
  console.log("received board");
  console.log(data);
  currentBoardData = data;
  document.querySelector("#board-name").innerHTML = data.name;
  document.title = `Cardboard - ${data.name}`;

  generateCards();
});

function generateCards() {
  // add new card button
  document.querySelector("#board-content").innerHTML = "";
  let clone1 = document.querySelector("#new-card-button-template").content.cloneNode(true);
  document.querySelector("#board-content").append(clone1);

  // add all cards
  for (i in currentBoardData.items) {
    let clone2 = document.querySelector("#card-template").content.cloneNode(true);
    let item = currentBoardData.items[i];
    if (item.image) {
      clone2.querySelector(".img").src = `/resources/assets/${item.image}`;
    } else {
      clone2.querySelector(".img").style.display = "none";
    }
    clone2.querySelector(".text1").innerHTML = item.text1;
    clone2.querySelector(".text2").innerHTML = item.text2;

    if (item.url) {
      let matches = item.url.match(/^(https?:\/\/)?(www\.)?([^/]+)/i);
      if (matches && matches[3]) {
        let baseurl = matches[3];
        clone2.querySelector(".url").innerHTML = baseurl;
        clone2.querySelector(".url").target = "_blank";
        clone2.querySelector(".url").href = item.url;
      }
    }

    let index = i;
    clone2.querySelector(".edit-btn").onclick = function () {
      editCard(index);
    };
    document.querySelector("#board-content").append(clone2);
  }
}

socket.on("boards_data_to_client", (data) => {
  console.log("received boards data");
  document.querySelector("#board-list").innerHTML = "";
  console.log(data);
  boardsData = data;

  for (let i in boardsData.boards) {
    let btn = document.createElement("button");
    btn.innerHTML = boardsData.boards[i];
    btn.onclick = function () {
      currentBoardIndex = i;
      console.log(currentBoardIndex);
      loadBoard(currentBoardIndex);
    };
    document.querySelector("#board-list").append(btn);
  }

  currentBoardIndex = 0;

  loadBoard(0);
});

function deleteCurrentBoard() {
  console.log(`deleting board ${currentBoardIndex}`);
  socket.emit("delete_board", {
    board_id: currentBoardIndex,
  });
}

function newBoard() {
  console.log("creating new board");
  socket.emit("new_board", {});
}

function loadBoard(index) {
  socket.emit("fetch_board", index);
  console.log(`fetching board ${index}`);
  document.querySelector("#board-content").innerHTML = "";
}

function newCardDialog() {
  document.querySelector("#new-card-popup").style.display = "flex";
}

function cancelNewCard() {
  document.querySelector("#new-card-popup").style.display = "none";
  document.querySelector("#new-card-popup #text1-input").value = "";
  document.querySelector("#new-card-popup #text2-input").value = "";
  document.querySelector("#new-card-popup #url-input").value = "";
}

function cancelEditCard() {
  document.querySelector("#edit-card-popup").style.display = "none";
  editIndex = -1;
}

function createNewCard() {
  file = document.querySelector("#new-card-popup #dragdrop-input").files[0];

  currentBoardData.items.push({
    image: file ? file.name : "",
    text1: document.querySelector("#new-card-popup #text1-input").value,
    text2: document.querySelector("#new-card-popup #text2-input").value,
    url: document.querySelector("#new-card-popup #url-input").value,
  });
  generateCards();
  if (file) {
    uploadFile(file);
  }
  console.log("created new card");
  updateBoard(currentBoardIndex);
  cancelNewCard();
}

// Prevent the default behavior of the browser when a file is dragged over the drop zone.
/*
document.querySelector("#dragdrop-container").addEventListener("dragover", (e) => {
  e.preventDefault();
});

// Handle the drop event when files are dropped onto the box.
document.querySelector("#dragdrop-container").addEventListener("drop", (e) => {
  e.preventDefault();

  // Get the dropped files from the event.
  const files = e.dataTransfer.files;

  // Display the file names in a list.
  for (const file of files) {
    const listItem = document.createElement("li");
    listItem.textContent = file.name;
    console.log(file);
  }
});*/

function uploadFile(file) {
  console.log("uploading file to backend");
  console.log(file);
  socket.emit("upload", file, file.name, (status) => {
    console.log(status);
  });
}

function previewFiles(files) {
  console.log("previewing file");
  console.log(files);
}

function updateBoard(index) {
  console.log("updating board json for " + index);
  socket.emit("update_board", { index: index, data: currentBoardData });
}

function editCard(index) {
  editIndex = index;
  console.log(currentBoardData.items[editIndex]);
  console.log("editing card " + index);
  document.querySelector("#edit-card-popup").style.display = "flex";
  document.querySelector("#edit-card-popup #text1-input").value = currentBoardData.items[editIndex].text1;
  document.querySelector("#edit-card-popup #text2-input").value = currentBoardData.items[editIndex].text2;
  document.querySelector("#edit-card-popup #url-input").value = currentBoardData.items[editIndex].url;
}

function saveEdits() {
  currentBoardData.items[editIndex].text1 = document.querySelector("#edit-card-popup #text1-input").value;
  currentBoardData.items[editIndex].text2 = document.querySelector("#edit-card-popup #text2-input").value;
  currentBoardData.items[editIndex].url = document.querySelector("#edit-card-popup #url-input").value;
  updateBoard(currentBoardIndex);
  cancelEditCard();
  generateCards();
}

function deleteCard() {
  editIndex = -1;
}
