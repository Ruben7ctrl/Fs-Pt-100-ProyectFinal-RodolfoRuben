import anime from 'animejs';  
import { useEffect } from 'react';



export const Loading = () => {
    useEffect(() => {
        // Animaciones
        anime({
            targets: '.loop',
            translateX: 270,
            loop: 3,
            easing: 'easeInOutSine'
        });

        anime({
            targets: '.loop-infinity',
            translateX: 270,
            loop: true,
            easing: 'easeInOutSine'
        });

        anime({
            targets: '.loop-alternate-infinity',
            translateX: 270,
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutSine'
        });
    }, []);

    return (
        <div className="loading-screen">
            <div className="loop">🔵</div>
            <div className="loop-infinity">🟢</div>
            <div className="loop-alternate-infinity">🟡</div>
            <p>Cargando juego...</p>
        </div>
    );
};
