import { useIOSAudioUnlock } from '@/hooks/useIOSAudioUnlock';
import { useEffect } from 'react';

/**
 * iOS Audio Unlock Provider
 * 
 * Invisible component that initializes audio unlock system globally.
 * Place at app root to ensure audio works on all mobile browsers.
 * 
 * Does NOT render any visible UI.
 */
export const IOSAudioUnlockProvider = () => {
  const { isUnlocked } = useIOSAudioUnlock();

  useEffect(() => {
    // Log unlock status for debugging (dev only)
    if (process.env.NODE_ENV === 'development' && isUnlocked) {
      console.log('[IOSAudioUnlock] Audio pipeline unlocked');
    }
  }, [isUnlocked]);

  return null;
};
