import { useState } from "react"
import axios from 'axios'
import { useActionData } from "react-router-dom"
import userServices from "../services/flux"


export const ForgotPassword = () => {

    const [email, setEmail] = useState('')
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

    const handleClick = () => {
        userServices.sendResetEmail(email)
    }

    return (
        // <div>
        //     <form onSubmit={handleSubmit}>
        //         <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        //         <button type="submit">Enviar Correo</button>
        //     </form>
        //     <p>{msg}</p>
        // </div>

        <div>
            <h1>Recuperar Contraseña</h1>
            <input type="text" value={email} onChange={e => setEmail(e.target.value)} />
            <button onClick={handleClick}>Reset</button>
        </div>
    )
}