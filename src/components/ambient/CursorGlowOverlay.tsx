import { useEffect, useRef, useCallback } from 'react';
import { useFocusMode } from '@/hooks/useFocusMode';

interface CursorGlowOverlayProps {
  enabled?: boolean;
}

// Convert HSL string to rgba for canvas compatibility
const hslToRgba = (hslString: string, alpha: number): string => {
  // Parse HSL values from CSS variable format "277 84% 47%" or "277, 84%, 47%"
  const values = hslString.replace(/,/g, ' ').split(/\s+/).filter(Boolean);
  if (values.length < 3) return `rgba(139, 92, 246, ${alpha})`; // fallback purple
  
  const h = parseFloat(values[0]) / 360;
  const s = parseFloat(values[1]) / 100;
  const l = parseFloat(values[2]) / 100;

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
};

export const CursorGlowOverlay = ({ enabled = true }: CursorGlowOverlayProps) => {
  const { focusMode } = useFocusMode();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: -100, y: -100 });
  const smoothMouseRef = useRef({ x: -100, y: -100 });

  const getThemeColor = useCallback(() => {
    const root = document.documentElement;
    const primaryHsl = getComputedStyle(root).getPropertyValue('--primary').trim();
    return primaryHsl || '262 83% 58%';
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
        const primaryHsl = getThemeColor();
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 80);
        
        // Use proper rgba format for canvas
        gradient.addColorStop(0, hslToRgba(primaryHsl, 0.2));
        gradient.addColorStop(0.5, hslToRgba(primaryHsl, 0.08));
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

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
  }, [enabled, focusMode, getThemeColor]);

  if (!enabled || focusMode) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[5] pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
