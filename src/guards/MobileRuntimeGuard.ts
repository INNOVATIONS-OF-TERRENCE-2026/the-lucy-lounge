/**
 * THE LUCY LOUNGE - MOBILE RUNTIME GUARD
 * 
 * Production-grade runtime validation for mobile environments.
 * Prevents crashes, white screens, and hydration mismatches.
 * 
 * iOS Safari is the PRIMARY runtime - all guards are tuned for its restrictions.
 * 
 * GUARDS:
 * - Boot sequence validation
 * - Media API access control
 * - Storage availability checks
 * - Network state detection
 * - WebView/PWA detection
 * 
 * NEVER call media APIs without a valid gesture token.
 * NEVER access storage during SSR or initial render.
 * ALWAYS provide fallbacks for restricted environments.
 */

// ============================================================================
// TYPES
// ============================================================================

export type MobilePlatform = 'ios' | 'android' | 'other';
export type BrowserEngine = 'webkit' | 'blink' | 'gecko' | 'other';
export type RuntimeEnvironment = 'browser' | 'webview' | 'pwa' | 'ssr';

export interface MobileRuntimeInfo {
  platform: MobilePlatform;
  browser: BrowserEngine;
  environment: RuntimeEnvironment;
  version: { major: number; minor: number };
  isStandalone: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  supportsServiceWorker: boolean;
  supportsWebGL: boolean;
  supportsAudioContext: boolean;
  touchCapable: boolean;
  reducedMotion: boolean;
  prefersColorScheme: 'light' | 'dark' | 'no-preference';
  connectionType: 'wifi' | 'cellular' | '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
}

export interface GuardResult {
  allowed: boolean;
  reason?: string;
  fallback?: () => void;
}

export interface MediaAccessRequest {
  type: 'audio' | 'video' | 'camera' | 'microphone';
  hasGestureToken: boolean;
  isInitialRender: boolean;
}

// ============================================================================
// ENVIRONMENT DETECTION
// ============================================================================

// Cached detection (computed once)
let _cachedRuntimeInfo: MobileRuntimeInfo | null = null;

/**
 * Detect the mobile runtime environment
 * SAFE to call at any time - no side effects
 */
