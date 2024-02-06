const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  console.log("inside moveset router");
  res.send("titties!");
});

module.exports = router;
