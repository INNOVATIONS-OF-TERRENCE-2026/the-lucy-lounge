import { useEffect, useState } from 'react';

export const CosmicBackground = () => {
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    let time = 0;

    const animate = () => {
      time += 0.0001;
      // Extremely subtle parallax drift
      setParallaxY(Math.sin(time) * 2);
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Layer 1: Base Cosmic Gradient */}
      <div 
        className="absolute inset-0 animate-nebula-drift"
        style={{
          background: 'var(--gradient-nebula)',
        }}
      />

      {/* Layer 2: Nebula Cloud */}
      <div 
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 30%, hsl(277 100% 30% / 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, hsl(320 100% 50% / 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, hsl(280 100% 9% / 0.4) 0%, transparent 60%)
          `,
          transform: `translateY(${parallaxY}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      />

      {/* Layer 3: Sacred Light Rays */}
      <div className="absolute inset-0">
        {/* Left ray */}
        <div 
          className="absolute left-[15%] top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent animate-light-ray"
          style={{
            boxShadow: '0 0 20px hsl(277 100% 30% / 0.3)',
            transform: `translateY(${parallaxY * 1.5}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
        
        {/* Center ray */}
        <div 
          className="absolute left-1/2 top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-secondary/8 to-transparent animate-light-ray"
          style={{
            boxShadow: '0 0 25px hsl(320 100% 50% / 0.2)',
            animationDelay: '2s',
            transform: `translateY(${parallaxY * 2}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
        
        {/* Right ray */}
        <div 
          className="absolute right-[20%] top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent animate-light-ray"
          style={{
            boxShadow: '0 0 20px hsl(277 100% 30% / 0.3)',
            animationDelay: '4s',
            transform: `translateY(${parallaxY * 1.8}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
      </div>

      {/* Soft vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, hsl(0 0% 0% / 0.3) 100%)',
        }}
      />
    </div>
  );
};
