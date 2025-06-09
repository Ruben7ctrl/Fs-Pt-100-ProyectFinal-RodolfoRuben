import React from "react";
import "../styles/Chess.css"
import { ChessBoard } from "../components/ChessBoard";


export const Chess = () => {

    return (
        <div className="text-center  fondoAjedrez1">
           
            <ChessBoard />
        </div>
    )
}