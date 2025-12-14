import { useEffect, useRef, useCallback } from 'react';

/**
 * iOS Audio Unlock Hook
 * 
 * Handles iOS Safari and mobile browser audio restrictions by:
 * - Creating a shared AudioContext
 * - Resuming context on first user gesture
 * - Warming audio pipeline with silent buffer
 * - Providing unlock status for other audio systems
 */

// Global singleton for audio context (shared across all hooks)
let globalAudioContext: AudioContext | null = null;
let isAudioUnlocked = false;
let unlockAttempted = false;

const STORAGE_KEY = 'lucy-audio-unlocked-session';

export const getGlobalAudioContext = (): AudioContext | null => globalAudioContext;
export const getIsAudioUnlocked = (): boolean => isAudioUnlocked;

export const useIOSAudioUnlock = () => {
  const hasUnlockedRef = useRef(false);

  const initAudioContext = useCallback(() => {
    if (globalAudioContext) return globalAudioContext;

    try {
      // Use webkit prefix for older iOS Safari
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return null;

      globalAudioContext = new AudioContextClass();
      return globalAudioContext;
    } catch (e) {
      console.warn('[AudioUnlock] Failed to create AudioContext:', e);
      return null;
    }
  }, []);

  const warmAudioPipeline = useCallback((ctx: AudioContext) => {
    try {
      // Create silent buffer to "warm" the audio pipeline
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      source.stop(0.001);
    } catch (e) {
      // Ignore warm-up errors
    }
  }, []);

  const unlockAudio = useCallback(async () => {
    if (hasUnlockedRef.current || isAudioUnlocked) return true;

    const ctx = initAudioContext();
    if (!ctx) return false;

    try {
      // Check if suspended (common on iOS)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Warm the pipeline with silent audio
      warmAudioPipeline(ctx);

      // Mark as unlocked
      isAudioUnlocked = true;
      hasUnlockedRef.current = true;

      // Store in session storage for page persistence
      try {
        sessionStorage.setItem(STORAGE_KEY, 'true');
      } catch (e) {
        // Ignore storage errors
      }

      return true;
    } catch (e) {
      console.warn('[AudioUnlock] Resume failed, will retry:', e);
      return false;
    }
  }, [initAudioContext, warmAudioPipeline]);

  const handleUserGesture = useCallback(async () => {
    if (unlockAttempted && isAudioUnlocked) return;
    unlockAttempted = true;

    const success = await unlockAudio();
    
    // Retry once if failed
    if (!success) {
      setTimeout(() => {
        unlockAudio();
      }, 100);
    }
  }, [unlockAudio]);

  useEffect(() => {
    // Check if already unlocked this session
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
        isAudioUnlocked = true;
        hasUnlockedRef.current = true;
      }
    } catch (e) {
      // Ignore storage errors
    }

    // iOS and mobile require user gesture to unlock audio
    const events = ['touchstart', 'touchend', 'click', 'keydown'];
    
    const gestureHandler = () => {
      handleUserGesture();
      
      // Remove listeners after successful unlock
      if (isAudioUnlocked) {
        events.forEach(event => {
          document.removeEventListener(event, gestureHandler, { capture: true });
        });
      }
    };

    events.forEach(event => {
      document.addEventListener(event, gestureHandler, { capture: true, passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, gestureHandler, { capture: true });
      });
    };
  }, [handleUserGesture]);

  return {
    isUnlocked: isAudioUnlocked,
    unlockAudio,
    getAudioContext: initAudioContext,
  };
};
