const express = require("express");
const router = express.Router();

const gameMoves = [];
const gameState = [
  ["lr", "ln", "lb", "lq", "lk", "lb", "ln", "lr"],
  ["lp", "lp", "lp", "lp", "lp", "lp", "lp", "lp"],
  ["e", "e", "e", "e", "e", "e", "e", "e"],
  ["e", "e", "e", "e", "e", "e", "e", "e"],
  ["e", "e", "e", "e", "e", "e", "e", "e"],
  ["e", "e", "e", "e", "e", "e", "e", "e"],
  ["dp", "dp", "dp", "dp", "dp", "dp", "dp", "dp"],
  ["dr", "dn", "db", "dq", "dk", "db", "dn", "dr"],
];
router.get("/", async (req, res) => {
  res.send(gameState);
});

module.exports = router;
