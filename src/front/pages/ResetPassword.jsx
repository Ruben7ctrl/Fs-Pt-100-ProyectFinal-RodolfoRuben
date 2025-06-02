import axios from 'axios'
import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'




export const ResetPassword = () => {
    const { token } =useParams()
    // const [searchParams] = useSearchParams()
    // const token = searchParams.get('token')
    const [password, setPassword] = useState('')
    const [msg, setMsg] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const resp = await axios.post(`https://zany-fortnight-4jv64j66gv992qg5r-3000.app.github.dev/reset-password/${token}`,  {
                password,
            });
            setMsg(resp.data.msg)
        } catch (err) {
            setMsg("Error: " + err.response.data.error)
        }
    }

    return (
        <div>
            <h2>Resetear Contraseña</h2>
            <form onSubmit={handleSubmit}>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder='Password' />
                <button type='submit'>Actualizar</button>
            </form>
            <p>{msg}</p>
        </div>
    )
}