export const isValidMove = (piece, fromRow, fromCol, toRow, toCol, board) => {
  const direction = piece.color === "white" ? -1 : 1;
  const target = board[toRow][toCol];

  if (target && target.color === piece.color) {
    return false;
  }

  const isPathClear = (fromRow, fromCol, toRow, toCol, board) => {
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);
    let r = fromRow + rowStep;
    let c = fromCol + colStep;
    while (r !== toRow || c !== toCol) {
      if (board[r][c]) return false;
      r += rowStep;
      c += colStep;
    }
    return true;
  };

  const cloneBoard = (b) =>
    b.map((row) => row.map((cell) => (cell ? { ...cell } : null)));

  switch (piece.type) {
    case "pawn":
      const startRow = piece.color === "white" ? 6 : 1;
      if (
        fromCol === toCol &&
        !target &&
        (toRow === fromRow + direction ||
          (fromRow === startRow &&
            toRow === fromRow + 2 * direction &&
            !board[fromRow + direction][fromCol]))
      ) {
        return true;
      }
      if (
        Math.abs(fromCol - toCol) === 1 &&
        toRow === fromRow + direction &&
        target &&
        target.color !== piece.color
      ) {
        return true;
      }
      return false;

    case "rook":
      return (
        (fromRow === toRow || fromCol === toCol) &&
        isPathClear(fromRow, fromCol, toRow, toCol, board)
      );

    case "queen":
      const isStraight = fromRow === toRow || fromCol === toCol;
      const isDiagonal =
        Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol);
      return (
        (isStraight || isDiagonal) &&
        isPathClear(fromRow, fromCol, toCol, toRow, board)
      );

    case "knigth":
      return (
        (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 1) ||
        (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 2)
      );

    case "king": {
      const dRow = Math.abs(fromRow - toRow);
      const dCol = Math.abs(fromCol - toCol);

      // Movimieto normal del rey
      if (dRow <= 1 && dCol <= 1) {
        const tempBoard = cloneBoard(board);
        tempBoard[toRow][toCol] = { ...piece };
        tempBoard[fromRow][fromCol] = null;

        if (isInCheck(piece.color, tempBoard)) {
          return false;
        }
        return true;
      }

      // Enroque
      if (!piece.hasMoved && fromRow === toRow && dCol === 2) {
        const isKingside = toCol > fromCol;
        const rookCol = isKingside ? 7 : 0;
        const rook = board[fromRow][rookCol];
        if (
          !rook ||
          rook.type !== "rook" ||
          rook.color !== piece.color ||
          rook.hasMoved
        )
          return false;

        const colsToCheck = isKingside
          ? [fromCol + 1, fromCol + 2]
          : [fromCol - 1, fromCol - 2];

        for (let col of colsToCheck) {
          if (board[fromCol][col]) return false;

          // Simular el movimiento del rey pasando por cada casilla
          const tempBoard = cloneBoard(board);
          tempBoard[fromRow][col] = { ...piece };
          tempBoard[fromRow][fromCol] = null;
          if (isInCheck(piece.color, tempBoard)) return false;
        }
        return true;
      }
      return false;
    }
    default:
      return false;
  }
};


export const isInCheck = (color, board) => {
    const KingPos = findKingPosition(color, board);
    if (!KingPos) return false;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.color !== color) {
                if (isValidMove(piece, r, c, KingPos.row, KingPos.col, board)) {
                    return true
                }
            }
        }
    }
    return false;
}

const findKingPosition = (color, board) => {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.type === "king" && piece.color === color) {
                return { row: r, col: c };
            }
        }
    }
    return null;
}

export const hasLegalMoves = (color, board) => {
    const cloneBoard = (b) =>
        b.map((row) => row.map((cell) => (cell ? { ...cell } : null)));

    for (let r1 = 0; r1 < 8; r1++) {
        for (let c1 = 0; c1 < 8; c1++) {
            const piece = board[r1][c1];
            if(piece && piece.color === color) {
                for (let r2 = 0; r2 < 8; r2++) {
                    for (let c2 = 0; c2 < 8; c2++) {
                        if (isValidMove(piece, r1, c1, r2, c2, board)) {
                            const tempBoard = cloneBoard(board);
                            tempBoard[r2][c2] = { ...piece };
                            tempBoard[r1][c1] = null;
                            if (!isInCheck(color, tempBoard)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
    }
    return false;
};

export const isDrawByInsufficientMaterial = (board) => {
    const pieces = [];
    board.flat().forEach((cell) => {
        if (cell) pieces.push(cell);
    })

    if (pieces.length === 2) return true; // only Kings
    if (pieces.length === 3 &&
        pieces.some((p) => p.type === "bishop" || p.type === "knight")
    ) {
        return true;
    }
    return false;
};

export const checkGameEnd = (color, board) => {
    const opponent = color === "white" ? "black" : "white";

    if (isInCheck(opponent, board)) {
        if (!hasLegalMoves(opponent, board)) {
            return { end: true, result: `Jaque mate. Gana ${color}`}
        }
        return { end: false, result: "Jaque!"}
    }
    if (!hasLegalMoves(opponent, board)) {
        return { end: true, result: "Empate por ahogado!"}
    }
    if (isDrawByInsufficientMaterial(board)) {
        return { end: true, result: "Empate por material insficiente"};
    }

    return { end: false }
};

