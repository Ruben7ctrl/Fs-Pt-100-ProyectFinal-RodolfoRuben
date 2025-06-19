
import useGlobalReducer from "../hooks/useGlobalReducer";  // Custom hook for accessing the global state.
import { useEffect, useState, useRef } from "react";
import userServices from "../services/flux";
import "../styles/BoardGames.css";
import { NavbarVisitor } from "../components/NavbarVisitor";
import storeServices from "../services/fluxApis";
import { House, MagnifyingGlass, Gear, Globe, GameController, PuzzlePiece, User, CaretLeft, CaretRight, DeviceMobile, DesktopTower, Monitor, AppleLogo, AndroidLogo, SignOut, Clock, Calendar, ArrowLeft, ShoppingCart } from "phosphor-react";
import anime from "animejs";
import botones from './../assets/botones.mp3'
import Botonsiguiente from './../assets/Botonsiguiente.mp3'
import { useNavigate, useParams } from "react-router-dom";
import fallbackImage from './../assets/img/fallbackimage.jpg';
import { Loading } from "../components/loading";
import { Link } from "react-router-dom";
import stripeServices from "../services/fluxStore";
import { getStoredUser } from "../utils/storage";
import { handleAddToCartBoard } from "../utils/CartUtils.js"



export const BoardGames = () => {

    // Access the global state and dispatch function using the useGlobalReducer hook.
    const {
        store,
        dispatch,
    } = useGlobalReducer();

    const { juegosdemesa, cart } = store;
    const [letra, setLetra] = useState("a")
    const [cargando, setCargando] = useState(false)
    const [pagina, setPagina] = useState(1)
    const [juegos, setJuegos] = useState([])
    const audioBotones = new Audio(botones)
    const navigate = useNavigate();
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

    const user = JSON.parse(localStorage.getItem('user'));
    const username = user?.username


    const handleMouseEnter = (e) => {

        anime.remove(e.currentTarget);
        audioBotones.current.play();

        anime({
            targets: e.currentTarget,
            translateY: [
                { value: -44, easing: "easeOutExpo", duration: 600 },
                { value: 0, easing: "easeOutBounce", duration: 800, delay: 100 }
            ],

            rotate: {
                value: "-1turn", // ✅ Gira completamente
                duration: 1000,
                easing: "easeInOutSine"

            },
            delay: 0

        });

    };

    const handleMouseLeave = (e) => {
        anime.remove(e.currentTarget);

        anime({
            targets: e.currentTarget,
            translateY: 0,
            rotate: 0, // ✅ Asegura que vuelve al ángulo original
            scale: 1,
            duration: 400,
            easing: "easeOutQuad"
        });

    };

    const userIsLoggedIn = !!localStorage.getItem('user')

    const items = [
        { icon: <House size={32} weight="fill" />, label: "Home", route: "/" },
        // { icon: <MagnifyingGlass size={32} weight="fill" />, label: "Search" },
        ...(userIsLoggedIn
            ? [{
                icon: <Globe size={32} weight="fill" />, label: "OnlineGames", route: "/onlinegames"
            }] : []),
        { icon: <GameController size={32} weight="fill" />, label: "Videogames", route: "/games" },
        { icon: <ShoppingCart size={32} weight="fill" />, label: "Cart", route: "/cart" },
        // { icon: <PuzzlePiece size={32} weight="fill" />, label: "Boardgames", route: "/boardgames" },
        { icon: <User size={32} weight="fill" />, label: "Profile", route: "/userprofile" },
        ...(userIsLoggedIn
            ? [{
                icon: <SignOut size={32} weight="fill" />, label: "SignOut", action: () => { dispatch({ type: 'logout' }), navigate('/') }
            }] : [])

    ];

    const handleCardClick = (route, label, action) => {
        if (action) return action();

        const user = JSON.parse(localStorage.getItem("user"));
        // if (label === "Search") {
        //     new window.bootstrap.Offcanvas("#staticBackdrop").show();
        //     return;
        // }
        if (label === "Profile" && !user) return navigate("/signin");
        route && navigate(route);
    };


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

            console.log("📩 Respuesta de addFavorite:", result);

            if (result) {
                dispatch({ type: "add_favorite", payload: favoriteData });

                const updatedUser = {
                    ...user,
                    favorites: [...(user.favorites || []), favoriteData]
                };
                console.log("updatedUser", user);

                localStorage.setItem("user", JSON.stringify(updatedUser));
            } else {
                console.warn("⚠️ No se recibió resultado válido de addFavorite");
            }
        } catch (err) {
            console.error("❌ Error en handleFavoriteClick:", err);
        }
    };


    const juegosPorPagina = 6

    useEffect(() => {
        const cargar = async () => {
            setCargando(true)
            try {
                const lista = await storeServices.getJuegosMesa(letra)
                console.log("Juegos recibidos", lista);


                const detalles = await Promise.all(
                    lista.slice((pagina - 1) * juegosPorPagina, pagina * juegosPorPagina).map(async (j) => {
                        try {
                            const detalle = await storeServices.JuegosMesaDatos(j.id)
                            console.log("detalle cargado", detalle)
                            return detalle
                        } catch (error) {
                            console.warn(`Error cargando juego con id ${j.id}:`, error)
                            return null
                        }
                    })
                )
                const storeItems = await stripeServices.getItemsFromStore();

                const JuegosConPrecio = detalles
                    .filter(j => j !== null)
                    .map(juego => {
                        const item = storeItems.find(si => si.game_api_id.toString() === juego.id.toString());
                        return {
                            ...juego,
                            stripe_price_id: item ? item.stripe_price_id : null,
                        }
                    })

                setJuegos(JuegosConPrecio)
            } catch (error) {
                console.error("Error cargando juegos:", error)
                setJuegos([])
            }
            setCargando(false)
        }
        cargar()
    }, [pagina, letra])


    const hoverSoundRef = useRef(new Audio(Botonsiguiente));

    const playHoverSound = () => {
        const sound = hoverSoundRef.current;
        sound.currentTime = 0; // 🔥 Esta línea es clave
        sound.play().catch(e => {
            console.log("Playback prevented:", e);
        });
    };


    const isFavorite = (gameId) => {
        return store.user?.favorites?.some(fav => Number(fav.id) === Number(gameId));
    }; console.log("user", user);

    return (
        <div className="fondoGames">

            <div className="boardgames-pageB">

                {/* Botón Volver */}
                {/* <div className="boardgames-backB">
                    <button className="icon-buttonB" onClick={() => navigate('/games')}>
                        <ArrowLeft size={24} weight="bold" />
                    </button>
                </div>

                <h2 className="boardgames-titleB">🎲 Juegos de Mesa ({letra.toUpperCase()})</h2> */}
                <div className="container mb-5">
                    <div className="ps5-grid">
                        {items.map(({ icon, label, route, action }, i) => (
                            <div
                                key={i}
                                className="char ps5-card cyber-card"
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                onClick={() => handleCardClick(route, label, action)}
                            >
                                <div className="icon">{icon}</div>
                                <span className="label">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Letras */}
                <div className="boardgames-lettersB">
                    {letras.map(l => (
                        <button
                            key={l}
                            onClick={() => { setLetra(l.toLowerCase()); setPagina(1) }}
                            className={`letter-buttonB ${l.toLowerCase() === letra ? "active" : ""}`}
                        >
                            {l}
                        </button>
                    ))}
                </div>

                {/* Juegos */}
                {cargando ? (
                    <Loading />
                ) : (
                    <div className="boardgames-gridB">
                        {juegos.map(juego => (
                            <div key={juego.id} className="boardgames-cardB">
                                <Link to={`/boardgame/${juego.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                    {/* Imagen arriba */}

                                    <img
                                        src={juego.image ? juego.image : fallbackImage}
                                        alt={juego.name}
                                        className="boardgames-card-image"
                                    />


                                    {/* Info abajo */}
                                    <div className="boardgames-card-contentB">
                                        <h4>{juego.name}</h4>
                                        <p>{juego.year}</p>
                                        <p>🎯 {juego.minPlayers} - {juego.maxPlayers} jugadores</p>
                                        <p>⏱️ {juego.playTime} min</p>
                                        <p>⭐ {parseFloat(juego.averageRating).toFixed(2)}</p>
                                        {/* <p className="categoriesB">{juego.categories?.join(", ")}</p> */}
                                    </div>

                                </Link>
                                <div className="buttons-mesa">
                                    {juego?.stripe_price_id ? (
                                        <button className="game-button" onClick={() => {
                                            handleAddToCartBoard(juego, cart, dispatch, navigate)
                                        }}><span class="fa-solid fa-cart-shopping"></span></button>
                                    ) : (
                                        <button className="game-bottons" disabled><Clock size={27} /></button>
                                    )}
                                    <button
                                        className={`game-button ${isFavorite(juego.id) ? "favorited" : ""}`}
                                        onClick={() => handleFavoriteClick(juego)}
                                    >
                                        {isFavorite(Number(juego.id)) ? "❤️" : "🤍"}
                                    </button>
                                </div>
                            </div>

                        ))}
                    </div>
                )}

                {/* Paginación */}
                <div className="boardgames-paginationB">
                    <button
                        disabled={pagina === 1}
                        onClick={() => { setPagina(p => p - 1); playHoverSound() }}

                        className="pagination-buttonB"
                    >
                        <ArrowLeft size={20} weight="bold" /> Anterior
                    </button>
                    <span className="pagination-pageB">Página {pagina}</span>
                    <button
                        onClick={() => { setPagina(p => p + 1); playHoverSound() }}
                        className="pagination-buttonB"
                    >
                        Siguiente <CaretRight size={20} weight="bold" />
                    </button>
                </div>

            </div>

        </div>
    );




};