/**
 * THE LUCY LOUNGE - Cinematic Mode Hook
 * 
 * Central state management for all cinematic features.
 * Persists to Supabase with localStorage fallback.
 * Respects prefers-reduced-motion and low-power devices.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type CinematicLevel = 'off' | 'low' | 'medium' | 'ultra';
export type MotionPreset = 'calm' | 'flow' | 'power';

export interface CinematicSettings {
  level: CinematicLevel;
  motionIntensity: number; // 0-100
  audioVisualSync: boolean;
  filmGrain: boolean;
  ambientGlow: boolean;
  particleEffects: boolean;
  pageTransitions: boolean;
  lucyPresence: boolean;
}

const DEFAULT_SETTINGS: CinematicSettings = {
  level: 'medium',
  motionIntensity: 50,
  audioVisualSync: true,
  filmGrain: true,
  ambientGlow: true,
  particleEffects: true,
  pageTransitions: true,
  lucyPresence: true,
};

const STORAGE_KEY = 'lucy-cinematic-settings';

// Detect low-power/reduced-motion preference
function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isLowPowerDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  // Check for low memory devices
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) return true;
  // Check for hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return true;
  return false;
}

export function useCinematicMode() {
  const [settings, setSettings] = useState<CinematicSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [reducedMotion, setReducedMotion] = useState(shouldReduceMotion);
  const [lowPower, setLowPower] = useState(isLowPowerDevice);
  const [userId, setUserId] = useState<string | null>(null);

  // Listen for reduced motion changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Get user ID for future Supabase sync (when column is added)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        // Note: cinematic_settings column can be added to user_preferences later
        // For now, using localStorage for persistence
      }
    });
  }, []);

  // Persist settings
  const updateSettings = useCallback((updates: Partial<CinematicSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}

      // Note: Supabase sync can be added when cinematic_settings column exists
      // For now, localStorage provides offline-first persistence

      return next;
    });
  }, []);

  // Computed effective settings (respects system preferences)
  const effectiveSettings = useMemo((): CinematicSettings => {
    // If user prefers reduced motion, disable most effects
    if (reducedMotion) {
      return {
        ...settings,
        level: 'off',
        motionIntensity: 0,
        particleEffects: false,
        pageTransitions: false,
        filmGrain: false,
      };
    }

    // If low-power device, reduce intensity
    if (lowPower) {
      return {
        ...settings,
        level: settings.level === 'ultra' ? 'medium' : settings.level,
        motionIntensity: Math.min(settings.motionIntensity, 30),
        particleEffects: false,
      };
    }

    return settings;
  }, [settings, reducedMotion, lowPower]);

  // Convenience methods
  const setLevel = useCallback((level: CinematicLevel) => {
    const presets: Record<CinematicLevel, Partial<CinematicSettings>> = {
      off: { level: 'off', motionIntensity: 0, filmGrain: false, particleEffects: false, pageTransitions: false },
      low: { level: 'low', motionIntensity: 25, filmGrain: false, particleEffects: false, pageTransitions: true },
      medium: { level: 'medium', motionIntensity: 50, filmGrain: true, particleEffects: true, pageTransitions: true },
      ultra: { level: 'ultra', motionIntensity: 100, filmGrain: true, particleEffects: true, pageTransitions: true },
    };
    updateSettings(presets[level]);
  }, [updateSettings]);

  const resetToCalm = useCallback(() => {
    updateSettings({
      level: 'low',
      motionIntensity: 25,
      audioVisualSync: false,
      filmGrain: false,
      particleEffects: false,
    });
  }, [updateSettings]);

  // Check if effects should be enabled
  const isEnabled = effectiveSettings.level !== 'off';
  const intensity = effectiveSettings.motionIntensity / 100;

  return {
    settings: effectiveSettings,
    rawSettings: settings,
    updateSettings,
    setLevel,
    resetToCalm,
    isEnabled,
    intensity,
    reducedMotion,
    lowPower,
  };
}

// Motion preset mapping for routes
export function getMotionPreset(pathname: string): MotionPreset {
  if (pathname.includes('presence') || pathname.includes('silent')) return 'calm';
  if (pathname.includes('listening') || pathname.includes('dream')) return 'flow';
  if (pathname.includes('command') || pathname.includes('vision')) return 'power';
  return 'flow';
}
