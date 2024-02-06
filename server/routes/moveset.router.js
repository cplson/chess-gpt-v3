const express = require("express");
const router = express.Router();

let state;
router.get("/state/:state", (req, res) => {
  state = req.params.state;
  console.log("inside moveset router:", state);
  res.send("eyyy");
});

module.exports = router;
