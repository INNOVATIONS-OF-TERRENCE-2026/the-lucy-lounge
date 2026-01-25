/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — MEDIA POLICY                                             │
 * │                                                                             │
 * │ Single source of truth for what is allowed on load vs after gesture.       │
 * │ DO NOT MODIFY: Governed by /docs/MEDIA_GESTURE_POLICY.md                   │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * PURPOSE:
 * - Define which APIs require user gesture
 * - Enforce gesture requirements at runtime
 * - Provide policy check helpers
 * - Document browser-specific quirks
 * 
 * RULES:
 * 1. This file is the AUTHORITATIVE source for media policy
 * 2. All media code MUST consult this policy before init
 * 3. NO exceptions - even for "quick fixes"
 */

import { GestureToken, hasUserGesture, getGestureToken } from '@/hooks/useUserGestureGate';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POLICY DEFINITIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * APIs that can be DETECTED at any time (read-only check)
 * These are safe because they don't initialize resources
 */
export const SAFE_AT_LOAD = [
  'check-AudioContext-support',
  'check-MediaDevices-support',
  'check-WebGL-support',
  'check-SpeechRecognition-support',
  'check-SpeechSynthesis-support',
  'check-localStorage-support',
  'check-serviceWorker-support',
  'read-navigator-properties',
  'read-screen-properties',
  'read-matchMedia-queries',
] as const;

/**
 * APIs that REQUIRE user gesture before initialization
 * CRITICAL: These will crash iOS Safari if called at load
 */
export const REQUIRES_GESTURE = [
  'AudioContext-create',
  'AudioContext-resume',
  'MediaDevices-getUserMedia',
  'MediaDevices-getDisplayMedia',
  'video-play',
  'audio-play',
  'SpeechRecognition-start',
  'Notification-requestPermission',
  'Geolocation-requestPermission',
  'camera-access',
  'microphone-access',
  'WebGL-context-create', // On some mobile browsers
] as const;

/**
 * APIs that should be DEFERRED until needed (lazy init)
 * Not strictly gesture-gated but resource-intensive
 */
export const SHOULD_DEFER = [
  'heavy-WebGL-init',
  'video-preload',
  'audio-buffer-decode',
  'worker-init',
  'wasm-init',
] as const;

export type SafeAtLoadAPI = typeof SAFE_AT_LOAD[number];
export type RequiresGestureAPI = typeof REQUIRES_GESTURE[number];
export type ShouldDeferAPI = typeof SHOULD_DEFER[number];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POLICY ENFORCEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class MediaPolicyViolation extends Error {
  constructor(
    public api: string,
    message: string
  ) {
    super(`[MediaPolicy] ${message}`);
    this.name = 'MediaPolicyViolation';
  }
}

/**
 * Check if an API is safe to call at load time
 */
export function isSafeAtLoad(api: string): boolean {
  return (SAFE_AT_LOAD as readonly string[]).includes(api);
}

/**
 * Check if an API requires user gesture
 */
export function requiresGesture(api: string): boolean {
  return (REQUIRES_GESTURE as readonly string[]).includes(api);
}

/**
 * Check if an API should be deferred
 */
export function shouldDefer(api: string): boolean {
  return (SHOULD_DEFER as readonly string[]).includes(api);
}

/**
 * Enforce gesture requirement for an API
 * @throws MediaPolicyViolation if gesture not captured
 */
export function enforceGesturePolicy(api: RequiresGestureAPI): GestureToken {
  if (!requiresGesture(api)) {
    // Not a gesture-required API, return dummy token
    return {
      id: 'policy-bypass',
      timestamp: Date.now(),
      eventType: 'not-required',
      isTrusted: true,
    };
  }

  const token = getGestureToken();
  if (!token) {
    throw new MediaPolicyViolation(
      api,
      `API "${api}" requires user gesture before initialization. ` +
      `Wrap your initialization in a click/touch handler or use useDeferredCapabilityInit().`
    );
  }

  return token;
}

/**
 * Check if gesture requirement is satisfied (non-throwing)
 */
