import React, { useEffect ,useState} from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import "../styles/Home.css"
import { useNavigate } from "react-router-dom";
import ParaHome from './../assets/ParaHome.mp3'




export const Home = () => {
    const audioHome = new Audio(ParaHome)
	const [animar, setAnimar] = useState(false);
	const [animarA, setAnimarA] = useState(false);
	const [animarB, setAnimarB] = useState(false);
	const navigate = useNavigate()

	useEffect(()=>{




	audioHome.play();
	
	audioHome.volume = 0.1

	},[])
	

	const handleSignup = () => {
		setAnimar(true);
		setTimeout(() => {
      navigate('/signup');
    }, 400);
		audioHome.pause();
	}

	const handleSignin = () => {
		setAnimarA(true);
		setTimeout(() => {
      navigate('/signin');
    }, 400);
		audioHome.pause();
	}

	const handleVisitor = () => {
		setAnimarB(true);
		setTimeout(() => {
      navigate('/games');
    }, 400);
		
		audioHome.pause();
		
	}

	

	
  




	return (
		<div className="fondoPrincipal">
			<div className="structure">
				<h1 className="text_logo">RACEGAME<span className="invertir">R</span></h1>
				<div className="buttons">

					<div className="box">
                        <div className="background-fill"></div>
						<div className="line main-line-left"></div>
							<div className="line main-line-right"></div>
						<div className="line vertical-left"></div>
						<div className="line vertical-right"></div>
						<div className="line top-line-left"></div>
						<div className="line top-line-right"></div>

						<div className="boxes container-fluid ">
							<svg width="275" className={animar ? 'blur-out-expand' : ''} onClick={handleSignup} height="103" viewBox="0 0 758 103" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M157.1 0.699994L137.9 39.4H110.3L117.05 25.6H66.5L64.1 30.4L125.6 64.3L116.6 82.45L126.95 103H0.5L19.7 64.3H47.3L40.4 78.1H91.1L93.5 73.3L32 39.4L41 21.25L30.65 0.699994H157.1ZM214.595 0.849992L176.045 78.4L165.695 66.25L184.295 103H136.145L174.695 25.45L185.045 37.75L166.445 0.849992H214.595ZM288.216 39.55L320.016 103H193.566L231.966 25.45L242.316 37.75L223.866 0.849992H350.166L330.966 39.55H303.366L310.266 25.6H259.566L233.616 78.25H278.466L271.566 64.3H258.516L270.816 39.55H288.216ZM407.661 0.849992L402.561 11.2L427.911 62.05L458.211 0.849992H485.961L447.411 78.4L437.211 66.25L455.661 103H407.511L412.611 92.8L387.261 41.95L356.961 103H329.211L367.761 25.45L378.111 37.75L359.511 0.849992H407.661ZM543.302 0.699994L505.052 78.1H555.602L594.002 0.699994H621.602L581.102 82.45L591.452 103H465.002L505.502 21.25L495.302 0.699994H543.302ZM710.296 39.55L717.196 25.6H666.646L659.746 39.55H710.296ZM647.446 64.3L638.446 82.6L648.646 103H600.646L639.046 25.45L649.396 37.75L641.146 21.25L630.796 0.849992H757.246L725.746 64.3H647.446Z" fill="white" />
							</svg></div>

						<div className="boxes container-fluid ">
							<svg width="275" className={animarA ? 'blur-out-expand' : ''} onClick={handleSignin} height="103" viewBox="0 0 680 103" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M157.1 0.699994L137.9 39.4H110.3L117.05 25.6H66.5L64.1 30.4L125.6 64.3L116.6 82.45L126.95 103H0.5L19.7 64.3H47.3L40.4 78.1H91.1L93.5 73.3L32 39.4L41 21.25L30.65 0.699994H157.1ZM214.595 0.849992L176.045 78.4L165.695 66.25L184.295 103H136.145L174.695 25.45L185.045 37.75L166.445 0.849992H214.595ZM288.216 39.55L320.016 103H193.566L231.966 25.45L242.316 37.75L223.866 0.849992H350.166L330.966 39.55H303.366L310.266 25.6H259.566L233.616 78.25H278.466L271.566 64.3H258.516L270.816 39.55H288.216ZM407.661 0.849992L402.561 11.2L427.911 62.05L458.211 0.849992H485.961L447.411 78.4L437.211 66.25L455.661 103H407.511L412.611 92.8L387.261 41.95L356.961 103H329.211L367.761 25.45L378.111 37.75L359.511 0.849992H407.661ZM543.302 0.699994L502.802 82.45L513.152 103H465.002L505.502 21.25L495.152 0.699994H543.302ZM600.727 0.849992L595.627 11.2L620.977 62.05L651.277 0.849992H679.027L640.477 78.4L630.277 66.25L648.727 103H600.577L605.677 92.8L580.327 41.95L550.027 103H522.277L560.827 25.45L571.177 37.75L552.577 0.849992H600.727Z" fill="white" />
							</svg></div>

						<div className="boxes container-fluid">
							<svg onClick={handleVisitor} className={animarB ? 'blur-out-expand' : ''} width="400" height="103" viewBox="0 0 797 103" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M60.2 0.699994L29.75 62.2L37.55 78.1H72.35L110.75 0.699994H138.5L97.85 82.45L108.2 103H19.4L0.5 65.2L22.25 21.25L12.05 0.699994H60.2ZM195.991 0.849992L157.441 78.4L147.091 66.25L165.691 103H117.541L156.091 25.45L166.441 37.75L147.841 0.849992H195.991ZM331.713 0.849992L312.513 39.55H284.763L291.663 25.6H241.113L238.713 30.4L300.213 64.3L293.163 78.4L282.813 66.25L301.413 103H174.963L194.163 64.3H221.913L215.013 78.25H265.563L267.963 73.45L206.463 39.55L213.513 25.45L223.863 37.75L205.263 0.849992H331.713ZM389.204 0.849992L350.654 78.4L340.304 66.25L358.904 103H310.754L349.304 25.45L359.654 37.75L341.054 0.849992H389.204ZM524.655 0.849992L505.455 39.55H477.705L484.605 25.6H473.055L444.855 82.6L455.205 103H407.055L445.305 25.6H410.655L398.205 0.849992H524.655ZM569.674 25.6L543.574 78.25H594.274L620.224 25.6H569.674ZM660.274 0.849992L621.874 78.4L611.524 66.25L629.974 103H503.674L542.074 25.45L552.424 37.75L533.824 0.849992H660.274ZM749.118 39.55L756.018 25.6H705.468L698.568 39.55H749.118ZM717.618 103L727.068 83.95L717.318 64.3H686.268L667.068 103H639.318L677.868 25.45L688.068 37.75L669.618 0.849992H796.068L764.568 64.3H746.418L765.768 103H717.618Z" fill="white" />
							</svg>
						</div>
					</div>







				</div>
			</div>
		</div>
	);
}; 