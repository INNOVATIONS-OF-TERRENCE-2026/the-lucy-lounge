import { useEffect, useRef, useCallback, useMemo } from 'react';
import { WeatherMode, SeasonMode } from '@/hooks/useWeatherAmbient';

interface WeatherEffectsOverlayProps {
  weather: WeatherMode;
  season: SeasonMode;
  intensity: number;
  enabled: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  opacity: number;
  angle?: number;
  rotationSpeed?: number;
  life?: number;
  maxLife?: number;
}

export const WeatherEffectsOverlay = ({ 
  weather, 
  season, 
  intensity, 
  enabled 
}: WeatherEffectsOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const getParticleCount = useCallback((baseCount: number) => {
    const viewportScale = Math.min(window.innerWidth * window.innerHeight / (1920 * 1080), 1.5);
    return Math.floor(baseCount * intensity * viewportScale);
  }, [intensity]);

  const createParticle = useCallback((canvas: HTMLCanvasElement, type: string): Particle => {
    const w = canvas.width;
    const h = canvas.height;

    switch (type) {
      case 'rain':
        return {
          x: Math.random() * w * 1.2 - w * 0.1,
          y: Math.random() * h * 0.2 - h * 0.2,
          size: Math.random() * 1.5 + 0.5,
          speed: (4 + Math.random() * 4) * (0.5 + intensity * 0.5),
          drift: (Math.random() - 0.3) * 0.8,
          opacity: Math.random() * 0.4 + 0.2,
          angle: Math.PI / 12 + (Math.random() - 0.5) * 0.1,
        };

      case 'snow':
      case 'blizzard':
        const blizzardMultiplier = type === 'blizzard' ? 2 : 1;
        return {
          x: Math.random() * w,
          y: Math.random() * h * 0.1 - h * 0.1,
          size: Math.random() * 3 + 1,
          speed: (0.5 + Math.random() * 1) * (0.5 + intensity * 0.3),
          drift: (Math.random() - 0.5) * blizzardMultiplier * intensity,
          opacity: Math.random() * 0.6 + 0.3,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
        };

      case 'sunshine':
        return {
          x: w * (0.7 + Math.random() * 0.3),
          y: h * Math.random() * 0.3,
          size: Math.random() * 150 + 80,
          speed: 0,
          drift: 0,
          opacity: 0.03 + Math.random() * 0.02,
        };

      case 'cloudy':
        return {
          x: Math.random() * w * 1.5 - w * 0.25,
          y: Math.random() * h * 0.35,
          size: Math.random() * 250 + 150,
          speed: (0.1 + Math.random() * 0.15) * intensity,
          drift: 0,
          opacity: 0.06 + Math.random() * 0.04,
        };

      case 'bloomy':
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 20 + 5,
          speed: Math.random() * 0.3 + 0.1,
          drift: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.15 + 0.05,
          life: 0,
          maxLife: 200 + Math.random() * 200,
        };

      case 'hurricane':
        const hAngle = Math.random() * Math.PI * 2;
        return {
          x: w / 2 + Math.cos(hAngle) * (100 + Math.random() * 300),
          y: h / 2 + Math.sin(hAngle) * (100 + Math.random() * 300),
          size: Math.random() * 2 + 1,
          speed: 2 + Math.random() * 2,
          drift: 0,
          opacity: Math.random() * 0.4 + 0.2,
          angle: hAngle,
          rotationSpeed: 0.01 + Math.random() * 0.01,
        };

      case 'tornado':
        const tAngle = Math.random() * Math.PI * 2;
        const tRadius = Math.random() * 80 + 20;
        return {
          x: w * 0.7 + Math.cos(tAngle) * tRadius,
          y: h + 50,
          size: Math.random() * 2 + 1,
          speed: 1.5 + Math.random() * 1.5,
          drift: 0,
          opacity: Math.random() * 0.35 + 0.15,
          angle: tAngle,
          rotationSpeed: 0.03 + Math.random() * 0.02,
        };

      default:
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          size: 2,
          speed: 1,
          drift: 0,
          opacity: 0.3,
        };
    }
  }, [intensity]);

  const getSeasonTint = useCallback((season: SeasonMode): { r: number; g: number; b: number; a: number } => {
    switch (season) {
      case 'spring':
        return { r: 144, g: 238, b: 144, a: 0.015 };
      case 'summer':
        return { r: 255, g: 223, b: 186, a: 0.02 };
      case 'fall':
        return { r: 210, g: 160, b: 100, a: 0.02 };
      case 'winter':
        return { r: 200, g: 220, b: 255, a: 0.015 };
      default:
        return { r: 0, g: 0, b: 0, a: 0 };
    }
  }, []);

  const drawParticle = useCallback((
    ctx: CanvasRenderingContext2D,
    particle: Particle,
    type: string
  ) => {
    ctx.save();
    const baseOpacity = particle.opacity * intensity;

    switch (type) {
      case 'rain':
        ctx.strokeStyle = `rgba(180, 200, 220, ${baseOpacity})`;
        ctx.lineWidth = particle.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const rainLength = 15 + particle.speed * 2;
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(
          particle.x + Math.sin(particle.angle || 0) * rainLength,
          particle.y + Math.cos(particle.angle || 0) * rainLength
        );
        ctx.stroke();
        break;

      case 'snow':
      case 'blizzard':
        const snowGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        );
        snowGradient.addColorStop(0, `rgba(255, 255, 255, ${baseOpacity})`);
        snowGradient.addColorStop(0.5, `rgba(255, 255, 255, ${baseOpacity * 0.5})`);
        snowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = snowGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'sunshine':
        const sunGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        );
        sunGradient.addColorStop(0, `rgba(255, 250, 220, ${baseOpacity * 1.5})`);
        sunGradient.addColorStop(0.3, `rgba(255, 245, 200, ${baseOpacity})`);
        sunGradient.addColorStop(1, 'rgba(255, 240, 180, 0)');
        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'cloudy':
        const cloudGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        );
        cloudGradient.addColorStop(0, `rgba(160, 165, 175, ${baseOpacity})`);
        cloudGradient.addColorStop(0.4, `rgba(150, 155, 165, ${baseOpacity * 0.6})`);
        cloudGradient.addColorStop(1, 'rgba(140, 145, 155, 0)');
        ctx.fillStyle = cloudGradient;
        ctx.beginPath();
        ctx.ellipse(particle.x, particle.y, particle.size, particle.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'bloomy':
        const lifeRatio = particle.life && particle.maxLife 
          ? Math.sin((particle.life / particle.maxLife) * Math.PI) 
          : 1;
        const bloomGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        );
        bloomGradient.addColorStop(0, `rgba(255, 230, 200, ${baseOpacity * lifeRatio})`);
        bloomGradient.addColorStop(1, 'rgba(255, 220, 180, 0)');
        ctx.fillStyle = bloomGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'hurricane':
      case 'tornado':
        ctx.fillStyle = `rgba(180, 190, 200, ${baseOpacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  }, [intensity]);

  const updateParticle = useCallback((
    particle: Particle,
    canvas: HTMLCanvasElement,
    type: string,
    deltaTime: number
  ): boolean => {
    const dt = Math.min(deltaTime, 32) / 16.67;
    const w = canvas.width;
    const h = canvas.height;

    switch (type) {
      case 'rain':
        particle.x += particle.drift * dt;
        particle.y += particle.speed * dt;
        if (particle.y > h + 20) {
          particle.y = -20;
          particle.x = Math.random() * w * 1.2 - w * 0.1;
        }
        break;

      case 'snow':
      case 'blizzard':
        particle.x += particle.drift * dt + Math.sin(particle.y * 0.01 + Date.now() * 0.001) * 0.3;
        particle.y += particle.speed * dt;
        if (particle.y > h + 10) {
          particle.y = -10;
          particle.x = Math.random() * w;
        }
        if (particle.x < -10) particle.x = w + 10;
        if (particle.x > w + 10) particle.x = -10;
        break;

      case 'sunshine':
        particle.opacity = 0.03 + Math.sin(Date.now() * 0.0003 + particle.x * 0.005) * 0.02;
        break;

      case 'cloudy':
        particle.x += particle.speed * dt;
        if (particle.x > w + particle.size) {
          particle.x = -particle.size;
        }
        break;

      case 'bloomy':
        particle.x += particle.drift * dt;
        particle.y -= particle.speed * dt;
        if (particle.life !== undefined && particle.maxLife) {
          particle.life += dt;
          if (particle.life >= particle.maxLife) {
            particle.life = 0;
            particle.x = Math.random() * w;
            particle.y = h + 20;
          }
        }
        if (particle.y < -20) {
          particle.y = h + 20;
          particle.x = Math.random() * w;
        }
        break;

      case 'hurricane':
        if (particle.angle !== undefined) {
          particle.angle += (particle.rotationSpeed || 0.01) * dt;
          const radius = Math.sqrt(
            Math.pow(particle.x - w / 2, 2) + Math.pow(particle.y - h / 2, 2)
          );
          particle.x = w / 2 + Math.cos(particle.angle) * radius * 0.998;
          particle.y = h / 2 + Math.sin(particle.angle) * radius * 0.998;
          
          if (radius < 30 || radius > Math.max(w, h) * 0.8) {
            const newAngle = Math.random() * Math.PI * 2;
            const newRadius = 100 + Math.random() * 300;
            particle.x = w / 2 + Math.cos(newAngle) * newRadius;
            particle.y = h / 2 + Math.sin(newAngle) * newRadius;
            particle.angle = newAngle;
          }
        }
        break;

      case 'tornado':
        if (particle.angle !== undefined) {
          particle.angle += (particle.rotationSpeed || 0.03) * dt;
          particle.y -= particle.speed * dt;
          const tornadoCenterX = w * 0.7;
          const distFromBottom = h - particle.y;
          const radius = Math.max(10, 80 - distFromBottom * 0.1);
          particle.x = tornadoCenterX + Math.cos(particle.angle) * radius;
          
          if (particle.y < -50) {
            particle.y = h + 50;
            particle.angle = Math.random() * Math.PI * 2;
          }
        }
        break;
    }

    return true;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled || weather === 'clear' || prefersReducedMotion) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Determine particle count based on weather type
    const baseCounts: Record<string, number> = {
      rain: 150,
      snow: 80,
      blizzard: 200,
      sunshine: 5,
      cloudy: 8,
      bloomy: 40,
      hurricane: 100,
      tornado: 60,
    };

    const count = getParticleCount(baseCounts[weather] || 50);
    particlesRef.current = Array.from({ length: count }, () => 
      createParticle(canvas, weather)
    );

    const seasonTint = getSeasonTint(season);
    lastTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Clear with slight fade for trails (only for some effects)
      if (weather === 'hurricane' || weather === 'tornado') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }

      // Draw season tint overlay
      if (seasonTint.a > 0) {
        ctx.fillStyle = `rgba(${seasonTint.r}, ${seasonTint.g}, ${seasonTint.b}, ${seasonTint.a * intensity})`;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      }

      // Update and draw particles
      particlesRef.current.forEach(particle => {
        updateParticle(particle, canvas, weather, deltaTime);
        drawParticle(ctx, particle, weather);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [weather, season, intensity, enabled, prefersReducedMotion, getParticleCount, createParticle, updateParticle, drawParticle, getSeasonTint]);

  if (!enabled || weather === 'clear' || prefersReducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ 
        zIndex: 1,
        mixBlendMode: 'screen',
      }}
      aria-hidden="true"
    />
  );
};
