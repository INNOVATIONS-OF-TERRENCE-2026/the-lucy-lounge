/**
 * THE LUCY LOUNGE - Lucy Presence System
 * 
 * Micro-interactions that make Lucy feel alive:
 * - Idle "breathing" animation
 * - Soft glow pulse when processing
 * - Cursor-aware eye-follow illusion (extremely subtle)
 * - Ambient presence synced to state
 * 
 * Rules:
 * - Never blocks interaction
 * - Never distracts from content
 * - Disabled in Silent/Presence modes
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useCinematicSafe } from '@/contexts/CinematicContext';

export type LucyState = 'idle' | 'listening' | 'processing' | 'speaking' | 'thinking';

interface LucyPresenceProps {
  state?: LucyState;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showGlow?: boolean;
  disabled?: boolean;
}

// Subtle color shifts based on state
const stateColors: Record<LucyState, string> = {
  idle: 'rgba(147, 112, 219, 0.4)',       // Soft purple
  listening: 'rgba(59, 130, 246, 0.5)',    // Blue
  processing: 'rgba(251, 191, 36, 0.5)',   // Amber
  speaking: 'rgba(34, 197, 94, 0.5)',      // Green
  thinking: 'rgba(167, 139, 250, 0.5)',    // Violet
};

const sizeMap = {
  sm: { avatar: 32, glow: 48 },
  md: { avatar: 48, glow: 72 },
  lg: { avatar: 64, glow: 96 },
};

export function LucyPresence({
  state = 'idle',
  size = 'md',
  className = '',
  showGlow = true,
  disabled = false,
}: LucyPresenceProps) {
  const cinematic = useCinematicSafe();
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Eye follow state (extremely subtle)
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  
  // Determine if presence animations should be active
  const isActive = useMemo(() => {
    if (disabled) return false;
    if (shouldReduceMotion) return false;
    if (!cinematic) return true;
    return cinematic.isEnabled && cinematic.settings.lucyPresence;
  }, [disabled, shouldReduceMotion, cinematic]);

  const intensity = cinematic?.intensity ?? 0.5;
  const dimensions = sizeMap[size];

  // Cursor tracking for subtle eye-follow effect
  useEffect(() => {
    if (!isActive || intensity < 0.3) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate offset (max 2px movement)
      const maxOffset = 2 * intensity;
      const dx = (e.clientX - centerX) / window.innerWidth;
      const dy = (e.clientY - centerY) / window.innerHeight;
      
      setEyeOffset({
        x: dx * maxOffset,
        y: dy * maxOffset,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isActive, intensity]);

  // Animation variants based on state
  const avatarVariants = useMemo(() => ({
    idle: {
      scale: [1, 1.02, 1],
      filter: ['brightness(1)', 'brightness(1.05)', 'brightness(1)'],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
    listening: {
      scale: [1, 1.03, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
    processing: {
      scale: [1, 1.05, 1],
      boxShadow: [
        `0 0 20px ${stateColors.processing}`,
        `0 0 40px ${stateColors.processing}`,
        `0 0 20px ${stateColors.processing}`,
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
    speaking: {
      scale: [1, 1.02, 0.98, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
    thinking: {
      rotate: [0, 2, -2, 0],
      scale: [1, 1.01, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  }), []);

  const glowVariants = useMemo(() => ({
    idle: {
      opacity: [0.3, 0.5, 0.3],
      scale: [1, 1.1, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
    processing: {
      opacity: [0.5, 0.8, 0.5],
      scale: [1, 1.2, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
    speaking: {
      opacity: [0.4, 0.6, 0.4],
      scale: [1, 1.15, 1],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
    listening: {
      opacity: [0.4, 0.6, 0.4],
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
    thinking: {
      opacity: [0.3, 0.5, 0.3],
      scale: [1, 1.05, 1],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  }), []);

  if (!isActive) {
    // Return static version
    return (
      <div 
        className={`lucy-presence-static relative inline-flex items-center justify-center ${className}`}
        style={{ width: dimensions.avatar, height: dimensions.avatar }}
      >
        <div 
          className="rounded-full bg-gradient-to-br from-purple-500 to-indigo-600"
          style={{ width: dimensions.avatar, height: dimensions.avatar }}
        />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`lucy-presence relative inline-flex items-center justify-center ${className}`}
      style={{ width: dimensions.glow, height: dimensions.glow }}
    >
      {/* Ambient glow ring */}
      {showGlow && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${stateColors[state]} 0%, transparent 70%)`,
          }}
          variants={glowVariants}
          animate={state}
          initial="idle"
        />
      )}

      {/* Main avatar with breathing */}
      <motion.div
        className="relative rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center overflow-hidden"
        style={{ 
          width: dimensions.avatar, 
          height: dimensions.avatar,
          transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
        }}
        variants={avatarVariants}
        animate={state}
        initial="idle"
      >
        {/* Inner highlight for depth */}
        <div 
          className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 to-transparent"
          style={{
            transform: `translate(${-eyeOffset.x * 0.5}px, ${-eyeOffset.y * 0.5}px)`,
          }}
        />
        
        {/* Lucy "eye" indicator */}
        <motion.div
          className="w-1/3 h-1/3 rounded-full bg-white/80"
          style={{
            transform: `translate(${eyeOffset.x * 1.5}px, ${eyeOffset.y * 1.5}px)`,
          }}
          animate={{
            scale: state === 'processing' ? [1, 0.8, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: state === 'processing' ? Infinity : 0,
          }}
        />
      </motion.div>

      {/* State indicator ring */}
      <AnimatePresence>
        {state !== 'idle' && (
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: stateColors[state] }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0.5, 1, 0.5], 
              scale: [1, 1.1, 1],
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Hook to track Lucy's state based on chat activity
 */
export function useLucyPresenceState() {
  const [state, setState] = useState<LucyState>('idle');
  const timeoutRef = useRef<NodeJS.Timeout>();

  const setTemporaryState = useCallback((newState: LucyState, duration: number = 3000) => {
    setState(newState);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setState('idle');
    }, duration);
  }, []);

  const setProcessing = useCallback(() => setTemporaryState('processing', 30000), [setTemporaryState]);
  const setSpeaking = useCallback(() => setTemporaryState('speaking', 5000), [setTemporaryState]);
  const setListening = useCallback(() => setTemporaryState('listening', 3000), [setTemporaryState]);
  const setThinking = useCallback(() => setTemporaryState('thinking', 10000), [setTemporaryState]);
  const setIdle = useCallback(() => setState('idle'), []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    setState,
    setProcessing,
    setSpeaking,
    setListening,
    setThinking,
    setIdle,
  };
}

export default LucyPresence;
