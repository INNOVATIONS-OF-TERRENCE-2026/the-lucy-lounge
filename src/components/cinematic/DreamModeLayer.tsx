/**
 * THE LUCY LOUNGE - Dream & Presence Mode Layer
 * 
 * Cognitive Load Reduction States:
 * - UI fades to essentials
 * - Slower easing / time dilation
 * - Floating typography
 * - Reduced contrast, increased depth
 * 
 * Rules:
 * - No popups
 * - No notifications  
 * - No analytics overlays
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCinematicSafe } from '@/contexts/CinematicContext';

export type CognitiveMode = 'normal' | 'dream' | 'presence' | 'silent' | 'focus';

interface CognitiveModeState {
  mode: CognitiveMode;
  setMode: (mode: CognitiveMode) => void;
  isReduced: boolean; // True when in any reduced-load mode
  timeDilation: number; // Animation speed multiplier
  contrastLevel: number; // 0-1, lower = more muted
  showNonEssentials: boolean;
}

const CognitiveModeContext = createContext<CognitiveModeState | null>(null);

const modeSettings: Record<CognitiveMode, { timeDilation: number; contrast: number; showNonEssentials: boolean }> = {
  normal: { timeDilation: 1, contrast: 1, showNonEssentials: true },
  dream: { timeDilation: 0.5, contrast: 0.7, showNonEssentials: false },
  presence: { timeDilation: 0.3, contrast: 0.6, showNonEssentials: false },
  silent: { timeDilation: 0.2, contrast: 0.5, showNonEssentials: false },
  focus: { timeDilation: 0.8, contrast: 0.9, showNonEssentials: false },
};

/**
 * iOS-SAFE storage helper - never throws
 */
function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable - silent fail
  }
}

export function CognitiveModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<CognitiveMode>('normal');

  const setMode = useCallback((newMode: CognitiveMode) => {
    setModeState(newMode);
    // Persist to localStorage (iOS-safe)
    safeSetItem('lucy-cognitive-mode', newMode);
  }, []);

  // Load from localStorage (iOS-safe)
  useEffect(() => {
    const stored = safeGetItem('lucy-cognitive-mode') as CognitiveMode;
    if (stored && modeSettings[stored]) {
      setModeState(stored);
    }
  }, []);

  const settings = modeSettings[mode];

  const value: CognitiveModeState = {
    mode,
    setMode,
    isReduced: mode !== 'normal',
    timeDilation: settings.timeDilation,
    contrastLevel: settings.contrast,
    showNonEssentials: settings.showNonEssentials,
  };

  return (
    <CognitiveModeContext.Provider value={value}>
      {children}
    </CognitiveModeContext.Provider>
  );
}

export function useCognitiveMode(): CognitiveModeState {
  const context = useContext(CognitiveModeContext);
  if (!context) {
    // Fallback for components outside provider
    return {
      mode: 'normal',
      setMode: () => {},
      isReduced: false,
      timeDilation: 1,
      contrastLevel: 1,
      showNonEssentials: true,
    };
  }
  return context;
}

/**
 * Dream Mode Layer - Visual overlay for dream/presence states
 */
interface DreamModeLayerProps {
  children: React.ReactNode;
  className?: string;
}

export function DreamModeLayer({ children, className = '' }: DreamModeLayerProps) {
  const { mode, isReduced, timeDilation, contrastLevel } = useCognitiveMode();
  const cinematic = useCinematicSafe();
  const shouldReduceMotion = useReducedMotion();

  const isEnabled = !shouldReduceMotion && (cinematic?.isEnabled ?? true);

  // CSS custom properties for time dilation
  const style = useMemo(() => ({
    '--time-dilation': timeDilation,
    '--contrast-level': contrastLevel,
    '--transition-duration': `${0.3 / timeDilation}s`,
  } as React.CSSProperties), [timeDilation, contrastLevel]);

  return (
    <div 
      className={`dream-mode-layer ${isReduced ? `mode-${mode}` : ''} ${className}`}
      style={style}
    >
      {/* Soft overlay for reduced modes */}
      <AnimatePresence>
        {isReduced && isEnabled && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 / timeDilation }}
          >
            {/* Soft vignette */}
            <div 
              className="absolute inset-0"
              style={{
                background: mode === 'dream' 
                  ? 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(139, 92, 246, 0.1) 100%)'
                  : mode === 'presence'
                  ? 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(255, 255, 255, 0.05) 100%)'
                  : 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0, 0, 0, 0.2) 100%)',
              }}
            />
            
            {/* Soft blur at edges */}
            <div 
              className="absolute inset-0"
              style={{
                backdropFilter: mode === 'silent' ? 'blur(1px)' : 'none',
                opacity: 0.3,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="relative z-10"
        style={{
          filter: isReduced ? `contrast(${contrastLevel})` : 'none',
          transition: `filter ${0.5 / timeDilation}s ease`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Floating Text Component - For dream mode typography
 */
interface FloatingTextProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export function FloatingText({ children, className = '', intensity = 1 }: FloatingTextProps) {
  const { mode, timeDilation } = useCognitiveMode();
  const cinematic = useCinematicSafe();
  const shouldReduceMotion = useReducedMotion();

  const isEnabled = !shouldReduceMotion && (cinematic?.isEnabled ?? true) && mode !== 'normal';

  if (!isEnabled) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      className={`floating-text inline-block ${className}`}
      animate={{
        y: [0, -3 * intensity, 0],
        opacity: [1, 0.9, 1],
      }}
      transition={{
        duration: 4 / timeDilation,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.span>
  );
}

/**
 * Essential Only Wrapper - Hides content in reduced modes
 */
interface EssentialOnlyProps {
  children: React.ReactNode;
  essential?: boolean;
  fadeOut?: boolean;
}

export function EssentialOnly({ children, essential = false, fadeOut = true }: EssentialOnlyProps) {
  const { showNonEssentials, timeDilation } = useCognitiveMode();

  if (essential || showNonEssentials) {
    return <>{children}</>;
  }

  if (!fadeOut) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5 / timeDilation }}
      style={{ pointerEvents: 'none' }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Non-Essential Wrapper - Automatically hides in reduced modes
 */
export function NonEssential({ children }: { children: React.ReactNode }) {
  return <EssentialOnly essential={false}>{children}</EssentialOnly>;
}

/**
 * Time Dilated Animation Wrapper
 */
interface TimeDilatedProps {
  children: React.ReactNode;
  className?: string;
  animationType?: 'fade' | 'slide' | 'scale';
}

export function TimeDilated({ children, className = '', animationType = 'fade' }: TimeDilatedProps) {
  const { timeDilation } = useCognitiveMode();
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants[animationType]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 / timeDilation }}
    >
      {children}
    </motion.div>
  );
}

export default DreamModeLayer;
