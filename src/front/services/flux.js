import { Password } from "phosphor-react";
import { getStoredUser } from "../utils/storage";

const userServices = {};
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const apikeyRAWG = import.meta.env.VITE_RAWG_API_KEY;

userServices.signup = async (formData) => {
  try {
    const resp = await fetch(backendUrl + "/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    if (!resp.ok) throw new Error("something went wrong with signup");
    const data = await resp.json();

    return {success: true, data};
  } catch (error) {
    console.log(error);
  }
};

userServices.signin = async (formData) => {
  try {
    const resp = await fetch(backendUrl + "/api/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    if (!resp.ok) throw new Error("something went wrong with signin");
    const data = await resp.json();
    console.log("login response", data);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  } catch (error) {
    console.log(error);
  }
};

userServices.updatePassword = async (password, token) => {
  console.log("Token enviado", token);
  console.log("password enviado", password);

  try {
    const resp = await fetch(backendUrl + "/api/reset-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
    });
    console.log("Response status", resp.status);

    if (resp.status != 200) return false;

    const data = await resp.json();
    console.log(data);

    return data;
  } catch (error) {
    console.log("Error loading message from backend", error);
  }
};

userServices.sendResetEmail = async (email) => {
  try {
    const resp = await fetch(backendUrl + "/api/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    if (resp.status != 200) return false;

    const data = resp.json();
    console.log(data);

    return data;
  } catch (error) {
    console.log("Error loading message from backend", error);
  }
};

userServices.checkAuth = async (token) => {
  try {
    const resp = await fetch(backendUrl + "/api/token", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!resp.ok) return false;

    const text = await resp.text();
    console.log("🔧 Respuesta cruda del backend:", text);

    const data = JSON.parse(text);
    return data.user; // <-- Asegúrate de esto si el usuario viene como `user`
  } catch (error) {
    console.log("Error loading message from backend", error);
    return null;
  }
};


userServices.addFavorite = async (_, game) => {
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  if (!token || !user) {
    window.location.href = "/signin";
    return;
  }

  const body = {
    user1_id: user.id,
    game_api_id: game.id,
    game_type : game.game_type // modificado en el back 
  };

  console.log("🧪 Enviando favorito al backend con:", body);

  try {
    const resp = await fetch(`${backendUrl}/api/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("❌ Error en el backend:", errorText);
      throw new Error("Error al agregar favorito");
    }

    const data = await resp.json();
    return data;
  } catch (error) {
    console.error("Error al agregar favorito:", error);
    return null;
  }
};



userServices.getFavorites = async (dispatch = null) => {
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  if (!token || !user) return [];

  try {
    const resp = await fetch(`${backendUrl}/api/users/${user.id}/favorites`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    if (!resp.ok) throw new Error("Error al obtener favoritos");

    const data = await resp.json();
  

    if (dispatch) {
      dispatch({ type: "set_favorites", payload: data });
    }console.log("set favorites", data);

    return data;
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return [];
  }
};


userServices.getFavoritesFromRelations = async (favoriteRelations) => {
  const videogames = [];
  const boardgames = [];

  for (const fav of favoriteRelations) {
    try {
      if (fav.game_type === "videogame") {
        const resp = await fetch(`https://api.rawg.io/api/games/${fav.game_api_id}?key=${apikeyRAWG}`);
        const data = await resp.json();
        videogames.push({
          id: fav.game_api_id,
          name: data.name,
          background_image: data.background_image,
          type: "videogame",
        });
      } else if (fav.game_type === "boardgame") {
        const resp = await fetch(`https://boardgamegeek.com/xmlapi2/thing?id=${fav.game_api_id}&stats=1`);
        if (!resp.ok) throw new Error("Error al obtener datos BGG");

        const xmlText = await resp.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");

        const item = xmlDoc.querySelector("item");
        const name = item.querySelector('name[type="primary"]')?.getAttribute("value");
        const image = item.querySelector("image")?.textContent;

        boardgames.push({
          id: fav.game_api_id,
          name: name || "Sin nombre",
          image: image || "",
          type: "boardgame",
        });
      }
    } catch (err) {
      console.warn("Error enriqueciendo favorito", fav, err);
    }
  }

  return [...videogames, ...boardgames];
};




userServices.eliminarFavorito = async (favoriteId, token) => {
  try {
    const res = await fetch(`${backendUrl}/api/favorites/${favoriteId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("No se pudo eliminar el favorito");

    return true;
  } catch (error) {
    console.error("❌ Error al eliminar favorito:", error);
    return false;
  }
};




export default userServices;
