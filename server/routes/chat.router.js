const express = require("express");
const router = express.Router();
router.use(express.json());
router.get("/", async (req, res) => {
  // GET route code here
  // const completion = await openai.chat.completions.create({
  //   messages: [{ role: "system", content: "You are a helpful assistant." }],
  //   model: "gpt-3.5-turbo",
  // });

  // console.log(completion.choices[0]);
  res.send(console.log("yay"));
});

module.exports = router;
