const express = require("express");
const router = express.Router();

const gameMoves = [];
const gameState = [
  ["lr", "lp", "e", "e", "e", "e", "dp", "dr"],
  ["ln", "lp", "e", "e", "e", "e", "dp", "dn"],
  ["lb", "lp", "e", "e", "e", "e", "dp", "db"],
  ["lq", "lp", "e", "e", "e", "e", "dp", "dq"],
  ["lk", "lp", "e", "e", "e", "e", "dp", "dk"],
  ["lb", "lp", "e", "e", "e", "e", "dp", "db"],
  ["ln", "lp", "e", "e", "e", "e", "dp", "dn"],
  ["lr", "lp", "e", "e", "e", "e", "dp", "dr"],
];
router.get("/", async (req, res) => {
  res.send(gameState);
});

module.exports = router;
