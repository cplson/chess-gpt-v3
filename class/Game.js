import Piece from "./Piece.js";
import Team from "./Team.js";

const SQUARES_PER_SIDE = 8;
let teams;
let gameState;
let player;

export class Game {
  constructor() {
    this.container = document.getElementById("chess-container");
    this.board = document.createElement("div");
    this.board.id = "chess-board";
    this.container.appendChild(this.board);
    this.squares = [];
  }

  async initBoard() {
    gameState = await getState();
    teams = setTeams();
    for (let i = SQUARES_PER_SIDE; i > 0; i--) {
      for (let j = 0; j < SQUARES_PER_SIDE; j++) {
        const square = new Square(i, j, gameState[i - 1][j]);
        this.squares.push(square);
        this.board.appendChild(square.getElement());
      }
    }
  }
}

function setTeams() {
  player = new Team("James", "white");
  const gpt = new Team("Chat-GPT", "black");
  player.updatePieces(gameState);
  return [player, gpt];
}

export class Square {
  constructor(x, y, piece = "e") {
    const ROW = x;
    const COLUMN = String(y).charCodeAt(0);
    const COLUMN_LETTER = String.fromCharCode(COLUMN + 17);

    // console.log("x: ", ROW, "\ny: ", COLUMN_LETTER);
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
    this.initEventListener(this.element, x, y, piece);
  }

  getElement() {
    return this.element;
  }

  async initEventListener(element, x, y, piece) {
    const IS_USER_PIECE =
      (piece[0] == "d" && player.color == "black") ||
      (piece[0] == "l" && player.color == "white");
    element.addEventListener("click", async () => {
      if (IS_USER_PIECE) {
        const previous = document.getElementsByClassName("targeted-square");
        if (previous[0]) {
          previous[0].classList.remove("targeted-square");
        }
        element.classList.add("targeted-square");
      }
    });
  }
}

async function getState() {
  const response = await axios.get("http://localhost:5000/api/gameState");
  return response.data;
}

function startNewTurn() {
  teams.forEach((team) => {
    team.updatePieces(gameState);
    team.isTurn = !isTurn;
  });
}
