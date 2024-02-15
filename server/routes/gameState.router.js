const express = require("express");
const router = express.Router();
router.use(express.json());
const gameMoves = [];
const gameState =
  // = [
  //   ["e", "e", "e", "e", "lku", "e", "e", "e"],
  //   ["e", "e", "lp", "lp", "e", "lp", "lp", "lp"],
  //   ["e", "e", "e", "e", "e", "e", "e", "dp"],
  //   ["lr", "e", "e", "e", "e", "dp", "e", "e"],
  //   ["e", "e", "e", "e", "e", "e", "e", "e"],
  //   ["lp", "e", "lr", "lq", "e", "e", "e", "e"],
  //   ["lp", "e", "e", "e", "e", "e", "e", "e"],
  //   ["dr", "e", "e", "e", "e", "e", "e", "dk"],
  // ];
  [
    ["lr", "e", "lb", "e", "lk", "lb", "ln", "lr"],
    ["e", "dp", "lp", "lq", "e", "lp", "lp", "lp"],
    ["e", "e", "e", "e", "e", "e", "e", "dp"],
    ["e", "e", "e", "e", "e", "dp", "e", "e"],
    ["lp", "e", "e", "e", "e", "e", "e", "e"],
    ["e", "e", "e", "e", "e", "e", "e", "e"],
    ["lp", "dp", "dp", "dq", "e", "e", "dp", "e"],
    ["e", "dn", "db", "e", "dk", "db", "dn", "dr"],
  ];
router.get("/", async (req, res) => {
  res.send({ gameState, gameMoves });
});

router.post("/castle", async (req, res) => {
  try {
    const side = req.body.side;
    const color = req.body.color;
    const rookRow = color == "l" ? 0 : 7;
    const rookCol = side == "O-O" ? 7 : 0;
    const rookToCol = rookCol == 7 ? 5 : 3;
    const kingToCol = rookCol == 7 ? 6 : 2;

    gameState[rookRow][rookToCol] = color + "r";
    gameState[rookRow][rookCol] = "e";
    gameState[rookRow][kingToCol] = color + "k";
    gameState[rookRow][4] = "e";
    console.log(gameState);
    res.sendStatus(201);
  } catch (err) {
    res.send(err);
  }
});
router.post("/", async (req, res) => {
  try {
    const toSquare = [req.body.toX, req.body.toY];
    const piece = req.body.piece;
    let takenPiece = gameState[toSquare[0]][toSquare[1]];

    //unmark rooks and kings when moved
    if (gameState[piece.row][piece.col].length == 3) {
      gameState[piece.row][piece.col].length = 2;
    }

    // EN PASSANT LOGIC
    if (
      piece.pieceType == "p" &&
      piece.col != toSquare[1] &&
      takenPiece == "e"
    ) {
      takenPiece = gameState[piece.row][toSquare[1]];
      gameState[piece.row][toSquare[1]] = "e";
    }
    console.log(gameMoves);
    gameState[toSquare[0]][toSquare[1]] =
      piece.color == "white" ? "l" + piece.pieceType : "d" + piece.pieceType;
    gameState[piece.row][piece.col] = "e";
    let moveOrder = gameMoves.length;
    gameMoves.push({
      piece: piece,
      from: [piece.row, piece.col],
      to: toSquare,
      takenPiece: takenPiece,
      moveOrder: moveOrder,
    });
    // console.log("gameMoves out:", gameMoves);
    // console.log(gameState);
    res.sendStatus(201);
  } catch (err) {
    res.send(err);
  }
});

router.post("/promote", (req, res) => {
  const row = req.body.row;
  const col = req.body.col;
  console.log(req.body);
  const color = row == 7 ? "l" : "d";

  gameState[row][col] = color + "q";
  console.log(gameState);

  res.sendStatus(201);
});

module.exports = router;
