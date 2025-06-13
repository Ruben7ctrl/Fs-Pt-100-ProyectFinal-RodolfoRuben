import { Password } from "phosphor-react";

const userServices = {};
const backendUrl = import.meta.env.VITE_BACKEND_URL;

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

    return data;
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
    if (resp.status != 200) return false;

    const data = await resp.json();
    console.log(data);

    return data;
  } catch (error) {
    console.log("Error loading message from backend", error);
  }
};

userServices.addFavorite = async (_, game) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    window.location.href = "/signin";
    return;
  }

  const body = {
    user1_id: user.id,
    onlinegame_id: game.id
  };

  try {
    const resp = await fetch(`${backendUrl}/api/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) throw new Error(`Error al agregar favorito: ${await resp.text()}`);

    const data = await resp.json();
    return data;
  } catch (error) {
    console.error("Error al agregar favorito:", error);
    return null;
  }
};


userServices.getFavorites = async (dispatch) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

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
    const favorites = data.favorites || [];

    // Actualizar el estado global si se proporciona `dispatch`
    if (dispatch) {
      dispatch({ type: "set_favorites", payload: favorites });
    }

    return favorites;
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return [];
  }
};


export default userServices;
