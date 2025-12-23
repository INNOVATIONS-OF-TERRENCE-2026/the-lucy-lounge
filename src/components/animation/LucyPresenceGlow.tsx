import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLucyWorlds } from '@/contexts/LucyWorldsContext';

export type PresenceState = 'idle' | 'thinking' | 'responding' | 'listening';

interface LucyPresenceGlowProps {
  state?: PresenceState;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export const LucyPresenceGlow = memo(function LucyPresenceGlow({
  state = 'idle',
  size = 'md',
  className,
  children
}: LucyPresenceGlowProps) {
  const { worldConfig } = useLucyWorlds();

  const sizeConfig = useMemo(() => ({
    sm: { ring: 'w-16 h-16', glow: 'blur-lg' },
    md: { ring: 'w-24 h-24', glow: 'blur-xl' },
    lg: { ring: 'w-32 h-32', glow: 'blur-2xl' },
  }), []);

  const stateConfig = useMemo(() => ({
    idle: {
      duration: 4,
      scale: [1, 1.02, 1],
      opacity: [0.3, 0.5, 0.3],
    },
    thinking: {
      duration: 1.5,
      scale: [1, 1.08, 1],
      opacity: [0.4, 0.7, 0.4],
    },
    responding: {
      duration: 2,
      scale: [1, 1.05, 1],
      opacity: [0.5, 0.8, 0.5],
    },
    listening: {
      duration: 1,
      scale: [1, 1.03, 1],
      opacity: [0.6, 0.9, 0.6],
    },
  }), []);

  const glowColor = worldConfig?.primaryColor || '277 84% 55%';
  const secondaryGlowColor = worldConfig?.secondaryColor || '320 100% 55%';
  const config = stateConfig[state];
  const sizes = sizeConfig[size];

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Outer breathing glow */}
      <motion.div
        className={cn("absolute rounded-full", sizes.ring, sizes.glow)}
        style={{
          background: `radial-gradient(circle, hsl(${glowColor} / 0.4) 0%, hsl(${secondaryGlowColor} / 0.2) 50%, transparent 70%)`,
        }}
        animate={{
          scale: config.scale,
          opacity: config.opacity,
        }}
        transition={{
          duration: config.duration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Inner shimmer ring */}
      <motion.div
        className={cn(
          "absolute rounded-full border",
          sizes.ring,
        )}
        style={{
          borderColor: `hsl(${glowColor} / 0.3)`,
          boxShadow: `inset 0 0 20px hsl(${glowColor} / 0.2), 0 0 30px hsl(${secondaryGlowColor} / 0.15)`,
        }}
        animate={{
          scale: [1, 1.02, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: config.duration * 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      />

      {/* Pulse effect for active states */}
      {(state === 'thinking' || state === 'responding') && (
        <motion.div
          className={cn("absolute rounded-full border-2", sizes.ring)}
          style={{
            borderColor: `hsl(${glowColor} / 0.5)`,
          }}
          animate={{
            scale: [1, 1.5],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: state === 'thinking' ? 1 : 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}

      {/* Content wrapper */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
});
