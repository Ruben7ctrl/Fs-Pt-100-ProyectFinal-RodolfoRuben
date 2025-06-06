import React, { useEffect, useRef, useState } from "react";
import { Square } from "./Squares";
import { CapturedPieces } from "./CapturedPieces";
import { Chess } from "chess.js";
import gamesServices from "../services/fluxGames";


export const ChessBoard = () => {
    const [chess, setChess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const [selected, setSelected] = useState(null);
    const [turn, setTurn] = useState("w")
    const [promotion, setPromotion] = useState(null);
    const [capturedWhite, setCapturedWhite] = useState([]);
    const [capturedBlack, setCapturedBlack] = useState([]);
    const [gameResult, SetGameResult] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [statsUpdated, setStatsUpdated] = useState(false);

    const engine = useRef(null)



    const updateStats = (result) => {
        const token = localStorage.getItem('token')
        const gameId = localStorage.getItem('gameId');
        const moveCount = chess.history().length;
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id

        console.log("token:", token);
        console.log("userId:", userId);
        console.log("onlineGameId:", gameId);
        console.log("moveCount", moveCount);


        if (!token || !userId || !gameId) {
            console.warn("Faltan datos para actualizar stats");
            return;

        }

        gamesServices.updateStats(result, gameId, userId, moveCount)
        // .then(() => setStatsUpdated(true)).catch((e) => console.error("Error updating stats:", e))

    }

    const applyMove = (moveObj) => {
        let result = null;

        setChess(prevChess => {
            const update = new Chess(prevChess.fen());
            result = update.move(moveObj);

            if (result && result.captured) {
                const capturedPiece = { type: result.captured, color: result.color === "w" ? "b" : "w", };
                if (capturedPiece.color === "w") {
                    setCapturedBlack(prev => [...prev, capturedPiece])
                } else {
                    setCapturedWhite(prev => [...prev, capturedPiece])
                }
            }

            return result ? update : prevChess;
        });

        return result;
    }

    useEffect(() => {
        engine.current = new Worker("/stockfish.js");

        engine.current.onmessage = (event) => {
            const line = event.data;
            if (line.startsWith("bestmove")) {
                const moveStr = line.split(" ")[1];
                if (moveStr !== "(none)") {
                    const moveObj = {
                        from: moveStr.substring(0, 2),
                        to: moveStr.substring(2, 4),
                        promotion: moveStr.length === 5 ? moveStr[4] : undefined,
                    };
                    applyMove(moveObj);
                    setSelected(null);
                    setTurn("w")
                }
            }
        }

        engine.current.postMessage("uci")
        engine.current.postMessage("ucinewgame");

        return () => engine.current.terminate();
    }, [])

    useEffect(() => {
        setBoard(chess.board());
        setTurn(chess.turn());

        if (chess.isGameOver()) {
            setGameOver(true)
            if (chess.isCheckmate()) {
                SetGameResult(`Jaque mate: Gana ${chess.turn() === "w" ? "negras" : "blancas"}`);
            } else if (chess.isStalemate()) {
                SetGameResult("Empate por ahogado");
            } else if (chess.isInsufficientMaterial()) {
                SetGameResult("Empate por material insuficiente");
            } else {
                SetGameResult("Juego terminado")
            }
        }
    }, [chess])

    useEffect(() => {
        if (gameOver && !statsUpdated) {
            const winner = chess.turn() === "w" ? "b" : "w";
            let result = "stalemate"

            if (chess.isCheckmate()) {
                result = winner === "w" ? "win" : "loss"
            } else if (chess.isStalemate() || chess.isInsufficientMaterial()) {
                result = "stalemate"
            }
            const moveCount = chess.history().length
            const gameId = localStorage.getItem("gameId")
            const userId = localStorage.getItem("userId")

            updateStats(result, gameId, userId, moveCount)
        }
    }, [gameOver, statsUpdated, chess])

    useEffect(() => {
        if (turn === "b" && !gameResult) {
            const fen = chess.fen();
            engine.current.postMessage(`position fen ${fen}`)
            engine.current.postMessage("go depth 15")
        }
    }, [turn, gameResult, chess])

    const coordsToSquare = (row, col) => {
        const files = "abcdefgh";
        return files[col] + (8 - row);
    }

    const handleClick = (row, col) => {
        if (turn !== "w" || gameResult) return;

        const square = coordsToSquare(row, col);
        const piece = chess.get(square);

        if (selected) {
            const selectedSquare = coordsToSquare(selected[0], selected[1]);

            if (piece && piece.color === "w" && square !== selectedSquare) {
                setSelected([row, col]);
                return;
            }

            const moveObj = {
                from: selectedSquare,
                to: square,
                promotion: promotion || undefined,
            };

            const updated = new Chess(chess.fen());
            const result = updated.move(moveObj);

            if (result) {
                applyMove(moveObj);
                setSelected(null);
                setPromotion(null);
                setTurn("b")
            } else {
                setSelected(null)
            }
        } else {
            if (piece && piece.color === "w") {
                setSelected([row, col]);
            }
        }
    }

    return (
        <>
            <CapturedPieces pieces={capturedBlack} color="black" />

            <div className="chess-board">
                {board.map((row, rIdx) =>
                    row.map((cell, cIdx) => (
                        <Square key={`${rIdx}-${cIdx}`} row={rIdx} col={cIdx} piece={cell} selected={selected?.[0] === rIdx && selected?.[1] === cIdx} onClick={() => handleClick(rIdx, cIdx)} />
                    )))}
            </div>

            <CapturedPieces pieces={capturedWhite} color="white" />

            {promotion && (
                <div className="promotion-popup">
                    <p>Promocionar a:</p>
                    {["queen", "rook", "bishop", "knight"].map((type) => (
                        <button key={type} onClick={() => setPromotion(type[0])}>{type}</button>
                    ))}
                </div>
            )}

            {gameResult && (
                <div className="game-over-popup">
                    <h2>Fin del Juego</h2>
                    <p>{gameResult}</p>
                    <button onClick={() => {
                        const newGame = new Chess();
                        setChess(newGame);
                        setBoard(newGame.board());
                        setSelected(null);
                        setTurn("w");
                        setPromotion(null);
                        setCapturedBlack([]);
                        setCapturedWhite([]);
                        SetGameResult(null);
                        setGameOver(false);
                        setStatsUpdated(false);
                    }}>Reiniciar partida</button>
                </div>
            )}
        </>
    )
}

