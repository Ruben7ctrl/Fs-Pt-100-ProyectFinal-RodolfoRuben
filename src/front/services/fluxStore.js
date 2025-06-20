import storeServices from "./fluxApis";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const stripeServices = {}


stripeServices.getItemsFromStore = async () => {
    try {
        const resp = await fetch(backendUrl + "/api/items", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const data = await resp.json()
        console.log(data);
        
        return data
    } catch (error) {
        console.log(error);
        
    }
}

stripeServices.fetchClientSecret = async (items) => {

    try {
        const resp = await fetch(backendUrl + "/api/create-checkout-session", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ items })
        });
        if (!resp.ok) {
            const error = await resp.json()
            throw new Error(error.error || "Failed to create checkout session");
        }

        const data = await resp.json();
        return data.clientSecret
        
    } catch (error) {
        console.error("Stripe error:", error.message);
        throw error
    }
}

stripeServices.fetchSessionStatus = async (sessionId) => {

    try {
        const resp = await fetch(backendUrl + `/api/session-status?session_id=${sessionId}`)
        if (!resp.ok) {
            throw new Error("Failed to fetch session status");
            
        }
        const data = await resp.json()

        return data
    } catch (error) {
        throw error
    }
}

stripeServices.addToCart = async ({user_id, game_api_id, stripe_price_id, quantity = 1, game_type}) => {
    

    try {
        console.log("📦 Enviando a backend:", { user_id, game_api_id, stripe_price_id, quantity, game_type });
        
        const resp = await fetch(backendUrl + "/api/add-to-cart", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({user_id, game_api_id, stripe_price_id, quantity, game_type })
        })
        if (!resp.ok) {
                const err = await resp.json()
                throw new Error(err.error || "Error al agregar al carrito");
            }
        const data = await resp.json()
        return data
    } catch (error) {
        console.log("error", error);
        
    }
}

stripeServices.getCart = async (user_id) => {
    try {
        const resp = await fetch(backendUrl + `/api/cart/${user_id}`)

        if (!resp.ok) {
            throw new Error("Error al obtener el carrito");
        }
        const data = await resp.json()
        return data.items || []
    } catch (error) {
        console.log(error);
        
    }
}

stripeServices.removeCartItem = async (itemId) => {
    try {
        const resp = await fetch(backendUrl + `/api/cart/item/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        if (!resp.ok) {
            const error = await resp.json()
            throw new Error(error.error || "Error eliminando item");
        }
        const data = resp.json()
        return data
    } catch (error) {
        console.log(error);
        
    }
}

stripeServices.cleanCart = async (userId) => {
    try {
        const resp = await fetch(backendUrl + `/api/cart/clean/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        if (!resp.ok) {
            const error = await resp.json()
            throw new Error(error.error || "Error vaciando carrito");
        }
        const data = resp.json()
        return data
    } catch (error) {
        
    }
}

export default stripeServices