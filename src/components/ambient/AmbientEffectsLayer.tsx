import { useEffect, useRef, useCallback } from 'react';
import { WeatherMode, SeasonMode } from '@/hooks/useWeatherAmbient';

interface AmbientEffectsLayerProps {
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
  rotation?: number;
  rotationSpeed?: number;
}

export const AmbientEffectsLayer = ({ 
  weather, 
  season, 
  intensity, 
  enabled 
}: AmbientEffectsLayerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const getParticleConfig = useCallback(() => {
    const baseCount = Math.floor(80 * intensity);
    
    switch (weather) {
      case 'rain':
        return { count: baseCount * 2, type: 'rain' as const };
      case 'snow':
        return { count: baseCount, type: 'snow' as const };
      case 'blizzard':
        return { count: baseCount * 3, type: 'blizzard' as const };
      case 'sunshine':
        return { count: Math.floor(baseCount * 0.3), type: 'sunshine' as const };
      case 'cloudy':
        return { count: Math.floor(baseCount * 0.2), type: 'cloudy' as const };
      case 'bloomy':
        return { count: Math.floor(baseCount * 0.5), type: 'bloomy' as const };
      case 'hurricane':
        return { count: baseCount * 1.5, type: 'hurricane' as const };
      case 'tornado':
        return { count: Math.floor(baseCount * 0.8), type: 'tornado' as const };
      default:
        return { count: 0, type: 'clear' as const };
    }
  }, [weather, intensity]);

  const createParticle = useCallback((canvas: HTMLCanvasElement, type: string): Particle => {
    const baseParticle = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      opacity: Math.random() * 0.5 + 0.3,
    };

    switch (type) {
      case 'rain':
        return {
          ...baseParticle,
          size: Math.random() * 2 + 1,
          speed: Math.random() * 4 + 6,
          drift: (Math.random() - 0.5) * 0.5,
        };
      case 'snow':
      case 'blizzard':
        return {
          ...baseParticle,
          size: Math.random() * 4 + 2,
          speed: Math.random() * 1.5 + 0.5,
          drift: (Math.random() - 0.5) * (type === 'blizzard' ? 3 : 1),
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
        };
      case 'sunshine':
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 100 + 50,
          speed: 0,
          drift: 0,
          opacity: Math.random() * 0.1 + 0.05,
        };
      case 'cloudy':
        return {
          x: Math.random() * canvas.width * 1.5 - canvas.width * 0.25,
          y: Math.random() * canvas.height * 0.4,
          size: Math.random() * 200 + 100,
          speed: Math.random() * 0.3 + 0.1,
          drift: 0,
          opacity: Math.random() * 0.15 + 0.05,
        };
      case 'bloomy':
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 150 + 50,
          speed: Math.random() * 0.2,
          drift: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.08 + 0.02,
        };
      case 'hurricane':
        return {
          ...baseParticle,
          size: Math.random() * 3 + 1,
          speed: Math.random() * 3 + 2,
          drift: Math.random() * 4 - 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.05,
        };
      case 'tornado':
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 100 + 50;
        return {
          x: canvas.width / 2 + Math.cos(angle) * radius,
          y: canvas.height + Math.random() * 100,
          size: Math.random() * 3 + 1,
          speed: Math.random() * 2 + 1,
          drift: 0,
          opacity: Math.random() * 0.4 + 0.2,
          rotation: angle,
          rotationSpeed: 0.02 + Math.random() * 0.02,
        };
      default:
        return baseParticle as Particle;
    }
  }, []);

  const drawParticle = useCallback((
    ctx: CanvasRenderingContext2D, 
    particle: Particle, 
    type: string,
    seasonColor: string
  ) => {
    ctx.save();
    ctx.globalAlpha = particle.opacity * intensity;

    switch (type) {
      case 'rain':
        ctx.strokeStyle = seasonColor;
        ctx.lineWidth = particle.size * 0.5;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x + particle.drift * 2, particle.y + particle.size * 8);
        ctx.stroke();
        break;

      case 'snow':
      case 'blizzard':
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        // Soft glow
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = particle.size * 2;
        ctx.fill();
        break;

      case 'sunshine':
        const sunGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        );
        sunGradient.addColorStop(0, `rgba(255, 244, 214, ${particle.opacity})`);
        sunGradient.addColorStop(1, 'rgba(255, 244, 214, 0)');
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
        cloudGradient.addColorStop(0, `rgba(180, 180, 190, ${particle.opacity})`);
        cloudGradient.addColorStop(0.5, `rgba(160, 160, 170, ${particle.opacity * 0.5})`);
        cloudGradient.addColorStop(1, 'rgba(150, 150, 160, 0)');
        ctx.fillStyle = cloudGradient;
        ctx.beginPath();
        ctx.ellipse(particle.x, particle.y, particle.size, particle.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'bloomy':
        const bloomGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        );
        bloomGradient.addColorStop(0, `rgba(255, 230, 240, ${particle.opacity})`);
        bloomGradient.addColorStop(1, 'rgba(255, 200, 220, 0)');
        ctx.fillStyle = bloomGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'hurricane':
      case 'tornado':
        ctx.fillStyle = `rgba(200, 200, 210, ${particle.opacity})`;
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
    const timeScale = deltaTime / 16.67; // Normalize to 60fps

    switch (type) {
      case 'rain':
        particle.y += particle.speed * timeScale;
        particle.x += particle.drift * timeScale;
        if (particle.y > canvas.height) {
          particle.y = -10;
          particle.x = Math.random() * canvas.width;
        }
        break;

      case 'snow':
      case 'blizzard':
        particle.y += particle.speed * timeScale;
        particle.x += particle.drift * timeScale + Math.sin(particle.y * 0.01) * 0.5;
        if (particle.rotation !== undefined) {
          particle.rotation += (particle.rotationSpeed || 0) * timeScale;
        }
        if (particle.y > canvas.height) {
          particle.y = -10;
          particle.x = Math.random() * canvas.width;
        }
        break;

      case 'sunshine':
        particle.opacity = 0.05 + Math.sin(Date.now() * 0.0005 + particle.x * 0.01) * 0.03;
        break;

      case 'cloudy':
        particle.x += particle.speed * timeScale;
        if (particle.x > canvas.width + particle.size) {
          particle.x = -particle.size;
        }
        break;

      case 'bloomy':
        particle.x += particle.drift * timeScale;
        particle.y += particle.speed * timeScale;
        particle.opacity = 0.02 + Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.02;
        if (particle.y > canvas.height + particle.size) {
          particle.y = -particle.size;
        }
        break;

      case 'hurricane':
        const hAngle = Math.atan2(particle.y - canvas.height / 2, particle.x - canvas.width / 2);
        particle.x += (Math.cos(hAngle + Math.PI / 2) * 2 + particle.drift) * timeScale;
        particle.y += (Math.sin(hAngle + Math.PI / 2) * 2 + particle.speed) * timeScale;
        if (particle.y > canvas.height || particle.x < 0 || particle.x > canvas.width) {
          particle.y = -10;
          particle.x = Math.random() * canvas.width;
        }
        break;

      case 'tornado':
        if (particle.rotation !== undefined) {
          particle.rotation += (particle.rotationSpeed || 0.02) * timeScale;
          const radius = 50 + (canvas.height - particle.y) * 0.3;
          particle.x = canvas.width / 2 + Math.cos(particle.rotation) * radius;
          particle.y -= particle.speed * timeScale;
          if (particle.y < -50) {
            particle.y = canvas.height + 50;
            particle.rotation = Math.random() * Math.PI * 2;
          }
        }
        break;
    }

    return true;
  }, []);

  const getSeasonColor = useCallback((season: SeasonMode): string => {
    switch (season) {
      case 'spring':
        return 'rgba(144, 238, 144, 0.6)';
      case 'summer':
        return 'rgba(135, 206, 235, 0.6)';
      case 'fall':
        return 'rgba(210, 180, 140, 0.6)';
      case 'winter':
        return 'rgba(200, 220, 255, 0.6)';
      default:
        return 'rgba(180, 200, 220, 0.6)';
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled || weather === 'clear') {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const config = getParticleConfig();
    particlesRef.current = Array.from({ length: config.count }, () => 
      createParticle(canvas, config.type)
    );

    const seasonColor = getSeasonColor(season);

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Throttle to ~60fps max
      if (deltaTime < 16) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(particle => {
        updateParticle(particle, canvas, config.type, Math.min(deltaTime, 32));
        drawParticle(ctx, particle, config.type, seasonColor);
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
  }, [weather, season, intensity, enabled, getParticleConfig, createParticle, updateParticle, drawParticle, getSeasonColor]);

  if (!enabled || weather === 'clear') {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
};
