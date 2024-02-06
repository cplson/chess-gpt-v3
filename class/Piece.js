export default class Piece {
  constructor(state) {
    this.pieceUrl = `./data/Chess_${state[1]}${state[0]}t45.svg`;
    this.pieceImg = document.createElement("img");
    this.pieceImg.src = this.pieceUrl;
    this.pieceImg.alt = "piece";
    this.pieceImg.classList.add(state[0] == "l" ? "light" : "dark");
  }
}
