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


export default stripeServices