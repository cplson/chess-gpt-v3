import Piece from "./Piece.js";
import Team from "./Team.js";

const SQUARES_PER_SIDE = 8;
let teams;
let gameState;
let gameMoves;
let player;
let selectedPiece;
let state;
const squares = [];

export class Game {
  constructor() {
    this.container = document.getElementById("chess-container");
    this.board = document.createElement("div");
    this.board.id = "chess-board";
    this.container.appendChild(this.board);
    this.squares = [];
  }

  async initBoard() {
    state = await getState();
    gameState = state.gameState;
    gameMoves = state.gameMoves;
    teams = setTeams();
    for (let i = SQUARES_PER_SIDE; i > 0; i--) {
      for (let j = 0; j < SQUARES_PER_SIDE; j++) {
        const square = new Square(i, j, gameState[i - 1][j]);
        squares.push(square);
        this.board.appendChild(square.getElement());
      }
    }
  }

  async getSquareAt(row, col) {
    return this.squares[row * SQUARES_PER_SIDE + col];
  }
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
    this.element.addEventListener("click", async () => {
      let occupiedBy;
      const square = getSquareElement(this.x, this.y);
      const TEAMS_TURN = player.isTurn ? teams[0] : teams[1];
      const SQUARE_OCCUPIED = square.childNodes.length > 0;
      if (SQUARE_OCCUPIED) {
        occupiedBy = square.childNodes[0];

        const IS_TEAM_PIECE =
          SQUARE_OCCUPIED && occupiedBy.classList.contains(TEAMS_TURN.color);

        if (IS_TEAM_PIECE) {
          const previous = document.getElementsByClassName("targeted-square");
          if (previous[0]) {
            previous[0].classList.remove("targeted-square");
          }
          square.classList.add("targeted-square");
          const targetedPieces = TEAMS_TURN.pieces.filter((piece) => {
            return piece.row == this.x - 1 && piece.col == this.y;
          });
          selectedPiece = targetedPieces[0];
          if (selectedPiece != null && selectedPiece != undefined) {
            highlightAllMoves(selectedPiece.moveset);
          }
        }
      }
      if (TEAMS_TURN.isTurn && square.classList.contains("move-location")) {
        move(selectedPiece, this, square);
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

async function move(fromSquarePiece, toSquare, toSquareElement) {
  let invertedRow = Math.abs(SQUARES_PER_SIDE - fromSquarePiece.row);
  if (invertedRow == 8) {
    invertedRow = 0;
  }

  const response = await axios
    .post("http://localhost:5000/api/gameState", {
      toX: toSquare.x - 1,
      toY: toSquare.y,
      piece: fromSquarePiece,
    })
    .then((res) => {
      if (res.status == 201) {
        console.log("eyy");
        renderMove(toSquareElement, toSquare, fromSquarePiece);
        transitionTurns();
      } else {
        console.log(res);
      }
    });
}

function renderMove(toSquareElement, toSquare, fromSquarePiece) {
  // get the image of the piece thats being moved
  const fromSquareElement = getSquareElement(
    fromSquarePiece.row + 1,
    fromSquarePiece.col
  );

  const pieceImg = fromSquareElement.children[0];
  if (toSquareElement.children[0]) {
    toSquareElement.removeChild(toSquareElement.children[0]);
  }
  // remove piece from square that the piece came from
  // and add to the element that the piece moved too
  fromSquareElement.removeChild(pieceImg);
  toSquare.element.appendChild(pieceImg);
}

function highlightMove(move) {
  const ROW = move[0] + 1;
  const COLUMN = String(move[1]).charCodeAt(0);
  const COLUMN_LETTER = String.fromCharCode(COLUMN + 17);

  const element = document.getElementsByClassName(`${ROW} ${COLUMN_LETTER}`);
  element[0].classList.add("move-location");
}
function highlightAllMoves(moves) {
  const previouslyHighlighted =
    document.getElementsByClassName("move-location");
  if (previouslyHighlighted.length > 0) {
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

async function transitionTurns() {
  selectedPiece = {};

  const targetedSquares = document.getElementsByClassName("targeted-square");
  targetedSquares[0].classList.remove("targeted-square");

  const highlightedSquares = document.getElementsByClassName("move-location");
  for (let i = highlightedSquares.length - 1; i >= 0; i--) {
    highlightedSquares[i].classList.remove("move-location");
  }
  state = await getState();
  gameState = state.gameState;
  gameMoves = state.gameMoves;
  teams.forEach((team) => {
    team.toggleTurn();
    team.updatePieces(gameState, gameMoves);
  });
  //   console.log("gameMoves after turn transition: ", gameMoves);
}

function setTeams() {
  player = new Team("James", "white");
  const gpt = new Team("Chat-GPT", "black");
  player.updatePieces(gameState, gameMoves);
  return [player, gpt];
}

function getSquareElement(row, col) {
  // SEEMS OK FOR NOW
  const ROW = row;
  const COLUMN = String(col).charCodeAt(0);
  const COLUMN_LETTER = String.fromCharCode(COLUMN + 17);
  return document.getElementsByClassName(`${ROW} ${COLUMN_LETTER}`)[0];
}
