/*currentBoardIndex = -1;
currentBoardData = {};
boardsData = {};
editIndex = -1;

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
});*/ /*

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

function closeDeleteCardPopup() {
  editIndex = -1;
  document.querySelector("#delete-card-popup").style.display = "none";
}

function deleteCardPopup() {
  document.querySelector("#edit-card-popup").style.display = "none";
  document.querySelector("#delete-card-popup").style.display = "flex";
}

function deleteCard() {
  // delete here
  currentBoardData.items.splice(editIndex, 1);
  updateBoard(currentBoardIndex);
  generateCards();
  closeDeleteCardPopup();
}

function zoom(amount) {
  document.querySelector("#board-content").style.columnCount = amount;
}*/

async function fetchBoards() {
  try {
    // fetch all board data
    console.log("fetching boards data");
    const response = await fetch("/api/boards");
    const boards = await response.json();
    console.log("received boards data");
    console.log(boards);
    // generate buttons to switch boards
    for (i in boards) {
      let btn = document.createElement("button");
      btn.innerHTML = boards[i];
      let id = i;
      btn.onclick = function () {
        gotoBoard(id);
      };
      document.querySelector("#board-btns").append(btn);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function gotoBoard(id) {
  try {
    // fetch board data
    console.log(`fetching board ${id}`);
    const response = await fetch(`/api/board/${id}`);
    const board = await response.json();
    // generate cards
    generateCards(board);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function generateCards(boardData) {
  console.log(`received board ${boardData.id}`);
  console.log(boardData);

  // clear existing cards
  document.querySelector("#board-content").innerHTML = "";

  // add new card button
  let clone1 = document.querySelector("#new-card-button-template").content.cloneNode(true);
  document.querySelector("#board-content").append(clone1);

  // add cards
  for (i in boardData.cards) {
    let card = boardData.cards[i];
    let cardTemplate = document.querySelector("#card-template").content.cloneNode(true);
    if (card.image) {
      cardTemplate.querySelector(".img").src = `/resources/assets/${card.image}`;
    } else {
      cardTemplate.querySelector(".img").style.display = "none";
    }
    cardTemplate.querySelector(".text1").innerHTML = card.text1;
    cardTemplate.querySelector(".text2").innerHTML = card.text2;

    if (card.url) {
      let matches = card.url.match(/^(https?:\/\/)?(www\.)?([^/]+)/i);
      if (matches && matches[3]) {
        let baseurl = matches[3];
        cardTemplate.querySelector(".url").innerHTML = baseurl;
        cardTemplate.querySelector(".url").target = "_blank";
        cardTemplate.querySelector(".url").href = card.url;
      }
    }

    let index = i;
    cardTemplate.querySelector(".edit-btn").onclick = function () {
      openEditCardDialog(card, index);
    };
    document.querySelector("#board-content").append(cardTemplate);
  }
}

function openEditCardDialog(card, index) {
  editIndex = index;
  console.log("editing card " + index);
  document.querySelector("#edit-card-popup").style.display = "flex";
  document.querySelector("#edit-card-popup #text1-input").value = card.text1;
  document.querySelector("#edit-card-popup #text2-input").value = card.text2;
  document.querySelector("#edit-card-popup #url-input").value = card.url;
  document.querySelector("#edit-card-popup #save-edits-btn").onclick = function () {
    saveCardEdits(card, index);
  };
}

function saveCardEdits(card, index) {
  console.log("saving edits to card " + index);
  card.text1 = document.querySelector("#edit-card-popup #text1-input").value;
  card.text2 = document.querySelector("#edit-card-popup #text2-input").value;
  card.url = document.querySelector("#edit-card-popup #url-input").value;
  // PUT into backend with index
  closeEditCardDialog();
}

function closeEditCardDialog() {
  document.querySelector("#edit-card-popup").style.display = "none";
}

function init() {
  fetchBoards();
}

window.addEventListener("load", init());
