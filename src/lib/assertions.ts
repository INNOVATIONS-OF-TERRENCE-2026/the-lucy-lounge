/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — RUNTIME ASSERTIONS                                       │
 * │                                                                             │
 * │ Production-safe assertion utilities for regression prevention.             │
 * │ DO NOT REMOVE: Governed by /docs/PRODUCTION_SPEC_v1.md                     │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * PURPOSE:
 * - Provide clear runtime assertions for development
 * - Catch regressions before they reach production
 * - Generate actionable error messages
 * - React-catchable errors (caught by error boundaries)
 * 
 * RULES:
 * 1. Assertions MUST be React-catchable (extend Error)
 * 2. NEVER throw at module import time
 * 3. Include remediation steps in error messages
 * 4. Log to console in addition to throwing
 */

import { hasUserGesture, getGestureToken } from '@/hooks/useUserGestureGate';
import { isBrowser } from '@/lib/safeBrowser';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ASSERTION ERROR CLASSES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Base assertion error - caught by React error boundaries
 */
export class AssertionError extends Error {
  public readonly assertion: string;
  public readonly remediation: string;
  public readonly timestamp: string;
  
  constructor(assertion: string, message: string, remediation: string) {
    super(`[Assertion Failed] ${assertion}: ${message}`);
    this.name = 'AssertionError';
    this.assertion = assertion;
    this.remediation = remediation;
    this.timestamp = new Date().toISOString();
    
    // Log to console for debugging
    console.error(`[AssertionError] ${assertion}`, {
      message,
      remediation,
      timestamp: this.timestamp,
      stack: this.stack,
    });
  }
}

/**
 * Gesture-related assertion error
 */
export class GestureAssertionError extends AssertionError {
  constructor(api: string) {
    super(
      'GestureRequired',
      `API "${api}" was called before user gesture was captured.`,
      `Wrap the call in a click/touch handler, or use useDeferredCapabilityInit() to queue initialization.`
    );
    this.name = 'GestureAssertionError';
  }
}

/**
 * Environment-related assertion error
 */
export class EnvironmentAssertionError extends AssertionError {
  constructor(variable: string, hint: string) {
    super(
      'EnvironmentInvalid',
      `Required environment variable "${variable}" is missing or invalid.`,
      hint
    );
    this.name = 'EnvironmentAssertionError';
  }
}

/**
 * Media initialization assertion error
 */
export class MediaInitAssertionError extends AssertionError {
  constructor(api: string, context: string) {
    super(
      'MediaInitViolation',
      `Media API "${api}" was initialized at ${context}. This will crash iOS Safari.`,
      `Move initialization to inside a user gesture handler (onClick, onTouchStart). ` +
      `Use useUserGestureGate() to track gestures and useDeferredCapabilityInit() to queue init.`
    );
    this.name = 'MediaInitAssertionError';
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ASSERTION FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Assert user gesture has been captured
 * @throws GestureAssertionError if no gesture
 */
export function assertGestureOrThrow(api: string): void {
  if (!hasUserGesture()) {
    throw new GestureAssertionError(api);
  }
}

/**
 * Assert environment variable exists and is valid
 * @throws EnvironmentAssertionError if invalid
 */
export function assertEnvIsValid(variable: string, value: string | undefined, validator?: (v: string) => boolean): void {
  if (!value || value.trim() === '') {
    throw new EnvironmentAssertionError(
      variable,
      `Set ${variable} in your .env file or environment configuration.`
    );
  }
  
  if (validator && !validator(value)) {
    throw new EnvironmentAssertionError(
      variable,
      `${variable} exists but failed validation. Check the format and value.`
    );
  }
}

/**
 * Assert we are not at boot/mount time (for media init guards)
 * This is checked by detecting if we're in a render phase without gesture
 * 
 * @param api - The media API being initialized
 * @param context - Where the init is happening (e.g., 'useEffect', 'render')
 * @throws MediaInitAssertionError if called without gesture at boot
 */
export function assertNoMediaInitOnBoot(api: string, context: string = 'unknown'): void {
  // If we have a gesture, init is safe
  if (hasUserGesture()) return;
  
  // If we're not in browser, skip (SSR)
  if (!isBrowser()) return;
  
  // Check if we're likely in a boot context
  // This is a heuristic - if no gesture and being called, it's suspicious
  console.warn(
    `[AssertionWarning] ${api} init at ${context} without gesture. ` +
    `This may crash on iOS Safari.`
  );
  
  // In dev mode, throw to catch early
  if (import.meta.env.DEV) {
    throw new MediaInitAssertionError(api, context);
  }
}

/**
 * Assert browser environment is ready
 * Safe for SSR - returns false instead of throwing
 */
export function assertBrowserReady(): boolean {
  return isBrowser();
}

/**
 * Assert storage is available
 * @throws AssertionError if storage unavailable
 */
export function assertStorageAvailable(): void {
  if (!isBrowser()) return; // Skip SSR
  
  try {
    const test = '__lucy_assert_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
  } catch {
    throw new AssertionError(
      'StorageAvailable',
      'localStorage is not available. The app may not function correctly.',
      'Check if you are in private/incognito mode or if storage is blocked.'
    );
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SOFT ASSERTIONS (Log only, don't throw)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Soft assertion - logs warning but doesn't throw
 * Use for non-critical checks in production
 */
export function softAssert(condition: boolean, message: string, context?: Record<string, unknown>): void {
  if (!condition) {
    console.warn(`[SoftAssert] ${message}`, context || {});
  }
}

/**
 * Soft gesture check - logs if no gesture
 */
export function softAssertGesture(api: string): boolean {
  const hasGest = hasUserGesture();
  if (!hasGest) {
    console.warn(`[SoftAssert] ${api} called without user gesture`);
  }
  return hasGest;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEVELOPMENT HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Development-only assertion (no-op in production)
 */
export function devAssert(condition: boolean, message: string): void {
  if (import.meta.env.DEV && !condition) {
    console.error(`[DevAssert] ${message}`);
    throw new AssertionError('DevOnly', message, 'Fix the issue before deploying to production.');
  }
}

/**
 * Log assertion state (for debugging)
 */
export function logAssertionState(): void {
  console.log('[Assertions] Current state:', {
    hasGesture: hasUserGesture(),
    gestureToken: getGestureToken(),
    isBrowser: isBrowser(),
    isDev: import.meta.env.DEV,
  });
}

export default {
  assertGestureOrThrow,
  assertEnvIsValid,
  assertNoMediaInitOnBoot,
  assertBrowserReady,
  assertStorageAvailable,
  softAssert,
  softAssertGesture,
  devAssert,
  logAssertionState,
  AssertionError,
  GestureAssertionError,
  EnvironmentAssertionError,
  MediaInitAssertionError,
};
