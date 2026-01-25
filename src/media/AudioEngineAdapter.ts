/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — AUDIO ENGINE ADAPTER                                     │
 * │                                                                             │
 * │ Safari-safe AudioContext management with hard gesture gating.              │
 * │ DO NOT MODIFY: Governed by /docs/MEDIA_GESTURE_POLICY.md                   │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * PURPOSE:
 * - Provide safe AudioContext creation and management
 * - Enforce gesture requirements at init time
 * - Handle iOS Safari quirks (resume, warm-up, etc.)
 * - Singleton pattern for AudioContext reuse
 * 
 * RULES:
 * 1. NEVER create AudioContext at module import
 * 2. ALWAYS require gesture token for initialization
 * 3. ALWAYS warm audio pipeline on iOS Safari
 * 4. Handle suspended state properly
 */

import { GestureToken } from '@/hooks/useUserGestureGate';
import { 
  enforceGesturePolicy, 
  validateGestureToken,
  IOS_SAFARI_POLICY,
  MediaPolicyViolation 
} from './MediaPolicy';
import { isBrowser, isIOSSafari, isIOS, supportsWebAudio } from '@/lib/safeBrowser';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface AudioEngineState {
  /** Whether AudioContext exists */
  initialized: boolean;
  /** Current AudioContext state */
  state: AudioContextState | 'uninitialized';
  /** Whether audio is fully ready for playback */
  ready: boolean;
  /** Error if initialization failed */
  error: Error | null;
}

export interface AudioInitOptions {
  /** Gesture token (REQUIRED) */
  gestureToken: GestureToken;
  /** Sample rate (default: device native) */
  sampleRate?: number;
  /** Latency hint */
  latencyHint?: AudioContextLatencyCategory | number;
}

export interface AudioEngineAdapter {
  /** Get current state */
  getState(): AudioEngineState;
  /** Check if audio is supported (pure detection) */
  canUseAudio(): boolean;
  /** Initialize AudioContext (REQUIRES gesture) */
  initializeAudio(options: AudioInitOptions): Promise<boolean>;
  /** Get AudioContext (null if not initialized) */
  getAudioContext(): AudioContext | null;
  /** Resume AudioContext if suspended */
  resume(): Promise<boolean>;
  /** Suspend AudioContext */
  suspend(): Promise<boolean>;
  /** Close and cleanup AudioContext */
  close(): Promise<void>;
  /** Warm audio pipeline (iOS Safari) */
  warmPipeline(): void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON STATE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let audioContext: AudioContext | null = null;
let lastError: Error | null = null;
let initializationPromise: Promise<boolean> | null = null;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IMPLEMENTATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get current audio engine state
 */
function getState(): AudioEngineState {
  if (!audioContext) {
    return {
      initialized: false,
      state: 'uninitialized',
      ready: false,
      error: lastError,
    };
  }

  return {
    initialized: true,
    state: audioContext.state,
    ready: audioContext.state === 'running',
    error: lastError,
  };
}

/**
 * Check if WebAudio is supported (pure detection)
 * SAFE to call at any time
 */
function canUseAudio(): boolean {
  return supportsWebAudio();
}

/**
 * Create and initialize AudioContext
 * REQUIRES valid gesture token
 */
async function initializeAudio(options: AudioInitOptions): Promise<boolean> {
  // Validate gesture token
  if (!validateGestureToken(options.gestureToken)) {
    throw new MediaPolicyViolation(
      'AudioContext-create',
      'Invalid or expired gesture token. AudioContext requires a fresh user gesture.'
    );
  }

  // Enforce policy
  enforceGesturePolicy('AudioContext-create');

  // If already initializing, return existing promise
  if (initializationPromise) {
    return initializationPromise;
  }

  // If already initialized and running, return success
  if (audioContext && audioContext.state === 'running') {
    return true;
  }

  // Start initialization
  initializationPromise = (async () => {
    try {
      // Check support
      if (!canUseAudio()) {
        throw new Error('WebAudio API not supported on this device');
      }

      // Get AudioContext constructor
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('AudioContext not available');
      }

      // Create context with options
      const contextOptions: AudioContextOptions = {};
      if (options.sampleRate) {
        contextOptions.sampleRate = options.sampleRate;
      }
      if (options.latencyHint) {
        contextOptions.latencyHint = options.latencyHint;
      }

      // Create context
      audioContext = new AudioContextClass(contextOptions);
      console.log('[AudioEngine] Created AudioContext, state:', audioContext.state);

      // Handle iOS Safari requirements
      if (isIOSSafari() || isIOS()) {
        // iOS requires explicit resume
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
          console.log('[AudioEngine] Resumed AudioContext for iOS');
        }

        // Warm the pipeline
        warmPipeline();
      }

      // Wait for running state
      if (audioContext.state !== 'running') {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('AudioContext failed to start within timeout'));
          }, 5000);

          const handleStateChange = () => {
            if (audioContext?.state === 'running') {
              clearTimeout(timeout);
              audioContext.removeEventListener('statechange', handleStateChange);
              resolve();
            }
          };

          audioContext!.addEventListener('statechange', handleStateChange);
          
          // Try resume again
          audioContext!.resume().catch(() => {});
        });
      }

      lastError = null;
      console.log('[AudioEngine] Initialization complete, state:', audioContext.state);
      return true;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error('[AudioEngine] Initialization failed:', lastError);
      return false;
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
}

/**
 * Get AudioContext (null if not initialized)
 */
function getAudioContext(): AudioContext | null {
  return audioContext;
}

/**
 * Resume AudioContext if suspended
 * Should be called from user gesture handler
 */
async function resume(): Promise<boolean> {
  if (!audioContext) {
    console.warn('[AudioEngine] Cannot resume - not initialized');
    return false;
  }

  if (audioContext.state === 'running') {
    return true;
  }

  try {
    await audioContext.resume();
    console.log('[AudioEngine] Resumed, state:', audioContext.state);
    return audioContext.state === 'running';
  } catch (error) {
    console.error('[AudioEngine] Resume failed:', error);
    return false;
  }
}

/**
 * Suspend AudioContext
 */
async function suspend(): Promise<boolean> {
  if (!audioContext) return true;

  try {
    await audioContext.suspend();
    return true;
  } catch (error) {
    console.error('[AudioEngine] Suspend failed:', error);
    return false;
  }
}

/**
 * Close and cleanup AudioContext
 */
async function close(): Promise<void> {
  if (!audioContext) return;

  try {
    await audioContext.close();
  } catch (error) {
    console.warn('[AudioEngine] Close error:', error);
  }

  audioContext = null;
  lastError = null;
  initializationPromise = null;
}

/**
 * Warm audio pipeline with silent buffer
 * Required for iOS Safari to enable audio output
 */
function warmPipeline(): void {
  if (!audioContext) return;

  try {
    // Create a silent buffer
    const buffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
    source.stop(0.001);
    console.log('[AudioEngine] Pipeline warmed');
  } catch (error) {
    console.warn('[AudioEngine] Warm pipeline failed:', error);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT ADAPTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const audioEngineAdapter: AudioEngineAdapter = {
  getState,
  canUseAudio,
  initializeAudio,
  getAudioContext,
  resume,
  suspend,
  close,
  warmPipeline,
};

export default audioEngineAdapter;
