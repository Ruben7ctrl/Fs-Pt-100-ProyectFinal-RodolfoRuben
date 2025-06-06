export const initializeBoard = () => {
    const empty = Array(8).fill(null).map(() => Array(8).fill(null));

    const board = empty.map((row, rIdx) => 
    row.map((_, cIdx) => {
        if (rIdx === 1) return { type: "pawn", color: "black"};
        if (rIdx === 6) return { type: "pawn", color: "white"};

        if (rIdx === 0 || rIdx === 7) {
            const color = rIdx === 0 ? "black": "white";
            const order = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
            const type = order[cIdx];

            // Solo king y rook necesitan kasMoved para el enroque
            if (type === "king" || type === "rook") {
                return { type, color, hasMoved: false };
            } else {
                return { type, color }
            }
        }
        return null;
    }))

    return board;
}