/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — MOBILE VIEWPORT FIX                                      │
 * │                                                                             │
 * │ PROBLEM: Mobile browsers have dynamic URL bars that affect 100vh height    │
 * │ SOLUTION: Set --vh CSS custom property to actual viewport height           │
 * │                                                                             │
 * │ MUST RUN: Before first paint, in main.tsx                                  │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

/**
 * Initialize viewport fix for mobile browsers.
 * Sets CSS custom properties for actual viewport height.
 * 
 * Usage in CSS:
 *   height: calc(var(--vh, 1vh) * 100);
 */
export function initViewportFix(): void {
  // Guard: only run in browser
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const setViewportHeight = (): void => {
    try {
      // Use visualViewport for most accurate height (especially with iOS keyboard)
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const vh = viewportHeight * 0.01;
      
      // Set --vh CSS custom property
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Also set --svh for "small viewport height" (minimum height)
      // On mobile, this is the height with address bar visible
      const svh = Math.min(window.innerHeight, window.screen.height) * 0.01;
      document.documentElement.style.setProperty('--svh', `${svh}px`);
      
      // Set --keyboard-inset for iOS keyboard offset
      if (window.visualViewport) {
        const keyboardHeight = window.innerHeight - window.visualViewport.height;
        document.documentElement.style.setProperty('--keyboard-inset-height', `${Math.max(0, keyboardHeight)}px`);
      }
    } catch {
      // Silent fail - CSS will use fallback vh units
    }
  };

  // Set immediately
  setViewportHeight();

  // Update on resize (debounced to prevent thrashing)
  let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  
  const handleResize = (): void => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(setViewportHeight, 100);
  };

  window.addEventListener('resize', handleResize, { passive: true });
  
  // Use visualViewport resize event (critical for iOS keyboard)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setViewportHeight, { passive: true });
    window.visualViewport.addEventListener('scroll', setViewportHeight, { passive: true });
  }
  
  // Also update on orientation change (critical for mobile)
  window.addEventListener('orientationchange', () => {
    // Delay slightly to let the browser finish the rotation
    setTimeout(setViewportHeight, 200);
  }, { passive: true });

  // Update when page becomes visible (handles tab switching)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      setViewportHeight();
    }
  }, { passive: true });
}

/**
 * Check if device is likely mobile based on viewport
 */
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // Consider mobile if width <= 768px OR if touch is primary input
    return (
      window.innerWidth <= 768 ||
      window.matchMedia('(pointer: coarse)').matches
    );
  } catch {
    return false;
  }
}

/**
 * Get safe viewport dimensions that work on mobile
 */
export function getSafeViewport(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 1920, height: 1080 }; // Fallback for SSR
  }

  try {
    return {
      width: window.innerWidth || document.documentElement.clientWidth || 1920,
      height: window.innerHeight || document.documentElement.clientHeight || 1080,
    };
  } catch {
    return { width: 1920, height: 1080 };
  }
}
