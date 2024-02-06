const express = require("express");
const router = express.Router();

const state = [];
router.get("/state/:state", (req, res) => {
  const unformattedState = req.params.state.split(",");
  formatState(unformattedState);
    console.log(state);
  res.send("eyyy");
});

function formatState(unformattedState) {
    for (let i = 0; i < 8; i++) {
        const row = unformattedState.slice(i * 8, (i + 1) * 8);
        state.push(row);
    }
}

module.exports = router;
