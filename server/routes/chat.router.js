const openAi = require("openai");
const express = require("express");
const router = express.Router();

const openai = new openAi();
let state = [
  'a8: r', 'b8: n', 'c8: b', 'd8: q', 'e8: k', 'f8: b', 'g8: n', 'h8: r', 
  'a7: p', 'b7: p', 'c7: p', 'd7: p', 'e7: p', 'f7: p', 'g7: p', 'h7: p', 
  'a6: e', 'b6: e', 'c6: e', 'd6: e', 'e6: e', 'f6: e', 'g6: e', 'h6: e', 
  'a5: e', 'b5: e', 'c5: e', 'd5: e', 'e5: e', 'f5: e', 'g5: e', 'h5: e', 
  'a4: e', 'b4: e', 'c4: e', 'd4: e', 'e4: e', 'f4: e', 'g4: e', 'h4: e', 
  'a3: e', 'b3: e', 'c3: e', 'd3: e', 'e3: e', 'f3: e', 'g3: e', 'h3: e', 
  'a2: P', 'b2: P', 'c2: P', 'd2: P', 'e2: P', 'f2: P', 'g2: P', 'h2: P', 
  'a1: R', 'b1: N', 'c1: B', 'd1: Q', 'e1: K', 'f1: B', 'g1: N', 'h1: R'
]

const stringifiedState = []

const messages = [
  {
    role: "system",
    content: `
      You are a chess player designed to output moves 
      using the 'move' key in JSON using algebraic notation,
      ensuring to note the file and/or rank of the original piece position when ambiguous moves are made. 
      
      The user will give the board state when they make 
      their turn to ensure syncronized state, in the state the uppercase letters will represent white pieces 
      and lowercase will represent black, while e represents empty squares. 
      return the updated state of the game as it is represented after your move using the key 'state'
      `,
  },
  {
    role: "user",
    content: `You have the first move, good luck! ${JSON.stringify(state)}`,
  },
];

router.use(express.json());

let aiMove = {
  moveType: "normal",
  aiPiece: {},
  toX: 0,
  toY: 0,
};
let pieceMoved;

router.get("/", async (req, res) => {
  // GET route code here

  res.send(aiMove);
});

