import React, { useEffect, useState } from "react";
import "../styles/TresEnRaya.css"
import gamesServices from "../services/fluxGames";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MagnifyingGlass, User } from "phosphor-react";

const TURNS = {
    X: 'x',
    O: 'o'
}



const WINNER_COMBOS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]

const Square = ({ children, isSelected, updateBoard, index }) => {
    const className = `square ${isSelected ? 'is-selected' : ''}`

    const handleClick = () => {
        updateBoard(index)

    }
    return (
        <div onClick={handleClick} className={className}>
            {children}
        </div>
    )
}



//create your first component
function App() {

    const navigate = useNavigate();

    const [board, setBoard] = useState(Array(9).fill(null))
    const [winner, setWinner] = useState(null)//null es que no hay ganador,false es que hay un empate
    const [turn, setTurn] = useState(TURNS.X)
    // console.log(board)

    const checkWinner = (boardTocheck) => {
        for (const combo of WINNER_COMBOS) {
            const [a, b, c] = combo
            if (
                boardTocheck[a] &&
                boardTocheck[a] === boardTocheck[b] &&
                boardTocheck[a] === boardTocheck[c]

            ) {
                return boardTocheck[a]
            }
        }
        return null
    }


    const resetGame = () => {
        setBoard(Array(9).fill(null))
        setTurn(TURNS.X)
        setWinner(null)
    }

    const checkEndGame = (newBoard) => {
        return newBoard.every((square) => square !== null)
    }



    const updateBoard = (index) => {
        //este if es para que no se sobrescriba si ya tiene algo  o hay ganador//
        if (board[index] || winner) return

        //actualizar el tablero
        const newBoard = [...board]
        newBoard[index] = turn
        setBoard(newBoard)



        //revisar si hay ganador

        const newWinner = checkWinner(newBoard)

        if (newWinner) {
            setWinner(newWinner)

        } else if (checkEndGame(newBoard)) {
            setWinner(false) //un empate
        } else {
            setTurn(turn === TURNS.X ? TURNS.O : TURNS.X)
        }
    }

    const getBestMove = (board, player) => {
        let bestScore = -Infinity;
        let move = -1;

        board.forEach((cell, idx) => {
            if (cell === null) {
                const newBoard = [...board];
                newBoard[idx] = player;
                const score = minimax(newBoard, 0, false);
                if (score > bestScore) {
                    bestScore = score;
                    move = idx
                }
            }
        });

        return move;
    }

    const minimax = (board, depth, isMaximizing) => {
        const result = checkWinner(board);
        if (result === TURNS.O) return 10 - depth;
        if (result === TURNS.X) return depth - 10;
        if (checkEndGame(board)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            board.forEach((cell, idx) => {
                if (cell === null) {
                    const newBoard = [...board];
                    newBoard[idx] = TURNS.O;
                    const score = minimax(newBoard, depth + 1, false);
                    bestScore = Math.max(score, bestScore)
                }
            });

            return bestScore;
        } else {
            let bestScore = Infinity;
            board.forEach((cell, idx) => {
                if (cell === null) {
                    const newBoard = [...board];
                    newBoard[idx] = TURNS.X;
                    const score = minimax(newBoard, depth + 1, true);
                    bestScore = Math.min(score, bestScore)
                }
            });
            return bestScore;
        }
    }

    useEffect(() => {
        if (turn === TURNS.O && !winner) {
            const timeout = setTimeout(() => {
                // const emptyIndices = board.map((val, idx) => (val === null ? idx : null)).filter(idx => idx !== null);
                const bestMove = getBestMove(board, TURNS.O)
                // if (emptyIndices.length > 0) {
                //     const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
                //     updateBoard(randomIndex)
                if (bestMove !== -1) {
                    updateBoard(bestMove)
                }

            }, 500);

            return () => clearTimeout(timeout)
        }
    }, [turn, board, winner])

    return (
        <main className="board-container">
            <div className="boardgames-backB">
                <button className="icon-buttonB" onClick={() => navigate('/onlinegames')}>
                    <ArrowLeft size={24} weight="bold" />
                </button>
            </div>
            <div className="board-box">
                <div className="board">
                    <h1> TIC TAC TOE</h1>
                    <button onClick={resetGame}>Reset del juego</button>
                    <section className="tresraya">
                        {
                            board.map((square, index) => {
                                return (<Square
                                    key={index}
                                    index={index}
                                    updateBoard={updateBoard}
                                >
                                    {square}
                                </Square>
                                )

                            })
                        }
                    </section>
                    <section className="turns">
                        <Square isSelected={turn === TURNS.X}>{TURNS.X}</Square>
                        <Square isSelected={turn === TURNS.O}>{TURNS.O}</Square>
                    </section>
                    {

                        winner !== null && (
                            <section className="winner">
                                <div className="texts">

                                    <h2>
                                        {
                                            winner === false
                                                ? 'Empate'
                                                : 'Ganó:'
                                        }


                                    </h2>
                                    <header className="win">
                                        {winner && <Square>{winner}</Square>}

                                    </header>
                                    <footer>

                                        <button onClick={resetGame}> Empezar de nuevo </button>
                                    </footer>
                                </div>

                            </section>
                        )
                    }
                </div>

            </div>

        </main>
    )
}

export default App;