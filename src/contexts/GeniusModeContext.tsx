/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * THE LUCY LOUNGE - Genius Mode Context Provider
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Global context for Lucy's Genius Mode settings.
 * Provides unified access across all chat components.
 * 
 * UI RULES:
 * - May show: "Lucy Genius Mode", "Lucy is thinking deeply..."
 * - NEVER show: Model names, providers, technical details
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useGeniusMode, GeniusModeState } from '@/hooks/useGeniusMode';

const GeniusModeContext = createContext<GeniusModeState | null>(null);

export function GeniusModeProvider({ children }: { children: ReactNode }) {
  const geniusMode = useGeniusMode();

  return (
    <GeniusModeContext.Provider value={geniusMode}>
      {children}
    </GeniusModeContext.Provider>
  );
}

/**
 * Use Genius Mode state from context.
 * Must be used within GeniusModeProvider.
 */
export function useGeniusModeContext(): GeniusModeState {
  const context = useContext(GeniusModeContext);
  if (!context) {
    throw new Error('useGeniusModeContext must be used within GeniusModeProvider');
  }
  return context;
}

/**
 * Safe version that returns null if outside provider.
 * Useful for components that may be rendered outside the provider.
 */
export function useGeniusModeSafe(): GeniusModeState | null {
  return useContext(GeniusModeContext);
}

export { GeniusModeContext };
