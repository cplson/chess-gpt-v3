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
  const message = req.body.message;
  const board = [
    ["lrq", "ln", "lb", "lq", "lku", "lb", "ln", "lrk"],
    ["lp", "lp", "lp", "lp", "lp", "lp", "lp", "lp"],
    ["e", "e", "e", "e", "e", "e", "e", "e"],
    ["e", "e", "e", "e", "e", "e", "e", "e"],
    ["e", "e", "e", "e", "e", "e", "e", "e"],
    ["e", "e", "e", "e", "e", "e", "e", "e"],
    ["dp", "dp", "dp", "dp", "dp", "dp", "dp", "dp"],
    ["drq", "dn", "db", "dq", "dku", "db", "dn", "drk"],
  ];
  console.log("heres the message: ", message);

  // const completion = await openai.chat.completions.create({
  //   model: "gpt-3.5-turbo-0125",
  //   response_format: { type: "json_object" },
  //   messages: [
  //     { role: "system", content: "You are a chess player designed to output moves using the 'move' key in JSON using algebraic notation. The user will give the board format when they make their turn to ensure syncronized state" },
  //     { role: "user", content: "You have the first move, good luck!" }
  //   ],
  // });

  // const move = JSON.parse(completion.choices[0].message.content).move
  // console.log(completion.choices[0]);
  // console.log('resulting move is: ', move)

  // const possibleMoveTypes = [
  //   "0-0",
  //   "0 -0 -0",
  //   "O-O",
  //   "O-O-O",
  //   "e5",
  //   "N3 e2",
  //   "Qb5",
  //   "dxe4+",
  //   "gxf6",
  //   "B5xd5",
  //   "Qf5xf7",
  //   "e8 = Q",
  //   "exd1=N",
  // ];
  // // Remove dashes, x's, and +'s, and spaces
  // const filteredMoves = possibleMoveTypes.forEach((move, index) => {
  //   possibleMoveTypes[index] = move.replace(/[\s-x]/g, "");
  //   console.log(possibleMoveTypes[index]);
  // });
  const move = "dxe4+"
  res.sendStatus(201);
});

module.exports = router;