export function canCallAPI(api: string): boolean {
  if (isSafeAtLoad(api)) return true;
  if (!requiresGesture(api)) return true;
  return hasUserGesture();
}

/**
 * Validate gesture token
 */
export function validateGestureToken(token: GestureToken | null | undefined): token is GestureToken {
  if (!token) return false;
  if (!token.id || !token.timestamp) return false;
  // Token expires after 30 minutes (for very long sessions)
  const maxAge = 30 * 60 * 1000;
  return Date.now() - token.timestamp < maxAge;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BROWSER-SPECIFIC POLICY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * iOS Safari specific requirements
 */
export const IOS_SAFARI_POLICY = {
  // AudioContext MUST be created inside user gesture handler
  audioContextInGesture: true,
  // AudioContext MUST be resumed after creation
  audioContextRequiresResume: true,
  // Audio elements need user gesture for play()
  audioElementNeedsGesture: true,
  // Video autoplay only works muted
  videoAutoplayOnlyMuted: true,
  // Silent audio buffer needed to "warm" pipeline
  requiresSilentWarmup: true,
  // MediaDevices needs user gesture
  mediaDevicesNeedsGesture: true,
} as const;

/**
 * Chrome/Edge specific requirements
 */
export const CHROME_POLICY = {
  // AudioContext starts suspended
  audioContextStartsSuspended: true,
  // Resume can happen after creation
  audioContextResumeDeferred: true,
  // Autoplay blocked without gesture
  autoplayBlocked: true,
  // More lenient than Safari
  videoAutoplayMuted: true,
} as const;

/**
 * Firefox specific requirements
 */
export const FIREFOX_POLICY = {
  // Most lenient with audio
  audioContextLenient: true,
  // Still blocks autoplay
  autoplayBlocked: true,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POLICY DOCUMENTATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Human-readable policy documentation
 * Used for error messages and documentation generation
 */
export const POLICY_DOCS: Record<RequiresGestureAPI, string> = {
  'AudioContext-create': 
    'AudioContext must be created inside a user gesture handler (click, touch, keydown). ' +
    'iOS Safari will throw an error if created at page load.',
  
  'AudioContext-resume': 
    'AudioContext.resume() must be called from a user gesture handler. ' +
    'Newly created AudioContexts start in "suspended" state on iOS Safari.',
  
  'MediaDevices-getUserMedia': 
    'getUserMedia (microphone/camera) requires user gesture and explicit permission. ' +
    'Always wrap in a button click handler.',
  
  'MediaDevices-getDisplayMedia': 
    'Screen sharing requires user gesture and explicit permission. ' +
    'Must be initiated from a button click.',
  
  'video-play': 
    'Video play() requires user gesture on mobile browsers. ' +
    'Autoplay only works for muted videos.',
  
  'audio-play': 
    'Audio play() requires user gesture on mobile browsers. ' +
    'Never call from useEffect or setTimeout.',
  
  'SpeechRecognition-start': 
    'Speech recognition requires user gesture and microphone permission. ' +
    'Wrap in a click handler.',
  
  'Notification-requestPermission': 
    'Notification permission must be requested from user gesture. ' +
    'Call from a button click.',
  
  'Geolocation-requestPermission': 
    'Geolocation permission should be requested from user gesture for best UX.',
  
  'camera-access': 
    'Camera access requires explicit user permission via getUserMedia.',
  
  'microphone-access': 
    'Microphone access requires explicit user permission via getUserMedia.',
  
  'WebGL-context-create': 
    'WebGL context creation may require user gesture on some mobile browsers.',
};

/**
 * Get documentation for a gesture-required API
 */
export function getPolicyDoc(api: RequiresGestureAPI): string {
  return POLICY_DOCS[api] || `API "${api}" requires user gesture.`;
}

export default {
  SAFE_AT_LOAD,
  REQUIRES_GESTURE,
  SHOULD_DEFER,
  isSafeAtLoad,
  requiresGesture,
  shouldDefer,
  enforceGesturePolicy,
  canCallAPI,
  validateGestureToken,
  IOS_SAFARI_POLICY,
  CHROME_POLICY,
  FIREFOX_POLICY,
  getPolicyDoc,
};
