/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — SAFE MEDIA GATE                                          │
 * │                                                                             │
 * │ Gates audio/video/mic features behind user gesture confirmation.           │
 * │ CRITICAL for iOS Safari and mobile browser compatibility.                  │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * PURPOSE:
 * - Prevent premature AudioContext creation that crashes iOS Safari
 * - Gate media features behind explicit user consent
 * - Provide graceful degradation for unsupported browsers
 * - Store consent in localStorage for session persistence
 * 
 * RULES:
 * 1. NEVER auto-play audio/video without user gesture
 * 2. NEVER initialize AudioContext at module import
 * 3. ALWAYS wait for user click before creating media resources
 */
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { 
  isBrowser, 
  supportsWebAudio, 
  supportsMediaDevices,
  getStorageItem,
  setStorageItem,
  isIOSSafari,
} from '@/lib/safeBrowser';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface MediaGateContextType {
  /** Whether audio features are enabled by user */
  audioEnabled: boolean;
  /** Whether microphone is enabled by user */
  micEnabled: boolean;
  /** Whether AudioContext has been successfully created */
  audioContextReady: boolean;
  /** Enable audio features (requires user gesture) */
  enableAudio: () => Promise<boolean>;
  /** Enable microphone (requires user gesture) */
  enableMic: () => Promise<boolean>;
  /** Disable all media features */
  disableAll: () => void;
  /** Get or create AudioContext (only after enableAudio) */
  getAudioContext: () => AudioContext | null;
  /** Feature support flags */
  support: {
    webAudio: boolean;
    mediaDevices: boolean;
  };
}

const MediaGateContext = createContext<MediaGateContextType | null>(null);

// Storage keys
const STORAGE_KEYS = {
  audioEnabled: 'lucy_media_audio_enabled',
  micEnabled: 'lucy_media_mic_enabled',
} as const;

// Singleton AudioContext (shared across app)
let globalAudioContext: AudioContext | null = null;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROVIDER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SafeMediaGateProviderProps {
  children: ReactNode;
}

