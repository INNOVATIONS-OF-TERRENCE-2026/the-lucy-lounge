/**
 * THE LUCY LOUNGE - Cinematic Context Provider
 * 
 * Global context for cinematic mode settings and state.
 * Provides unified access across all components.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useCinematicMode, CinematicSettings, CinematicLevel } from '@/hooks/useCinematicMode';

interface CinematicContextType {
  settings: CinematicSettings;
  rawSettings: CinematicSettings;
  updateSettings: (updates: Partial<CinematicSettings>) => void;
  setLevel: (level: CinematicLevel) => void;
  resetToCalm: () => void;
  isEnabled: boolean;
  intensity: number;
  reducedMotion: boolean;
  lowPower: boolean;
}

const CinematicContext = createContext<CinematicContextType | null>(null);

export function CinematicProvider({ children }: { children: ReactNode }) {
  const cinematic = useCinematicMode();

  return (
    <CinematicContext.Provider value={cinematic}>
      {children}
    </CinematicContext.Provider>
  );
}

export function useCinematic(): CinematicContextType {
  const context = useContext(CinematicContext);
  if (!context) {
    throw new Error('useCinematic must be used within CinematicProvider');
  }
  return context;
}

// Safe hook that doesn't throw (for components that may be outside provider)
export function useCinematicSafe(): CinematicContextType | null {
  return useContext(CinematicContext);
}
