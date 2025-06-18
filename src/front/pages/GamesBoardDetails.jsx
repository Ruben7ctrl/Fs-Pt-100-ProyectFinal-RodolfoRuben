import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';
import storeServices from '../services/fluxApis';
import "../styles/BoardgamesDetails.css";
import userServices from "../services/flux";
import { MagnifyingGlass, User, ArrowLeft, ShoppingCart, Heart,HeartBreak, ShoppingCartSimple } from 'phosphor-react';
import { Loading } from '../components/loading';
import { getStoredUser } from "../utils/storage";
import { handleAddToCart } from "../utils/CartUtils.js"


export const Gameboarddetail = () => {

    const { store, dispatch } = useGlobalReducer()
    const { cart, favorites } = store


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

        const handleFavoriteClick = async (game) => {
        const user = getStoredUser();

        if (!user) {
            console.warn("🔴 No hay usuario en localStorage. Redirigiendo...");
            navigate("/signin");
            return;
        }

        // 🔥 Asegúrate de agregar el tipo correcto para juegos de mesa
        const favoriteData = {
            ...game,
            id: Number(game.id),
            game_type: "boardgame"
        };

        try {
            const result = await userServices.addFavorite(null, favoriteData);

            if (result) {
                dispatch({ type: "add_favorite", payload: favoriteData });

                const updatedUser = {
                    ...user,
                    favorites: [...(user.favorites || []), favoriteData]
                };

                localStorage.setItem("user", JSON.stringify(updatedUser));
            } else {
                console.warn("⚠️ No se recibió resultado válido de addFavorite");
            }
        } catch (err) {
            console.error("❌ Error en handleFavoriteClick:", err);
        }
    };

    if (loading || !juego) return <Loading />;

    console.log("Imagen del juego:", juego.image);

    const isFavorite = (gameId) => {
    return store.user?.favorites?.some(fav => Number(fav.id) === Number(gameId));
  }; console.log("Es favorito:", isFavorite(id));

    const isInCart = (id) =>
        cart?.some(item => Number(item.game_api_id) === Number(id) || Number(item.id) === Number(id));

    console.log("Esta en cart:", isInCart(id));

    return (
        <div
            className="boardgames-detail"
            style={{ backgroundImage: `url("${juego.image}")` }}
        >
            {/* Header superior izquierdo */}
            <div className="game-header">
                <button className="icon-button" onClick={() => {
                    handleAddToCart(juego, cart, dispatch, navigate)
                }}>
                    {isInCart(id) ? <ShoppingCart size={24} weight="fill" /> : <ShoppingCartSimple size={24} weight="fill" />}
                </button>
                <button className="icon-button">
                    <Link to={'/userprofile'} >
                        <User size={24} weight="bold" />
                    </Link>

                </button>
                <button
                    className={`icon-button ${isFavorite(juego.id) ? "favorited" : ""}`}
                    onClick={() => handleFavoriteClick(juego)}
                >
                    {isFavorite(Number(juego.id)) ? <Heart size={24} weight="fill" /> : <HeartBreak size={24} weight="fill" />}
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