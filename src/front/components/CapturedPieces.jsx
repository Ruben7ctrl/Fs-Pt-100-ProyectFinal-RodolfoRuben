import React from "react";
import "../styles/Chess.css"


export const CapturedPieces = ({ pieces, color }) => {

    return (
        <div className={`captured-pieces captured-${color}`}>
            <p>Piezas capturadas ({color}):</p>
            <div className="captured-list">
                {pieces.map((piece, idx) => {
                    console.log(piece);
                    return (
                        <img key={idx} src={`/assets/pieces/${piece.color}_${piece.type}.svg`} alt={`${piece.color}_${piece.type}`} className="captured-piece" />
                    )
                })}
            </div>
        </div>
    )
}