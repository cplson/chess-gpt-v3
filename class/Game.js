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

    // Initialize castleBtns
    const castleBtns = Array.from(
      document.getElementsByClassName("castle-btn")
    );
    castleBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const teamColor = btn.classList.contains("white") ? "l" : "d";
        const side = btn.classList.contains("queenside") ? "O-O-O" : "O-O";

        axios
          .post(`http://localhost:5000/api/gameState/castle`, {
            color: teamColor,
            side: side,
          })
          .then(async (res) => {
            if (res.status == 201) {
              //   renderCastleMove(teamColor, side);
              state = await getState();
              gameState = state.gameState;
              gameMoves = state.gameMoves;
              renderMove();
              const castleBtns = Array.from(
                document.getElementsByClassName("castle-btn")
              );
              castleBtns.forEach((btn) => {
                btn.style.opacity = 0;
                btn.disabled = true;
              });

              transitionTurns();
            } else {
              console.log(res);
            }
          });
      });
    });
    initPromptGpt();
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

  await axios
    .post("http://localhost:5000/api/gameState", {
      toX: toSquare.x - 1,
      toY: toSquare.y,
      piece: fromSquarePiece,
    })
    .then(async (res) => {
      if (res.status == 201) {
        state = await getState();
        gameState = state.gameState;
        gameMoves = state.gameMoves;
        renderMove(toSquareElement, toSquare, fromSquarePiece);

        const castleBtns = Array.from(
          document.getElementsByClassName("castle-btn")
        );
        castleBtns.forEach((btn) => {
          btn.style.opacity = 0;
          btn.disabled = true;
        });
        transitionTurns();
      } else {
        console.log(res);
      }
    });
}

function renderMove(toSquareElement, toSquare, fromSquarePiece) {
  let k = 0;
  for (let i = SQUARES_PER_SIDE; i > 0; i--) {
    for (let j = 0; j < SQUARES_PER_SIDE; j++) {
      const updatedSquareState = gameState[i - 1][j];
      // console.log(squares[k * 8 + j].element)
      squares[k * 8 + j].element.textContent = "";
      if (updatedSquareState != "e") {
        const pieceImg = new Piece(updatedSquareState);
        squares[k * 8 + j].element.appendChild(pieceImg.pieceImg);
      }
    }
    k++;
  }

  //check for pawn promo
  if (fromSquarePiece) {
    if (
      fromSquarePiece.pieceType == "p" &&
      (toSquare.x == 8 || toSquare.x == 1)
    ) {
      axios.post("http://localhost:5000/api/gameState/promote", {
        row: toSquare.x - 1,
        col: toSquare.y,
      });
      fromSquarePiece.pieceType = "q";
      console.log((fromSquarePiece.color == "white" ? "l" : "d") + "q");
      const pieceImg = new Piece(
        (fromSquarePiece.color == "white" ? "l" : "d") + "q"
      );
      toSquareElement.innerHTML = "";
      console.log(pieceImg.pieceImg);
      toSquareElement.appendChild(pieceImg.pieceImg);
    }
  }
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

  const regularMoves = moves.filter((move) => typeof move != "string");
  const castleMoves = moves.filter((move) => typeof move == "string");
  //   console.log(regularMoves);
  //   console.log(castleMoves);

  const castleBtns = Array.from(document.getElementsByClassName("castle-btn"));
  castleBtns.forEach((btn) => {
    btn.style.opacity = 0;
    btn.disabled = true;
  });
  regularMoves.forEach((move) => {
    highlightMove(move);
  });

  const teamsTurn = teams.filter((team) => team.isTurn)[0];
  castleMoves.forEach((move) => {
    castleBtns.forEach((btn) => {
      if (move === "O-O") {
        if (
          btn.classList.contains(`kingside`) &&
          btn.classList.contains(`${teamsTurn.color}`)
        ) {
          btn.style.opacity = 1;
          btn.disabled = false;
        }
      } else {
        if (
          btn.classList.contains(`queenside`) &&
          btn.classList.contains(`${teamsTurn.color}`)
        ) {
          btn.style.opacity = 1;
          btn.disabled = false;
        }
      }
    });
  });
}

async function getState() {
  const response = await axios.get("http://localhost:5000/api/gameState");
  return response.data;
}

async function transitionTurns() {
  selectedPiece = {};

  const targetedSquares = document.getElementsByClassName("targeted-square");
  if(targetedSquares.length > 0){
      targetedSquares[0].classList.remove("targeted-square");
  }

  const highlightedSquares = document.getElementsByClassName("move-location");
  for (let i = highlightedSquares.length - 1; i >= 0; i--) {
    highlightedSquares[i].classList.remove("move-location");
  }

  //   teams.forEach(async (team) => {
  //     team.toggleTurn();
  //     await team.updatePieces(gameState, gameMoves);
  //   });

  await Promise.all(
    teams.map(async (team) => {
      team.toggleTurn();
      await team.updatePieces(gameState, gameMoves);
    })
  );

  //   if chat gpts turn
  if (teams[1].isTurn) {
    /*
       -> call chat api
       -> update the gameState
       -> get the gameState
       -> render move
       -> transition turns
      */
    const prompt = await axios.post("http://localhost:5000/api/chat", {
      pieces: teams[1].pieces,
      state: gameState,
    });
    if (prompt.status == 201) {
      try {
        const response = await axios.get("http://localhost:5000/api/chat");
        const aiMove = response.data;
        await axios
          .post("http://localhost:5000/api/gameState", {
            toX: aiMove.toX,
            toY: aiMove.toY,
            piece: aiMove.aiPiece,
          })
          .then(async (res) => {
            state = await getState();
            gameState = state.gameState;
            gameMoves = state.gameMoves;
          });
          const toSquareElement = getSquareElement(aiMove.toX + 1, aiMove.toY)
          console.log(toSquareElement)
        renderMove(toSquareElement, [aiMove.toX, aiMove.toY], aiMove.aiPiece)
        transitionTurns()
      } catch (err) {
        console.log(err);
      }
    }
  }
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

async function initPromptGpt() {
  const promptBtn = document.getElementById("new-game-btn");
  promptBtn.addEventListener("click", async () => {
    const promptStatus = await axios.post("http://localhost:5000/api/chat", {
      message: "hey baby",
    });
    // const response = await axios.get('')
    console.log("promptStatus: ", promptStatus);
  });
}
