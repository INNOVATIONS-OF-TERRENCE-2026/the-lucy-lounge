// src/components/background/ChatActivityOverlay.tsx

import { useEffect, useRef } from "react";

interface ChatActivityOverlayProps {
  isTyping: boolean;
  hasNewMessage: boolean;
  intensity: number; // expected 0 → 1.5 (soft clamped internally)
}

type Ripple = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  velocity: number;
};

export const ChatActivityOverlay = ({
  isTyping,
  hasNewMessage,
  intensity,
}: ChatActivityOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    /* ======================= */
    /*  ENVIRONMENT SAFETY     */
    /* ======================= */

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    /* ======================= */
    /*  STATEFUL SYSTEMS       */
    /* ======================= */

    let glow = 0;
    let ambientPhase = Math.random() * Math.PI * 2;
    let ripples: Ripple[] = [];

    const MAX_INTENSITY = Math.min(Math.max(intensity, 0), 1.5);

    /* ======================= */
    /*  RENDER LOOP            */
    /* ======================= */

    const render = (time: number) => {
      const delta = Math.min((time - lastTimeRef.current) / 1000, 0.033);
      lastTimeRef.current = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* ---------- Ambient Neural Drift ---------- */
      if (!prefersReducedMotion) {
        ambientPhase += delta * 0.15;
        const driftOpacity = 0.04 * MAX_INTENSITY;

        const driftGradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          canvas.height * 0.9
        );

        driftGradient.addColorStop(
          0,
          `rgba(168, 85, 247, ${Math.abs(Math.sin(ambientPhase)) * driftOpacity})`
        );
        driftGradient.addColorStop(1, "rgba(168, 85, 247, 0)");

        ctx.fillStyle = driftGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      /* ---------- Typing Cognitive Glow ---------- */
      if (isTyping && !prefersReducedMotion) {
        glow = Math.min(glow + delta * 1.2, MAX_INTENSITY);
      } else {
        glow = Math.max(glow - delta * 1.4, 0);
      }

      if (glow > 0.001) {
        const glowGradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height,
          0,
          canvas.width / 2,
          canvas.height,
          canvas.height * 0.6
        );

        glowGradient.addColorStop(
          0,
          `rgba(139, 92, 246, ${glow * 0.18})`
        );
        glowGradient.addColorStop(1, "rgba(139, 92, 246, 0)");

        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      /* ---------- Message Arrival Ripples ---------- */
      if (hasNewMessage && ripples.length === 0 && !prefersReducedMotion) {
        ripples.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          radius: 0,
          opacity: 0.45 * MAX_INTENSITY,
          velocity: 220,
        });
      }

      ripples = ripples.filter((ripple) => {
        ripple.radius += ripple.velocity * delta;
        ripple.opacity -= delta * 0.35;

        if (ripple.opacity > 0) {
          ctx.strokeStyle = `rgba(168, 85, 247, ${ripple.opacity})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(
            ripple.x,
            ripple.y,
            ripple.radius,
            0,
            Math.PI * 2
          );
          ctx.stroke();
          return true;
        }
        return false;
      });

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);

    /* ======================= */
    /*  CLEANUP                */
    /* ======================= */

    return () => {
      window.removeEventListener("resize", resize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isTyping, hasNewMessage, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[3]"
      style={{ mixBlendMode: "screen" }}
    />
  );
};
