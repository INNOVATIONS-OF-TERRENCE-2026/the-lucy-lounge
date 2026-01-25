/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — DEFERRED CAPABILITY INIT                                 │
 * │                                                                             │
 * │ Ensures capabilities cannot be initialized until user gesture.             │
 * │ Prevents accidental early init even if called.                             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * PURPOSE:
 * - Queue capability init functions until gesture
 * - Automatically execute queued inits after gesture
 * - Prevent race conditions in boot sequence
 * - Provide clear init lifecycle management
 * 
 * RULES:
 * 1. All init functions MUST go through this hook
 * 2. Functions are queued until gesture is captured
 * 3. After gesture, functions execute immediately
 * 4. Deduplication by capability key
 */

import { useCallback, useRef, useEffect, useState } from 'react';
import { useUserGestureGate, GestureToken } from './useUserGestureGate';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type CapabilityKey = 
  | 'audio-context'
  | 'media-devices'
  | 'speech-recognition'
  | 'speech-synthesis'
  | 'webgl'
  | 'video-playback'
  | 'camera'
  | 'microphone'
  | string;

export interface CapabilityInitOptions {
  /** Unique key for this capability (for deduplication) */
  key: CapabilityKey;
  /** Whether to retry on failure */
  retry?: boolean;
  /** Max retry attempts */
  maxRetries?: number;
  /** Callback on successful init */
  onSuccess?: () => void;
  /** Callback on failed init */
  onError?: (error: Error) => void;
}

export interface CapabilityInitResult {
  /** Whether init was successful */
  success: boolean;
  /** Error if failed */
  error?: Error;
  /** Whether init was deferred (waiting for gesture) */
  deferred: boolean;
}

type InitFunction = (token: GestureToken) => Promise<boolean> | boolean;

interface QueuedInit {
  key: CapabilityKey;
  fn: InitFunction;
  options: CapabilityInitOptions;
  resolve: (result: CapabilityInitResult) => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GLOBAL QUEUE (Singleton - persists across hook instances)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const initQueue: Map<CapabilityKey, QueuedInit> = new Map();
const completedInits: Set<CapabilityKey> = new Set();
let queueProcessed = false;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Deferred Capability Init Hook
 * 
 * Ensures init functions only run after user gesture.
 * Prevents iOS Safari crashes from premature media init.
 * 
 * @example
 * const { deferredInit, isReady } = useDeferredCapabilityInit();
 * 
 * // This will queue until gesture, then run
 * await deferredInit({
 *   key: 'audio-context',
 *   fn: async (token) => {
 *     const ctx = new AudioContext();
 *     await ctx.resume();
 *     return true;
 *   }
 * });
 */
export function useDeferredCapabilityInit() {
  const { hasGesture, gestureToken, awaitUserGesture } = useUserGestureGate();
  const [isReady, setIsReady] = useState(hasGesture);
  const processingRef = useRef(false);

  // Process queue when gesture is captured
  const processQueue = useCallback(async (token: GestureToken) => {
    if (processingRef.current || queueProcessed) return;
    processingRef.current = true;

    console.log('[DeferredInit] Processing queue with', initQueue.size, 'items');

    for (const [key, queued] of initQueue.entries()) {
      if (completedInits.has(key)) {
        queued.resolve({ success: true, deferred: true });
        continue;
      }

      try {
        const result = await queued.fn(token);
        if (result) {
          completedInits.add(key);
          queued.resolve({ success: true, deferred: true });
          queued.options.onSuccess?.();
        } else {
          queued.resolve({ success: false, deferred: true, error: new Error('Init returned false') });
          queued.options.onError?.(new Error('Init returned false'));
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        queued.resolve({ success: false, deferred: true, error: err });
        queued.options.onError?.(err);
      }
    }

    initQueue.clear();
    queueProcessed = true;
    processingRef.current = false;
    setIsReady(true);
  }, []);

  // Watch for gesture
  useEffect(() => {
    if (hasGesture && gestureToken && !queueProcessed) {
      processQueue(gestureToken);
    }
  }, [hasGesture, gestureToken, processQueue]);

  /**
   * Queue or execute an init function
   */
  const deferredInit = useCallback(async (
    options: CapabilityInitOptions,
    fn: InitFunction
  ): Promise<CapabilityInitResult> => {
    const { key } = options;

    // Already completed
    if (completedInits.has(key)) {
      return { success: true, deferred: false };
    }

    // If we have gesture, execute immediately
    if (hasGesture && gestureToken) {
      try {
        const result = await fn(gestureToken);
        if (result) {
          completedInits.add(key);
          options.onSuccess?.();
          return { success: true, deferred: false };
        }
        return { success: false, deferred: false, error: new Error('Init returned false') };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        options.onError?.(err);
        return { success: false, deferred: false, error: err };
      }
    }

    // No gesture yet - queue the init
    return new Promise<CapabilityInitResult>((resolve) => {
      // Deduplicate by key
      if (initQueue.has(key)) {
        console.log('[DeferredInit] Skipping duplicate:', key);
        resolve({ success: false, deferred: true, error: new Error('Already queued') });
        return;
      }

      console.log('[DeferredInit] Queuing:', key);
      initQueue.set(key, { key, fn, options, resolve });

      // Start waiting for gesture
      awaitUserGesture().then((token) => {
        if (!queueProcessed) {
          processQueue(token);
        }
      });
    });
  }, [hasGesture, gestureToken, awaitUserGesture, processQueue]);

  /**
   * Check if a specific capability has been initialized
   */
  const isCapabilityReady = useCallback((key: CapabilityKey): boolean => {
    return completedInits.has(key);
  }, []);

  /**
   * Reset a capability (allow re-init)
   */
  const resetCapability = useCallback((key: CapabilityKey): void => {
    completedInits.delete(key);
    initQueue.delete(key);
  }, []);

  return {
    /** Whether gesture has been captured and init is allowed */
    isReady,
    /** Queue or execute an init function */
    deferredInit,
    /** Check if specific capability is ready */
    isCapabilityReady,
    /** Reset a capability for re-init */
    resetCapability,
    /** Current gesture state */
    hasGesture,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITY EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Check if capability is initialized (synchronous, no hook needed) */
export function isCapabilityInitialized(key: CapabilityKey): boolean {
  return completedInits.has(key);
}

/** Get all initialized capabilities */
export function getInitializedCapabilities(): CapabilityKey[] {
  return Array.from(completedInits);
}

export default useDeferredCapabilityInit;
