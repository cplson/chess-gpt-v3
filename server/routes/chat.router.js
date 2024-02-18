// import OpenAI from "openai";
const openAi = require("openai");
const express = require("express");
const router = express.Router();

const openai = new openAi();

router.use(express.json());

router.get("/", async (req, res) => {
  // GET route code here

  res.send(console.log("yay"));
});

router.post("/", async (req, res) => {
  const pieces = req.body.pieces;
  const state = req.body.state;
  // console.log("heres the message: ", message);

  // const completion = await openai.chat.completions.create({
  //   model: "gpt-3.5-turbo-0125",
  //   response_format: { type: "json_object" },
  //   messages: [
  //     {
  //       role: "system",
  //       content:
  //         "You are a chess player designed to output moves using the 'move' key in JSON using algebraic notation. The user will give the board format when they make their turn to ensure syncronized state",
  //     },
  //     { role: "user", content: "You have the first move, good luck!" },
  //   ],
  // });

  // const move = JSON.parse(completion.choices[0].message.content).move;
  // console.log(completion.choices[0]);
  // console.log("resulting move is: ", move);

  const possibleMoveTypes = [
    "0-0",
    "0 -0 -0",
    "O-O",
    "O-O-O",
    "e5",
    "N a6",
    "Qb5",
    "dxe4+",
    "gxf6",
    "B5xd5",
    "Qf5xf7",
    "e8 = Q",
    "exd1=N",
  ];
  // Remove dashes, x's, and +'s, and spaces
  // const filteredMoves = possibleMoveTypes.forEach((move, index) => {
  // possibleMoveTypes[index] = move.replace(/[\s-x+]/g, "");
  // console.log(possibleMoveTypes[index]);
  // const thisMove = possibleMoveTypes[index];
  const thisMove = "N a6";
  let regex = /^[0o]/i;

  if (regex.test(thisMove)) {
    const castleType = thisMove.length == 2 ? "kingside" : "queenside";
    console.log(castleType);
  } else if (thisMove.includes("=")) {
    console.log("pawn promo");
  } else {
    const toSquare = thisMove.slice(thisMove.length - 2);
    const fromPiece = thisMove.slice(0, thisMove.length - 2);
    // console.log(fromPiece, toSquare);

    // other piece move
    regex = /^[RNBQK]/;
    if (regex.test(fromPiece)) {
      const pieceType = fromPiece[0].toLowerCase();
      const movedPiece = pieces.filter((piece) => {
        console.log("piece being checked: ", piece);
        return destinationInSet(piece, pieceType, toSquare);
      });

      console.log("movedPiece(s): ", movedPiece);
      // cases
      // just pieceType - length == 1
      // length == 2 - determine if rank or file
      // length == 3 rank and file
    }
    // pawn move
    else {
      console.log("pawn");
    }
  }
  // });

  // const move = "dxe4+"
  res.sendStatus(201);
});

function destinationInSet(piece, pieceType, toSquare) {
  let possiblePiece = false;
  if (piece.pieceType == pieceType) {
    console.log(piece.pieceType, pieceType);
    piece.moveset.forEach((move) => {
      console.log("first check: ", move[0], Number(toSquare[1]) - 1);
      console.log("second check: ", determineFile(move[1]), toSquare[0]);

      if (
        move[0] == Number(toSquare[1]) - 1 &&
        determineFile(move[1]) == toSquare[0]
      ) {
        console.log("MATCH MADE IN HEAVEN");
        possiblePiece = true;
      }
    });
  }
  return possiblePiece;
}

function determineFile(col) {
  const COLUMN = String(col).charCodeAt(0);
  return String.fromCharCode(COLUMN + 17).toLowerCase();
}
module.exports = router;
