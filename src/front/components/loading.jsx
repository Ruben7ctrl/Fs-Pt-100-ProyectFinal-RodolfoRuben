import anime from 'animejs';  
import { useEffect } from 'react';
import "../styles/GameDetail.css";


export const Loading = () => {
   useEffect(() => {
    anime({
      targets: '.staggering-grid-demo .el',
      scale: [
        { value: 0.1, easing: 'easeOutSine', duration: 500 },
        { value: 1, easing: 'easeInOutQuad', duration: 1200 }
        
      ],
      delay: anime.stagger(200, { grid: [14, 5], from: 'center' }),
      loop: true
      
    });
  }, []);

  const elements = Array.from({ length: 14 * 5 });

  return (
    <div className="staggering-grid-wrapper">
      <div className="staggering-grid-demo">
        {elements.map((_, index) => (
          <div key={index} className="el"></div>
        ))}
      </div>
    </div>
  );
};
