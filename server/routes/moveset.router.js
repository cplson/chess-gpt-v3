const express = require("express");
const router = express.Router();
router.use(express.json());

const SQUARES_PER_SIDE = 8;
const state = [];
router.get("/state/:state/color/:color", (req, res) => {
  const playerColor = req.params.color;
  const enemyColor = playerColor == "white" ? "black" : "white";
  const unformattedState = req.params.state.split(",");
  formatState(unformattedState);
  if (playerColor == "white") {
    console.log("gamestate in moverouter: ", state);
  }
  const allPieces = formatPieces();
  const teamPieces = filterTeamPieces(playerColor, allPieces);
  const enemyPieces = filterTeamPieces(enemyColor, allPieces);
  getMoves(teamPieces);
  res.send(teamPieces);
});

function nonExtenderMoves(piece) {
  const ENEMY_INDICATOR = piece.color == "white" ? "d" : "l";
  let set;
  if (piece.pieceType == "k") {
    set = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
      [0, 1],
      [0, -1],
      [-1, 0],
      [1, 0],
    ];
  } else {
    set = [
      [-2, 1],
      [-2, -1],
      [2, 1],
      [2, -1],
      [1, 2],
      [-1, 2],
      [1, -2],
      [-1, -2],
    ];
  }

  set.forEach((move) => {
    const ROW = piece.row + move[0];
    const COL = piece.col + move[1];
    if (isMoveValid(ROW, COL, ENEMY_INDICATOR)[0]) {
      piece.moveset.push([ROW, COL]);
    }
  });
}

function extenderMoves(extender) {
  const ENEMY_INDICATOR = extender.color == "white" ? "d" : "l";
  let set;
  if (extender.pieceType == "q") {
    set = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
      [0, 1],
      [0, -1],
      [-1, 0],
      [1, 0],
    ];
  } else if (extender.pieceType == "b") {
    set = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];
  } else if (extender.pieceType == "r") {
    set = [
      [0, 1],
      [0, -1],
      [-1, 0],
      [1, 0],
    ];
  }
  set.forEach((direction) => {
    let ableToMoveForward = true;
    let i = 1;
    let row;
    let col;
    while (ableToMoveForward) {
      row = extender.row + i * direction[0];
      col = extender.col + i * direction[1];
      let isValid = isMoveValid(row, col, ENEMY_INDICATOR);
      if (isValid[0]) {
        extender.moveset.push([row, col]);
        if (isValid[1] != "e") {
          ableToMoveForward = false;
        }
      } else {
        ableToMoveForward = false;
      }
      i++;
    }
  });
  // console.log(extender.moveset)
}

function isMoveValid(ROW, COL, ENEMY_INDICATOR) {
  // check if move is on board
  if (
    ROW >= 0 &&
    ROW < SQUARES_PER_SIDE &&
    COL >= 0 &&
    COL < SQUARES_PER_SIDE
  ) {
    // then check if square is occupied
    if (state[ROW][COL][0] == "e" || state[ROW][COL][0] == ENEMY_INDICATOR) {
      // if occupied, by what? determine action
      return [true, state[ROW][COL]];
    } else {
      return [false];
    }
  } else {
    return [false];
  }
}

function pawnMoves(pawn) {
  const HOME_ROW = pawn.color == "white" ? 1 : 6;
  const Y_DIRECTION = pawn.color == "white" ? 1 : -1;
  const ENEMY_INDICATOR = pawn.color == "white" ? "d" : "l";
  const AT_FINAL_ROW =
    (pawn.color == "white" && pawn.row == 7) ||
    (pawn.color == "black" && pawn.row == 0);
  if (!AT_FINAL_ROW) {
    if (
      pawn.col > 0 &&
      state[pawn.row + Y_DIRECTION][pawn.col - 1][0] == ENEMY_INDICATOR
    ) {
      pawn.moveset.push([pawn.row + Y_DIRECTION, pawn.col - 1]);
    }
    if (
      pawn.col < SQUARES_PER_SIDE - 1 &&
      state[pawn.row + Y_DIRECTION][pawn.col + 1][0] == ENEMY_INDICATOR
    ) {
      pawn.moveset.push([pawn.row + Y_DIRECTION, pawn.col + 1]);
    }

    if (state[pawn.row + Y_DIRECTION][pawn.col] == "e") {
      pawn.moveset.push([pawn.row + Y_DIRECTION, pawn.col]);
      if (
        pawn.row == HOME_ROW &&
        state[pawn.row + Y_DIRECTION + Y_DIRECTION][pawn.col] == "e"
      ) {
        pawn.moveset.push([pawn.row + Y_DIRECTION + Y_DIRECTION, pawn.col]);
      }
    }
  }
}

function determineMoveType(piece) {
  if (piece.pieceType == "p") {
    pawnMoves(piece);
  } else if (
    piece.pieceType == "q" ||
    piece.pieceType == "r" ||
    piece.pieceType == "b"
  ) {
    extenderMoves(piece);
  } else {
    nonExtenderMoves(piece);
  }
}

function getMoves(pieces) {
  for (let i = 0; i < pieces.length; i++) {
    determineMoveType(pieces[i]);
  }
}

function formatPieces() {
  const formattedPieces = [];
  for (let i = 0; i < SQUARES_PER_SIDE; i++) {
    for (let j = 0; j < SQUARES_PER_SIDE; j++) {
      if (state[i][j] != "e") {
        const str = state[i][j];
        const color = str[0] == "l" ? "white" : "black";
        const pieceType = str[1];
        const row = i;
        const col = j;
        const moveset = [];
        formattedPieces.push({ pieceType, color, row, col, moveset });
      }
    }
  }
  return formattedPieces;
}

function filterTeamPieces(color, allPieces) {
  const teamPieces = [];
  teamPieces.push(...allPieces.filter((piece) => piece.color == color));
  return teamPieces;
}

function formatState(unformattedState) {
  state.length = 0;
  for (let i = 0; i < SQUARES_PER_SIDE; i++) {
    const row = unformattedState.slice(
      i * SQUARES_PER_SIDE,
      (i + 1) * SQUARES_PER_SIDE
    );
    state.push(row);
  }
}

module.exports = router;

/*
    X. Create function to format pieces
    X. Get pieces for the player
    2. for every player piece, get all of its moves
*/
