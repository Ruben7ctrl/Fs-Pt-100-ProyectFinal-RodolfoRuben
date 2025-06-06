import React, { useEffect, useState } from "react";
import "../styles/TresEnRaya.css"
import gamesServices from "../services/fluxGames";

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

    useEffect(() => {
        if (winner !== null) {
            const result = winner === false
                ? 'stalemate'
                : winner === TURNS.X
                ? 'win'
                : 'loss';
            
                const moveCount = board.filter((cell) => cell !== null).length;
                const gameId = localStorage.getItem("gameId");
                const user = JSON.parse(localStorage.getItem("user"));
                const userId = user?.id;

                if (!gameId || !userId) {
                    console.warn("Faltan datos para actualizar estadisticas");
                    return;
                    
                }

                gamesServices.updateStats(result, gameId, userId, moveCount);
        }
    }, [winner])

    useEffect(() => {
        if (turn === TURNS.O && !winner) {
            const timeout = setTimeout(() => {
                const emptyIndices = board.map((val, idx) => (val === null ? idx : null)).filter(idx => idx !== null);

                if (emptyIndices.length > 0) {
                    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
                    updateBoard(randomIndex)
                }
            }, 500);

            return () => clearTimeout(timeout)
        }
    }, [turn, board, winner])

    return (
        <main className="board-container">
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