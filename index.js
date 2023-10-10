const express = require("express");
const app = express();
const port = 3300;

const fs = require("fs");
const multer = require("multer");

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

app.delete("/api/board/:id", (req, res) => {
  // delete a board by id
  try {
    // Synchronously delete the file
    fs.unlinkSync(`public/resources/boards/board-${req.params.id}.json`);
    console.log(`Deleted file "board-${req.params.id}"`);

    // Synchronously read the existing content of the file
    const fileContent = JSON.parse(fs.readFileSync(`public/resources/boards.json`, "utf8"));

    // edit the content
    delete fileContent[req.params.id];

    // Synchronously write the modified content back to the file
    fs.writeFileSync(`public/resources/boards.json`, JSON.stringify(fileContent));

    console.log(`Edited "boards.json"`);

    res.sendStatus(204);
  } catch (err) {
    // Handle any errors that occur during the deletion
    console.error(`Error deleting "board-${req.params.id}.json": ${err.message}`);
    res.sendStatus(500);
  }
});

app.get("/api/boards", (req, res) => {
  // get list of all boards
  // read boards.json
  const boards = fs.readFileSync(`public/resources/boards.json`, "utf-8");
  // send data
  res.send(boards);
});

// Create a storage engine using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/resources/uploads"); // Define the destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original filename
    console.log(file);
  },
});

// init multer
const upload = multer({ storage });

// Handle file upload
app.post("/api/upload", upload.single("fileToUpload"), (req, res) => {
  res.send("File uploaded successfully");
});

app.put("/api/board/:id/:index", (req, res) => {
  // edit a card

  // get current data
  const fileContent = JSON.parse(fs.readFileSync(`public/resources/boards/board-${req.params.id}.json`, "utf8"));
  fileContent.cards[req.params.index] = req.body;

  // Synchronously write the modified content back to the file
  fs.writeFileSync(`public/resources/boards/board-${req.params.id}.json`, JSON.stringify(fileContent));

  console.log(`Edited "board-${req.params.id}.json"`);
});

app.put("/api/board/:id/", (req, res) => {
  // create a new card
  // get current data
  const fileContent = JSON.parse(fs.readFileSync(`public/resources/boards/board-${req.params.id}.json`, "utf8"));

  fileContent.cards.push(req.body);

  // Synchronously write the modified content back to the file
  fs.writeFileSync(`public/resources/boards/board-${req.params.id}.json`, JSON.stringify(fileContent));

  console.log(`Edited "board-${req.params.id}.json"`);
});

app.delete("/api/board/:id/:index", (req, res) => {
  // delete a card
  console.log(req.params.index);
  const fileContent = JSON.parse(fs.readFileSync(`public/resources/boards/board-${req.params.id}.json`, "utf8"));
  console.log(fileContent.cards[req.params.index]);

  fileContent.cards.splice(req.params.index, 1);
  // Synchronously write the modified content back to the file
  fs.writeFileSync(`public/resources/boards/board-${req.params.id}.json`, JSON.stringify(fileContent));

  console.log(`Edited "board-${req.params.id}.json"`);
});

app.post("/api/board", (req, res) => {
  let newBoardId = "c";
  try {
    // Synchronously write the content to the file
    let content = {
      name: `New Board`,
      id: newBoardId,
      cards: [],
    };
    fs.writeFileSync(`public/resources/boards/board-${newBoardId}.json`, JSON.stringify(content));
    console.log(`Created "board-${newBoardId}.json"`);

    // Synchronously read the existing content of the file
    const fileContent = JSON.parse(fs.readFileSync(`public/resources/boards.json`, "utf8"));

    // edit the content
    fileContent[newBoardId] = content.name;

    // Synchronously write the modified content back to the file
    fs.writeFileSync(`public/resources/boards.json`, JSON.stringify(fileContent));

    console.log(`Edited "boards.json"`);

    res.sendStatus(201);
  } catch (err) {
    // Handle any errors that occur during the file write
    console.error(`Error creating board ${newBoardId}: ${err.message}`);
    res.sendStatus(500);
  }
});
