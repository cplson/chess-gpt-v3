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
  const toSquare = [req.body.toX, req.body.toY];
  const piece = req.body.piece;
  const TAKEN_PIECE = gameState[toSquare[0]][toSquare[1]];
  gameState[toSquare[0]][toSquare[1]] =
    piece.color == "white" ? "l" + piece.pieceType : "d" + piece.pieceType;
  gameState[piece.row][piece.col] = "e";
  gameMoves.push({
    from: [piece.row, piece.col],
    to: toSquare,
    takenPiece: TAKEN_PIECE,
  });
  console.log(gameMoves);
  res.sendStatus(201);
});

module.exports = router;
