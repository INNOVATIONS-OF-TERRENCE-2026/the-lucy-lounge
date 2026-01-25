/**
 * THE LUCY LOUNGE - Enhanced Cinematic Wrapper
 * 
 * Global cinematic foundation providing:
 * - Ambient gradient lighting (GPU-safe)
 * - Film grain / noise overlay
 * - Soft parallax bloom
 * - Motion smoothing via Framer Motion
 * 
 * Auto-disables on:
 * - Low-power devices
 * - prefers-reduced-motion
 * - User preference
 */

import React, { useMemo, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCinematicSafe } from '@/contexts/CinematicContext';
import './cinematic.css';

interface CinematicWrapperProps {
  children: React.ReactNode;
  loungeType?: 'neural' | 'dream' | 'vision' | 'silent' | 'timeline' | 'command' | 'quantum' | 'presence' | 'events' | 'listening' | 'default';
  particleCount?: number;
  className?: string;
  disableEffects?: boolean;
}

export const CinematicWrapper: React.FC<CinematicWrapperProps> = ({
  children,
  loungeType = 'default',
  particleCount = 12,
  className = '',
  disableEffects = false,
}) => {
  const cinematic = useCinematicSafe();
  const shouldReduceMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Delay effects until after TTI for performance
  useEffect(() => {
    const timer = requestIdleCallback?.(() => setMounted(true)) ?? 
                  setTimeout(() => setMounted(true), 100);
    return () => {
      if (typeof timer === 'number') clearTimeout(timer);
    };
  }, []);

  // Compute effective settings
  const effectsEnabled = useMemo(() => {
    if (disableEffects) return false;
    if (shouldReduceMotion) return false;
    if (!cinematic) return true; // Default to enabled if no context
    return cinematic.isEnabled;
  }, [disableEffects, shouldReduceMotion, cinematic]);

  const intensity = cinematic?.intensity ?? 0.5;
  const showFilmGrain = cinematic?.settings.filmGrain ?? true;
  const showParticles = cinematic?.settings.particleEffects ?? true;
  const showGlow = cinematic?.settings.ambientGlow ?? true;

  // Generate particles with deterministic positions
  const particles = useMemo(() => {
    if (!effectsEnabled || !showParticles || !mounted) return [];
    const count = Math.floor(particleCount * intensity);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${(i * 37 + 13) % 100}%`,
      top: `${(i * 53 + 7) % 100}%`,
      delay: (i * 0.7) % 5,
      size: 2 + ((i * 3) % 4),
      duration: 8 + ((i * 2) % 6),
    }));
  }, [particleCount, effectsEnabled, showParticles, mounted, intensity]);

  // Parallax effect on mouse move (very subtle)
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    if (!effectsEnabled || !mounted || intensity < 0.3) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10 * intensity;
      const y = (e.clientY / window.innerHeight - 0.5) * 10 * intensity;
      setParallax({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [effectsEnabled, mounted, intensity]);

  const loungeClass = loungeType !== 'default' ? `lounge-${loungeType}` : '';

  return (
    <motion.div
      ref={wrapperRef}
      className={`cinematic-wrapper ${loungeClass} relative min-h-screen ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: effectsEnabled ? 0.5 : 0.1 }}
    >
      {/* Ambient background gradient */}
      {effectsEnabled && mounted && showGlow && (
        <motion.div
          className="cinematic-ambient-bg fixed inset-0 -z-10"
          style={{
            background: loungeType !== 'default'
              ? `linear-gradient(135deg, hsl(var(--lounge-secondary)) 0%, hsl(var(--background)) 50%, hsl(var(--lounge-secondary) / 0.5) 100%)`
              : `radial-gradient(ellipse at 50% 50%, hsl(var(--primary) / 0.05) 0%, transparent 70%)`,
          }}
          animate={{
            x: parallax.x,
            y: parallax.y,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 30 }}
        />
      )}

      {/* Cinematic glow overlay */}
      {effectsEnabled && mounted && showGlow && (
        <div 
          className="cinematic-glow fixed inset-0 -z-5 pointer-events-none"
          style={{ 
            opacity: 0.3 * intensity,
            animationDuration: `${6 / intensity}s`,
          }}
        />
      )}

      {/* Film grain overlay */}
      {effectsEnabled && mounted && showFilmGrain && (
        <div 
          className="cinematic-film-grain fixed inset-0 -z-4 pointer-events-none"
          style={{ opacity: 0.03 * intensity }}
        />
      )}

      {/* Floating particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="cinematic-particle"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.6, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Main content with subtle entrance */}
      <motion.div
        className="relative z-10"
        initial={effectsEnabled ? { y: 20, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: effectsEnabled ? 0.6 : 0.1, 
          delay: effectsEnabled ? 0.1 : 0,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default CinematicWrapper;
