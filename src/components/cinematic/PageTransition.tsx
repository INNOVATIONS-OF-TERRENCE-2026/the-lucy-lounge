/**
 * THE LUCY LOUNGE - Page Transition Orchestrator
 * 
 * Provides smooth, cinematic transitions between routes:
 * - Cross-fade + depth slide transitions
 * - Shared-element transitions (titles/icons)
 * - Route-aware motion presets
 * 
 * Rules:
 * - Sidebar remains persistent
 * - No route remount bugs
 * - No flashing or double renders
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, Variants, useReducedMotion } from 'framer-motion';
import { useCinematicSafe } from '@/contexts/CinematicContext';
import { getMotionPreset, MotionPreset } from '@/hooks/useCinematicMode';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

// Motion presets for different route types
const presetVariants: Record<MotionPreset, Variants> = {
  calm: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
    },
  },
  flow: {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.98,
      transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
    },
  },
  power: {
    initial: { opacity: 0, x: 30, scale: 0.95 },
    animate: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
    exit: { 
      opacity: 0, 
      x: -30, 
      scale: 0.95,
      transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
    },
  },
};

// Minimal variants for reduced motion / disabled cinematic
const reducedVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const location = useLocation();
  const cinematic = useCinematicSafe();
  const shouldReduceMotion = useReducedMotion();
  const prevPathRef = useRef(location.pathname);

  // Determine if transitions should be active
  const isEnabled = useMemo(() => {
    if (shouldReduceMotion) return false;
    if (!cinematic) return true;
    return cinematic.isEnabled && cinematic.settings.pageTransitions;
  }, [shouldReduceMotion, cinematic]);

  // Get motion preset based on route
  const preset = useMemo(() => getMotionPreset(location.pathname), [location.pathname]);
  
  // Select variants based on settings
  const variants = useMemo(() => {
    if (!isEnabled) return reducedVariants;
    return presetVariants[preset];
  }, [isEnabled, preset]);

  // Track route changes for debugging (optional)
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        className={`page-transition ${className}`}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Shared Element Transition Component
 * For elements that should morph/persist across route changes
 */
interface SharedElementProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function SharedElement({ id, children, className = '' }: SharedElementProps) {
  const cinematic = useCinematicSafe();
  const shouldReduceMotion = useReducedMotion();
  
  const isEnabled = useMemo(() => {
    if (shouldReduceMotion) return false;
    if (!cinematic) return true;
    return cinematic.isEnabled && cinematic.settings.pageTransitions;
  }, [shouldReduceMotion, cinematic]);

  if (!isEnabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      layoutId={`shared-${id}`}
      className={className}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Route-aware wrapper that applies appropriate transitions
 */
interface RouteTransitionWrapperProps {
  children: React.ReactNode;
  loungeType?: string;
}

export function RouteTransitionWrapper({ children, loungeType }: RouteTransitionWrapperProps) {
  const location = useLocation();
  const cinematic = useCinematicSafe();
  const shouldReduceMotion = useReducedMotion();

  const isEnabled = !shouldReduceMotion && (cinematic?.isEnabled ?? true);

  // Stagger children animation
  const containerVariants: Variants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: isEnabled ? 0.1 : 0,
        delayChildren: isEnabled ? 0.2 : 0,
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants: Variants = {
    initial: isEnabled ? { opacity: 0, y: 10 } : { opacity: 0 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: isEnabled ? 0.4 : 0.1 },
    },
    exit: { 
      opacity: 0,
      transition: { duration: isEnabled ? 0.2 : 0.05 },
    },
  };

  return (
    <motion.div
      key={location.pathname}
      className={`route-wrapper ${loungeType ? `lounge-${loungeType}` : ''}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div variants={itemVariants}>
        {children}
      </motion.div>
    </motion.div>
  );
}

export default PageTransition;
