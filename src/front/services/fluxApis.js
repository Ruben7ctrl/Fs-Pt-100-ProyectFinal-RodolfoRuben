const storeServices = {}
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const apikeyRAWG = import.meta.env.VITE_RAWG_API_KEY;

storeServices.videojuegos = async (page = 1) => {

    try {
        const resp = await fetch(`https://api.rawg.io/api/games?key=${apikeyRAWG}&page=${page}`)
        if(!resp.ok) throw new Error("Error fetch data")
        const data = await resp.json()
        return data.results

    } catch (error) {
        console.log(error);
        return []
        
    }
}


storeServices.getRecomendados = async ({ genre_slug = null, platform_id = null, page = 1 }) => {
    try {
        const url = new URL("https://api.rawg.io/api/games");
        url.searchParams.set("key", apikeyRAWG);
        url.searchParams.set("page", page);
        url.searchParams.set("page_size", 10);

        if (genre_slug && genre_slug !== "all") url.searchParams.set("genres", genre_slug);
        if (platform_id && platform_id !== "all") url.searchParams.set("platforms", platform_id);

        console.log("Fetching URL:", url.toString());  // <--- para debug

        const resp = await fetch(url.toString());
        if (!resp.ok) throw new Error('Error fetch data');
        const data = await resp.json();
        return data.results;
    } catch (error) {
        console.log(error);
        return [];
    }
};





storeServices.getOneVideojuegos = async (id) => {

    try {
        const resp = await fetch(`https://api.rawg.io/api/games/${id}?key=${apikeyRAWG}`)
        console.log(resp);
        
        if (!resp.ok) throw new Error('Error fetch data')
        const data = await resp.json()
        return data
    } catch (error) {
        console.log(error);
        return null

    }
}

storeServices.getGameScreenshots = async (id) => {
  
  const response = await fetch(`https://api.rawg.io/api/games/${id}/screenshots?key=${apikeyRAWG}`);
  if (!response.ok) throw new Error("Error al obtener screenshots");
  return await response.json();
};



storeServices.video = async (id) => {

    try {
        const resp = await fetch(`https://api.rawg.io/api/games/${id}/movies?key=${apikeyRAWG}`)
        console.log(resp);
        
        if (!resp.ok) throw new Error('Error fetch data')
        const data = await resp.json()
        return data
    } catch (error) {
        console.log(error);
        return null

    }
}

storeServices.getJuegosMesa = async (leters) => {

    try {
        const resp = await fetch(`https://boardgamegeek.com/xmlapi2/search?query=${leters}&type=boardgame`)
        if(!resp.ok) throw new Error("Error fetch data");

        const xmlText = await resp.text()
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlText, "application/xml")

        const items = Array.from(xmlDoc.getElementsByTagName("item")).map(item => {
            return {
                id: item.getAttribute("id"),
                name: item.getElementsByTagName("name")[0]?.getAttribute("value"),
                year: item.getElementsByTagName("yearpublished")[0]?.getAttribute("value")
            }
        })
        
        return items
    } catch (error) {
        console.log(error);
        return []
        
    }
}

storeServices.JuegosMesaDatos = async (id) => {

    try {
        const resp = await fetch(`https://boardgamegeek.com/xmlapi2/thing?id=${id}&stats=1`)
        if(!resp.ok) throw new Error("Error fetch data");

        const xmlText = await resp.text()
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlText, "application/xml")

        const item = xmlDoc.querySelector("item")
        if(!item) return null

        const name = item.querySelector('name[type="primary"]')?.getAttribute("value")
        const year = item.querySelector('yearpublished')?.getAttribute("value")
        const description = item.querySelector('description')?.textContent
        const image = item.querySelector('image')?.textContent
        const minPlayers = item.querySelector('minPlayers')?.getAttribute("value")
        const maxPlayers = item.querySelector('maxPlayers')?.getAttribute("value")
        const playTime = item.querySelector('playingtime')?.getAttribute("value")
        const averageRating = item.querySelector('average')?.getAttribute("value")
        const categories = Array.from(item.getElementsByTagName("link")).filter(link => link.getAttribute("type") === "boardgamecategory").map(link => link.getAttribute("value"))

        return {
            id,
            name,
            year,
            description,
            image,
            minPlayers,
            maxPlayers,
            playTime,
            averageRating,
            categories,
        }
        
    } catch (error) {
        console.log("Error parsing BGG data:", error);
        return null
        
    }
}

export default storeServices