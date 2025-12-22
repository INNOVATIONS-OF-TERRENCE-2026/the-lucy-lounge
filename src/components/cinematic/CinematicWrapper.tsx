import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import './cinematic.css';

interface CinematicWrapperProps {
  children: React.ReactNode;
  loungeType: 'neural' | 'dream' | 'vision' | 'silent' | 'timeline' | 'command' | 'quantum' | 'presence' | 'events';
  particleCount?: number;
}

export const CinematicWrapper: React.FC<CinematicWrapperProps> = ({
  children,
  loungeType,
  particleCount = 12
}) => {
  // Generate random particle positions
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      size: 2 + Math.random() * 4
    }));
  }, [particleCount]);

  return (
    <motion.div
      className={`lounge-${loungeType} relative min-h-screen overflow-hidden`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Ambient background gradient */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, hsl(var(--lounge-secondary)) 0%, hsl(var(--background)) 50%, hsl(var(--lounge-secondary) / 0.5) 100%)`
        }}
      />
      
      {/* Cinematic glow overlay */}
      <div className="cinematic-glow fixed inset-0 -z-5" />
      
      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="cinematic-particle"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}
      
      {/* Main content */}
      <motion.div
        className="relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default CinematicWrapper;
