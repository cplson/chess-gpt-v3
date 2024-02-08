export default class Piece {
  constructor(state) {
    this.pieceUrl = `./data/Chess_${state[1]}${state[0]}t45.svg`;
    this.pieceImg = document.createElement("img");
    this.pieceImg.src = this.pieceUrl;
    this.pieceImg.alt = state[0] == "l" ? "white-piece" : "black-piece";
    this.pieceImg.classList.add("piece", state[0] == "l" ? "white" : "black");
  }
}
