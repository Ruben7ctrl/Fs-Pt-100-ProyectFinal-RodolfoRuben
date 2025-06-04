import React from "react";
import "../styles/Chess.css"
import { ChessBoard } from "../components/ChessBoard";


export const Chess = () => {

    return (
        <div className="text-center mt-5">
            <h1>Juego de Ajedrez</h1>
            <ChessBoard />
        </div>
    )
}