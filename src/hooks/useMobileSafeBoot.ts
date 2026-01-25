/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — MOBILE SAFE BOOT                                         │
 * │                                                                             │
 * │ Device profile detection with NO side effects at init time.                │
 * │ All capability detection is PURE (read-only, try/catch guarded).           │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * PURPOSE:
 * - Produce a safe device profile at boot time
 * - NEVER trigger AudioContext/MediaDevices/WebGL at init
 * - Pure detection only (read-only operations)
 * - Provide consistent device fingerprint for conditional rendering
 * 
 * RULES:
 * 1. All detection wrapped in try/catch
 * 2. NO side effects (no API initialization)
 * 3. Returns same result for same device (pure)
 * 4. Safe to call during SSR (returns safe defaults)
 */

import { useMemo } from 'react';
import { isBrowser, isIOS, isAndroid, isMobile, isIOSSafari, isTouchDevice } from '@/lib/safeBrowser';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface DeviceProfile {
  /** Environment detection */
  environment: {
    isBrowser: boolean;
    isSSR: boolean;
  };
  
  /** Platform detection */
  platform: {
    isIOS: boolean;
    isIOSSafari: boolean;
    isAndroid: boolean;
    isMobile: boolean;
    isDesktop: boolean;
    isTouch: boolean;
  };
  
  /** Browser detection */
  browser: {
    isChrome: boolean;
    isSafari: boolean;
    isFirefox: boolean;
    isEdge: boolean;
  };
  
  /** Performance hints (pure detection, no API init) */
  performance: {
    isLowEnd: boolean;
    prefersReducedMotion: boolean;
    prefersReducedData: boolean;
    hardwareConcurrency: number;
    deviceMemory: number | null;
  };
  
  /** Capability SUPPORT detection (NOT init) */
  capabilities: {
    hasWebAudio: boolean;
    hasMediaDevices: boolean;
    hasWebGL: boolean;
    hasServiceWorker: boolean;
    hasLocalStorage: boolean;
    hasIntersectionObserver: boolean;
    hasResizeObserver: boolean;
  };
  
  /** PWA context */
  pwa: {
    isStandalone: boolean;
    isInstallable: boolean;
  };
  
  /** Network hints */
  network: {
    isOnline: boolean;
    effectiveType: string | null;
    saveData: boolean;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SAFE DETECTION HELPERS (Pure, no side effects)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function detectBrowser(): { isChrome: boolean; isSafari: boolean; isFirefox: boolean; isEdge: boolean } {
  if (!isBrowser()) return { isChrome: false, isSafari: false, isFirefox: false, isEdge: false };
  try {
    const ua = navigator.userAgent;
    return {
      isChrome: /Chrome/.test(ua) && !/Edg/.test(ua) && !/OPR/.test(ua),
      isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
      isFirefox: /Firefox/.test(ua),
      isEdge: /Edg/.test(ua),
    };
  } catch {
    return { isChrome: false, isSafari: false, isFirefox: false, isEdge: false };
  }
}

function detectPerformanceHints(): { isLowEnd: boolean; prefersReducedMotion: boolean; prefersReducedData: boolean; hardwareConcurrency: number; deviceMemory: number | null } {
  if (!isBrowser()) {
    return { isLowEnd: false, prefersReducedMotion: false, prefersReducedData: false, hardwareConcurrency: 4, deviceMemory: null };
  }
  
  try {
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const deviceMemory = (navigator as any).deviceMemory || null;
    const connection = (navigator as any).connection;
    
    let prefersReducedMotion = false;
    try {
      prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch { /* ignore */ }
    
    let prefersReducedData = false;
    let effectiveType: string | null = null;
    if (connection) {
      prefersReducedData = connection.saveData === true;
      effectiveType = connection.effectiveType;
    }
    
    // Low-end device heuristics
    const isLowEnd = 
      hardwareConcurrency < 4 ||
      (deviceMemory !== null && deviceMemory < 4) ||
      effectiveType === 'slow-2g' || effectiveType === '2g';
    
    return { isLowEnd, prefersReducedMotion, prefersReducedData, hardwareConcurrency, deviceMemory };
  } catch {
    return { isLowEnd: false, prefersReducedMotion: false, prefersReducedData: false, hardwareConcurrency: 4, deviceMemory: null };
  }
}

function detectCapabilities(): { hasWebAudio: boolean; hasMediaDevices: boolean; hasWebGL: boolean; hasServiceWorker: boolean; hasLocalStorage: boolean; hasIntersectionObserver: boolean; hasResizeObserver: boolean } {
  if (!isBrowser()) {
    return { hasWebAudio: false, hasMediaDevices: false, hasWebGL: false, hasServiceWorker: false, hasLocalStorage: false, hasIntersectionObserver: false, hasResizeObserver: false };
  }
  
  // PURE DETECTION ONLY - NO API INITIALIZATION
  let hasWebAudio = false;
  try {
    hasWebAudio = !!(window.AudioContext || (window as any).webkitAudioContext);
  } catch { /* ignore */ }
  
  let hasMediaDevices = false;
  try {
    hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  } catch { /* ignore */ }
  
  let hasWebGL = false;
  try {
    const canvas = document.createElement('canvas');
    hasWebGL = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    // Clean up immediately - don't hold references
  } catch { /* ignore */ }
  
  let hasServiceWorker = false;
  try {
    hasServiceWorker = 'serviceWorker' in navigator;
  } catch { /* ignore */ }
  
  let hasLocalStorage = false;
  try {
    const test = '__lucy_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    hasLocalStorage = true;
  } catch { /* ignore */ }
  
  let hasIntersectionObserver = false;
  try {
    hasIntersectionObserver = 'IntersectionObserver' in window;
  } catch { /* ignore */ }
  
  let hasResizeObserver = false;
  try {
    hasResizeObserver = 'ResizeObserver' in window;
  } catch { /* ignore */ }
  
  return { hasWebAudio, hasMediaDevices, hasWebGL, hasServiceWorker, hasLocalStorage, hasIntersectionObserver, hasResizeObserver };
}

function detectPWA(): { isStandalone: boolean; isInstallable: boolean } {
  if (!isBrowser()) return { isStandalone: false, isInstallable: false };
  
  try {
    let isStandalone = false;
    try {
      isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone === true ||
        window.location.search.includes('source=pwa');
    } catch { /* ignore */ }
    
    // PWA installable on most modern browsers
    const isInstallable = 'serviceWorker' in navigator;
    
    return { isStandalone, isInstallable };
  } catch {
    return { isStandalone: false, isInstallable: false };
  }
}

function detectNetwork(): { isOnline: boolean; effectiveType: string | null; saveData: boolean } {
  if (!isBrowser()) return { isOnline: true, effectiveType: null, saveData: false };
  
  try {
    const connection = (navigator as any).connection;
    return {
      isOnline: navigator.onLine,
      effectiveType: connection?.effectiveType || null,
      saveData: connection?.saveData === true,
    };
  } catch {
    return { isOnline: true, effectiveType: null, saveData: false };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CREATE DEVICE PROFILE (Called once, cached via useMemo)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function createDeviceProfile(): DeviceProfile {
  const browser = detectBrowser();
  const performance = detectPerformanceHints();
  const capabilities = detectCapabilities();
  const pwa = detectPWA();
  const network = detectNetwork();
  
  return {
    environment: {
      isBrowser: isBrowser(),
      isSSR: !isBrowser(),
    },
    platform: {
      isIOS: isIOS(),
      isIOSSafari: isIOSSafari(),
      isAndroid: isAndroid(),
      isMobile: isMobile(),
      isDesktop: isBrowser() && !isMobile(),
      isTouch: isTouchDevice(),
    },
    browser,
    performance,
    capabilities,
    pwa,
    network,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Mobile Safe Boot Hook
 * 
 * Returns a device profile with NO side effects.
 * All detection is pure (read-only).
 * Safe to call during SSR and on all platforms.
 * 
 * @example
 * const { device } = useMobileSafeBoot();
 * if (device.platform.isIOSSafari) {
 *   // Handle iOS Safari specifics
 * }
 */
export function useMobileSafeBoot(): { device: DeviceProfile } {
  // Create once per component mount, never changes
  const device = useMemo(() => createDeviceProfile(), []);
  
  return { device };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTED UTILITY (For non-hook contexts)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Get device profile (non-hook version) */
export function getDeviceProfile(): DeviceProfile {
  return createDeviceProfile();
}

export default useMobileSafeBoot;
