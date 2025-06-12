import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import stripeServices from "../services/fluxStore";
import { div } from "three/tsl";
import "../styles/PaymentReturn.css"
import { ArrowLeft } from 'phosphor-react';


const PaymentReturn = () => {
  const [status, setStatus] = useState(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const navigate = useNavigate()

  //para manejar cuando se muestra el spinner
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    //extraemos el session_id de la url
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sessionId = urlParams.get('session_id');

    //verificamos el estado de la sesión
    stripeServices.fetchSessionStatus(sessionId).then(data => {
      setStatus(data.status);
      setCustomerEmail(data.customer_email);
      setLoading(false);
    })

  }, []);
  //si esta abierta, lo llevamos al checkout
  if (status === 'open') {
    return (
      <Navigate to="/checkout" />
    )
  }
  //si completaste la compra, le mostramos un mensaje de éxito
  if (status === 'complete') {
    return (
      <div className="fondoGames">
        <div className="boardgames-detail-back">
          <button className="icon-button" onClick={() => navigate('/games')}>
            <ArrowLeft size={24} weight="bold" />
          </button>
        </div>
        <section id="success">
          <p>
            We appreciate your business! A confirmation email will be sent to {customerEmail}.
            <br />
            If you have any questions, please email <a href="mailto:orders@example.com">orders@example.com</a>.
          </p>
        </section>
      </div>

    )
  }
  //muestra el spinner mientras se verifica el estado de la sesión
  return (
    <>
      <div className="fondoGames">
        <div className="boardgames-detail-back">
          <button className="icon-button" onClick={() => navigate('/games')}>
            <ArrowLeft size={24} weight="bold" />
          </button>
        </div>
        {loading && <div className="d-flex text-center justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        }
      </div>


    </>
  )
}

export default PaymentReturn