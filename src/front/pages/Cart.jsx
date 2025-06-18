import { useNavigate, Link } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer"
import stripeServices from "../services/fluxStore"
import { loadStripe } from "@stripe/stripe-js"
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"
import { useEffect, useState } from "react"
import "../styles/Cart.css"
import { ArrowLeft } from "phosphor-react";
import { getStoredUser } from "../utils/storage";
import storeServices from "../services/fluxApis";


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC);

export const Cart = () => {

    const { store: { cart }, dispatch } = useGlobalReducer()
    const navigate = useNavigate()
    const [clientSecret, setClientSecret] = useState(null);
    const [checkoutActive, setCheckoutActive] = useState(false)
    const [itemsStore, setItemsStore] = useState([])

    const safeCart = cart || [];

    console.log("contenido del carrito", cart);

    // useEffect(() => {
    //     const fetchItems = async () => {
    //         const data = await stripeServices.getItemsFromStore();
    //         setItemsStore(data)
    //     }
    //     fetchItems()
    // }, [])

    useEffect(() => {
        const fetchCartItems = async () => {
            const user = getStoredUser();
            if (!user) {
                navigate('/signin');
                return;
            }

            try {
                const cartData = await stripeServices.getCart(user.id);  // Llamada al backend que devuelve los items del carrito
                console.log("Respuesta del backend carrito:", cartData);
                const enrichedItems = await Promise.all(
                    cartData.map(async (item) => {
                        const details = await storeServices.getOneVideojuegos(item.game_api_id);
                        return {
                            ...item,
                            background_image: details?.background_image,
                            platforms: details?.platforms,
                            ratings: details?.ratings,
                        }
                    })
                )
                setItemsStore(enrichedItems)
                dispatch({ type: 'set_cart', payload: enrichedItems });  // Actualiza el store global con los datos del backend
            } catch (error) {
                console.error("Error cargando carrito:", error);
            }
        }

        fetchCartItems();
    }, [dispatch, navigate]);

    const calculateTotal = () => {
        return cart.reduce((acc, item) => {
            const storeItem = itemsStore.find((i) => i.stripe_price_id === item.stripe_price_id);
            const price = parseFloat(storeItem?.price || 0)
            const quantity = item.quantity || 1
            return acc + price * quantity;
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

    const handleRemoveCart = async (itemId) => {
        try {
            await stripeServices.removeCartItem(itemId)

            dispatch({ type: 'remove_from_cart', payload: itemId})
        } catch (error) {
            console.error("Error eliminando item", error.message);
            
        }
    }

    // const handleCleanCart = async () => {
    //     const user = getStoredUser();
    //     if (!user) {
    //         navigate("/signin");
    //         return
    //     }
    //     try {
    //         await stripeServices.cleanCart(user.id);

    //         dispatch({ type: 'clean_cart'})
    //     } catch (error) {
    //         console.error("Error vaciando carrito", error.message);
            
    //     }
    // }

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
            <h1 className="title">Tu Cesta</h1>
            {safeCart.length === 0 ? (
                <div className="cart-summary">
                    <p><strong>No hay juegos en la cesta</strong></p>
                    <button onClick={() => navigate("/games")} className="cyber-btn">Seguir comprando</button>
                </div>
            ) : (
                <>
                    <ul className="cart-list">
                        {safeCart.map((item) => {
                            const storeItem = itemsStore.find(
                                (i) => i.stripe_price_id === item.stripe_price_id
                            );
                            const price = parseFloat(storeItem?.price) || "No disponible"
                            const ratings = item.ratings?.map(r => `"${r.title}"`).join(", ") || "Sin Ratings"
                            const platforms = item.platforms?.map(p => p.platform?.name || p.name).join(", ") || "Plataformas no disponibles"
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
                                        <p className="game-description">{item.rating}⭐</p>
                                        <p><strong className="text">Platforms: </strong>{platforms}</p>
                                        <p><strong className="text">Ratings: </strong>{ratings}</p>
                                        <p><strong className="text">Precio:</strong> {price}€</p>
                                        <div className="game-button-container">
                                            <button className="game-buttonss" onClick={() => handleRemoveCart(item.id)}>
                                                Eliminar
                                            </button>
                                            <Link to={`/games/${item.id}`} className="game-buttonss">
                                                Info
                                            </Link>
                                        </div>

                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                    <div className="cart-summary">
                        <p><strong>Total:</strong> {calculateTotal()} €</p>
                        <button onClick={handleCheckout} className="cyber-btn1">Proceder al Pago</button>
                        <button onClick={() => navigate("/games")} className="cyber-btn">Seguir comprando</button>
                    </div>

                </>
            )}
        </div>
    )
}