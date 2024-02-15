const express = require("express");
const router = express.Router();
router.use(express.json());

const SQUARES_PER_SIDE = 8;
const state = [];
const moveHistory = [];

router.post("/updateState", (req, res) => {
  const unformattedState = req.body.gameState;
  formatState(unformattedState);

  if (req.body.moveHistory.length > moveHistory.length) {
    moveHistory.push(req.body.moveHistory[req.body.moveHistory.length - 1]);
  }
  res.sendStatus(201);
});

router.get("/color/:color/isTurn/:isTurn", (req, res) => {
  const THIS_TEAMS_TURN = Boolean(req.params.isTurn == "true");
  const teamColor = req.params.color;
  const enemyColor = teamColor == "white" ? "black" : "white";

  const allPieces = formatPieces();
  const teamPieces = filterTeamPieces(teamColor, allPieces);
  const enemyPieces = filterTeamPieces(enemyColor, allPieces);
  getMoves(teamPieces);
  getMoves(enemyPieces);
  const teamRooks = teamPieces.filter((piece) => piece.pieceType == "r");
  // const enemyRooks = enemyPieces.filter((piece) => piece.pieceType == "r");
  const king = teamPieces.filter((piece) => piece.pieceType == "k")[0];
  // const enemyKing = enemyPieces.filter((piece) => piece.pieceType == "k")[0];

  teamRooks.forEach((rook) => {
    checkForCastle(rook, king, enemyPieces);
  });
  // enemyRooks.forEach((rook) => {
  //   checkForCastle(rook, enemyKing, teamPieces);
  // });

  if (THIS_TEAMS_TURN) {
    const THREAT_STATE = checkThreatState(king.row, king.col, enemyPieces);
    if (THREAT_STATE.isCheck) {
      // check if checkmate
      const IS_CHECKMATE = checkCheckmate(
        king,
        teamPieces.filter((piece) => piece.pieceType != "k"),
        enemyPieces,
        THREAT_STATE.threateningPiece
      );
      console.log("IS_CHECKMATE: ", IS_CHECKMATE);
    }
  }
  res.send(teamPieces);
});

function checkCheckmate(king, teamPieces, enemyPieces, threateningPiece) {
  let isCheckmate = true;
  // get path to king
  const pathToKing = getPathToKing(king, threateningPiece);
  // check if threateningPiece can be taken
  // or if piece can intercept the path to the king
  teamPieces.forEach((piece) => {
    const movesToKeep = [];
    if (piece.pieceType == "r") {
    }
    piece.moveset.forEach((move, moveIndex) => {
      pathToKing.forEach((square) => {
        if (move[0] == square[0] && move[1] == square[1]) {
          movesToKeep.push([move[0], move[1]]);
          isCheckmate = false;
        }
      });
    });
    piece.moveset.length = 0;
    movesToKeep.forEach((move) => {
      piece.moveset.push(move);
    });
  });

  // CHECK EVERY ENEMY MOVE TO SEE IF ITS IN THE KINGS MOVESET
  // IF ITS IN THE KINGS MOVESET (ALSO KEEPING IN MIND PAWN LOGIC)
  // FILTER THAT MOVE OUT OF THE NEW KING MOVESET

  const newKingMoves = king.moveset.filter((kingMove) => {
    let safeMove = true;

    enemyPieces.forEach((piece) => {
      piece.moveset.forEach((enemyMove) => {
        if (enemyMove.every((value, index) => value === kingMove[index])) {
          if (
            piece.pieceType != "p" ||
            (piece.pieceType == "p" && piece.col != kingMove[1])
          ) {
            if (enemyMove[0] == 3 && enemyMove[1] == 6) {
              console.log(piece);
            }
            safeMove = false;
          }
        }
      });
    });
    return safeMove;
  });
  king.moveset.length = 0;
  newKingMoves.forEach((move) => {
    king.moveset.push(move);
  });

  if (king.moveset.length > 0) {
    isCheckmate = false;
  }

  return isCheckmate;
}

