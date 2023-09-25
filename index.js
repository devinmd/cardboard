const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  maxHttpBufferSize: 1e8,
});

const fs = require("fs");

const port = 3030;

var boardsData = {};

// send index.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

// listen
server.listen(port, () => {
  console.log(`LISTENING ON PORT ${port}`);
});

fetchBoardsData();

io.use((socket, next) => {
  // handshake (auth)
  if (socket.handshake.auth.password != boardsData.password) {
    console.log(`denied a socket`);
    return next(new Error("incorrect_password"));
  }
  console.log(`${socket.id} authorized`);
  next();
});

io.on("connection", (socket) => {
  console.log(`${socket.id} joined`);

  fetchBoardsData();
  sendBoardsDataToClient(socket);

  // on disconnect
  socket.on("disconnect", () => {
    console.log(`${socket.id} left`);
  });

  // update a baord json file
  socket.on("update_board", (info) => {
    fs.readFile(`public/resources/boards/board-${info.index}.json`, "utf8", (err, data) => {
      if (err) {
        console.error("error reading file: ", err);
      } else {
        // write to file
        fs.writeFile(
          `public/resources/boards/board-${info.index}.json`,
          JSON.stringify(info.data),
          "utf8",
          (writeErr) => {
            if (writeErr) {
              console.error("error writing file: ", writeErr);
            } else {
              console.log(`edited board ${info.index} file`);
            }
          }
        );
      }
    });
  });

  // user upload file
  socket.on("upload", (file, name) => {
    console.log(file);
    fs.writeFile(`public/resources/assets/${name}`, file, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("uploaded file " + name);
      }
    });
  });

  // on message
  socket.on("new_board", (data) => {
    // 1) create new json file
    try {
      fs.writeFileSync(
        `public/resources/boards/board-${boardsData.boards.length}.json`,
        `
        {
          "name": "Board ${boardsData.boards.length}",
        "items": []
        }
        `
      );
      console.log("made a new board file");
    } catch (err) {
      console.error("Error creating new board: ", err);
    }
    boardsData.boards[boardsData.boards.length] = `Board ${boardsData.boards.length}`;
    updateBoardsFile(socket);
  });

  socket.on("delete_board", (data) => {
    console.log("delete board " + data.board_id);

    // edit boards data
    // boardsData.boards.splice(data.board_id, 1);
    boardsData.boards[data.board_id] = null;

    try {
      fs.unlinkSync(`public/resources/boards/board-${data.board_id}.json`);
      //file removed
    } catch (err) {
      console.error(err);
    }
    console.log(boardsData);
    updateBoardsFile(socket);
  });

  socket.on("fetch_board", (index) => {
    console.log(`${socket.id} fetching board ${index}`);
    try {
      const data = fs.readFileSync(`public/resources/boards/board-${index}.json`, "utf8");
      socket.emit("board_data", JSON.parse(data));
      console.log(JSON.parse(data));
    } catch (err) {
      console.error("error reading file: ", err);
    }
  });
});

// set public
app.use(express.static(__dirname + "/public"));

function fetchBoardsData() {
  try {
    const data = fs.readFileSync("public/resources/boards.json", "utf8");
    boardsData = JSON.parse(data);
    console.log(boardsData);
  } catch (err) {
    console.error("Error reading file:", err);
  }
}

function sendBoardsDataToClient(s) {
  // this function does not fetch the data, it only sends it to the client
  s.emit("boards_data_to_client", boardsData);
}

function updateBoardsFile(s) {
  fs.readFile("public/resources/boards.json", "utf8", (err, data) => {
    if (err) {
      console.error("error reading boards.json: ", err);
    } else {
      // write to file
      fs.writeFile("public/resources/boards.json", JSON.stringify(boardsData), "utf8", (writeErr) => {
        if (writeErr) {
          console.error("error writing boards.json: ", writeErr);
        } else {
          console.log("edited boards.json");
          // send new data to client
          sendBoardsDataToClient(s);
        }
      });
    }
  });
}
