import React from "react";
import "../styles/Chess.css";


export const Square = ({row, col, piece, selected, onClick}) => {
    const isLight = (row + col) % 2 === 0;

    return (
        <div className={`square ${isLight ? "ligth" : "dark"} ${selected ? "selected" : ""}`} onClick={onClick}>
            {piece && (
                <img src={`/assets/pieces/${piece.color}_${piece.type}.svg`} alt={`${piece.color}_${piece.type}`} className="piece" />
            )}
        </div>
    )
}