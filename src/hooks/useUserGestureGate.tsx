/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — USER GESTURE GATE                                        │
 * │                                                                             │
 * │ Tracks user gestures for iOS Safari and mobile browser compliance.         │
 * │ REQUIRED before initializing AudioContext, MediaDevices, etc.              │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * PURPOSE:
 * - Track first valid user interaction (tap, click, keydown)
 * - Provide gesture token for media adapter initialization
 * - Enable deferred capability initialization
 * - Prevent premature media API access
 * 
 * RULES:
 * 1. Only tracks gestures - NEVER initializes media APIs
 * 2. Provides synchronous `hasGesture` check
 * 3. Provides async `awaitUserGesture()` for waiting
 * 4. Gesture token is required by media adapters
 */

import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { isBrowser } from '@/lib/safeBrowser';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Gesture token - proof of user interaction
 * Required by media adapters for initialization
 */
export interface GestureToken {
  /** Unique token ID */
  id: string;
  /** Timestamp of gesture */
  timestamp: number;
  /** Event type that triggered gesture */
  eventType: string;
  /** Whether this is a trusted browser event */
  isTrusted: boolean;
}

export interface UserGestureGateContextType {
  /** Whether a user gesture has been captured */
  hasGesture: boolean;
  /** The gesture token (null if no gesture yet) */
  gestureToken: GestureToken | null;
  /** Wait for user gesture (resolves immediately if already captured) */
  awaitUserGesture: () => Promise<GestureToken>;
  /** Manually trigger gesture capture (for testing/simulation) */
  captureGesture: (event?: Event) => GestureToken;
  /** Get current gesture state */
  getGestureState: () => { hasGesture: boolean; token: GestureToken | null };
}

const UserGestureGateContext = createContext<UserGestureGateContextType | null>(null);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GLOBAL STATE (Singleton - persists across provider remounts)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let globalGestureToken: GestureToken | null = null;
let gesturePromiseResolvers: Array<(token: GestureToken) => void> = [];

function generateTokenId(): string {
  return `gesture_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROVIDER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface UserGestureGateProviderProps {
  children: ReactNode;
}

export function UserGestureGateProvider({ children }: UserGestureGateProviderProps) {
  const [hasGesture, setHasGesture] = useState(() => globalGestureToken !== null);
  const [gestureToken, setGestureToken] = useState<GestureToken | null>(() => globalGestureToken);
  const listenersAttachedRef = useRef(false);

  // Capture gesture and create token
  const captureGesture = useCallback((event?: Event): GestureToken => {
    // If already captured, return existing token
    if (globalGestureToken) return globalGestureToken;

    const token: GestureToken = {
      id: generateTokenId(),
      timestamp: Date.now(),
      eventType: event?.type || 'manual',
      isTrusted: event?.isTrusted ?? false,
    };

    globalGestureToken = token;
    setGestureToken(token);
    setHasGesture(true);

    // Resolve any waiting promises
    gesturePromiseResolvers.forEach(resolve => resolve(token));
    gesturePromiseResolvers = [];

    console.log('[UserGestureGate] Gesture captured:', token.eventType);
    return token;
  }, []);

  // Wait for user gesture
  const awaitUserGesture = useCallback((): Promise<GestureToken> => {
    // If already have gesture, resolve immediately
    if (globalGestureToken) {
      return Promise.resolve(globalGestureToken);
    }

    // Create promise that resolves on gesture
    return new Promise<GestureToken>((resolve) => {
      gesturePromiseResolvers.push(resolve);
    });
  }, []);

  // Get current state (synchronous)
  const getGestureState = useCallback(() => ({
    hasGesture: globalGestureToken !== null,
    token: globalGestureToken,
  }), []);

  // Attach global gesture listeners
  useEffect(() => {
    if (!isBrowser() || listenersAttachedRef.current) return;
    listenersAttachedRef.current = true;

    // Events that count as user gestures for browser APIs
    const gestureEvents = ['touchstart', 'touchend', 'click', 'keydown', 'mousedown'];

    const handleGesture = (event: Event) => {
      if (globalGestureToken) return; // Already captured
      
      captureGesture(event);
      
      // Remove listeners after first gesture
      gestureEvents.forEach(eventType => {
        document.removeEventListener(eventType, handleGesture, { capture: true });
      });
    };

    // Attach listeners with capture phase
    gestureEvents.forEach(eventType => {
      document.addEventListener(eventType, handleGesture, { capture: true, passive: true });
    });

    return () => {
      gestureEvents.forEach(eventType => {
        document.removeEventListener(eventType, handleGesture, { capture: true });
      });
    };
  }, [captureGesture]);

  const value: UserGestureGateContextType = {
    hasGesture,
    gestureToken,
    awaitUserGesture,
    captureGesture,
    getGestureState,
  };

  return (
    <UserGestureGateContext.Provider value={value}>
      {children}
    </UserGestureGateContext.Provider>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * User Gesture Gate Hook
 * 
 * Tracks user gestures required for iOS Safari media initialization.
 * 
 * @example
 * const { hasGesture, awaitUserGesture, gestureToken } = useUserGestureGate();
 * 
 * // In an event handler:
 * const handlePlay = async () => {
 *   const token = await awaitUserGesture();
 *   await audioAdapter.initializeAudio({ gestureToken: token });
 * };
 */
export function useUserGestureGate(): UserGestureGateContextType {
  const context = useContext(UserGestureGateContext);
  
  if (!context) {
    // Fallback for usage outside provider (should not happen in production)
    console.warn('[useUserGestureGate] Used outside provider, returning fallback');
    return {
      hasGesture: globalGestureToken !== null,
      gestureToken: globalGestureToken,
      awaitUserGesture: async () => {
        if (globalGestureToken) return globalGestureToken;
        return new Promise(resolve => gesturePromiseResolvers.push(resolve));
      },
      captureGesture: () => {
        if (globalGestureToken) return globalGestureToken;
        const token: GestureToken = {
          id: generateTokenId(),
          timestamp: Date.now(),
          eventType: 'fallback',
          isTrusted: false,
        };
        globalGestureToken = token;
        gesturePromiseResolvers.forEach(r => r(token));
        gesturePromiseResolvers = [];
        return token;
      },
      getGestureState: () => ({ hasGesture: globalGestureToken !== null, token: globalGestureToken }),
    };
  }
  
  return context;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITY EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Check if gesture has been captured (synchronous, no hook needed) */
export function hasUserGesture(): boolean {
  return globalGestureToken !== null;
}

/** Get gesture token if available (synchronous, no hook needed) */
export function getGestureToken(): GestureToken | null {
  return globalGestureToken;
}

export default useUserGestureGate;
