const express = require("express");
const app = express();
const port = 3300;

const fs = require("fs");

// Middleware to parse JSON requests
app.use(express.json());

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use(express.static("public"));

//

app.get("/api/board/:id", (req, res) => {
  // get a specific board by id
  // find the board file and read it
  const boardData = fs.readFileSync(`public/resources/boards/board-${req.params.id}.json`, "utf-8");
  // send data
  res.send(JSON.parse(boardData));
});

app.get("/api/boards", (req, res) => {
  // get list of all boards
  // read boards.json
  const boards = fs.readFileSync(`public/resources/boards.json`, "utf-8");
  // send data
  res.send(boards);
});
