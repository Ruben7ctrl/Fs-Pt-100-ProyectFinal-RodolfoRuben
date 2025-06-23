export const initialStore = () => {
  let user = {
    id: null,
    username: null,
    email: null,
    favorites: [],
    purchases: [],
  };

  try {
    const rawUser = localStorage.getItem("user");

    if (rawUser && rawUser !== "undefined") {
      user = JSON.parse(rawUser);

      if (!user.favorites) user.favorites = [];
      if (!user.purchases) user.purchases = [];
    }
  } catch (e) {
    console.warn("Error al cargar usuario desde localStorage:", e);
    localStorage.removeItem("user");
  }

  return {
    user,
    sessionID: localStorage.getItem("activeSessionID") || null,
    videojuegos: [],
    unvideojuego: [],
    juegosdemesa: [],
    jdmdatos: [],
    recomendados: [],
    videos: [],
    cart: [],
  };
};

export default function storeReducer(store, action = {}) {
  console.log("Dispatch action.type:", action.type);
  switch (action.type) {
    case "remove_favorite":
      if (!store.user) return store;
      return {
        ...store,
        user: {
          ...store.user,
          favorite1: store.user.favorite1.filter(
            (f) => String(f.game_api_id) !== String(action.payload)
          ),
          favorites: store.user.favorites.filter(
            (f) => String(f.id) !== String(action.payload)
          ),
        },
      };

    case "set_favorites":
      return {
        ...store,
        user: {
          ...store.user,
          favorites: [...(store.user.favorites || []), action.payload],
        },
      };
    case "add_favorite":
      if (!store.user) return store;

      return {
        ...store,
        user: {
          ...store.user,
          favorites: [...(store.user.favorites || []), action.payload], // opcional, si quieres reflejarlo de inmediato
        },
      };

    case "get_videos":
      return {
        ...store,
        videos: action.payload,
      };
    case "get_recomendados":
      return {
        ...store,
        recomendados: action.payload,
      };
    case "signin/signup":
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);

      const sessionID = localStorage.getItem(
        `sessionID-${action.payload.user.id}`
      );
      if (sessionID) {
        localStorage.setItem("activeSessionID", sessionID);
      }

      return {
        ...store,
        user: action.payload.user,
        sessionID,
      };
    case "logout":
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("activeSessionID");
      return {
        ...store,
        user: null,
        // sessionID: null,
      };
    case "clear_sessionID":
      localStorage.removeItem("activeSessionID");
      return {
        sessionID: null,
      };
    case "set_sessionID":
      localStorage.setItem("activeSessionID", action.payload);
      return {
        ...store,
        sessionID: action.payload,
      };
    case "load_videojuegos":
      return {
        ...store,
        videojuegos: action.payload,
      };
    case "get_videojuego":
      return {
        ...store,
        unvideojuego: action.payload,
      };
    case "load_juegosdemesa":
      return {
        ...store,
        juegosdemesa: action.payload,
      };
    case "load_jdmdatos":
      return {
        ...store,
        jdmdatos: action.payload,
      };
    case "add_to_cart":
      const exists = store.cart.some((item) => item.id === action.payload.id);
      if (exists) {
        return store;
      }
      return {
        ...store,
        cart: [...store.cart, action.payload],
      };
    case "set_cart":
      return {
        ...store,
        cart: action.payload || [],
      };
    case "remove_from_cart":
      return {
        ...store,
        cart: store.cart.filter((item) => item.id !== action.payload),
      };
    case "clean_cart":
      return {
        ...store,
        cart: [],
      };
    default:
      throw Error("Unknown action.");
  }
}
