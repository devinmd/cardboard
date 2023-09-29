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
  document.querySelector("#new-card-dialog").style.display = "flex";
}

function cancelNewCard() {
  document.querySelector("#new-card-dialog").style.display = "none";
  document.querySelector("#new-card-dialog #text1-input").value = "";
  document.querySelector("#new-card-dialog #text2-input").value = "";
  document.querySelector("#new-card-dialog #url-input").value = "";
}

function createNewCard() {
  file = document.querySelector("#new-card-dialog #dragdrop-input").files[0];

  currentBoardData.items.push({
    image: file ? file.name : "",
    text1: document.querySelector("#new-card-dialog #text1-input").value,
    text2: document.querySelector("#new-card-dialog #text2-input").value,
    url: document.querySelector("#new-card-dialog #url-input").value,
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
document.querySelector("#dragdrop-container").adDEventListener("dragover", (e) => {
  e.preventDefault();
});

// Handle the drop event when files are dropped onto the box.
document.querySelector("#dragdrop-container").adDEventListener("drop", (e) => {
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
  document.querySelector("#edit-card-dialog").style.display = "flex";
  document.querySelector("#edit-card-dialog #text1-input").value = currentBoardData.items[editIndex].text1;
  document.querySelector("#edit-card-dialog #text2-input").value = currentBoardData.items[editIndex].text2;
  document.querySelector("#edit-card-dialog #url-input").value = currentBoardData.items[editIndex].url;
}

function saveEdits() {
  currentBoardData.items[editIndex].text1 = document.querySelector("#edit-card-dialog #text1-input").value;
  currentBoardData.items[editIndex].text2 = document.querySelector("#edit-card-dialog #text2-input").value;
  currentBoardData.items[editIndex].url = document.querySelector("#edit-card-dialog #url-input").value;
  updateBoard(currentBoardIndex);
  cancelEditCard();
  generateCards();
}

function closeDeleteCardDialog() {
  editIndex = -1;
  document.querySelector("#delete-card-dialog").style.display = "none";
}

function deleteCardDialog() {
  document.querySelector("#edit-card-dialog").style.display = "none";
  document.querySelector("#delete-card-dialog").style.display = "flex";
}

function deleteCard() {
  // delete here
  currentBoardData.items.splice(editIndex, 1);
  updateBoard(currentBoardIndex);
  generateCards();
  closeDeleteCardDialog();
}
*/

async function fetchAllBoards() {
  document.querySelector("#board-btns").innerHTML = "";
  try {
    // fetch all board data
    console.log("fetching boards data");
    const response = await fetch("/api/boards");
    const boards = await response.json();
    console.log("received boards data");
    console.log(boards);
    // generate buttons to switch boards
    for (index in Object.keys(boards)) {
      let id = Object.keys(boards)[index];
      let btn = document.createElement("button");
      btn.innerHTML = boards[id];
      btn.onclick = function () {
        loadBoard(id);
      };
      if (index == 0) {
        btn.click();
      }
      document.querySelector("#board-btns").append(btn);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function loadBoard(id) {
  try {
    // fetch board data
    console.log(`fetching board ${id}`);
    const response = await fetch(`/api/board/${id}`);
    const board = await response.json();
    // generate cards
    generateCards(board);
    // set delete board button
    document.querySelector("#del-board-btn").onclick = function () {
      openDeleteBoardDialog(id);
    };
    document.querySelector("#new-card-btn").onclick = function () {
      openNewCardDialog(id);
    };
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

  // board name
  document.querySelector("#board-name").innerHTML = boardData.name;

  // add cards
  for (i in boardData.cards) {
    let card = boardData.cards[i];
    let cardTemplate = document.querySelector("#card-template").content.cloneNode(true);
    if (card.image) {
      cardTemplate.querySelector(".img").src = `/resources/uploads/${card.image}`;
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
      openEditCardDialog(card, index, boardData.id);
    };
    document.querySelector("#board-content").append(cardTemplate);
  }
}

function openEditCardDialog(card, index, id) {
  console.log("editing card " + index);
  document.querySelector("#edit-card-dialog").style.display = "flex";
  document.querySelector("#edit-card-dialog #text1-input").value = card.text1;
  document.querySelector("#edit-card-dialog #text2-input").value = card.text2;
  document.querySelector("#edit-card-dialog #url-input").value = card.url;
  document.querySelector("#edit-card-dialog #save-edits-btn").onclick = function () {
    saveCardEdits(card, index, id);
  };
  document.querySelector("#edit-card-dialog #del-card-btn").onclick = function () {
    openDeleteCardDialog(index);
  };
}

function openNewCardDialog(id) {
  console.log(`opening new card dialog for board ${id}`);
  document.querySelector("#new-card-dialog").style.display = "flex";
  document.querySelector("#create-new-card-btn").onclick = function () {
    createNewCard(id);
  };
}
function createNewCard(id) {
  const fileInput = document.querySelector("#dragdrop-input");
  const file = fileInput.files[0];

  // upload file
  if (file) {
    // Create a FormData object to simulate a form submission
    const formData = new FormData();
    formData.append("fileToUpload", file);

    // upload file
    fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        console.log("File uploaded successfully");
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
      });
  }

  // create the object for the new card
  const newCardData = {
    image: file ? file.name : null,
    text1: document.querySelector("#new-card-dialog #text1-input").value,
    text2: document.querySelector("#new-card-dialog #text2-input").value,
    url: document.querySelector("#new-card-dialog #url-input").value,
  };
  console.log(newCardData);

  // PUT the data
  fetch(`/api/board/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" }, // Specify JSON content typ
    body: JSON.stringify(newCardData),
  })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  console.log("created new card on board " + id);
  loadBoard(id);
  closeNewCardDialog();
}

function closeNewCardDialog() {
  document.querySelector("#new-card-dialog").style.display = "none";
}

function saveCardEdits(card, index, id) {
  console.log("saving edits to card " + index);
  card.text1 = document.querySelector("#edit-card-dialog #text1-input").value;
  card.text2 = document.querySelector("#edit-card-dialog #text2-input").value;
  card.url = document.querySelector("#edit-card-dialog #url-input").value;
  console.log(card);
  // PUT into backend
  fetch(`/api/board/${id}/${index}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json", // Specify JSON content type
    },
    body: JSON.stringify(card),
  })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  closeEditCardDialog();
  loadBoard(id);
}

function openDeleteBoardDialog(id) {
  console.log("opening delete board dialog for board " + id);
  document.querySelector("#del-board-dialog").style.display = "flex";
  document.querySelector("#confirm-del-board-btn").onclick = function () {
    deleteBoard(id);
  };
}

function closeDeleteBoardDialog() {
  console.log("close delete board dialog");
  document.querySelector("#del-board-dialog").style.display = "none";
}

function closeEditCardDialog() {
  console.log("close edit card dialog");
  document.querySelector("#edit-card-dialog").style.display = "none";
}

function deleteBoard(id) {
  console.log(`deleting board ${id}`);
  // delete
  fetch(`/api/board/${id}`, {
    method: "DELETE",
  })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  // close dialog
  closeDeleteBoardDialog();
  // fetch the boards again
  fetchAllBoards();
}

function openDeleteCardDialog(index) {
  console.log("opening delete card dialog for " + index);
}

function init() {
  fetchAllBoards();
}

function newBoard() {
  fetch(`/api/board/`, {
    method: "POST",
  })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  // fetch the boards again
  fetchAllBoards();
}

window.addEventListener("load", init());
