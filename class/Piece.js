export default class Piece {
  constructor(state) {
    console.log(state);
    this.pieceUrl = `./data/Chess_${state[1]}${state[0]}t45.svg`;
    this.pieceImg = document.createElement("img");
    this.pieceImg.src = this.pieceUrl;
    this.pieceImg.alt = "piece";
    // this.pieceImg.classList.add(`$`)
    console.log(this.pieceImg);
  }
}

// async function loadPieces() {
//   const blackPawn = await loadImage("./data/assets/Chess_pdt45.svg");
//   const blackRook = await loadImage("./data/assets/Chess_rdt45.svg");
//   const blackKnight = await loadImage("./data/Chess_ndt45.svg");
//   const blackBishop = await loadImage("./data/Chess_bdt45.svg");
//   const blackQueen = await loadImage("./data/Chess_qdt45.svg");
//   const blackKing = await loadImage("./data/Chess_kdt45.svg");
//   const whitePawn = await loadImage("./data/Chess_plt45.svg");
//   const whiteRook = await loadImage("./data/Chess_rlt45.svg");
//   const whiteKnight = await loadImage("./data/Chess_nlt45.svg");
//   const whiteBishop = await loadImage("./data/Chess_blt45.svg");
//   const whiteQueen = await loadImage("./data/Chess_qlt45.svg");
//   const whiteKing = await loadImage("./data/Chess_klt45.svg");
// }
