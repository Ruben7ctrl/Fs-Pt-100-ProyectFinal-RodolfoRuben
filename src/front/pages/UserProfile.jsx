import { ArrowLeft, User, CaretLeft, CaretRight } from "phosphor-react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "../styles/UserProfile.css";
import anime from "animejs";
import React, { useRef, useState, useEffect } from "react";
import userServices from "../services/flux";
import Maga from "../assets/img/Maga.jpg";
import Asesino from "../assets/img/Asesino.jpg";
import Soldado from "../assets/img/Soldado.jpg";

export const UserProfile = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const user = store.user;

  const [hoveredCard, setHoveredCard] = useState(null);
  const hoverRef = useRef(null);
  const videoCarouselRef = useRef(null);
  const boardCarouselRef = useRef(null);
  const [userInfo, setUserInfo] = useState(null);

  const avatarMap = {
    Maga,
    Asesino,
    Soldado,
  }

  const avatarName = user?.avatar_image || "default";
  const avatarUrl = avatarMap[avatarName];

  // Cargar favoritos enriquecidos si es necesario
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/signin");

      const userFromToken = await userServices.checkAuth(token);
      if (!userFromToken) return navigate("/signin");

      // Enriquecer favoritos (videojuegos y juegos de mesa)
      const enrichedFavorites = await userServices.getFavoritesFromRelations(userFromToken.favorite1 || []);
      const filteredFavorites = enrichedFavorites.filter((f) => f !== null);

      // Actualiza store y estado local
      setUserInfo({
        ...userFromToken,
        favorites: filteredFavorites,
      });

      dispatch({
        type: "signin/signup",
        payload: {
          user: {
            ...userFromToken,
            favorites: filteredFavorites,
            purchases: userFromToken.owned_games || [],
          },
          token,
        },
      });
    };

    fetchUserData();
  }, []);





  useEffect(() => {
    if (hoverRef.current && hoveredCard) {
      const card = hoverRef.current;

      // Estado inicial: forma distorsionada y oculta
      card.style.opacity = 0;
      card.style.transform = "translate(-50%, -50%) scale(0.2) rotate(-30deg) skew(20deg, 10deg)";
      card.style.filter = "blur(10px)";
      card.style.left = "50%";
      card.style.top = "50%";

      anime({
        targets: card,
        opacity: [0, 1],
        scale: [0.2, 1],
        rotate: [-30, 0],
        skew: [
          { value: '20deg', duration: 0 },
          { value: '0deg', duration: 700 }
        ],
        filter: ['blur(10px)', 'blur(0px)'],
        easing: "easeOutExpo",
        duration: 1000,
        complete: () => {
          card.style.transform = "translate(-50%, -50%)";
          card.style.filter = "none";
        }
      });
    }
  }, [hoveredCard]);


  const scrollCarousel = (ref, direction) => {
    const el = ref.current;
    const scrollAmount = 300;

    anime({
      targets: el,
      scrollLeft: direction === "left" ? el.scrollLeft - scrollAmount : el.scrollLeft + scrollAmount,
      duration: 500,
      easing: "easeInOutQuad",
    });
  };

  if (!user || !user.favorite1 || !user.favorites) {
    return <div className="loading-userProfile">Cargando perfil...</div>;
  }




  const handleRemoveFavorite = async (gameId, gameType) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Debes iniciar sesión");

    const favToRemove = user.favorite1.find(
      (f) => String(f.game_api_id) === String(gameId) && f.game_type === gameType
    );

    if (!favToRemove) return console.warn("❗ Favorito no encontrado");

    const success = await userServices.eliminarFavorito(favToRemove.id, token);
    if (success) {
      dispatch({ type: "remove_favorite", payload: gameId });
    }
  };



  return (
    <div className="fondoGamesProfile">
      {/* Bloque superior */}
      <div className="profile-top-section-userProfile">
        <div className="profile-top-userProfile">
          <button className="icon-button-userProfile" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} weight="bold" />
          </button>

          <div className="avatar-info-userProfile">
            <div className="avatar-circle-userProfile" style={{ backgroundImage: `url(${avatarUrl})` }} />
            <div className="profile-name-userProfile neon-text">
              <User size={24} /> {user?.username}
            </div>
          </div>
        </div>

        <div className="favorites-section-userProfile">
          <h2 className="slider-title-userProfile neon-text">🎮 Tus videojuegos favoritos</h2>
          <div className="carousel-container-userProfile">
            <button className="carousel-btn-userProfile" onClick={() => scrollCarousel(videoCarouselRef, "left")}>
              <CaretLeft size={32} />
            </button>
            <div className="carousel-track-userProfile" ref={videoCarouselRef}>
              {user.favorite1
                .filter((f) => f.game_type === "videogame")
                .map((fav, index) => {
                  const game = user.favorites.find((g) => String(g.id) === String(fav.game_api_id));
                  if (!game) return null;
                  return (
                    <div
                      key={index}
                      className="favorite-card-small-userProfile"
                      onMouseEnter={() => setHoveredCard(game)}
                      onMouseLeave={() => setHoveredCard(null)}
                      onClick={() => navigate(`/games/${game.id}`)}
                    >
                      <img
                        src={game.background_image || game.image}
                        alt={game.name}
                        className="favorite-card-img-userProfile"
                      />
                      <p className="favorite-name-userProfile">{game.name}</p>
                      <button
                        className="remove-fav-btn-userProfile"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(fav.game_api_id, "videogame");
                        }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
            </div>
            <button className="carousel-btn-userProfile" onClick={() => scrollCarousel(videoCarouselRef, "right")}>
              <CaretRight size={32} />
            </button>
          </div>
        </div>
      </div>

      {/* Bloque flotante hover */}
      <div className="profile-hover-zone-userProfile">
        {hoveredCard && (
          <div className="hover-preview-card-userProfile" ref={hoverRef}>
            <img
              src={hoveredCard.background_image || hoveredCard.image}
              alt={hoveredCard.name}
              className="hover-preview-img"
            />
            <h3 className="hover-preview-title">{hoveredCard.name}</h3>
          </div>

        )}
      </div>

      {/* Bloque inferior */}
      <div className="profile-bottom-section-userProfile">
        <div className="favorites-section-userProfile">
          <h2 className="slider-title-userProfile neon-text">🎲 Tus juegos de mesa favoritos</h2>
          <div className="carousel-container-userProfile">
            <button className="carousel-btn-userProfile" onClick={() => scrollCarousel(boardCarouselRef, "left")}>
              <CaretLeft size={32} />
            </button>
            <div className="carousel-track-userProfile" ref={boardCarouselRef}>
              {user.favorite1
                .filter((f) => f.game_type === "boardgame")
                .map((fav, index) => {
                  const game = user.favorites.find((g) => String(g.id) === String(fav.game_api_id));
                  if (!game) return null;
                  return (
                    <div
                      key={index}
                      className="favorite-card-small-userProfile"
                      onMouseEnter={() => setHoveredCard(game)}
                      onMouseLeave={() => setHoveredCard(null)}
                      onClick={() => navigate(`/boardgame/${game.id}`)}
                      
                      
                    >
                      <img
                        src={game.background_image || game.image}
                        alt={game.name}
                        className="favorite-card-img-userProfile"
                      />
                      <p className="favorite-name-userProfile">{game.name}</p>
                      <button
                        className="remove-fav-btn-userProfile"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(fav.game_api_id, "boardgame");
                        }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
            </div>
            <button className="carousel-btn-userProfile" onClick={() => scrollCarousel(boardCarouselRef, "right")}>
              <CaretRight size={32} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

};
