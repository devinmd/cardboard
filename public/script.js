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
      btn.className = 'accent'
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

function generateCards(boardData, shuffle) {
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

    if(card.tags){
      for(t in card.tags){
        let tagBtn = document.createElement('button')
        tagBtn.innerHTML = card.tags[t]
        tagBtn.className = 'tag-chip accent'
        cardTemplate.querySelector('.tag-list').append(tagBtn)
      }
    }

    let index = i;
    cardTemplate.querySelector(".edit-btn").onclick = function () {
      openEditCardDialog(card, index, boardData.id);
    };

    if (card.status && card.status != 0) {
      if (card.status == 1) {
        // disabled
        cardTemplate.querySelector(".card").classList.add("priority");
      }
    }

    document.querySelector("#board-content").append(cardTemplate);
  }
}

function openEditCardDialog(card, index, id) {
  console.log("editing card " + index);
  document.querySelector("#edit-card-dialog").style.display = "flex";
  document.querySelector("#edit-card-dialog #text1-input").focus();
  document.querySelector("#edit-card-dialog #text1-input").value = card.text1;
  document.querySelector("#edit-card-dialog #text2-input").value = card.text2;
  document.querySelector("#edit-card-dialog #url-input").value = card.url;
  document.querySelector("#edit-card-dialog #status-input").value = card.status;
  if (card.tags) {
    document.querySelector("#edit-card-dialog #tag-input").value = card.tags.join(", ");
  }

  document.querySelector("#edit-card-dialog #save-edits-btn").onclick = function () {
    saveCardEdits(card, index, id);
  };
  document.querySelector("#edit-card-dialog #del-card-btn").onclick = function () {
    openDeleteCardDialog(id, index);
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

    loadBoard(id);
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

function saveCardEdits(card, index, id, tagList) {
  console.log("saving edits to card " + index);
  card.text1 = document.querySelector("#edit-card-dialog #text1-input").value;
  card.text2 = document.querySelector("#edit-card-dialog #text2-input").value;
  card.url = document.querySelector("#edit-card-dialog #url-input").value;
  card.status = document.querySelector("#edit-card-dialog #status-input").value;
  card.tags = document.querySelector("#edit-card-dialog #tag-input").value.toLowerCase().replaceAll(" ", "").split(",");

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

function openDeleteCardDialog(id, index) {
  console.log("opening delete card dialog for " + index);
  closeEditCardDialog();
  document.querySelector("#del-card-dialog").style.display = "flex";
  document.querySelector("#confirm-delete-card-btn").onclick = function () {
    deleteCard(id, index);
  };
}

function deleteCard(id, index) {
  fetch(`/api/board/${id}/${index}`, {
    method: "DELETE",
  })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  closeDeleteCardDialog();
  loadBoard(id);
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

function closeDeleteCardDialog() {
  console.log("close delete card dialog");
  document.querySelector("#del-card-dialog").style.display = "none";
}

function closeDeleteBoardDialog() {
  console.log("close delete board dialog");
  document.querySelector("#del-board-dialog").style.display = "none";
}

function closeEditCardDialog() {
  console.log("close edit card dialog");
  document.querySelector("#edit-card-dialog").style.display = "none";
}

window.addEventListener("load", init());