export function detectRuntime(): MobileRuntimeInfo {
  // Return cached if available
  if (_cachedRuntimeInfo) return _cachedRuntimeInfo;

  // SSR guard
  if (typeof window === 'undefined') {
    return {
      platform: 'other',
      browser: 'other',
      environment: 'ssr',
      version: { major: 0, minor: 0 },
      isStandalone: false,
      isSafari: false,
      isChrome: false,
      isFirefox: false,
      supportsServiceWorker: false,
      supportsWebGL: false,
      supportsAudioContext: false,
      touchCapable: false,
      reducedMotion: false,
      prefersColorScheme: 'no-preference',
      connectionType: 'unknown',
    };
  }

  const ua = navigator.userAgent.toLowerCase();
  const vendor = navigator.vendor?.toLowerCase() ?? '';

  // Platform detection
  let platform: MobilePlatform = 'other';
  if (/iphone|ipad|ipod/.test(ua) || (ua.includes('mac') && 'ontouchend' in document)) {
    platform = 'ios';
  } else if (/android/.test(ua)) {
    platform = 'android';
  }

  // Browser detection
  let browser: BrowserEngine = 'other';
  let isSafari = false;
  let isChrome = false;
  let isFirefox = false;

  if (ua.includes('firefox')) {
    browser = 'gecko';
    isFirefox = true;
  } else if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'blink';
    isChrome = true;
  } else if (vendor.includes('apple') || ua.includes('safari')) {
    browser = 'webkit';
    isSafari = true;
  }

  // iOS Chrome/Firefox still use WebKit
  if (platform === 'ios') {
    browser = 'webkit';
    // But they identify as Chrome/Firefox
    if (ua.includes('crios')) isChrome = true;
    if (ua.includes('fxios')) isFirefox = true;
    if (!isChrome && !isFirefox) isSafari = true;
  }

  // Version detection (Safari-focused)
  let version = { major: 0, minor: 0 };
  const versionMatch = ua.match(/version\/(\d+)\.(\d+)/);
  if (versionMatch) {
    version = { major: parseInt(versionMatch[1]), minor: parseInt(versionMatch[2]) };
  }

  // Environment detection
  let environment: RuntimeEnvironment = 'browser';
  
  // Check for standalone (PWA)
  const isStandalone = 
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    (navigator as any).standalone === true ||
    document.referrer.includes('android-app://');

  if (isStandalone) {
    environment = 'pwa';
  } else if (ua.includes('wv') || ua.includes('webview')) {
    environment = 'webview';
  }

  // Feature detection (safe - no initialization)
  const supportsServiceWorker = 'serviceWorker' in navigator;
  const supportsAudioContext = 'AudioContext' in window || 'webkitAudioContext' in window;
  
  // WebGL detection (safe check without creating context)
  let supportsWebGL = false;
  try {
    const canvas = document.createElement('canvas');
    supportsWebGL = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    supportsWebGL = false;
  }

  // Touch capability
  const touchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Media queries (safe in browser)
  let reducedMotion = false;
  let prefersColorScheme: 'light' | 'dark' | 'no-preference' = 'no-preference';
  
  try {
    reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    if (window.matchMedia?.('(prefers-color-scheme: dark)')?.matches) {
      prefersColorScheme = 'dark';
    } else if (window.matchMedia?.('(prefers-color-scheme: light)')?.matches) {
      prefersColorScheme = 'light';
    }
  } catch {
    // matchMedia may throw in some restricted contexts
  }

  // Connection detection
  let connectionType: MobileRuntimeInfo['connectionType'] = 'unknown';
  const connection = (navigator as any).connection;
  if (connection?.effectiveType) {
    connectionType = connection.effectiveType as MobileRuntimeInfo['connectionType'];
  }

  _cachedRuntimeInfo = {
    platform,
    browser,
    environment,
    version,
    isStandalone,
    isSafari,
    isChrome,
    isFirefox,
    supportsServiceWorker,
    supportsWebGL,
    supportsAudioContext,
    touchCapable,
    reducedMotion,
    prefersColorScheme,
    connectionType,
  };

  return _cachedRuntimeInfo;
}

// ============================================================================
// RUNTIME GUARDS
// ============================================================================

/**
 * Check if we're in a safe browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Check if initial render is complete
 * Use this to defer side effects until after hydration
 */
let _hydratedAt: number | null = null;

export function isHydrated(): boolean {
  return _hydratedAt !== null;
}

export function markHydrated(): void {
  if (_hydratedAt === null) {
    _hydratedAt = Date.now();
    console.log('[MobileGuard] Hydration complete at', _hydratedAt);
  }
}

/**
 * Guard: Can we safely access media APIs?
 */
export function guardMediaAccess(request: MediaAccessRequest): GuardResult {
  // Never allow during SSR
  if (!isBrowser()) {
    return { allowed: false, reason: 'SSR environment - no media access' };
  }

  // Never allow during initial render
  if (request.isInitialRender) {
    return { allowed: false, reason: 'Initial render - defer media access' };
  }

  const runtime = detectRuntime();

  // iOS Safari requires gesture for all media
  if (runtime.platform === 'ios' && runtime.isSafari) {
    if (!request.hasGestureToken) {
      return { 
        allowed: false, 
        reason: 'iOS Safari requires user gesture for media access',
      };
    }
  }

  // All Chrome browsers require gesture for audio autoplay
  if (runtime.isChrome && request.type === 'audio' && !request.hasGestureToken) {
    return { 
      allowed: false, 
      reason: 'Chrome requires user gesture for audio playback',
    };
  }

  // Camera/microphone always require gesture
  if ((request.type === 'camera' || request.type === 'microphone') && !request.hasGestureToken) {
    return { 
      allowed: false, 
      reason: 'Camera/microphone access requires user gesture',
    };
  }

  return { allowed: true };
}

/**
 * Guard: Can we safely access localStorage?
 */
export function guardStorageAccess(): GuardResult {
  if (!isBrowser()) {
    return { allowed: false, reason: 'SSR environment - no storage' };
  }

  // Test localStorage availability
  try {
    const testKey = '__lucy_storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return { allowed: true };
  } catch {
    return { 
      allowed: false, 
      reason: 'localStorage unavailable (private browsing or quota exceeded)',
    };
  }
}

