import { useNavigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer"
import stripeServices from "../services/fluxStore"
import { loadStripe } from "@stripe/stripe-js"
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"
import { useState } from "react"
import "../styles/Cart.css"


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC);

export const Cart = () => {

    const { store: { cart }, dispatch } = useGlobalReducer()
    const navigate = useNavigate()
    const [clientSecret, setClientSecret] = useState(null);
    const [checkoutActive, setCheckoutActive] = useState(false)

    const handleCheckout = async () => {
        try {
            const items = cart.map((item) => ({
                price: item.stripe_price_id,
                quantity: 1,
            }));
            const secret = await stripeServices.fetchClientSecret(items);
            setClientSecret(secret)
            setCheckoutActive(true)
        } catch (error) {
            console.error("Error en el checkout:", error.message);
            
        }
    }

    if (checkoutActive && clientSecret) {
        return (
            <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ clientSecret }} >

                <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
        )
    }

    return (
        <div className="cart-container">
            <h1>Tu Cesta</h1>
            {cart.length === 0 ? (
                <p>No hay juegos en la cesta</p>
            ) : (
                <>
                    <ul>
                        {cart.map((item) => (
                            <li key={item.id}>
                                {item.name}{" "}
                                <button onClick={() => dispatch({ type: 'remove_from_cart', payload: item.id})}>
                                    Eliminar
                                </button>
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleCheckout} className="cyber-btn">Proceder al Pago</button>
                </>
            )}
        </div>
    )
}