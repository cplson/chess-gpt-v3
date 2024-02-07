const express = require("express");
const router = express.Router();

const SQUARES_PER_SIDE = 8;
const state = [];
router.get("/state/:state/color/:color", (req, res) => {
  const playerColor = req.params.color;
  const enemyColor = playerColor == "white" ? "black" : "white";
  const unformattedState = req.params.state.split(",");
  formatState(unformattedState);
  const allPieces = formatPieces();
  const teamPieces = filterTeamPieces(playerColor, allPieces);
  const enemyPieces = filterTeamPieces(enemyColor, allPieces);
  getMoves(teamPieces);
  res.send(teamPieces);
});

function pawnMoves(pawn) {
  const HOME_ROW = pawn.color == "white" ? 1 : 6;
  const Y_DIRECTION = pawn.color == "white" ? 1 : -1;
  const ENEMY_INDICATOR = pawn.color == "white" ? "d" : "l";

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
  console.log(pawn.moveset);
}

function determineMoveType(piece) {
  if (piece.pieceType == "p") {
    return pawnMoves(piece);
  } else if (
    piece.pieceType == "q" ||
    piece.pieceType == "r" ||
    piece.pieceType == "b"
  ) {
    // return extenderMoves(piece)
  } else {
    // return nonExtenderMoves(piece)
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
