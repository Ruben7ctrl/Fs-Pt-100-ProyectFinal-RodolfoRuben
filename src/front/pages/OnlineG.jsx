
import useGlobalReducer from "../hooks/useGlobalReducer";  // Custom hook for accessing the global state.
import { useEffect, useState, useRef } from "react";
import userServices from "../services/flux";
import "../styles/BoardGames.css";
import { NavbarVisitor } from "../components/NavbarVisitor";
import storeServices from "../services/fluxApis";
import { House, MagnifyingGlass, ArrowLeft, Gear, Globe, GameController, PuzzlePiece, User, CaretLeft, CaretRight } from "phosphor-react";
import anime from "animejs";
import botones from './../assets/botones.mp3'
import { useNavigate } from "react-router-dom";
import fallbackImage from './../assets/img/fallbackimage.jpg';
import Botonsiguiente from './../assets/Botonsiguiente.mp3'
import { Loading } from "../components/loading";
import gamesServices from "../services/fluxGames";


export const OnlineGames = () => {

    // Access the global state and dispatch function using the useGlobalReducer hook.
    const { store, dispatch } = useGlobalReducer()
    const audioBotones = new Audio(botones)
    const navigate = useNavigate();
    const [games, setGames] = useState([])
    const [cargando, setCargando] = useState(false)

    // const user = JSON.parse(localStorage.getItem('user'));
    // const username = user?.username


    useEffect(() => {
        const fetchGames = async () => {
            const result = await gamesServices.getGames();
            setGames(result)
        }

        fetchGames();
    }, [])


    const handleJoinGame = (gameId) => {
        localStorage.setItem('gameId', gameId);
        navigate("/chess")
    }


    const hoverSoundRef = useRef(new Audio(Botonsiguiente));

    const playHoverSound = () => {
        const sound = hoverSoundRef.current;
        sound.currentTime = 0; // 🔥 Esta línea es clave
        sound.play().catch(e => {
            console.log("Playback prevented:", e);
        });
    };

    return (
        <div className="fondoGames">

            <div className="boardgames-pageB">

                {/* Botón Volver */}
                <div className="boardgames-backB">
                    <button className="icon-buttonB" onClick={() => navigate('/games')}>
                        <ArrowLeft size={24} weight="bold" />
                    </button>
                </div>

                <h2 className="boardgames-titleB">🎲 Juegos de Online</h2>

                {/* Juegos */}

                <h2>Partidas disponibles</h2>
                {games.length === 0 ? (
                    <p>No hay partidas disponibles</p>
                ) : (
                    games.map((game) => (
                        <button key={game.id} onClick={() => handleJoinGame(game.id)}>
                            Entrar a partida: {game.name || game.id}
                        </button>
                    ))
                )}

            </div>

        </div>
    );




};