import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";
import "../styles/Autentication.css"
import userServices from "../services/fluxAutentication";


export const Signin = () => {


    const { store, dispatch } = useGlobalReducer()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        identify: "",
        password: "",
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const data = await userServices.signin(formData)

            if(data?.success) {
                if(formData.identify?.includes("@admin")) {
                    navigate('/admin')
                    setFormData({
                        identify: "",
                        password: ""
                    })
                } else {
                    navigate('/demo')
                    setFormData({
                        identify: "",
                        password: ""
                    })
                }
            } else {
                alert(data?.error || "Email, contraseña incorrectos")
            }
        } catch (error) {
            console.log("Login error", error);
            
        }
    }

    const handleClick = () => {
        navigate('/signup')
    }



    return (
        <div className="fondo">
            <div className="center">
            <div className="signin">
                <form className="container mt-2" onSubmit={handleSubmit}>
                    <div className="card-header d-flex justify-content-center">
                        <h2>SignIn</h2>
                    </div>
                    <div className=" mt-3 col-sm-12 col-md-12">
                        <label htmlFor="identify" className="form-label">Email/Username</label>
                        <input type="text" className="form-control" placeholder="Email/Username" name="identify" value={formData.identify} onChange={handleChange} required />
                    </div>
                    <div className=" mt-3 col-sm-12 col-md-12">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input type="password" className="form-control" placeholder="Password" name="password" value={formData.password} onChange={handleChange} required />
                    </div>

                    <div className="d-flex flex-column gap-3 mt-3">
                        <button className="btn btn-secondary" onClick={handleClick}>Sign Up</button>
                        <input type="submit" className="btn btn-primary" value={"Sign In"}/>
                    </div>


                </form>
            </div>
            </div>
        </div>
    )
}