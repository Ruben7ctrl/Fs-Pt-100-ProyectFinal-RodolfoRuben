const backendUrl = import.meta.env.VITE_BACKEND_URL;
const gamesServices = {};

gamesServices.updateStats = async (result, gameId, userId, moveCount, token) => {
  try {
    // const token = localStorage.getItem("token");
    // if (!token || !userId || !onlineGameId) {
    //   throw new Error("Faltan datos para actualizar estadisticas");
    // }
    console.log("Enviando stats:", {
      result,
      moveCount,
      gameId,
      userId,
    });
    const resp = await fetch(backendUrl + "/api/stats/update_result", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: userId,
        online_game_id: gameId,
        result: result,
        move_count: moveCount,
      }),
    });

    const data = await resp.json();
    console.log("Stats update:", data);

    return data;
  } catch (error) {
    console.error("Error updating stats:", error);
  }
};

gamesServices.getGames = async () => {
  try {
    const token = localStorage.getItem("token");
    const resp = await fetch(backendUrl + "/api/onlinegames", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!resp.ok) throw new Error("Error al obtener partidas");
    const data = await resp.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default gamesServices;
