import React from "react";
import "../styles/Chess.css";
import b_b from '../assets/pieces/b_b.svg'

export const Square = ({row, col, piece, selected, onClick}) => {
    const isLight = (row + col) % 2 === 0;

    const getPiece = (color, type) => {
       
    }

    return (
        <div className={`squaresC ${isLight ? "ligth" : "dark"} ${selected ? "selected" : ""}`} onClick={onClick}>
       
            {piece && (
                <img src={`../assets/pieces/${piece.color}_${piece.type}.svg`} alt={`${piece.color}_${piece.type}`} className="piece" />
            )}
        </div>
    )
}