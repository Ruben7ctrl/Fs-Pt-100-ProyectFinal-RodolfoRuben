import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';
import storeServices from '../services/fluxApis';

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
        <div>
            <h1>Game Detail for ID: {id}</h1>
            {/* Aquí podrías volver a llamar a la API con el ID y mostrar más info */}
            <h1>{game.name}</h1>
            <p>Fecha de lanzamiento: {game.released}</p>
            <p>Rating: {game.rating}</p>
            <p>Géneros: {game.genres.map(g => g.name).join(', ')}</p>
            <img src={game.background_image} alt={game.name} style={{ width: '300px' }} />
        </div>
    );
};