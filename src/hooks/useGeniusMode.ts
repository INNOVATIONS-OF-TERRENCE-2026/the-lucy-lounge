/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * THE LUCY LOUNGE - Lucy Genius Mode Hook
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Controls Lucy's "Genius Mode" - a toggle that forces 70B+ class models
 * for maximum intelligence without exposing model details to users.
 * 
 * USER EXPERIENCE:
 * - "Lucy Genius Mode" toggle in chat UI
 * - "Lucy is thinking deeply..." indicator when active
 * - NEVER shows model names, providers, or technical details
 * 
 * TECHNICAL BEHAVIOR:
 * - When ON: Routes to Qwen-72B, Claude 3.5 Sonnet, GPT-4o
 * - When OFF: Uses intelligent task-based routing
 * - Persists preference in localStorage
 * - Request-level flag sent to backend
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect } from 'react';

const GENIUS_MODE_STORAGE_KEY = 'lucy-genius-mode';

export interface GeniusModeState {
  // Is Genius Mode currently enabled?
  enabled: boolean;
  
  // Toggle Genius Mode on/off
  toggle: () => void;
  
  // Explicitly set Genius Mode
  setEnabled: (enabled: boolean) => void;
  
  // Reset to default (off)
  reset: () => void;
  
  // UI helpers (NEVER expose model names)
  statusText: string;
  thinkingText: string;
}

/**
 * Hook to manage Lucy Genius Mode state.
 * 
 * Usage:
 * ```tsx
 * const { enabled, toggle, statusText } = useGeniusMode();
 * 
 * // In chat request
 * sendMessage({ geniusMode: enabled, ... });
 * ```
 */
export function useGeniusMode(): GeniusModeState {
  // Initialize from localStorage, default to false (off)
  const [enabled, setEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem(GENIUS_MODE_STORAGE_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  // Persist to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(GENIUS_MODE_STORAGE_KEY, String(enabled));
    } catch {
      // Ignore storage errors
    }
  }, [enabled]);

  const toggle = useCallback(() => {
    setEnabledState(prev => !prev);
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
  }, []);

  const reset = useCallback(() => {
    setEnabledState(false);
  }, []);

  // UI text - NEVER expose model names
  const statusText = enabled 
    ? "Lucy Genius Mode active" 
    : "Lucy ready";
    
  const thinkingText = enabled
    ? "Lucy is thinking deeply..."
    : "Lucy is thinking...";

  return {
    enabled,
    toggle,
    setEnabled,
    reset,
    statusText,
    thinkingText,
  };
}

/**
 * Simple getter for Genius Mode state (for non-hook contexts)
 */
export function getGeniusModeEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(GENIUS_MODE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Simple setter for Genius Mode state (for non-hook contexts)
 */
export function setGeniusModeEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GENIUS_MODE_STORAGE_KEY, String(enabled));
  } catch {
    // Ignore storage errors
  }
}

export default useGeniusMode;