export function SafeMediaGateProvider({ children }: SafeMediaGateProviderProps) {
  // Check browser support (safe, won't crash)
  const support = {
    webAudio: supportsWebAudio(),
    mediaDevices: supportsMediaDevices(),
  };

  // Load persisted preferences (after user previously enabled)
  const [audioEnabled, setAudioEnabled] = useState(() => {
    if (!isBrowser()) return false;
    return getStorageItem(STORAGE_KEYS.audioEnabled) === 'true';
  });

  const [micEnabled, setMicEnabled] = useState(() => {
    if (!isBrowser()) return false;
    return getStorageItem(STORAGE_KEYS.micEnabled) === 'true';
  });

  const [audioContextReady, setAudioContextReady] = useState(false);

  // Create AudioContext (ONLY after user gesture)
  const createAudioContext = useCallback((): AudioContext | null => {
    if (!support.webAudio) return null;
    if (globalAudioContext) return globalAudioContext;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return null;

      globalAudioContext = new AudioContextClass();
      
      // iOS Safari requires resume on user gesture
      if (globalAudioContext.state === 'suspended') {
        globalAudioContext.resume().catch(() => {});
      }

      return globalAudioContext;
    } catch (e) {
      console.warn('[SafeMediaGate] Failed to create AudioContext:', e);
      return null;
    }
  }, [support.webAudio]);

  // Warm the audio pipeline (iOS Safari requirement)
  const warmAudioPipeline = useCallback((ctx: AudioContext) => {
    try {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      source.stop(0.001);
    } catch {
      // Ignore warm-up errors
    }
  }, []);

  // Enable audio (MUST be called from user gesture handler)
  const enableAudio = useCallback(async (): Promise<boolean> => {
    if (!support.webAudio) {
      console.warn('[SafeMediaGate] WebAudio not supported');
      return false;
    }

    try {
      const ctx = createAudioContext();
      if (!ctx) return false;

      // Resume if suspended (iOS Safari)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Warm the pipeline
      warmAudioPipeline(ctx);

      // Mark as enabled
      setAudioEnabled(true);
      setAudioContextReady(true);
      setStorageItem(STORAGE_KEYS.audioEnabled, 'true');

      console.log('[SafeMediaGate] Audio enabled successfully');
      return true;
    } catch (e) {
      console.error('[SafeMediaGate] Failed to enable audio:', e);
      return false;
    }
  }, [support.webAudio, createAudioContext, warmAudioPipeline]);

  // Enable microphone (MUST be called from user gesture handler)
  const enableMic = useCallback(async (): Promise<boolean> => {
    if (!support.mediaDevices) {
      console.warn('[SafeMediaGate] MediaDevices not supported');
      return false;
    }

    try {
      // Request mic permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop the stream immediately (we just needed permission)
      stream.getTracks().forEach(track => track.stop());

      setMicEnabled(true);
      setStorageItem(STORAGE_KEYS.micEnabled, 'true');

      console.log('[SafeMediaGate] Microphone enabled successfully');
      return true;
    } catch (e) {
      console.error('[SafeMediaGate] Failed to enable microphone:', e);
      return false;
    }
  }, [support.mediaDevices]);

  // Disable all media
  const disableAll = useCallback(() => {
    setAudioEnabled(false);
    setMicEnabled(false);
    setAudioContextReady(false);
    setStorageItem(STORAGE_KEYS.audioEnabled, 'false');
    setStorageItem(STORAGE_KEYS.micEnabled, 'false');

    // Close AudioContext
    if (globalAudioContext) {
      try {
        globalAudioContext.close();
      } catch {
        // Ignore
      }
      globalAudioContext = null;
    }
  }, []);

  // Get AudioContext (only if enabled)
  const getAudioContext = useCallback((): AudioContext | null => {
    if (!audioEnabled || !audioContextReady) return null;
    return globalAudioContext;
  }, [audioEnabled, audioContextReady]);

  // If audio was previously enabled, try to restore on user gesture
  useEffect(() => {
    if (!audioEnabled || audioContextReady) return;
    if (!isBrowser()) return;

    const restoreAudio = async () => {
      // For iOS Safari, we need a fresh user gesture
      if (isIOSSafari()) {
        // Reset enabled state - user will need to re-enable
        console.log('[SafeMediaGate] iOS Safari - waiting for user gesture to restore audio');
        return;
      }

      // For other browsers, try to restore
      const ctx = createAudioContext();
      if (ctx && ctx.state === 'running') {
        setAudioContextReady(true);
      }
    };

    restoreAudio();
  }, [audioEnabled, audioContextReady, createAudioContext]);

  const value: MediaGateContextType = {
    audioEnabled,
    micEnabled,
    audioContextReady,
    enableAudio,
    enableMic,
    disableAll,
    getAudioContext,
    support,
  };

  return (
    <MediaGateContext.Provider value={value}>
      {children}
    </MediaGateContext.Provider>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useSafeMedia(): MediaGateContextType {
  const context = useContext(MediaGateContext);
  if (!context) {
    throw new Error('useSafeMedia must be used within SafeMediaGateProvider');
  }
  return context;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENABLE AUDIO BUTTON COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface EnableAudioButtonProps {
  className?: string;
  children?: ReactNode;
}

export function EnableAudioButton({ className, children }: EnableAudioButtonProps) {
  const { audioEnabled, enableAudio, support } = useSafeMedia();
  const [loading, setLoading] = useState(false);

  if (!support.webAudio) {
    return (
      <div className={className} style={{ opacity: 0.5, pointerEvents: 'none' }}>
        Audio not supported
      </div>
    );
  }

  if (audioEnabled) {
    return null; // Already enabled
  }

  const handleClick = async () => {
    setLoading(true);
    await enableAudio();
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid rgba(167, 139, 250, 0.3)',
        background: 'rgba(167, 139, 250, 0.1)',
        color: '#a78bfa',
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {loading ? '⏳' : '🔊'} {children || 'Enable Audio'}
    </button>
  );
}

export default SafeMediaGateProvider;
