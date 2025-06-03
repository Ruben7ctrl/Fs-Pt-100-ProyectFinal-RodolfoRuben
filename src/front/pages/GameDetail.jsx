import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';
import storeServices from '../services/fluxApis';
import "../styles/GameDetail.css";
import { MagnifyingGlass, User, ArrowLeft } from 'phosphor-react';
import { Loading } from '../components/loading';

export const GameDetail = () => {
    const { id } = useParams(); // PARA CHECK
    const { store, dispatch } = useGlobalReducer()
    const navigate = useNavigate()
    const [game, setGame] = useState(null)
    const [video, setVideo] = useState(null);


    useEffect(() => {
        if (id) {
            // Traemos el juego
            storeServices.getOneVideojuegos(id).then(gameData => {
                setGame(gameData);

                // 🚀 Traemos recomendados por un género aleatorio
                if (gameData.genres && gameData.genres.length > 0) {
                    const randomIndex = Math.floor(Math.random() * gameData.genres.length);
                    const genreSlug = gameData.genres[randomIndex].slug;

                    storeServices.getRecomendados(genreSlug)
                        .then(recomendados => {
                            if (recomendados) {
                                dispatch({
                                    type: 'get_recomendados',
                                    payload: recomendados
                                });
                            }
                        })
                        .catch(error => console.error("Error cargando recomendados", error));
                }


                storeServices.video(gameData.id)
                    .then(videoData => {
                        if (videoData && videoData.results && videoData.results.length >= 0) {
                            setVideo(videoData.results[0]);  // ejemplo: guardo solo el primer video
                        } else {
                            console.log("No hay videos para este juego.");
                            setVideo(null);
                        }
                    })
                    .catch(error => {
                        console.error("Error cargando video", error);
                        setVideo(null);
                    });
            });
        }
    }, [id]);


    if (!game) return <Loading />;



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
                <button className="icon-button" onClick={() => navigate('/games')}>
                    <ArrowLeft size={24} weight="bold" />
                </button>
            </div>

            {/* Recuadro del video → arriba a la derecha */}
            {video?.data?.max && (
                <div className="game-video-box">
                    <video
                        src={video.data.max}
                        controls
                    />
                </div>
            )}



            {/* Panel izquierdo con animación */}
            <div className="game-info-panel animate-panel">
                <h1 className="game-detail-title">{game.name}</h1>
                <p className="game-detail-description">{game.description_raw}</p>
                <p className="game-detail-rating">Rating: {game.rating} ⭐</p>
            </div>

            {/* 🚀 Recomendados al estilo PS5 - DEBAJO DEL TODO */}
            <div className="ps5-recommended-line ">
                {store.recomendados.map(similarGame => (
                    <div
                        key={similarGame.id}
                        className="ps5-recommended-card"
                        onClick={() => navigate(`/games/${similarGame.id}`)}
                        style={{
                            backgroundImage: `url(${similarGame.background_image})`
                        }}
                    >
                    </div>
                ))}
            </div>
        </div>
    );

};