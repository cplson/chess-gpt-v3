const express = require("express");
const router = express.Router();

const state = [];
router.get("/state/:state/color/:color", (req, res) => {
  const playerColor = req.params.color;
  const enemyColor = playerColor == "white" ? "black" : "white";
  const unformattedState = req.params.state.split(",");
  formatState(unformattedState);
  const allPieces = formatPieces();
  const teamPieces = filterTeamPieces(playerColor, allPieces);
  const enemyPieces = filterTeamPieces(enemyColor, allPieces);
  console.log("teamPieces: ", teamPieces);
  console.log("enemyPieces: ", enemyPieces);
  res.send("eyyy");
});

function formatPieces() {
  const formattedPieces = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (state[i][j] != "e") {
        const str = state[i][j];
        const color = str[0] == "l" ? "white" : "black";
        const pieceType = str[1];
        const moveset = [];
        formattedPieces.push({ pieceType, color, moveset });
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
  for (let i = 0; i < 8; i++) {
    const row = unformattedState.slice(i * 8, (i + 1) * 8);
    state.push(row);
  }
}

module.exports = router;

/*
    0. Create function to format pieces
    1. Get pieces for the player
    2. for every player piece, get all of its moves
*/
