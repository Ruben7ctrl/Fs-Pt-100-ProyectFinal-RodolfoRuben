import React, { useState, useEffect } from "react";
import { Board } from "./Board";
import { generateEmptyBoard, placeAllShipsRandomly, isGameOver, performAttack } from '../utils/ShipUtils.js';
import { ShipPlacer } from "./ShipPlacer.jsx";
import { GameOverModal } from "./GameOverModal.jsx";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MagnifyingGlass, User } from "phosphor-react";


export const Game = () => {
    const [playerBoard, setPlayerBoard] = useState(generateEmptyBoard());
    const [aiBoard, setAiBoard] = useState(generateEmptyBoard());
    const [playerTurn, setPlayerTurn] = useState(true);
    const [aiShips, setAiShips] = useState([]);
    const [playerShips, setPlayerShips] = useState([]);
    const [message, setMessage] = useState('Coloca tus barcos');
    const [winner, setWinner] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [playerShipsPlaced, setPlayerShipsPlaced] = useState(false);
    const navigate = useNavigate();
    


    useEffect(() => {
        const [newAIBoard, ships] = placeAllShipsRandomly(generateEmptyBoard());
        setAiBoard(newAIBoard);
        setAiShips(ships);
    }, [])

    const startGame = (finalBoard, ships) => {
        setPlayerBoard(finalBoard);
        setPlayerShips(ships);
        setPlayerShipsPlaced(true);
        setMessage('¡Comienza el juego! Ataca la IA');
        setGameStarted(true);
    }

    const handlePlayerAttack = (row, col) => {
        if (!gameStarted || !playerTurn) return;

        const [newBoard, hit] = performAttack(aiBoard, row, col);
        setAiBoard(newBoard);

        const isOver = isGameOver(newBoard);
        if (isOver) {
            setWinner('player');
            setGameStarted(false);
            return;
        }

        setMessage(hit ? '¡Tocado! IA espera...' : '¡Fallaste! Turno de la IA');
        setPlayerTurn(false)
    }

    useEffect(() => {
        if (!playerTurn && gameStarted) {
            const timeout = setTimeout(() => {
                let attacked = false;
                let row, col, newBoard;

                while (!attacked) {
                    row = Math.floor(Math.random() * 10);
                    col = Math.floor(Math.random() * 10);
                    if (playerBoard[row][col] !== 'hit' && playerBoard[row][col] !== 'miss') {
                        [newBoard] = performAttack(playerBoard, row, col);
                        attacked = true;
                    }
                }

                setPlayerBoard(newBoard);
                const isOver = isGameOver(newBoard);
                if (isOver) {
                    setWinner('ai');
                    setGameStarted(false)
                } else {
                    setMessage('Tu Turno');
                    setPlayerTurn(true);
                }
            }, 1000);

            return () => clearTimeout(timeout)
        }
    }, [playerTurn])

    const restartGame = () => {

          const [newAIBoard, ships] = placeAllShipsRandomly(generateEmptyBoard());
        setAiBoard(newAIBoard);
        setAiShips(ships);
       
        setPlayerShips(null);
        setPlayerShipsPlaced(null);
        
        setGameStarted(true)
        

    }

    return (
        <div className="game">
              <div className="boardgames-backB">
                            <button className="icon-buttonB" onClick={() => navigate('/onlinegames')}>
                                <ArrowLeft size={24} weight="bold" />
                            </button>
                        </div>
            {!playerShipsPlaced ? (
                <ShipPlacer onPlaceShips={startGame} />
            ) : (
                <>
                    <div className="boards">
                        <Board title='Tu Tablero' board={playerBoard} isPlayer={true} />
                        <Board title='IA' board={aiBoard} onCellClick={handlePlayerAttack} hideShips={true} />
                    </div>
                    <p>{message}</p>
                    <button className="BotonBarco" onClick={restartGame}>Reiniciar</button>
                    {winner && (
                        <GameOverModal
                            winner={winner}
                            onRestart={restartGame}
                        />
                    )}
                </>

            )}
        </div>
    )
}