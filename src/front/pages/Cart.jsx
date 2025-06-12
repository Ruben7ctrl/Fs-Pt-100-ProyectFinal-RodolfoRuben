import { useNavigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer"
import stripeServices from "../services/fluxStore"
import { loadStripe } from "@stripe/stripe-js"
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"
import { useEffect, useState } from "react"
import "../styles/Cart.css"
import { ArrowLeft } from "phosphor-react";


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC);

export const Cart = () => {

    const { store: { cart }, dispatch } = useGlobalReducer()
    const navigate = useNavigate()
    const [clientSecret, setClientSecret] = useState(null);
    const [checkoutActive, setCheckoutActive] = useState(false)
    const [itemsStore, setItemsStore] = useState([])

    console.log("contenido del carrito", cart);

    useEffect(() => {
        const fetchItems = async () => {
            const data = await stripeServices.getItemsFromStore();
            setItemsStore(data)
        }
        fetchItems()
    }, [])

    const calculateTotal = () => {
        return cart.reduce((acc, item) => {
            const storeItem = itemsStore.find((i) => i.stripe_price_id === item.stripe_price_id);
            const price = parseFloat(storeItem?.price || 0)
            return acc + price
        }, 0).toFixed(2);
    }


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
            <div className="cart-container">
                <div className="embedded-checkout-wrapper">
                    <EmbeddedCheckoutProvider
                        stripe={stripePromise}
                        options={{ clientSecret }} >

                        <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                </div>
            </div>

        )
    }


    return (
        <div className="cart-container">
            <div className="boardgames-detail-back">
                <button className="icon-button" onClick={() => navigate('/games')}>
                    <ArrowLeft size={24} weight="bold" />
                </button>
            </div>
            <h1>Tu Cesta</h1>
            {cart.length === 0 ? (
                <div className="cart-summary">
                    <p><strong>No hay juegos en la cesta</strong></p>
                    <button onClick={() => navigate("/games")} className="cyber-btn">Seguir comprando</button>
                </div>
            ) : (
                <>
                    <ul className="cart-list">
                        {cart.map((item) => {
                            const storeItem = itemsStore.find(
                                (i) => i.stripe_price_id === item.stripe_price_id
                            );
                            const price = storeItem?.price || "No disponible"
                            const imageSrc = item.background_image || item.image || "fallback.jpg"
                            console.log("storeItem:", item);

                            return (
                                <li key={item.id} className="cart-item">
                                    {imageSrc
                                        && (
                                            <img
                                                src={imageSrc}
                                                alt={item.name}
                                                className="cart-item-image" />
                                        )}
                                    <div className="cart-item-details">
                                        <h3>{item.name}</h3>
                                        <p>Precio: {price}€</p>
                                        <button onClick={() => dispatch({ type: 'remove_from_cart', payload: item.id })}>
                                            Eliminar
                                        </button>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                    <div className="cart-summary">
                        <p><strong>Total:</strong> {calculateTotal()} €</p>
                        <button onClick={handleCheckout} className="cyber-btn">Proceder al Pago</button>
                        <button onClick={() => navigate("/games")} className="cyber-btn">Seguir comprando</button>
                    </div>

                </>
            )}
        </div>
    )
}