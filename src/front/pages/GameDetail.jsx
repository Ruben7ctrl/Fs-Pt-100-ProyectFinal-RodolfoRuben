import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';
import storeServices from '../services/fluxApis';
import "../styles/GameDetail.css";
import { MagnifyingGlass, User, ArrowLeft, ShoppingCart, Heart,HeartBreak, ShoppingCartSimple } from 'phosphor-react';
import { Loading } from '../components/loading';
import { Link } from "react-router-dom";
import { handleFavoriteClick } from "../utils/favoriteUtils.js";
import { getStoredUser } from "../utils/storage";
import { handleAddToCart } from "../utils/CartUtils.js"
import stripeServices from '../services/fluxStore.js';

export const GameDetail = () => {
    const { id } = useParams(); // PARA CHECK
    const { store, dispatch } = useGlobalReducer()
    const { cart, favorites } = store
    const navigate = useNavigate()
    const [game, setGame] = useState(null)
    const [video, setVideo] = useState(null);
    const [screenshots, setScreenshots] = useState([]);


    const user = getStoredUser();

    useEffect(() => {
        if (id) {
            // Traemos el juego
            Promise.all([
                storeServices.getOneVideojuegos(id),
                stripeServices.getItemsFromStore()
            ]).then(([gameData, storeItems]) => {
                const item = storeItems.find(si => si.game_api_id.toString() === gameData.id.toString())
                setGame({
                    ...gameData,
                    stripe_price_id: item ? item.stripe_price_id : null
                });
                console.log('screenshots', gameData)
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

                storeServices.getGameScreenshots(id)
                    .then(data => {
                        if (data.results) setScreenshots(data.results);
                    })
                    .catch(error => {
                        console.error("No se pudieron cargar screenshots", error);
                    });


            });
        }

    }, [id]);



    if (!game) return <Loading />;

const isFavorite = (id) =>
  store.user?.favorites?.some(fav => fav.id === id || fav.game_api_id === id);

console.log("Es favorito:", isFavorite(id));

const isInCart = (id) =>
  cart?.some(item => item.game_api_id === parseInt(id) || item.id === parseInt(id));

console.log("Esta en cart:", isInCart(id));

    return (
        <div
            className="game-detail"
            style={{ '--background-url': `url(${game.background_image})` }}
        >
            {/* Header superior izquierdo */}
            <div className="game-header">
                <button className="icon-button" onClick={() => {
                     handleAddToCart(game, cart, dispatch, navigate)
                    }}>
                     {isInCart(id) ? <ShoppingCart size={24} weight="fill" /> : <ShoppingCartSimple size={24} weight="fill" />}
                </button>
                <button className="icon-button">
                    <Link to={'/userprofile'} >
                        <User size={24} weight="bold" />
                    </Link>

                </button>
                <button
                    className={`icon-button ${isFavorite(id) ? "favorited" : ""}`}
                    onClick={() => handleFavoriteClick(game, dispatch, navigate)}
                >
                    {isFavorite(Number(id)) ? <Heart size={24} weight="fill" /> : <HeartBreak size={24} weight="fill" />}
                </button>
            </div>

            {/* Botón Volver → en la esquina superior derecha */}
            <div className="game-back">
                <button className="icon-button" onClick={() => navigate('/games')}>
                    <ArrowLeft size={24} weight="bold" />
                </button>
            </div>

            {/* Recuadro del video → arriba a la derecha */}
            {/* Recuadro del video o carrusel */}
            <div className="game-main-content">
                {video?.data?.max ? (
                    <div className="game-video-box">
                        <video className="videoinfo"
                            src={video.data.max}
                            autoPlay
                            muted
                            loop
                            playsInline
                            controls
                        />
                    </div>
                ) : screenshots.length > 0 ? (
                    <div id="carouselExampleAutoplaying" className="carousel slide game-video-box" data-bs-ride="carousel" data-bs-interval="3000">
                        <div className="carousel-inner">
                            {screenshots.map((img, idx) => (
                                <div className={`carousel-item ${idx === 0 ? 'active' : ''}`} key={img.id}>
                                    <img src={img.image} className="d-block w-100 imginfo" alt={`screenshot-${idx}`} />
                                </div>
                            ))}
                        </div>
                        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="prev">
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Previous</span>
                        </button>
                        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="next">
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Next</span>
                        </button>
                    </div>
                ) : null}






                {/* Panel izquierdo con animación */}
                <div className="game-info-panel animate-panel">
                    <h1 className="game-detail-title">{game.name}</h1>
                    <p className="game-detail-description">{game.description_raw}</p>
                    <p className="game-detail-rating">Rating: {game.rating} ⭐</p>
                </div>
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