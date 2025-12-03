import { useEffect, useRef, useState } from 'react';

export const LucyGoddessBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Only load script after canvas is mounted
    if (!canvasRef.current) return;
    
    // Check if script already exists
    const existingScript = document.querySelector('script[src="/matrix.js"]');
    if (existingScript) {
      setScriptLoaded(true);
      return;
    }

    // Wait a tick for canvas to be fully ready
    const timer = setTimeout(() => {
      const script = document.createElement('script');
      script.src = '/matrix.js';
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    }, 100);

    return () => {
      clearTimeout(timer);
      const script = document.querySelector('script[src="/matrix.js"]');
      if (script) {
        script.remove();
      }
    };
  }, []);

  // Expose lucy trigger globally for chat integration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).triggerLucyResponse = () => {
        window.dispatchEvent(new Event('lucy-response'));
      };
    }
  }, []);

  return (
    <div className="lucy-bg">
      {/* Matrix Canvas Layer */}
      <canvas 
        ref={canvasRef}
        id="matrix" 
        className="matrix-canvas"
        aria-hidden="true"
      />
      
      {/* Holographic Parallax Layer */}
      <div className="holographic-layer" aria-hidden="true" />
      
      {/* Glow Pulse Layer */}
      <div className="glow-pulse-layer" aria-hidden="true" />
      
      {/* Dark Fade for Readability */}
      <div className="dark-fade-layer" aria-hidden="true" />
      
      {/* Lucy Full-Body Silhouette Glow */}
      <div className="lucy-silhouette-glow" aria-hidden="true" />
    </div>
  );
};
