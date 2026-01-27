/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — PWA UTILITIES                                            │
 * │                                                                             │
 * │ Standalone mode detection and PWA-specific helpers.                        │
 * │ SAFE: Does not modify any business logic or state.                         │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

/**
 * Detect if app is running in standalone/installed PWA mode.
 * 
 * @returns true if running as installed PWA (iOS Home Screen or Android installed)
 */
export function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // iOS Safari standalone mode
    if ('standalone' in window.navigator) {
      return (window.navigator as any).standalone === true;
    }
    
    // Android Chrome / Desktop PWA via display-mode media query
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }
    
    // Fallback: check if running in minimal-ui (some Android browsers)
    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      return true;
    }
    
    // Check referrer for iOS PWA (no referrer when launched from home screen)
    if (document.referrer === '' && window.navigator.userAgent.includes('Safari') && !window.navigator.userAgent.includes('Chrome')) {
      // This is a heuristic, not definitive
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Detect if device is iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  } catch {
    return false;
  }
}

/**
 * Detect if device is Android
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    return /Android/.test(navigator.userAgent);
  } catch {
    return false;
  }
}

/**
 * Check if PWA can be installed (not already installed)
 */
export function canInstallPWA(): boolean {
  if (typeof window === 'undefined') return false;
  
  // If already in standalone mode, can't install again
  if (isStandaloneMode()) return false;
  
  // Check for beforeinstallprompt support (Chromium browsers)
  // This will be set by the browser if the PWA is installable
  return 'BeforeInstallPromptEvent' in window || 
         (isIOS() && !isStandaloneMode()); // iOS can always "Add to Home Screen"
}

/**
 * Get safe area insets (for programmatic access if needed)
 * Returns CSS env() values or fallbacks
 */
export function getSafeAreaInsets(): {
  top: string;
  bottom: string;
  left: string;
  right: string;
} {
  return {
    top: 'env(safe-area-inset-top, 0px)',
    bottom: 'env(safe-area-inset-bottom, 0px)',
    left: 'env(safe-area-inset-left, 0px)',
    right: 'env(safe-area-inset-right, 0px)',
  };
}

/**
 * Apply standalone mode class to document for CSS targeting
 * Call this once on app initialization
 */
export function initPWAMode(): void {
  if (typeof document === 'undefined') return;
  
  try {
    if (isStandaloneMode()) {
      document.documentElement.classList.add('pwa-standalone');
    }
    
    if (isIOS()) {
      document.documentElement.classList.add('is-ios');
    }
    
    if (isAndroid()) {
      document.documentElement.classList.add('is-android');
    }
  } catch {
    // Silent fail
  }
}
