import { getStoredUser } from "../utils/storage";
import stripeServices from "../services/fluxStore";


export const handleAddToCart = async (game, cart, dispatch, navigate, showCartModal) => {
  const user = getStoredUser();
  console.log("🧩 game que recibo:", game);

  if (!user) {
    console.warn("🔴 No hay usuario en localStorage. Redirigiendo...");
    navigate("/signin");
    return;
  }
  console.log("game", game);

  if (!game?.id) {
    console.error("El juego no tiene 'id' válido", game);
    alert("Error: juego inválido, no se puede añadir al carrito.");
    return;
  }

  const payload = {
    user_id: user.id,
    game_api_id: game.id,
    // name: game.name,
    stripe_price_id: game.stripe_price_id,
    game_type: "videogame",
    // currency: game.currency || "eur",
    quantity: 1,
  };

  if (cart.find((item) => item.game_api_id === game.id || item.id === game.id)) {
    showCartModal(game.name);
    return;
  }

  try {
    dispatch({ type: "add_to_cart", payload: {...game, game_api_id: game.id} });

    console.log("Payload addToCart:", payload);
    const resp = await stripeServices.addToCart(payload);
    console.log("📩 Respuesta de add_to_cart:", resp);
  } catch (error) {
    console.error("Error al añadir al carrito", error);
    alert("No se pudo guardar en el carrito");
  }
};

export const handleAddToCartBoard = async (game, cart, dispatch, navigate, showCartModal) => {
  const user = getStoredUser();
  console.log("🧩 game que recibo:", game);

  if (!user) {
    console.warn("🔴 No hay usuario en localStorage. Redirigiendo...");
    navigate("/signin");
    return;
  }
  console.log("game", game);

  if (!game?.id) {
    console.error("El juego no tiene 'id' válido", game);
    alert("Error: juego inválido, no se puede añadir al carrito.");
    return;
  }

  const payload = {
    user_id: user.id,
    game_api_id: game.id,
    // name: game.name,
    stripe_price_id: game.stripe_price_id,
    game_type: "boardgame",
    // currency: game.currency || "eur",
    quantity: 1,
  };

  if (cart.find((item) => item.game_api_id === game.id || item.id === game.id)) {
    showCartModal(game.name);
    return;
  }

  try {
    dispatch({ type: "add_to_cart", payload: {...game, game_api_id: game.id} });

    console.log("Payload addToCart:", payload);
    const resp = await stripeServices.addToCart(payload);
    console.log("📩 Respuesta de add_to_cart:", resp);
  } catch (error) {
    console.error("Error al añadir al carrito", error);
    alert("No se pudo guardar en el carrito");
  }
};
