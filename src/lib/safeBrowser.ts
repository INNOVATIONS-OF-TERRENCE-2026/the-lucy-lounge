/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — SAFE BROWSER API UTILITIES                               │
 * │                                                                             │
 * │ Universal browser compatibility layer for cross-platform operation.        │
 * │ All browser APIs must be accessed through these utilities.                 │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * PURPOSE:
 * - Provide safe access to browser APIs that may not exist on all platforms
 * - Feature detection for progressive enhancement
 * - Graceful fallbacks for unsupported features
 * - SSR-safe guards for window/document/navigator
 * 
 * RULES:
 * 1. NEVER access window/document/navigator directly at module scope
 * 2. ALWAYS use these utilities for browser feature detection
 * 3. NEVER throw - return false/null for unsupported features
 * 4. ALWAYS provide graceful degradation paths
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENVIRONMENT DETECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Check if running in browser (not SSR) */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/** Check if running on iOS Safari */
export function isIOSSafari(): boolean {
  if (!isBrowser()) return false;
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua);
  const notChrome = !/CriOS/.test(ua) && !/Chrome/.test(ua);
  return iOS && webkit && notChrome;
}

/** Check if running on any iOS device */
export function isIOS(): boolean {
  if (!isBrowser()) return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/** Check if running on Android */
export function isAndroid(): boolean {
  if (!isBrowser()) return false;
  return /Android/.test(navigator.userAgent);
}

/** Check if running on mobile device */
export function isMobile(): boolean {
  if (!isBrowser()) return false;
  return isIOS() || isAndroid() || /webOS|BlackBerry|Opera Mini|IEMobile/.test(navigator.userAgent);
}

/** Check if touch device */
export function isTouchDevice(): boolean {
  if (!isBrowser()) return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEATURE DETECTION — Never throw, always return boolean
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Check if WebAudio API is supported */
export function supportsWebAudio(): boolean {
  if (!isBrowser()) return false;
  try {
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  } catch {
    return false;
  }
}

/** Check if MediaDevices API is supported (microphone/camera) */
export function supportsMediaDevices(): boolean {
  if (!isBrowser()) return false;
  try {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  } catch {
    return false;
  }
}

/** Check if WebGL is supported */
export function supportsWebGL(): boolean {
  if (!isBrowser()) return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

/** Check if Clipboard API is supported */
export function supportsClipboard(): boolean {
  if (!isBrowser()) return false;
  try {
    return !!(navigator.clipboard && navigator.clipboard.writeText);
  } catch {
    return false;
  }
}

/** Check if FileSystem Access API is supported */
export function supportsFileSystemAccess(): boolean {
  if (!isBrowser()) return false;
  try {
    return 'showSaveFilePicker' in window;
  } catch {
    return false;
  }
}

/** Check if Speech Recognition is supported */
export function supportsSpeechRecognition(): boolean {
  if (!isBrowser()) return false;
  try {
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  } catch {
    return false;
  }
}

/** Check if Speech Synthesis is supported */
export function supportsSpeechSynthesis(): boolean {
  if (!isBrowser()) return false;
  try {
    return 'speechSynthesis' in window;
  } catch {
    return false;
  }
}

/** Check if Service Worker is supported */
export function supportsServiceWorker(): boolean {
  if (!isBrowser()) return false;
  try {
    return 'serviceWorker' in navigator;
  } catch {
    return false;
  }
}

/** Check if localStorage is available and working */
export function supportsLocalStorage(): boolean {
  if (!isBrowser()) return false;
  try {
    const test = '__lucy_storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/** Check if sessionStorage is available and working */
export function supportsSessionStorage(): boolean {
  if (!isBrowser()) return false;
  try {
    const test = '__lucy_storage_test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/** Check if Intersection Observer is supported */
export function supportsIntersectionObserver(): boolean {
  if (!isBrowser()) return false;
  try {
    return 'IntersectionObserver' in window;
  } catch {
    return false;
  }
}

/** Check if ResizeObserver is supported */
export function supportsResizeObserver(): boolean {
  if (!isBrowser()) return false;
  try {
    return 'ResizeObserver' in window;
  } catch {
    return false;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USER PREFERENCE DETECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Check if user prefers reduced motion */
export function prefersReducedMotion(): boolean {
  if (!isBrowser()) return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/** Check if user prefers dark color scheme */
export function prefersDarkMode(): boolean {
  if (!isBrowser()) return false;
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return true; // Default to dark for Lucy
  }
}

/** Check if user has enabled data saver / reduced data mode */
export function prefersReducedData(): boolean {
  if (!isBrowser()) return false;
  try {
    // Connection API with saveData hint
    const connection = (navigator as any).connection;
    if (connection?.saveData) return true;
    // Slow effective type
    if (connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') return true;
    return false;
  } catch {
    return false;
  }
}

/** Detect if device is likely low-performance */
export function isLowPerformanceDevice(): boolean {
  if (!isBrowser()) return false;
  try {
    // Low CPU cores
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return true;
    // Low memory (if available)
    const memory = (navigator as any).deviceMemory;
    if (memory && memory < 4) return true;
    return false;
  } catch {
    return false;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SAFE BROWSER API ACCESS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Safe localStorage getter */
export function safeLocalStorage(): Storage | null {
  if (!supportsLocalStorage()) return null;
  return localStorage;
}

/** Safe sessionStorage getter */
export function safeSessionStorage(): Storage | null {
  if (!supportsSessionStorage()) return null;
  return sessionStorage;
}

/** Safe localStorage.getItem with fallback */
export function getStorageItem(key: string, fallback: string = ''): string {
  try {
    if (!supportsLocalStorage()) return fallback;
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

/** Safe localStorage.setItem */
export function setStorageItem(key: string, value: string): boolean {
  try {
    if (!supportsLocalStorage()) return false;
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/** Safe localStorage.removeItem */
export function removeStorageItem(key: string): boolean {
  try {
    if (!supportsLocalStorage()) return false;
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VIEWPORT UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Get safe viewport height (handles mobile browser chrome) */
export function getSafeViewportHeight(): number {
  if (!isBrowser()) return 800;
  try {
    // Use visualViewport if available (most accurate on mobile)
    if (window.visualViewport) {
      return window.visualViewport.height;
    }
    return window.innerHeight;
  } catch {
    return 800;
  }
}

/** Get safe viewport width */
export function getSafeViewportWidth(): number {
  if (!isBrowser()) return 1024;
  try {
    if (window.visualViewport) {
      return window.visualViewport.width;
    }
    return window.innerWidth;
  } catch {
    return 1024;
  }
}

/** Set CSS custom property for safe viewport height (call on resize) */
export function updateViewportUnits(): void {
  if (!isBrowser()) return;
  try {
    const vh = getSafeViewportHeight() * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.documentElement.style.setProperty('--svh', `${vh}px`);
  } catch {
    // Ignore
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLIPBOARD UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Safe clipboard write with fallback */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!isBrowser()) return false;
  
  try {
    // Modern Clipboard API
    if (supportsClipboard()) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const result = document.execCommand('copy');
    document.body.removeChild(textArea);
    return result;
  } catch {
    return false;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOWNLOAD UTILITIES (iOS Safari compatible)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Download a blob as a file (works on iOS Safari) */
export function downloadBlob(filename: string, blob: Blob): boolean {
  if (!isBrowser()) return false;
  
  try {
    const url = URL.createObjectURL(blob);
    
    // iOS Safari doesn't support download attribute well
    if (isIOS()) {
      // Open in new tab for iOS - let user long-press to save
      const newTab = window.open(url, '_blank');
      if (newTab) {
        // Clean up after a delay
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        return true;
      }
    }
    
    // Standard download for other browsers
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}

/** Download from URL (works on iOS Safari) */
export async function downloadUrl(filename: string, url: string): Promise<boolean> {
  if (!isBrowser()) return false;
  
  try {
    // For iOS, just open in new tab
    if (isIOS()) {
      window.open(url, '_blank', 'noopener');
      return true;
    }
    
    // For other browsers, fetch and download as blob
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch');
    
    const blob = await response.blob();
    return downloadBlob(filename, blob);
  } catch {
    // Fallback: open in new tab
    try {
      window.open(url, '_blank', 'noopener');
      return true;
    } catch {
      return false;
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MEDIA QUERY UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Subscribe to media query changes (returns cleanup function) */
export function watchMediaQuery(
  query: string,
  callback: (matches: boolean) => void
): () => void {
  if (!isBrowser()) return () => {};
  
  try {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    
    // Initial call
    callback(mq.matches);
    
    // Modern API
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
    
    // Legacy API
    mq.addListener(handler);
    return () => mq.removeListener(handler);
  } catch {
    return () => {};
  }
}

/** Watch for reduced motion preference changes */
export function watchReducedMotion(callback: (prefersReduced: boolean) => void): () => void {
  return watchMediaQuery('(prefers-reduced-motion: reduce)', callback);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DIAGNOSTICS (Safe for error reporting)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Get safe device info for diagnostics (no secrets) */
export function getSafeDiagnostics(): Record<string, unknown> {
  if (!isBrowser()) {
    return { environment: 'server', timestamp: new Date().toISOString() };
  }
  
  try {
    return {
      timestamp: new Date().toISOString(),
      url: window.location.pathname,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      viewport: {
        width: getSafeViewportWidth(),
        height: getSafeViewportHeight(),
      },
      screen: {
        width: window.screen?.width,
        height: window.screen?.height,
      },
      devicePixelRatio: window.devicePixelRatio,
      online: navigator.onLine,
      features: {
        webAudio: supportsWebAudio(),
        mediaDevices: supportsMediaDevices(),
        webGL: supportsWebGL(),
        clipboard: supportsClipboard(),
        localStorage: supportsLocalStorage(),
        serviceWorker: supportsServiceWorker(),
      },
      preferences: {
        reducedMotion: prefersReducedMotion(),
        darkMode: prefersDarkMode(),
        reducedData: prefersReducedData(),
      },
      device: {
        mobile: isMobile(),
        touch: isTouchDevice(),
        ios: isIOS(),
        android: isAndroid(),
        lowPerformance: isLowPerformanceDevice(),
      },
    };
  } catch {
    return { error: 'Failed to collect diagnostics', timestamp: new Date().toISOString() };
  }
}
