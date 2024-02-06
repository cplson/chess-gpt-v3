import Piece from "./Piece.js";

const SQUARES_PER_SIDE = 8;
export class Game {
  constructor() {
    this.container = document.getElementById("chess-container");
    this.board = document.createElement("div");
    this.board.id = "chess-board";
    this.container.appendChild(this.board);
    this.squares = [];
  }

  async initBoard() {
    const gameState = await getState();
    for (let i = SQUARES_PER_SIDE; i > 0; i--) {
      for (let j = 0; j < SQUARES_PER_SIDE; j++) {
        const square = new Square(i, j, gameState[i - 1][j]);
        this.squares.push(square);
        this.board.appendChild(square.getElement());
      }
    }
  }
}

export class Square {
  constructor(x, y, piece = "e") {
    const ROW = x;
    const COLUMN = String(y).charCodeAt(0);
    const COLUMN_LETTER = String.fromCharCode(COLUMN + 17);

    console.log("x: ", ROW, "\ny: ", COLUMN_LETTER);
    this.element = document.createElement("div");
    this.element.classList.add(
      `square`,
      Math.floor(x + y) % 2 == 0 ? "white-square" : "black-square",
      `${String(ROW)}`,
      `${COLUMN_LETTER}`
    );
    if (piece != "e") {
      const pieceInSquare = new Piece(piece);
      this.element.appendChild(pieceInSquare.pieceImg);
    }
  }

  getElement() {
    return this.element;
  }
}

async function getState() {
  console.log("inside getstate");
  const response = await axios.get("http://localhost:5000/api/gameState");
  return response.data;
}
