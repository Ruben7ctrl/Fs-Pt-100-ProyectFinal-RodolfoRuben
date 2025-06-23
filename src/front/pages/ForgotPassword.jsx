import { useState } from "react"
import axios from 'axios'
import { useActionData } from "react-router-dom"
import userServices from "../services/flux"
import "../styles/ForgotPassword.css"


export const ForgotPassword = () => {

    const [email, setEmail] = useState('')
    const [success, setSuccess] = useState(null)
    // const [msg, setMsg] = useState('')
    // const [error, setError] = useState('')



    // const handleSubmit = async (e) => {
    //     e.preventDefault()
    //     setMsg('')
    //     setError('')

    //     if (!email) {
    //         setError('Por favor ingresa un email válido')
    //         return
    //     }

    //     try {
    //         const resp = await axios.post(
    //             'https://zany-fortnight-4jv64j66gv992qg5r-3001.app.github.dev/api/forgot-password', 
    //             { email }
    //         )
    //         setMsg(resp.data.msg)
    //     } catch (err) {
    //         setError(err.response?.data?.msg || 'Error enviando correo')
    //     }
    // }

    const handleClick = async () => {
        
        const resp = await userServices.sendResetEmail(email)
		if (resp && resp.success) {
			setSuccess(true)

		}
		else {
			setSuccess(false)
		}
    }

    return (
        // <div>
        //     <form onSubmit={handleSubmit}>
        //         <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        //         <button type="submit">Enviar Correo</button>
        //     </form>
        //     <p>{msg}</p>
        // </div>

            <div className="forgot-container">
                <div className="forgot-box">
                    <h1>Recuperar Contraseña</h1>
                    <input type="text" value={email} onChange={e => setEmail(e.target.value)} />
                    <button onClick={handleClick}>Reset</button>
                    {
						success !== null && (
							success ? (
								<div className="container bg-success"> Se ha mandado el correo exitosamente</div>
							) : (
								<div className="container bg-danger"> hubo un problema</div>
							)
						)}
                </div>
            </div>
    )
}