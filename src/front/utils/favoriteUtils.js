import userServices from "../services/flux";
import { getStoredUser } from "../utils/storage";
import useGlobalReducer from "../hooks/useGlobalReducer";

 export const handleFavoriteClick = async (game, dispatch, navigate) => {
    const user = getStoredUser();
    

    if (!user) {
      console.warn("🔴 No hay usuario en localStorage. Redirigiendo...");
      navigate("/signin");
      return;
    }

    const favoriteData = {
      ...game, game_type: "videogame"
    };



    try {
      const result = await userServices.addFavorite(null, favoriteData);

      console.log("📩 Respuesta de addFavorite:", result);

      if (result) {
        // Actualiza store
        dispatch({ type: "add_favorite", payload: favoriteData });

        // Actualiza localStorage
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