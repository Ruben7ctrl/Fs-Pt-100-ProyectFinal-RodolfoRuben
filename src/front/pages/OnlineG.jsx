import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MagnifyingGlass, User } from "phosphor-react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import gamesServices from "../services/fluxGames";
import "../styles/BoardGames.css";
import botones from './../assets/botones.mp3';
import Botonsiguiente from './../assets/Botonsiguiente.mp3';

// 🚀 Importamos las imágenes desde src/assets/img/
import fondoTresEnRaya from "../assets/img/fondoTresEnRaya.png";
import fondoAjedrez from "../assets/img/fondoAjedrez.png";


export const OnlineGames = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [games, setGames] = useState([]);
    const [hoveredGame, setHoveredGame] = useState(null);

    const audioBotones = new Audio(botones);
    const hoverSoundRef = useRef(new Audio(Botonsiguiente));

    useEffect(() => {
        const fetchGames = async () => {
            const result = await gamesServices.getGames();
            setGames(result);
        };

        fetchGames();
    }, []);


const handleClick = ()=>{

    navigate('/ia_sessions')
}

    const handleJoinGame = (gameId) => {
        localStorage.setItem('gameId', gameId);
        navigate(`/onlinegame/${gameId}`);
    };

    const playHoverSound = () => {
        const sound = hoverSoundRef.current;
        sound.currentTime = 0;
        sound.play().catch(e => {
            console.log("Playback prevented:", e);
        });
    };

    // 🚀 Elegimos la imagen de fondo según hoveredGame
 const getBackgroundClass = () => {
    if (hoveredGame === 'ajedrez') return 'fondoAjedrez';
    if (hoveredGame === 'tres en raya') return 'fondoTresEnRaya';
    if (hoveredGame === 'campaña') return 'fondoCampaña';
    if (hoveredGame === 'hundir la flota') return 'fondoHundirflota';

    return 'fondoGames';
};

return (
    <div className={getBackgroundClass()}>
        <div className="boardgames-pageB">

            {/* Botón Volver */}
            <div className="boardgames-backB">
                <button className="icon-buttonB" onClick={() => navigate('/games')}>
                    <ArrowLeft size={24} weight="bold" />
                </button>
            </div>

            <h2 className="boardgames-titleB">🎲 Juegos Online</h2>

            

            <div className="online-games-grid">
                {games.length === 0 ? (
                    <p>No hay partidas disponibles</p>
                ) : (
                    games.map((game) => (
                        <div
                            key={game.id}
                            className="online-game-card"
                            onMouseEnter={() => {
                                setHoveredGame(game.name.toLowerCase());
                                playHoverSound();
                            }}
                            onMouseLeave={() => setHoveredGame(null)}
                            onClick={() => handleJoinGame(game.id)}
                        >
                            <div className="online-game-card-content">
                                <h3>{game.name}</h3>
                                <p>{game.description}</p>
                                <p>Dificultad: {game.difficulty_levels}</p>
                            </div>
                        </div>
                    ))
                )}
<div
                            
                            className="online-game-card"
                            onMouseEnter={() => {
                                setHoveredGame('campaña');
                                
                                playHoverSound();
                            }}
                            onMouseLeave={() => setHoveredGame(null)}
                           onClick={() => handleClick()}
                        
                        >
                            <div className="online-game-card-content">
                                <h3>Campaña</h3>
                                <p>Este es el juego clasico de campaña, estaras en todo momento asistido por la IA</p>
                                <p>Dificultad: Medium</p>
                            </div>
                        </div>
                
            </div>

        </div>
    </div>
);

};