router.post("/", async (req, res) => {
  const pieces = req.body.pieces;
  state = req.body.state;
 
loadStringState();

  if (messages.length > 2) {
    messages.push({ role: "user", content: `
    here's the updated state after my move ${JSON.stringify(stringifiedState)}, 
    reminder you are white, take care to ensure you're next 
    move is valid using the updated state that the user provides.
    ` });
  }
  console.log("the number of messages is: ", messages.length);

  // const completion = await openai.chat.completions.create({
  //   model: "gpt-4-turbo-preview",
  //   response_format: { type: "json_object" },
  //   messages: messages,
  // });

  messages.push(completion.choices[0].message);
  console.log("the number of messages is: ", messages.length);

  let move = JSON.parse(completion.choices[0].message.content).move;
  let aiState = JSON.parse(completion.choices[0].message.content).state;
  move = move.replace(/[\s-x+]/g, "");
  // console.log("the whole response is: ", completion.choices[0].message);
  console.log("resulting move is: ", move);
  console.log('aiState is:', aiState)

  // const possibleMoveTypes = [
  //   "0-0",
  //   "0 -0 -0",
  //   "O-O",
  //   "O-O-O",
  //   "e5",
  //   "N a6",
  //   "Qb5",
  //   "dxe4+",
  //   "gxf6",
  //   "B5xd5",
  //   "Qf5xf7",
  //   "e8 = Q",
  //   "exd1=N",
  // ];
  // Remove dashes, x's, and +'s, and spaces
  // const filteredMoves = possibleMoveTypes.forEach((move, index) => {
  // possibleMoveTypes[index] = move.replace(/[\s-x+]/g, "");
  // console.log(possibleMoveTypes[index]);
  // const move = possibleMoveTypes[index];

  let regex = /^[0o]/i;

  if (regex.test(move)) {
    aiMove.moveType = move.length == 2 ? "O-O" : "O-O-O";
  } else if (move.includes("=")) {
    console.log("pawn promo");
  } else {
    const toSquare = move.slice(move.length - 2);
    const fromPiece = move.slice(0, move.length - 2).trim();

    aiMove.toY = convertToCol(toSquare[0]);
    aiMove.toX = Number(toSquare[1]) - 1;

    if(/^[a-h][1-8][a-h][1-8]$/.test(move)){
      // convert files and ranks
      // determine the move
      const ROW = Number(fromPiece[1]) - 1;
      const COL = convertToCol(fromPiece[0])

      pieceMoved = pieces.filter(piece => {
        return (
          piece.row == ROW &&  piece.col == COL
        )
      })
      console.log(aiMove, fromPiece)
      console.log(pieceMoved)
    }
    // other piece move
    else if (/^[RNBQK]/.test(fromPiece)) {
      console.log("inside non-pawn move", fromPiece, fromPiece.length);

      const pType = fromPiece[0].toLowerCase();
      const possiblePieces = pieces.filter((piece) => {
        return (piece.pieceType == pType) && destinationInSet(piece, pType, toSquare);
      });
      console.log(possiblePieces)
      if(fromPiece.length == 1){
        pieceMoved = possiblePieces
      }
      else if (fromPiece.length == 2) {
        if (/[a-z]/i.test(fromPiece[1])) {
          pieceMoved = possiblePieces.filter(
            (piece) => piece.col == convertToCol(fromPiece[1])
          );
        } else {
          pieceMoved = possiblePieces.filter(
            (piece) => piece.row == Number(fromPiece[1]) - 1
          );
        }
      } else if(fromPiece.length == 3){
        pieceMoved = possiblePieces.filter(
          (piece) =>
            piece.row == Number(fromPiece[2]) - 1 &&
            piece.col == convertToCol(fromPiece[1])
        );
      }
    }
    // pawn move
    else {
      // if length == 0, use toSquare file
      console.log("inside pawn move");
      if (fromPiece.length == 0) {
        pieceMoved = pieces.filter(
          (piece) =>
            piece.pieceType == "p" && convertToCol(toSquare[0]) == piece.col
        );
      } else {
        // else use
        pieceMoved = pieces.filter(
          (piece) =>
            piece.pieceType == "p" && convertToCol(fromPiece[0]) == piece.col
        );
      }
    }
  }
  // });
  
  aiMove.aiPiece = pieceMoved[0];
  console.log(aiMove)
  res.sendStatus(201);
});

function destinationInSet(piece, pType, toSquare) {
  let possiblePiece = false;
  
    piece.moveset.forEach((move) => {
      if (
        move[0] == Number(toSquare[1]) - 1 &&
        determineFile(move[1]) == toSquare[0]
      ) {
        possiblePiece = true;
      }
    });
  
  return possiblePiece;
}

function determineFile(col) {
  const COLUMN = String(col).charCodeAt(0);
  return String.fromCharCode(COLUMN + 17).toLowerCase();
}

function loadStringState(){
  stringifiedState.length = 0;

  for(let i = 7; i >= 0; i--){
    for(let j = 0; j < 8; j++){
      const col = String(j).charCodeAt(0)
        const file = String.fromCharCode(col + 49)
        const square = file + Number(i + 1)
      if(state[i][j][0] == 'l'){
        const col = String(j).charCodeAt(0)
        const file = String.fromCharCode(col + 49)
        stringifiedState.push(`${square}: ${state[i][j][1].toUpperCase()}`)
      }
      else if(state[i][j][0] == 'd'){
        stringifiedState.push(`${square}: ${state[i][j][1]}`)
      }
      else{
        stringifiedState.push(`${square}: e`)
      }
    }
    stringifiedState.push('\n')
  }
  console.log('strinified state is:', stringifiedState)
}

function convertToCol(file) {
  const FILE = String(file).charCodeAt(0);
  return Number(String.fromCharCode(FILE - 49));
}
module.exports = router;
