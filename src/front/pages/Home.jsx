import React, { useEffect } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import "../styles/Home.css"
import { useNavigate } from "react-router-dom";


export const Home = () => {

	const navigate = useNavigate()

	const handleSignup = () => {
		navigate('/demo')
	}

	const handleSignin = () => {
		navigate('/single')
	}

	const handleVisitor = () => {
		navigate('/demo')
	}

	return (
		<div className="fondoPrincipal">
			<div className="structure">
				<h1 className="text_logo">RACEGAME<span className="invertir">R</span></h1>
				<div className="buttons">
					<button className="btnSignup" onClick={handleSignup}>SignUp</button>

					<button className="btnSignin" onClick={handleSignin}><span className="fa-solid fa-right-to-bracket"></span> SignIn</button>

					<button onClick={handleVisitor} className="btnVisitor"><span className="fa-solid fa-gamepad"></span> Visitor</button>
				</div>
			</div>
		</div>
	);
}; 