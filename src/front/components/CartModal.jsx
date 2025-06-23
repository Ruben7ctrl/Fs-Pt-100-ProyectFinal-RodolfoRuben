import "../styles/CartModal.css"


 export const CartModal = ({ isOpen, onClose, gameName }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>X</button>
                <h2 className="modal-title">
                        Ya esta en el Carrito
                </h2>
                <p className="modal-message">
                    El juego <strong>{gameName}</strong> ya ha sido añadido al carrito
                </p>
            </div>
        </div>
    )
}