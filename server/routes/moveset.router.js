const express = require("express");
const router = express.Router();

let playerColor;
const state = [];
router.get("/state/:state/color/:color", (req, res) => {
  playerColor = req.params.color;
  const unformattedState = req.params.state.split(",");
  formatState(unformattedState);
  const pieces = filterTeamPieces(playerColor);
  res.send("eyyy");
});

function filterTeamPieces(color) {
  const FILTERED_COLOR = color == "white" ? "l" : "d";
  const teamPieces = [];

  for (let i = 0; i < 8; i++) {
    teamPieces.push(...state[i].filter((piece) => piece[0] == FILTERED_COLOR));
  }
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
