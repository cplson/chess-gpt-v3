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
    this.element = document.createElement("div");
    this.x = x;
    this.y = y;
    this.element.classList.add(
      `square`,
      Math.floor(this.x + this.y) % 2 == 0 ? "white-square" : "black-square"
    );
    this.convertToSquareLocation();

    if (piece != "e") {
      const pieceInSquare = new Piece(piece);
      this.element.appendChild(pieceInSquare.pieceImg);
    }
    this.initEventListener(piece);
  }

  getElement() {
    return this.element;
  }

  async initEventListener(piece) {
    const IS_USER_PIECE =
      (piece[0] == "d" && player.color == "black") ||
      (piece[0] == "l" && player.color == "white");
    this.element.addEventListener("click", async () => {
      if (IS_USER_PIECE && player.isTurn) {
        const previous = document.getElementsByClassName("targeted-square");
        if (previous[0]) {
          previous[0].classList.remove("targeted-square");
        }
        this.element.classList.add("targeted-square");
        const targetedPiece = player.pieces.filter((piece) => {
          return piece.row == this.x - 1 && piece.col == this.y;
        });
        if (targetedPiece[0] != null && targetedPiece[0] != undefined) {
          highlightAllMoves(targetedPiece[0].moveset);
        }
      }
    });
  }
  convertToSquareLocation() {
    const ROW = this.x;
    const COLUMN = String(this.y).charCodeAt(0);
    const COLUMN_LETTER = String.fromCharCode(COLUMN + 17);

    this.element.classList.add(`${String(ROW)}`, `${COLUMN_LETTER}`);
  }
}

function highlightMove(move) {
  const ROW = move[0] + 1;
  const COLUMN = String(move[1]).charCodeAt(0);
  const COLUMN_LETTER = String.fromCharCode(COLUMN + 17);

  const element = document.getElementsByClassName(`${ROW} ${COLUMN_LETTER}`);
  console.log(element);
  element[0].classList.add("move-location");
}
function highlightAllMoves(moves) {
  console.log("inside highlight");
  const previouslyHighlighted =
    document.getElementsByClassName("move-location");
  if (previouslyHighlighted.length > 0) {
    // console.log("attempt to remove highlight");
    // previouslyHighlighted.map((element) => {
    //   console.log(element);
    //   element.classlist.remove("move-location");
    // });
    for (let i = previouslyHighlighted.length - 1; i >= 0; i--) {
      previouslyHighlighted[i].classList.remove("move-location");
    }
  }
  moves.forEach((move) => {
    highlightMove(move);
  });
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
