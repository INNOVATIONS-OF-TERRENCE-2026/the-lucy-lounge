import { useEffect, useRef } from 'react';

interface ChatActivityOverlayProps {
  isTyping: boolean;
  hasNewMessage: boolean;
  intensity: number;
}

export const ChatActivityOverlay = ({ isTyping, hasNewMessage, intensity }: ChatActivityOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let glowIntensity = 0;
    let ripples: Array<{ x: number; y: number; radius: number; opacity: number }> = [];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Typing glow effect
      if (isTyping) {
        glowIntensity = Math.min(glowIntensity + 0.02, intensity);
        
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height,
          0,
          canvas.width / 2,
          canvas.height,
          canvas.height * 0.5
        );
        gradient.addColorStop(0, `rgba(139, 92, 246, ${glowIntensity * 0.15})`);
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        glowIntensity = Math.max(glowIntensity - 0.02, 0);
      }

      // New message ripple effect
      if (hasNewMessage && ripples.length === 0) {
        ripples.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          radius: 0,
          opacity: 0.5,
        });
      }

      // Animate ripples
      ripples = ripples.filter((ripple) => {
        ripple.radius += 5;
        ripple.opacity -= 0.01;

        if (ripple.opacity > 0) {
          ctx.strokeStyle = `rgba(168, 85, 247, ${ripple.opacity * intensity})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
          ctx.stroke();
          return true;
        }
        return false;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isTyping, hasNewMessage, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[3]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
