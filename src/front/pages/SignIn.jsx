import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Autentication.css"
import userServices from "../services/flux";



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
  e.preventDefault();
  try {
    const data = await userServices.signin(formData);

    if (data?.success) {
      // ⚠️ Paso 1: obtenemos relaciones favoritas
      const favorite1 = data.user.favorite1 || [];

      // ⚠️ Paso 2: enriquecemos llamando a las APIs externas
      const favorites = await userServices.getFavoritesFromRelations(favorite1);

      // ⚠️ Paso 3: actualizamos user en store y localStorage
      const userActualizado = {
        ...data.user,
        favorites: favorites,
      };

      dispatch({
        type: "signin/signup",
        payload: {
          user: userActualizado,
          token: data.token,
        },
      });

      localStorage.setItem("user", JSON.stringify(userActualizado));
      localStorage.setItem("token", data.token);

      // Redirección por rol
      if (formData.identify?.includes("@admin")) {
        navigate("/admin");
      } else {
        navigate("/games");
      }

      setFormData({ identify: "", password: "" });

    } else {
      alert(data?.error || "Email o contraseña incorrectos");
    }

  } catch (error) {
    console.log("Login error", error);
  }
};




    const handleClick = () => {
        navigate('/signup')
    }



    return (
        <div className="fondo">
            <nav className="navbar">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">
                        <img src="src/front/assets/img/Logo.png" alt="Logo" width="60" height="44" />
                    </Link>
                </div>
            </nav>
            <div className="center">
                <div className="signin">
                    <form className="container-fluid mt-2" onSubmit={handleSubmit}>
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
                            <input type="submit" className="btn btn-primary" value={"Sign In"} />
                            <button className="btn btn-secondary" onClick={handleClick}>Sign Up</button>
                            <Link to="/forgot-password">
                                <span className="h6 d-flex justify-content-center">Forgot your password?</span>
                            </Link>
                        </div>


                    </form>
                </div>
            </div>
        </div>
    )
}