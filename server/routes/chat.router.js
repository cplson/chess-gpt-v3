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
  const thisMove = "fg6";
  let regex = /^[0o]/i;

  if (regex.test(thisMove)) {
    const castleType = thisMove.length == 2 ? "kingside" : "queenside";
    console.log(castleType);
  } else if (thisMove.includes("=")) {
    console.log("pawn promo");
  } else {
    const toSquare = thisMove.slice(thisMove.length - 2);
    const fromPiece = thisMove.slice(0, thisMove.length - 2).trim();

    // other piece move
    regex = /^[RNBQK]/;
    if (regex.test(fromPiece)) {
      const pieceType = fromPiece[0].toLowerCase();
      const possiblePieces = pieces.filter((piece) => {
        return destinationInSet(piece, pieceType, toSquare);
      });

      // console.log("possiblePieces(s): ", possiblePieces);
      // const COL = convertToCol(toSquare[0]);
      // const ROW = Number(toSquare[1]) - 1
      // console.log([ROW, COL])

      if (fromPiece.length == 2) {
        if (/[a-z]/i.test(fromPiece[1])) {
          const pieceMoved = possiblePieces.filter(
            (piece) => piece.col == convertToCol(fromPiece[1])
          );
        } else {
          const pieceMoved = possiblePieces.filter(
            (piece) => piece.row == Number(fromPiece[1]) - 1
          );
        }
      }
      else if (fromPiece.length == 3) {
        const pieceMoved = possiblePieces.filter(
          (piece) =>
            piece.row == Number(fromPiece[2]) - 1 &&
            piece.col == convertToCol(fromPiece[1])
        );
      }
     
    }
    // pawn move
    else {
      // if length == 0, use toSquare file
      if(fromPiece.length == 0){
        const pawn = pieces.filter(piece => piece.pieceType == 'p' && convertToCol(toSquare[0]) == piece.col)
      }
      else{
        // else use 
        const pawn = pieces.filter(piece => piece.pieceType == 'p' && convertToCol(fromPiece[0]) == piece.col)
        console.log('pawn is: ', pawn)
      }
    }
  }
  // });

  // const move = "dxe4+"
  res.sendStatus(201);
});

function destinationInSet(piece, pieceType, toSquare) {
  let possiblePiece = false;
  if (piece.pieceType == pieceType) {
    piece.moveset.forEach((move) => {
      if (
        move[0] == Number(toSquare[1]) - 1 &&
        determineFile(move[1]) == toSquare[0]
      ) {
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

function convertToCol(file) {
  const FILE = String(file).charCodeAt(0);
  return Number(String.fromCharCode(FILE - 49));
}
module.exports = router;
