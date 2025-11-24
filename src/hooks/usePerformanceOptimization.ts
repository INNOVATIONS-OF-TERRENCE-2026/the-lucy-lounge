import { useEffect, useState } from 'react';

export const usePerformanceOptimization = () => {
  const [fps, setFps] = useState(60);
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const currentFPS = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setFps(currentFPS);
        
        // If FPS drops below 30, consider it low performance
        setIsLowPerformance(currentFPS < 30);
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // Reduce animation complexity on low-end devices
  const getOptimizedSettings = () => {
    return {
      enableParticles: !isLowPerformance,
      enableBlur: !isLowPerformance,
      enableShadows: !isLowPerformance,
      particleCount: isLowPerformance ? 10 : 30,
      animationDuration: isLowPerformance ? 200 : 300
    };
  };

  return {
    fps,
    isLowPerformance,
    getOptimizedSettings
  };
};
