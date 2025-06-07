import React from "react";


export const GameOverModal = ({ winner, onRestart }) => {

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{winner === 'player' ? '¡Ganaste! 🎉' : 'La IA gana 😢'}</h2>
                <button onClick={onRestart}>Reiniciar Partida</button>
            </div>
        </div>
    )
}