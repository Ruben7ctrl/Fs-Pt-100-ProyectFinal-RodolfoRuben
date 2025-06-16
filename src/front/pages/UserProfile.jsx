
import { ArrowLeft, User, CaretLeft, CaretRight } from "phosphor-react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "../styles/UserProfile.css";
import anime from "animejs";
import React, { useRef, useState, useEffect } from "react";


export const UserProfile = () => {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();

  const user = store.user;
  const avatarName = user.Avatar_image || "default";
  const avatarUrl = `.../assets/img/${avatarName}.jpg`;
  const [hoveredCard, setHoveredCard] = useState(null);
  const hoverRef = useRef(null);


  const videoCarouselRef = useRef(null);
  const boardCarouselRef = useRef(null);

  const scrollCarousel = (ref, direction) => {
    const el = ref.current;
    const scrollAmount = 300;

    anime({
      targets: el,
      scrollLeft: direction === "left" ? el.scrollLeft - scrollAmount : el.scrollLeft + scrollAmount,
      duration: 500,
      easing: "easeInOutQuad"
    });
  };


useEffect(() => {
  if (hoverRef.current && hoveredCard) {
    hoverRef.current.style.opacity = 0;
    hoverRef.current.style.transform = "translate(-50%, -50%) rotateY(-45deg)";
    hoverRef.current.style.left = "50%";
    hoverRef.current.style.top = "50%";

    anime({
      targets: hoverRef.current,
      opacity: 1,
      scale: [0.8, 1],
      rotateY: [-45, 0],
      duration: 800,
      easing: "easeOutExpo",
      boxShadow: [
        "0 0 0px rgba(0,255,255,0)",
        "0 0 25px rgba(0,255,255,0.5)",
        "0 0 15px rgba(0,255,255,0.3)",
      ],
      complete: () => {
        if (hoverRef.current) {
          hoverRef.current.style.transform = "translate(-50%, -50%) rotateY(0deg)";
        }
      },
    });
  }
}, [hoveredCard]);









  return (
    <div className="fondoGamesProfile">
      {/* ────── BLOQUE SUPERIOR: encabezado + videojuegos ────── */}
      <div className="profile-top-section-userProfile">
        <div className="profile-top-userProfile">
          <button className="icon-button-userProfile" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} weight="bold" />
          </button>

          <div className="avatar-info-userProfile">
            <div
              className="avatar-circle-userProfile"

            />
            <div className="profile-name-userProfile neon-text">
              <User size={24} /> {user.username}
            </div>
          </div>
        </div>

        <div className="favorites-section-userProfile">
          <h2 className="slider-title-userProfile neon-text">🎮 Tus videojuegos favoritos</h2>

          <div className="carousel-container-userProfile">
            <button
              className="carousel-btn-userProfile"
              onClick={() => scrollCarousel(videoCarouselRef, "left")}
            >
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
                      onMouseEnter={() => {
                        if (hoveredCard?.id !== game.id) setHoveredCard(game);
                      }}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <img
                        src={game.background_image || game.image}
                        alt={game.name}
                        className="favorite-card-img-userProfile"
                      />
                      <p className="favorite-name-userProfile">{game.name}</p>
                    </div>
                  );
                })}
            </div>

            <button
              className="carousel-btn-userProfile"
              onClick={() => scrollCarousel(videoCarouselRef, "right")}
            >
              <CaretRight size={32} />
            </button>
          </div>
        </div>
      </div>

      {/* ────── BLOQUE CENTRAL: tarjeta flotante ────── */}
      <div className="profile-hover-zone-userProfile">
        {hoveredCard && (
          <div className="hover-preview-card-userProfile" ref={hoverRef}>
            <img
              src={hoveredCard.background_image || hoveredCard.image}
              alt={hoveredCard.name}
              className="hover-card-img-userProfile"
            />
            <h3 className="hover-card-title-userProfile">{hoveredCard.name}</h3>
          </div>
        )}
      </div>

      {/* ────── BLOQUE INFERIOR: boardgames al fondo ────── */}
      <div className="profile-bottom-section-userProfile">
        <div className="favorites-section-userProfile">
          <h2 className="slider-title-userProfile neon-text">🎲 Tus juegos de mesa favoritos</h2>

          <div className="carousel-container-userProfile">
            <button
              className="carousel-btn-userProfile"
              onClick={() => scrollCarousel(boardCarouselRef, "left")}
            >
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
                      onMouseEnter={() => {
                        if (hoveredCard?.id !== game.id) setHoveredCard(game);
                      }}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <img
                        src={game.background_image || game.image}
                        alt={game.name}
                        className="favorite-card-img-userProfile"
                      />
                      <p className="favorite-name-userProfile">{game.name}</p>
                    </div>
                  );
                })}
            </div>

            <button
              className="carousel-btn-userProfile"
              onClick={() => scrollCarousel(boardCarouselRef, "right")}
            >
              <CaretRight size={32} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );



};

