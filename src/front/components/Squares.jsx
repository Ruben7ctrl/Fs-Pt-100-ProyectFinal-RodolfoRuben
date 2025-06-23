import React from "react";
import "../styles/Chess.css";
import b_b from '../assets/pieces/b_b.svg'

export const Square = ({row, col, piece, selected, onClick}) => {
    const isLight = (row + col) % 2 === 0;

        const getPieceImage = (color, type) => {
        try {
            return new URL(`../assets/pieces/${color}_${type}.svg`, import.meta.url).href;
        } catch (err) {
            console.error(`Image not found for ${color}_${type}`);
            return '';
        }
    }

    return (
        <div className={`squaresC ${isLight ? "ligth" : "dark"} ${selected ? "selected" : ""}`} onClick={onClick}>
       
            {piece && (
                <img src={getPieceImage(piece.color, piece.type)} alt={`${piece.color}_${piece.type}`} className="piece" />
            )}
        </div>
    )
}