/**
 * Guard: Is the network available?
 */
export function guardNetworkAccess(): GuardResult {
  if (!isBrowser()) {
    return { allowed: false, reason: 'SSR environment' };
  }

  if (!navigator.onLine) {
    return { 
      allowed: false, 
      reason: 'Device is offline',
    };
  }

  const runtime = detectRuntime();
  if (runtime.connectionType === 'slow-2g' || runtime.connectionType === '2g') {
    return { 
      allowed: true, 
      reason: 'Slow connection detected - consider reduced payload',
    };
  }

  return { allowed: true };
}

/**
 * Guard: Should we enable animations?
 */
export function guardAnimations(): GuardResult {
  if (!isBrowser()) {
    return { allowed: false, reason: 'SSR environment' };
  }

  const runtime = detectRuntime();

  if (runtime.reducedMotion) {
    return { 
      allowed: false, 
      reason: 'User prefers reduced motion',
    };
  }

  // Disable heavy animations on slow connections
  if (runtime.connectionType === 'slow-2g' || runtime.connectionType === '2g') {
    return { 
      allowed: false, 
      reason: 'Slow connection - reducing animations',
    };
  }

  return { allowed: true };
}

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

export class MobileRuntimeError extends Error {
  constructor(message: string, public readonly guard: string) {
    super(`[MobileRuntimeGuard:${guard}] ${message}`);
    this.name = 'MobileRuntimeError';
  }
}

/**
 * Assert media access is allowed, throw if not
 */
export function assertMediaAccess(request: MediaAccessRequest): void {
  const result = guardMediaAccess(request);
  if (!result.allowed) {
    throw new MobileRuntimeError(result.reason ?? 'Media access denied', 'media');
  }
}

/**
 * Assert storage access is allowed, throw if not
 */
export function assertStorageAccess(): void {
  const result = guardStorageAccess();
  if (!result.allowed) {
    throw new MobileRuntimeError(result.reason ?? 'Storage access denied', 'storage');
  }
}

/**
 * Assert we're in a browser environment
 */
export function assertBrowser(): void {
  if (!isBrowser()) {
    throw new MobileRuntimeError('Browser environment required', 'browser');
  }
}

// ============================================================================
// BOOT SEQUENCE VALIDATOR
// ============================================================================

export interface BootSequenceStep {
  name: string;
  validator: () => boolean;
  required: boolean;
  errorMessage: string;
}

const DEFAULT_BOOT_SEQUENCE: BootSequenceStep[] = [
  {
    name: 'browser',
    validator: isBrowser,
    required: true,
    errorMessage: 'Browser environment required',
  },
  {
    name: 'dom',
    validator: () => isBrowser() && document.readyState !== 'loading',
    required: true,
    errorMessage: 'DOM not ready',
  },
  {
    name: 'storage',
    validator: () => guardStorageAccess().allowed,
    required: false,
    errorMessage: 'Storage unavailable - using memory fallback',
  },
  {
    name: 'network',
    validator: () => guardNetworkAccess().allowed,
    required: false,
    errorMessage: 'Network unavailable - offline mode',
  },
];

/**
 * Validate boot sequence and return status
 */
export function validateBootSequence(
  steps: BootSequenceStep[] = DEFAULT_BOOT_SEQUENCE
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const step of steps) {
    try {
      const passed = step.validator();
      if (!passed) {
        if (step.required) {
          errors.push(`[${step.name}] ${step.errorMessage}`);
        } else {
          warnings.push(`[${step.name}] ${step.errorMessage}`);
        }
      }
    } catch (e) {
      if (step.required) {
        errors.push(`[${step.name}] Validator threw: ${e}`);
      } else {
        warnings.push(`[${step.name}] Validator threw: ${e}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const mobileRuntimeGuard = {
  // Detection
  detectRuntime,
  isBrowser,
  isHydrated,
  markHydrated,

  // Guards
  guardMediaAccess,
  guardStorageAccess,
  guardNetworkAccess,
  guardAnimations,

  // Assertions
  assertMediaAccess,
  assertStorageAccess,
  assertBrowser,

  // Boot sequence
  validateBootSequence,
};

export default mobileRuntimeGuard;
