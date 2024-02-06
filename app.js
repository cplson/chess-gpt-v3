import { Game, Square } from "./class/Game.js";

window.addEventListener("DOMContentLoaded", async () => {
  // document
  //   .getElementById("new-game-button")
  //   .addEventListener("click", async () => {
  //     const message = await axios.get("/api/chat");
  //     console.log(message);
  //   });
  const game = new Game();
  game.initBoard();
  //   const gameState = await game.getState();
  //   console.log("gameState", gameState);
});
