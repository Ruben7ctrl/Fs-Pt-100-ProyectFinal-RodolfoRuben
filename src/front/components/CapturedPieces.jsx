import React from "react";
import "../styles/Chess.css"



export const CapturedPieces = ({ pieces, color }) => {
    const getPieceImage = (color, type) => {
        try {
            return new URL(`../assets/pieces/${color}_${type}.svg`, import.meta.url).href;
        } catch (err) {
            console.error(`Image not found for ${color}_${type}`);
            return '';
        }
    }



    return (
        <div className={`captured-pieces captured-${color}`}>
            <p>Piezas capturadas ({color}):</p>
            <div className="captured-list">
                {pieces.map((piece, idx) => {
                    console.log(piece);
                    return (
                        <img key={idx} src={getPieceImage(piece.color, piece.type)} alt={`${piece.color}_${piece.type}`} className="captured-piece" />
                    )
                })}
            </div>
        </div>
    )
}