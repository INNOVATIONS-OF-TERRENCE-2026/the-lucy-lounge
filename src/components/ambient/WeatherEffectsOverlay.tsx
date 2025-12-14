import { useEffect, useRef, useCallback, useMemo } from 'react';
import { WeatherMode, SeasonMode } from '@/hooks/useWeatherAmbient';

interface WeatherEffectsOverlayProps {
  weather: WeatherMode;
  season: SeasonMode;
  intensity: number;
  enabled: boolean;
}

interface Raindrop {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  layer: 'front' | 'back';
}

interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  layer: 'front' | 'back';
  wobblePhase: number;
}

interface CloudPuff {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

interface BloomParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface SunRay {
  x: number;
  y: number;
  size: number;
  opacity: number;
  angle: number;
}

interface WindParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  angle: number;
  rotationSpeed: number;
}

export const WeatherEffectsOverlay = ({ 
  weather, 
  season, 
  intensity, 
  enabled 
}: WeatherEffectsOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raindropsRef = useRef<Raindrop[]>([]);
  const snowflakesRef = useRef<Snowflake[]>([]);
  const cloudsRef = useRef<CloudPuff[]>([]);
  const bloomRef = useRef<BloomParticle[]>([]);
  const sunRaysRef = useRef<SunRay[]>([]);
  const windRef = useRef<WindParticle[]>([]);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Season tint colors (very subtle)
  const getSeasonTint = useCallback((season: SeasonMode): { r: number; g: number; b: number; a: number } => {
    switch (season) {
      case 'spring': return { r: 180, g: 230, b: 180, a: 0.02 };
      case 'summer': return { r: 255, g: 240, b: 200, a: 0.025 };
      case 'fall': return { r: 220, g: 170, b: 100, a: 0.025 };
      case 'winter': return { r: 200, g: 220, b: 255, a: 0.02 };
      default: return { r: 0, g: 0, b: 0, a: 0 };
    }
  }, []);

  // Create realistic raindrop
  const createRaindrop = useCallback((width: number, height: number): Raindrop => {
    const layer = Math.random() > 0.3 ? 'front' : 'back';
    const layerMultiplier = layer === 'front' ? 1 : 0.6;
    return {
      x: Math.random() * width,
      y: Math.random() * height * 0.2 - height * 0.2,
      size: (2 + Math.random() * 2) * layerMultiplier,
      speed: (3 + Math.random() * 2) * (0.6 + intensity * 0.4) * layerMultiplier,
      opacity: (0.4 + Math.random() * 0.3) * layerMultiplier,
      layer,
    };
  }, [intensity]);

  // Create realistic snowflake
  const createSnowflake = useCallback((width: number, height: number, isBlizzard: boolean): Snowflake => {
    const layer = Math.random() > 0.4 ? 'front' : 'back';
    const layerMultiplier = layer === 'front' ? 1 : 0.5;
    const blizzardMultiplier = isBlizzard ? 1.5 : 1;
    return {
      x: Math.random() * width,
      y: Math.random() * height * 0.1 - height * 0.1,
      size: (3 + Math.random() * 4) * layerMultiplier,
      speed: (0.4 + Math.random() * 0.6) * (0.5 + intensity * 0.3) * layerMultiplier,
      drift: (Math.random() - 0.5) * blizzardMultiplier * intensity * 2,
      opacity: (0.5 + Math.random() * 0.4) * layerMultiplier,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      layer,
      wobblePhase: Math.random() * Math.PI * 2,
    };
  }, [intensity]);

  // Create soft cloud puff
  const createCloud = useCallback((width: number, height: number): CloudPuff => {
    return {
      x: -200 + Math.random() * (width + 400),
      y: Math.random() * height * 0.4,
      size: 150 + Math.random() * 200,
      speed: 0.05 + Math.random() * 0.1,
      opacity: 0.04 + Math.random() * 0.04,
    };
  }, []);

  // Create bloom particle (pollen/bokeh)
  const createBloomParticle = useCallback((width: number, height: number): BloomParticle => {
    return {
      x: Math.random() * width,
      y: height + Math.random() * 50,
      size: 8 + Math.random() * 15,
      speed: 0.2 + Math.random() * 0.3,
      opacity: 0.1 + Math.random() * 0.15,
      life: 0,
      maxLife: 300 + Math.random() * 200,
    };
  }, []);

  // Create sun ray
  const createSunRay = useCallback((width: number, height: number): SunRay => {
    return {
      x: width * 0.8 + Math.random() * width * 0.2,
      y: Math.random() * height * 0.3,
      size: 100 + Math.random() * 150,
      opacity: 0.02 + Math.random() * 0.02,
      angle: Math.random() * 0.3,
    };
  }, []);

  // Create wind particle (for hurricane/tornado)
  const createWindParticle = useCallback((width: number, height: number, type: string): WindParticle => {
    const centerX = type === 'tornado' ? width * 0.7 : width * 0.5;
    const centerY = type === 'tornado' ? height : height * 0.5;
    const angle = Math.random() * Math.PI * 2;
    const radius = 50 + Math.random() * 300;
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      size: 1 + Math.random() * 2,
      speed: 2 + Math.random() * 2,
      opacity: 0.2 + Math.random() * 0.3,
      angle,
      rotationSpeed: (type === 'tornado' ? 0.03 : 0.01) + Math.random() * 0.01,
    };
  }, []);

  // Draw teardrop-shaped raindrop
  const drawRaindrop = useCallback((ctx: CanvasRenderingContext2D, drop: Raindrop) => {
    ctx.save();
    ctx.translate(drop.x, drop.y);
    
    const gradient = ctx.createLinearGradient(0, -drop.size, 0, drop.size * 2);
    gradient.addColorStop(0, `rgba(180, 210, 240, ${drop.opacity * intensity * 0.3})`);
    gradient.addColorStop(0.5, `rgba(200, 220, 250, ${drop.opacity * intensity})`);
    gradient.addColorStop(1, `rgba(180, 210, 240, ${drop.opacity * intensity * 0.2})`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    // Teardrop shape
    ctx.moveTo(0, -drop.size);
    ctx.bezierCurveTo(
      drop.size * 0.8, -drop.size * 0.3,
      drop.size * 0.8, drop.size * 1.2,
      0, drop.size * 2
    );
    ctx.bezierCurveTo(
      -drop.size * 0.8, drop.size * 1.2,
      -drop.size * 0.8, -drop.size * 0.3,
      0, -drop.size
    );
    ctx.fill();
    ctx.restore();
  }, [intensity]);

  // Draw snowflake with 6-point star shape
  const drawSnowflake = useCallback((ctx: CanvasRenderingContext2D, flake: Snowflake) => {
    ctx.save();
    ctx.translate(flake.x, flake.y);
    ctx.rotate(flake.rotation);
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, flake.size);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${flake.opacity * intensity})`);
    gradient.addColorStop(0.4, `rgba(240, 248, 255, ${flake.opacity * intensity * 0.7})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    
    // Draw 6-pointed snowflake
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const armLength = flake.size;
      const armWidth = flake.size * 0.15;
      
      ctx.moveTo(0, 0);
      ctx.lineTo(
        Math.cos(angle - 0.1) * armWidth,
        Math.sin(angle - 0.1) * armWidth
      );
      ctx.lineTo(
        Math.cos(angle) * armLength,
        Math.sin(angle) * armLength
      );
      ctx.lineTo(
        Math.cos(angle + 0.1) * armWidth,
        Math.sin(angle + 0.1) * armWidth
      );
    }
    ctx.closePath();
    ctx.fill();
    
    // Add central glow
    ctx.beginPath();
    ctx.arc(0, 0, flake.size * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity * intensity * 0.5})`;
    ctx.fill();
    
    ctx.restore();
  }, [intensity]);

  // Draw soft cloud
  const drawCloud = useCallback((ctx: CanvasRenderingContext2D, cloud: CloudPuff) => {
    const gradient = ctx.createRadialGradient(
      cloud.x, cloud.y, 0,
      cloud.x, cloud.y, cloud.size
    );
    gradient.addColorStop(0, `rgba(180, 185, 195, ${cloud.opacity * intensity})`);
    gradient.addColorStop(0.3, `rgba(170, 175, 185, ${cloud.opacity * intensity * 0.6})`);
    gradient.addColorStop(0.7, `rgba(160, 165, 175, ${cloud.opacity * intensity * 0.3})`);
    gradient.addColorStop(1, 'rgba(150, 155, 165, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(cloud.x, cloud.y, cloud.size, cloud.size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Add secondary puffs for more realistic cloud shape
    const puffOffsets = [
      { x: -cloud.size * 0.4, y: -cloud.size * 0.1, scale: 0.6 },
      { x: cloud.size * 0.3, y: cloud.size * 0.05, scale: 0.5 },
      { x: -cloud.size * 0.2, y: cloud.size * 0.15, scale: 0.4 },
    ];
    
    puffOffsets.forEach(puff => {
      const puffGradient = ctx.createRadialGradient(
        cloud.x + puff.x, cloud.y + puff.y, 0,
        cloud.x + puff.x, cloud.y + puff.y, cloud.size * puff.scale
      );
      puffGradient.addColorStop(0, `rgba(175, 180, 190, ${cloud.opacity * intensity * 0.7})`);
      puffGradient.addColorStop(1, 'rgba(165, 170, 180, 0)');
      ctx.fillStyle = puffGradient;
      ctx.beginPath();
      ctx.ellipse(
        cloud.x + puff.x, cloud.y + puff.y,
        cloud.size * puff.scale, cloud.size * puff.scale * 0.5,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    });
  }, [intensity]);

  // Draw bloom particle (soft bokeh)
  const drawBloomParticle = useCallback((ctx: CanvasRenderingContext2D, particle: BloomParticle) => {
    const lifeRatio = Math.sin((particle.life / particle.maxLife) * Math.PI);
    const gradient = ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, particle.size
    );
    gradient.addColorStop(0, `rgba(255, 245, 220, ${particle.opacity * lifeRatio * intensity})`);
    gradient.addColorStop(0.5, `rgba(255, 235, 200, ${particle.opacity * lifeRatio * intensity * 0.4})`);
    gradient.addColorStop(1, 'rgba(255, 230, 180, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }, [intensity]);

  // Draw sun ray
  const drawSunRay = useCallback((ctx: CanvasRenderingContext2D, ray: SunRay) => {
    ctx.save();
    ctx.translate(ray.x, ray.y);
    ctx.rotate(ray.angle);
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, ray.size);
    gradient.addColorStop(0, `rgba(255, 250, 230, ${ray.opacity * intensity})`);
    gradient.addColorStop(0.4, `rgba(255, 245, 210, ${ray.opacity * intensity * 0.5})`);
    gradient.addColorStop(1, 'rgba(255, 240, 200, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, ray.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, [intensity]);

  // Draw wind particle
  const drawWindParticle = useCallback((ctx: CanvasRenderingContext2D, particle: WindParticle) => {
    ctx.fillStyle = `rgba(180, 190, 210, ${particle.opacity * intensity})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled || weather === 'clear' || prefersReducedMotion) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    
    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Initialize particles based on weather type
    const rainCount = Math.floor(120 * intensity);
    const snowCount = Math.floor(80 * intensity);
    const cloudCount = Math.floor(8 + 4 * intensity);
    const bloomCount = Math.floor(40 * intensity);
    const sunRayCount = 5;
    const windCount = Math.floor(100 * intensity);

    // Clear all particle arrays
    raindropsRef.current = [];
    snowflakesRef.current = [];
    cloudsRef.current = [];
    bloomRef.current = [];
    sunRaysRef.current = [];
    windRef.current = [];

    switch (weather) {
      case 'rain':
        raindropsRef.current = Array.from({ length: rainCount }, () => createRaindrop(width, height));
        cloudsRef.current = Array.from({ length: cloudCount }, () => createCloud(width, height));
        break;
      case 'snow':
        snowflakesRef.current = Array.from({ length: snowCount }, () => createSnowflake(width, height, false));
        break;
      case 'blizzard':
        snowflakesRef.current = Array.from({ length: snowCount * 2 }, () => createSnowflake(width, height, true));
        cloudsRef.current = Array.from({ length: cloudCount }, () => createCloud(width, height));
        break;
      case 'sunshine':
        sunRaysRef.current = Array.from({ length: sunRayCount }, () => createSunRay(width, height));
        break;
      case 'cloudy':
        cloudsRef.current = Array.from({ length: cloudCount * 2 }, () => createCloud(width, height));
        break;
      case 'bloomy':
        bloomRef.current = Array.from({ length: bloomCount }, () => createBloomParticle(width, height));
        sunRaysRef.current = Array.from({ length: 3 }, () => createSunRay(width, height));
        break;
      case 'hurricane':
      case 'tornado':
        windRef.current = Array.from({ length: windCount }, () => createWindParticle(width, height, weather));
        cloudsRef.current = Array.from({ length: cloudCount }, () => createCloud(width, height));
        break;
    }

    const seasonTint = getSeasonTint(season);
    lastTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = Math.min(currentTime - lastTimeRef.current, 32);
      lastTimeRef.current = currentTime;
      const dt = deltaTime / 16.67;

      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      // Draw season tint
      if (seasonTint.a > 0) {
        ctx.fillStyle = `rgba(${seasonTint.r}, ${seasonTint.g}, ${seasonTint.b}, ${seasonTint.a * intensity})`;
        ctx.fillRect(0, 0, w, h);
      }

      // Draw clouds (background layer)
      cloudsRef.current.forEach(cloud => {
        cloud.x += cloud.speed * dt * intensity;
        if (cloud.x > w + cloud.size) cloud.x = -cloud.size;
        drawCloud(ctx, cloud);
      });

      // Draw sun rays
      sunRaysRef.current.forEach(ray => {
        ray.opacity = 0.02 + Math.sin(currentTime * 0.0003 + ray.x * 0.01) * 0.015;
        drawSunRay(ctx, ray);
      });

      // Draw back layer particles first
      raindropsRef.current
        .filter(d => d.layer === 'back')
        .forEach(drop => {
          drop.y += drop.speed * dt;
          drop.x += (Math.random() - 0.5) * 0.3;
          if (drop.y > h + 20) {
            drop.y = -20;
            drop.x = Math.random() * w;
          }
          drawRaindrop(ctx, drop);
        });

      snowflakesRef.current
        .filter(f => f.layer === 'back')
        .forEach(flake => {
          flake.y += flake.speed * dt;
          flake.x += flake.drift * dt + Math.sin(currentTime * 0.001 + flake.wobblePhase) * 0.3;
          flake.rotation += flake.rotationSpeed * dt;
          if (flake.y > h + 20) {
            flake.y = -20;
            flake.x = Math.random() * w;
          }
          if (flake.x < -20) flake.x = w + 20;
          if (flake.x > w + 20) flake.x = -20;
          drawSnowflake(ctx, flake);
        });

      // Draw front layer particles
      raindropsRef.current
        .filter(d => d.layer === 'front')
        .forEach(drop => {
          drop.y += drop.speed * dt;
          drop.x += (Math.random() - 0.5) * 0.2;
          if (drop.y > h + 20) {
            drop.y = -20;
            drop.x = Math.random() * w;
          }
          drawRaindrop(ctx, drop);
        });

      snowflakesRef.current
        .filter(f => f.layer === 'front')
        .forEach(flake => {
          flake.y += flake.speed * dt;
          flake.x += flake.drift * dt + Math.sin(currentTime * 0.001 + flake.wobblePhase) * 0.5;
          flake.rotation += flake.rotationSpeed * dt;
          if (flake.y > h + 20) {
            flake.y = -20;
            flake.x = Math.random() * w;
          }
          if (flake.x < -20) flake.x = w + 20;
          if (flake.x > w + 20) flake.x = -20;
          drawSnowflake(ctx, flake);
        });

      // Draw bloom particles
      bloomRef.current.forEach(particle => {
        particle.y -= particle.speed * dt;
        particle.x += Math.sin(currentTime * 0.0005 + particle.x * 0.01) * 0.2;
        particle.life += dt;
        if (particle.life >= particle.maxLife) {
          particle.life = 0;
          particle.y = h + 20;
          particle.x = Math.random() * w;
        }
        drawBloomParticle(ctx, particle);
      });

      // Draw wind particles (hurricane/tornado)
      const centerX = weather === 'tornado' ? w * 0.7 : w * 0.5;
      const centerY = weather === 'tornado' ? h : h * 0.5;
      windRef.current.forEach(particle => {
        particle.angle += particle.rotationSpeed * dt * intensity;
        const radius = Math.sqrt(
          Math.pow(particle.x - centerX, 2) + Math.pow(particle.y - centerY, 2)
        );
        
        if (weather === 'tornado') {
          particle.y -= particle.speed * dt;
          const shrinkFactor = Math.max(0.3, 1 - (h - particle.y) / h);
          particle.x = centerX + Math.cos(particle.angle) * radius * shrinkFactor;
          if (particle.y < -50) {
            particle.y = h + 50;
            particle.angle = Math.random() * Math.PI * 2;
          }
        } else {
          particle.x = centerX + Math.cos(particle.angle) * radius * 0.998;
          particle.y = centerY + Math.sin(particle.angle) * radius * 0.998;
          if (radius < 30 || radius > Math.max(w, h) * 0.7) {
            const newAngle = Math.random() * Math.PI * 2;
            const newRadius = 80 + Math.random() * 250;
            particle.x = centerX + Math.cos(newAngle) * newRadius;
            particle.y = centerY + Math.sin(newAngle) * newRadius;
            particle.angle = newAngle;
          }
        }
        drawWindParticle(ctx, particle);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [weather, season, intensity, enabled, prefersReducedMotion, getSeasonTint,
      createRaindrop, createSnowflake, createCloud, createBloomParticle, createSunRay, createWindParticle,
      drawRaindrop, drawSnowflake, drawCloud, drawBloomParticle, drawSunRay, drawWindParticle]);

  if (!enabled || weather === 'clear' || prefersReducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 5 }}
      aria-hidden="true"
    />
  );
};
