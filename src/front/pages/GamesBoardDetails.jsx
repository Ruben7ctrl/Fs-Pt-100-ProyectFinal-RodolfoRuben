import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';
import storeServices from '../services/fluxApis';
import "../styles/BoardgamesDetails.css";

import { MagnifyingGlass, User, ArrowLeft } from 'phosphor-react';
import { Loading } from '../components/loading';


export const Gameboarddetail = () => {
    



   const { id } = useParams();
    const navigate = useNavigate();
    const [juego, setJuego] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJuego = async () => {
            try {
                const data = await storeServices.JuegosMesaDatos(id);
                setJuego(data);
            } catch (error) {
                console.error("Error fetching juego:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJuego();
    }, [id]);

    if (loading || !juego) return <Loading />;

    console.log("Imagen del juego:", juego.image);

    return (
  <div
    className="boardgames-detail"
    style={{ backgroundImage: `url("${juego.image}")` }}
>
        {/* Header superior izquierdo */}
        <div className="boardgames-detail-header">
            <button className="icon-button">
                <MagnifyingGlass size={24} weight="bold" />
            </button>
            <button className="icon-button">
                <User size={24} weight="bold" />
            </button>
        </div>

        {/* Botón Volver → en la esquina superior derecha */}
        <div className="boardgames-detail-back">
            <button className="icon-button" onClick={() => navigate('/boardgames')}>
                <ArrowLeft size={24} weight="bold" />
            </button>
        </div>

        {/* Panel izquierdo con animación */}
        <div className="boardgames-detail-info-panel">
            <h1 className="boardgames-detail-title">{juego.name}</h1>
            <p className="boardgames-detail-description">{juego.description}</p>
            <p className="boardgames-detail-rating">Año: {juego.year}</p>
            <p className="boardgames-detail-rating">Jugadores: {juego.minPlayers} - {juego.maxPlayers}</p>
            <p className="boardgames-detail-rating">Tiempo de juego: {juego.playTime} min</p>
            <p className="boardgames-detail-rating">Rating medio: {juego.averageRating} ⭐</p>
            <p className="boardgames-detail-rating">Categorías: {juego.categories?.join(", ")}</p>
        </div>
    </div>
);


};