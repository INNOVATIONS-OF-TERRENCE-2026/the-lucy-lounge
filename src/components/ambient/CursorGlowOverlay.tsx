import { useEffect, useRef, useState } from 'react';
import { useFocusMode } from '@/hooks/useFocusMode';

interface CursorGlowOverlayProps {
  enabled?: boolean;
}

export const CursorGlowOverlay = ({ enabled = true }: CursorGlowOverlayProps) => {
  const { focusMode } = useFocusMode();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: -100, y: -100 });
  const smoothMouseRef = useRef({ x: -100, y: -100 });
  const [themeColor, setThemeColor] = useState('hsl(262, 83%, 58%)');

  // Get theme color from CSS variables
  useEffect(() => {
    const updateThemeColor = () => {
      const root = document.documentElement;
      const primaryHsl = getComputedStyle(root).getPropertyValue('--primary').trim();
      if (primaryHsl) {
        setThemeColor(`hsl(${primaryHsl})`);
      }
    };

    updateThemeColor();

    // Watch for theme changes
    const observer = new MutationObserver(updateThemeColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!enabled || focusMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Track mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      // Smooth lerp towards mouse position
      const lerp = 0.15;
      smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * lerp;
      smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * lerp;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw glow
      const { x, y } = smoothMouseRef.current;
      if (x > 0 && y > 0) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 80);
        
        // Parse the theme color and create gradient
        gradient.addColorStop(0, themeColor.replace(')', ', 0.2)').replace('hsl', 'hsla'));
        gradient.addColorStop(0.5, themeColor.replace(')', ', 0.08)').replace('hsl', 'hsla'));
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 80, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, [enabled, focusMode, themeColor]);

  if (!enabled || focusMode) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[5] pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