function getPathToKing(king, threateningPiece) {
  // direction is based on aggressor to king
  const THREAT_IS_EXTENDER =
    threateningPiece.pieceType == "r" ||
    threateningPiece.pieceType == "b" ||
    threateningPiece.pieceType == "q";
  const path = [];
  let xDirection = king.col - threateningPiece.col;
  let yDirection = king.row - threateningPiece.row;
  let distance = xDirection == 0 ? Math.abs(yDirection) : Math.abs(xDirection);
  if (xDirection != 0) {
    xDirection = xDirection / Math.abs(king.col - threateningPiece.col);
  }
  if (yDirection != 0) {
    yDirection = yDirection / Math.abs(king.row - threateningPiece.row);
  }

  for (let i = 0; i < distance; i++) {
    path.push([
      threateningPiece.row + i * yDirection,
      threateningPiece.col + i * xDirection,
    ]);
  }

  let squareOppKing;

  // if the threatening Piece is an extender there needs to be a way
  // to check the square on the opposing side of the king when we check
  // enemy moves against the kings moveset.
  if (THREAT_IS_EXTENDER) {
    squareOppKing = [
      threateningPiece.row + (distance + 1) * yDirection,
      threateningPiece.col + (distance + 1) * xDirection,
    ];
    king.moveset.forEach((move, moveIndex) => {
      if (move[0] == squareOppKing[0] && move[1] == squareOppKing[1]) {
        king.moveset.splice(moveIndex, 1);
      }
    });
  }
  return path;
}

function checkThreatState(row, col, enemyPieces) {
  const TRUE_STATE = state[row][col];
  const TEAM_PIECE_COLOR = enemyPieces[0].color == "white" ? "d" : "l";
  state[row][col] = TEAM_PIECE_COLOR + "p";
  let threateningPiece;
  getMoves(enemyPieces);
  let isCheck = false;
  enemyPieces.forEach((enemy) => {
    enemy.moveset.forEach((move) => {
      if (move[0] == row && move[1] == col) {
        isCheck = true;
        threateningPiece = enemy;
      }
    });
  });
  state[row][col] = TRUE_STATE;
  return { isCheck, threateningPiece };
}

function checkForCastle(rook, king, enemyPieces) {
  const KING_STATE = state[king.row][king.col];
  const ROOK_STATE = state[rook.row][rook.col];
  const DIRECTION = rook.col == 0 ? -1 : 1;
  const squares = [];
  if (ROOK_STATE.length == 3 && KING_STATE.length == 3) {
    if (!checkThreatState(king.row, king.col, enemyPieces)) {
      let i = king.col + DIRECTION;
      while (i != rook.col) {
        squares.push([king.row, i]);
        i = i + DIRECTION;
      }
      const OCCUPIED_SQUARES = squares.filter(
        (square) => state[square[0]][square[1]] != "e"
      );
      if (OCCUPIED_SQUARES.length == 0) {
        squares.length = 2;
        const SAFE_SQUARES = squares.filter(
          (square) => !checkThreatState(square[0], square[1], enemyPieces)
        );
        if (SAFE_SQUARES.length == 2) {
          rook.moveset.push(rook.col == 0 ? "O-O-O" : "O-O");
        }
      }
    }
  }
}

function nonExtenderMoves(piece) {
  const ENEMY_INDICATOR = piece.color == "white" ? "d" : "l";
  let set;
  if (piece.pieceType == "k") {
    set = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
      [0, 1],
      [0, -1],
      [-1, 0],
      [1, 0],
    ];
  } else {
    set = [
      [-2, 1],
      [-2, -1],
      [2, 1],
      [2, -1],
      [1, 2],
      [-1, 2],
      [1, -2],
      [-1, -2],
    ];
  }

  set.forEach((move) => {
    const ROW = piece.row + move[0];
    const COL = piece.col + move[1];
    if (isMoveValid(ROW, COL, ENEMY_INDICATOR)[0]) {
      piece.moveset.push([ROW, COL]);
    }
  });
}

function extenderMoves(extender) {
  const ENEMY_INDICATOR = extender.color == "white" ? "d" : "l";
  let set;
  if (extender.pieceType == "q") {
    set = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
      [0, 1],
      [0, -1],
      [-1, 0],
      [1, 0],
    ];
  } else if (extender.pieceType == "b") {
    set = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];
  } else if (extender.pieceType == "r") {
    set = [
      [0, 1],
      [0, -1],
      [-1, 0],
      [1, 0],
    ];
  }
  set.forEach((direction) => {
    let ableToMoveForward = true;
    let i = 1;
    let row;
    let col;
    while (ableToMoveForward) {
      row = extender.row + i * direction[0];
      col = extender.col + i * direction[1];
      let isValid = isMoveValid(row, col, ENEMY_INDICATOR);
      if (isValid[0]) {
        extender.moveset.push([row, col]);
        if (isValid[1] != "e") {
          ableToMoveForward = false;
        }
      } else {
        ableToMoveForward = false;
      }
      i++;
    }
  });
  // console.log(extender.moveset)
}

function isMoveValid(ROW, COL, ENEMY_INDICATOR) {
  // check if move is on board
  if (
    ROW >= 0 &&
    ROW < SQUARES_PER_SIDE &&
    COL >= 0 &&
    COL < SQUARES_PER_SIDE
  ) {
    // then check if square is occupied
    if (state[ROW][COL][0] == "e" || state[ROW][COL][0] == ENEMY_INDICATOR) {
      // if occupied, by what? determine action
      return [true, state[ROW][COL]];
    } else {
      return [false];
    }
  } else {
    return [false];
  }
}

