const express = require("express");
const app = express();
const port = 5000;
require("dotenv").config();

const chatRouter = require("./routes/chat.router.js");
const gameStateRouter = require("./routes/gameState.router.js");
app.use("/api/chat", chatRouter);
app.use("/api/gameState", gameStateRouter);

// Serve static files
app.use(express.static("build"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
