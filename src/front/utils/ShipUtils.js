export const SHIP_SIZES = [5, 4, 3, 2, 1];

export const generateEmptyBoard = () => {

    return Array(10)
        .fill(null)
        .map(() => Array(10).fill(null))
}

export const placeAllShipsRandomly = (board) => {
    const newBoard = JSON.parse(JSON.stringify(board));
    const ships = [];

    for (const size of SHIP_SIZES) {
        let placed = false;
        while (!placed) {
            const dir = Math.random() < 0.5 ? 'H' : 'V';
            const row = Math.floor(Math.random() * 10);
            const col = Math.floor(Math.random() * 10);

            if(canPlaceShip(newBoard, row, col, size, dir)) {
                placeShip(newBoard, row, col, size, dir);
                ships.push({row, col, size, dir});
                placed = true
            }
        }
    }

    return [newBoard, ships];
}

const canPlaceShip = (board, row, col, size, dir) => {
    if (dir === 'H' && col + size > 10) return false;
    if (dir === 'V' && row + size > 10) return false;

    for (let i = 0; i < size; i++) {
        const r = dir === 'V' ? row + i : row;
        const c = dir === 'H' ? col + i : col;
        if (board[r][c]) return false;
    }

    return true
}

const placeShip = (board, row, col, size, dir) => {
    for (let i = 0; i < size; i++) {
        const r = dir === 'V' ? row + i : row;
        const c = dir === 'H' ? col + i : col;
        board[r][c] = 'ship';
    }
}

export const performAttack = (board, row, col) => {
    const newBoard = JSON.parse(JSON.stringify(board));
    if (newBoard[row][col] === 'ship') {
        newBoard[row][col] = 'hit';
        return [newBoard, true];
    } else {
        newBoard[row][col] = 'miss';
        return [newBoard, false]
    }
}

export const isGameOver = (board) => {
    return !board.flat().includes('ship');
}