const express = require("express");
const router = express.Router();
router.use(express.json());
const gameMoves = [];
const gameState = [
  ["lr", "e", "lb", "e", "lk", "lb", "ln", "lr"],
  ["e", "dp", "lp", "lq", "e", "lp", "lp", "lp"],
  ["e", "e", "e", "e", "e", "dp", "e", "dp"],
  ["e", "e", "e", "e", "e", "e", "e", "e"],
  ["e", "e", "e", "e", "e", "e", "e", "e"],
  ["lp", "e", "e", "e", "e", "e", "e", "e"],
  ["lp", "dp", "dp", "dq", "e", "e", "dp", "e"],
  ["e", "dn", "db", "e", "dk", "db", "dn", "dr"],
];
router.get("/", async (req, res) => {
  res.send({ gameState, gameMoves });
});

router.post("/", async (req, res) => {
  try {
    // console.log("gamestate in:", gameState);
    const toSquare = [req.body.toX, req.body.toY];
    const piece = req.body.piece;
    const TAKEN_PIECE = gameState[toSquare[0]][toSquare[1]];
    gameState[toSquare[0]][toSquare[1]] =
      piece.color == "white" ? "l" + piece.pieceType : "d" + piece.pieceType;
    gameState[piece.row][piece.col] = "e";
    let moveOrder = gameMoves.length;
    gameMoves.push({
      piece: piece,
      from: [piece.row, piece.col],
      to: toSquare,
      takenPiece: TAKEN_PIECE,
      moveOrder: moveOrder,
    });
    // console.log("gameMoves out:", gameMoves);

    res.sendStatus(201);
  } catch (err) {
    res.send(err);
  }
});

module.exports = router;