function pawnMoves(pawn) {
  const HOME_ROW = pawn.color == "white" ? 1 : 6;
  const ENEMY_HOME_ROW = pawn.color == "white" ? 6 : 1;
  const Y_DIRECTION = pawn.color == "white" ? 1 : -1;
  const ENEMY_INDICATOR = pawn.color == "white" ? "d" : "l";
  const ROW_FOR_EN_PASSANT = HOME_ROW == 1 ? 4 : 3;
  const AT_FINAL_ROW =
    (pawn.color == "white" && pawn.row == 7) ||
    (pawn.color == "black" && pawn.row == 0);
  if (!AT_FINAL_ROW) {
    if (
      pawn.col > 0 &&
      state[pawn.row + Y_DIRECTION][pawn.col - 1][0] == ENEMY_INDICATOR
    ) {
      pawn.moveset.push([pawn.row + Y_DIRECTION, pawn.col - 1]);
    }
    if (
      pawn.col < SQUARES_PER_SIDE - 1 &&
      state[pawn.row + Y_DIRECTION][pawn.col + 1][0] == ENEMY_INDICATOR
    ) {
      pawn.moveset.push([pawn.row + Y_DIRECTION, pawn.col + 1]);
    }

    if (state[pawn.row + Y_DIRECTION][pawn.col] == "e") {
      pawn.moveset.push([pawn.row + Y_DIRECTION, pawn.col]);
      if (
        pawn.row == HOME_ROW &&
        state[pawn.row + Y_DIRECTION + Y_DIRECTION][pawn.col] == "e"
      ) {
        pawn.moveset.push([pawn.row + Y_DIRECTION + Y_DIRECTION, pawn.col]);
      }
    }
    if (pawn.row == ROW_FOR_EN_PASSANT) {
      // console.log("pawn is: ", pawn);

      // CHECK THE LAST INDEX OF THE MOVE HISTORY
      if (moveHistory.length > 0) {
        const LAST_MOVE = moveHistory[moveHistory.length - 1];
        // TO SEE IF PAWN WAS THE LAST PIECE TO MOVE.
        // IF IT WAS LAST AND IT MOVED TWO SQUARES FORWARD
        // CHECK IF THAT PAWN IS ADJACENT TO THIS PAWN
        //  IF SO, ADD THE EN PASSANT TO THE MOVESET.
        // NOTE: REMOVING OPPONENT WILL BE HANDLED IN THE GAMESTATE ROUTER
        if (
          LAST_MOVE.piece.pieceType == "p" &&
          LAST_MOVE.from[0] == ENEMY_HOME_ROW &&
          LAST_MOVE.to[0] == pawn.row &&
          Math.abs(LAST_MOVE.to[1] - pawn.col == 1)
        ) {
          pawn.moveset.push([pawn.row + Y_DIRECTION, LAST_MOVE.to[1]]);
        }
      }
    }
  }
  // WILL BE USED FOR PAWN PROMOTION
  else {
  }
}

function determineMoveType(piece) {
  if (piece.pieceType == "p") {
    pawnMoves(piece);
  } else if (
    piece.pieceType == "q" ||
    piece.pieceType == "r" ||
    piece.pieceType == "b"
  ) {
    extenderMoves(piece);
  } else {
    nonExtenderMoves(piece);
  }
}

function getMoves(pieces) {
  for (let i = 0; i < pieces.length; i++) {
    pieces[i].moveset.length = 0;
    determineMoveType(pieces[i]);
  }
}

function formatPieces() {
  const formattedPieces = [];
  for (let i = 0; i < SQUARES_PER_SIDE; i++) {
    for (let j = 0; j < SQUARES_PER_SIDE; j++) {
      if (state[i][j] != "e") {
        const str = state[i][j];
        const color = str[0] == "l" ? "white" : "black";
        const pieceType = str[1];
        const row = i;
        const col = j;
        const moveset = [];
        formattedPieces.push({ pieceType, color, row, col, moveset });
      }
    }
  }
  return formattedPieces;
}

function filterTeamPieces(color, allPieces) {
  const teamPieces = [];
  teamPieces.push(...allPieces.filter((piece) => piece.color == color));
  return teamPieces;
}

function formatState(unformattedState) {
  state.length = 0;
  for (let i = 0; i < SQUARES_PER_SIDE; i++) {
    state.push(unformattedState[i]);
  }
}

module.exports = router;
