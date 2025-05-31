const storeServices = {}
const backendUrl = import.meta.env.VITE_BACKEND_URL;

storeServices.videojuegos = async (page = 1) => {

    try {
        const resp = await fetch(`https://api.rawg.io/api/games?key=c5df4513c2584cc68477a27dce6e0f27&page=${page}`)
        if(!resp.ok) throw new Error("Error fetch data")
        const data = await resp.json()
        return data.results

    } catch (error) {
        console.log(error);
        return []
        
    }
}

storeServices.getOneVideojuegos = async (id) => {

    try {
        const resp = await fetch(`https://api.rawg.io/api/games/${id}?key=c5df4513c2584cc68477a27dce6e0f27`)
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