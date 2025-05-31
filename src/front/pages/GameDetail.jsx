import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';
import storeServices from '../services/fluxApis';
import "../styles/GameDetail.css";
import { MagnifyingGlass, User, ArrowLeft } from 'phosphor-react';

export const GameDetail = () => {
    const { id } = useParams(); // PARA CHECK
    const { store, dispatch } = useGlobalReducer()
    const navigate = useNavigate()
    const [game, setGame] = useState(null)


    useEffect(() => {
        if (id) {
            storeServices.getOneVideojuegos(id).then(setGame)
        }
    }, [id])

    if (!game) return <p>Cargando juego...</p>;
    

    return (
     <div
            className="game-detail"
            style={{ '--background-url': `url(${game.background_image})` }}
        >
            {/* Header superior izquierdo */}
            <div className="game-header">
                <button className="icon-button">
                    <MagnifyingGlass size={24} weight="bold" />
                </button>
                <button className="icon-button">
                    <User size={24} weight="bold" />
                </button>
            </div>

            {/* Botón Volver → en la esquina superior derecha */}
            <div className="game-back">
                <button className="icon-button" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} weight="bold" />
                </button>
            </div>

            {/* Panel izquierdo con animación */}
            <div className="game-info-panel animate-panel">
                <h1 className="game-detail-title">{game.name}</h1>
                <p className="game-detail-description">{game.description_raw}</p>
                <p className="game-detail-rating">Rating: {game.rating} ⭐</p>
            </div>
        </div>
        

    );
};