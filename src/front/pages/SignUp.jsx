import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Autentication.css"
import userServices from "../services/flux";
import logo from "../assets/img/Logo.png"
export const Signup = () => {

    const avatares = [
        { id: 0, nombre: "Maga", fondo: '/src/front/assets/img/Maga.jpg' },
        { id: 1, nombre: "Asesino", fondo: '/src/front/assets/img/Asesino.jpg' },
        { id: 2, nombre: "Soldado", fondo: '/src/front/assets/img/Soldado.jpg' }
    ]

    const { store, dispatch } = useGlobalReducer()
    const navigate = useNavigate()
    const [avatarIndex, setAvatarIndex] = useState(0)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
        firstname: "",
        lastname: "",
        dateofbirth: "",
        phone: "",
        avatar_image: avatares[0].nombre,
    })

    const avatar = avatares[avatarIndex]

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        userServices.signup(formData).then(data => data.success && navigate('/signin'))
        setFormData({
            email: "",
            password: "",
            username: "",
            firstname: "",
            lastname: "",
            dateofbirth: "",
            phone: "",
            avatar_image: avatares[0].nombre,
        })
    }

    const handleClick = () => {
        navigate('/signin')
    }

    useEffect(() => {
        setFormData(prev => {
            if (prev.avatar_image == avatar.nombre) return prev;
            return { ...prev, avatar_image: avatar.nombre };
        })
    }, [avatar])

    const handleMas = () => {
        setAvatarIndex((avatarIndex - 1 + avatares.length) % avatares.length)
    }

    const handleMenos = () => {
        setAvatarIndex((avatarIndex + 1) % avatares.length)
    }


    return (
        <div className={`fondo${avatar.nombre.toLowerCase()}`}>
            <nav className="navbar">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">
                        <img src={logo} alt="Logo" width="60" height="44" />
                    </Link>
                </div>
            </nav>
            <div className={`signup${avatar.nombre.toLowerCase()}`}>
                <form className="container-fluid mt-2" onSubmit={handleSubmit}>
                    <div className="card-header d-flex justify-content-center">
                        <h2>SignUp</h2>
                    </div>
                    <div className=" mt-3 col-sm-12 col-md-12">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input type="email" className="form-control" placeholder="Email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className=" mt-3 col-sm-12 col-md-12">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input type="password" className="form-control" placeholder="Password" name="password" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div className=" mt-3 col-sm-12 col-md-12">
                        <label htmlFor="inputUserName" className="form-label">UserName</label>
                        <input type="text" className="form-control" id="inputUserName" placeholder="UserName" name="username" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div className="avatars mt-3 col-sm-12 col-md-12">
                        <label htmlFor="avatar" className="form-label">Elige tu Avatar (flechas)</label>
                        <input type="text" className="form-control" placeholder="Avatar" name="avatar" value={formData.avatar_image} onChange={handleChange} required />
                    </div>

                    <div className="d-flex flex-column justify-content-center gap-3 mt-3">
                        <button className="btn btn-secondary" onClick={handleClick}>Already account?</button>
                        <input type="submit" className="btn btn-primary" value={"Sign Up"} />
                    </div>


                </form>
            </div>
            <div className="botones_avatar">
                    <h3 className="elige">Elige tu Avatar</h3>
                <div className="botones">
                    <button onClick={handleMas}><span className="fa-regular fa-square-caret-left"></span></button>
                    <button onClick={handleMenos}><span className="fa-regular fa-square-caret-right"></span></button>
                </div>

            </div>
        </div>
    )
}