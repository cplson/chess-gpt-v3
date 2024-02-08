const express = require("express");
const router = express.Router();
router.use(express.json());
const gameMoves = [];
const gameState = [
  ["lr", "ln", "lb", "lq", "lk", "lb", "ln", "lr"],
  ["e", "lp", "lp", "lp", "e", "lp", "lp", "lp"],
  ["e", "e", "e", "e", "e", "dp", "e", "dp"],
  ["e", "e", "e", "e", "e", "e", "e", "e"],
  ["lp", "e", "e", "e", "e", "e", "e", "e"],
  ["e", "e", "e", "e", "e", "e", "e", "e"],
  ["dp", "dp", "dp", "dp", "dp", "e", "dp", "e"],
  ["dr", "dn", "db", "dq", "dk", "db", "dn", "dr"],
];
router.get("/", async (req, res) => {
  res.send(gameState);
});

router.post("/", async (req, res) => {
  console.log(req.body);
  // const fromSquare = req.body.fromSquare;
  // const toSquare = [req.body.toX, req.body.toY];
  // const piece = req.body.piece;

  // console.log(fromSquare, toSquare, piece);
  res.sendStatus(201);
});

module.exports = router;
