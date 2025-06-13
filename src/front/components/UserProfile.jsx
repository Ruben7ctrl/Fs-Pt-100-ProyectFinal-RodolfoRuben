// src/pages/UserProfile.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userServices from "../services/flux";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "../styles/Profile.css";

export const UserProfile = () => {
  const [favorites, setFavorites] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  const {
    store: { user },
    dispatch
  } = useGlobalReducer();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/signin");
        return;
      }

      const userFromToken = await userServices.checkAuth(token);
      if (!userFromToken) {
        navigate("/signin");
        return;
      }

      setUserInfo(userFromToken);

      // También puedes guardar este usuario actualizado en el store si quieres:
      // dispatch({ type: "signin/signup", payload: { user: userFromToken, token } });

      const favs = await userServices.getFavorites();
      setFavorites(favs);
    };

    fetchUserData();
  }, [navigate]);

  if (!userInfo) return <div className="loading neon-text">Cargando perfil...</div>;

  return (
    <div className="profile-container">
      <h2 className="neon-text">Perfil de {userInfo.username}</h2>
      <p>Email: {userInfo.email}</p>
      <p>ID: {userInfo.id}</p>

      <h3 className="neon-text">Juegos Favoritos</h3>
      {favorites.length === 0 ? (
        <p>No tienes juegos favoritos aún.</p>
      ) : (
        <div className="favorites-grid">
          {favorites.map((game) => (
            <div key={game.id} className="favorite-card">
              <h4>{game.name}</h4>
              {game.background_image && (
                <img
                  src={game.background_image}
                  alt={game.name}
                  style={{ width: "100%", borderRadius: "8px" }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
