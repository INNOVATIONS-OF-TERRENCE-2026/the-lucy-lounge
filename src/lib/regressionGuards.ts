/**
 * THE LUCY LOUNGE - Regression Guards
 * 
 * Runtime guards to prevent regressions:
 * - Route guard: Prevent 404s on known routes
 * - Sidebar guard: Ensure sidebar references valid routes
 * - Listening mode guard: Spotify failures don't break UI
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Known valid routes in The Lucy Lounge
export const VALID_ROUTES = [
  '/',
  '/auth',
  '/chat',
  '/media',
  '/features',
  '/pricing',
  '/tools',
  '/tools/marketplace',
  '/creator-studio',
  '/launch',
  '/listening-mode',
  '/listening/explore',
  '/studios',
  '/studios/ai',
  '/studios/audio',
  '/studios/dev',
  '/guides/business-credit-repair',
  '/guides/sba-loan-complete-guide',
  '/guides/funding-for-women-entrepreneurs',
  '/about',
  '/about/terrence-milliner',
  '/blog',
  '/testimonials',
  '/press',
  '/editorial-standards',
  '/contact',
  '/rooms',
  '/neural',
  '/dream',
  '/vision',
  '/silent-room',
  '/timeline',
  '/command',
  '/quantum',
  '/presence',
  '/events',
  '/arcade',
  '/admin',
  '/analytics',
];

// Dynamic route patterns (with parameters)
export const DYNAMIC_ROUTE_PATTERNS = [
  /^\/blog\/[^/]+$/,           // /blog/:slug
  /^\/room\/[^/]+$/,           // /room/:roomId
  /^\/shared\/[^/]+$/,         // /shared/:token
  /^\/arcade\/[^/]+$/,         // /arcade/:gameId
];

// Legacy route redirects
export const LEGACY_ROUTE_REDIRECTS: Record<string, string> = {
  '/lounge': '/',
  '/home': '/',
  '/login': '/auth',
  '/signup': '/auth',
  '/register': '/auth',
  '/listen': '/listening-mode',
  '/listening': '/listening-mode',
  '/explore': '/listening/explore',
  '/studio': '/studios',
  '/ai-studio': '/studios/ai',
  '/audio-studio': '/studios/audio',
  '/dev-studio': '/studios/dev',
  '/games': '/arcade',
  '/play': '/arcade',
  '/settings': '/chat', // Settings accessible from chat
  '/profile': '/chat',  // Profile accessible from chat
};

/**
 * Check if a path is a valid route
 */
export function isValidRoute(path: string): boolean {
  // Check static routes
  if (VALID_ROUTES.includes(path)) {
    return true;
  }

  // Check dynamic patterns
  for (const pattern of DYNAMIC_ROUTE_PATTERNS) {
    if (pattern.test(path)) {
      return true;
    }
  }

  return false;
}

/**
 * Get redirect for legacy route
 */
export function getLegacyRedirect(path: string): string | null {
  return LEGACY_ROUTE_REDIRECTS[path] || null;
}

/**
 * Route Guard Hook
 * Handles legacy route redirects and logs 404s
 */
export function useRouteGuard() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;

    // Check for legacy redirects
    const redirect = getLegacyRedirect(currentPath);
    if (redirect) {
      console.log(`[RouteGuard] Redirecting legacy route: ${currentPath} → ${redirect}`);
      navigate(redirect, { replace: true });
      return;
    }

    // Log invalid routes (for monitoring)
    if (!isValidRoute(currentPath)) {
      console.warn(`[RouteGuard] Unknown route accessed: ${currentPath}`);
      // Don't redirect - let the app show its default 404 handling
    }
  }, [location.pathname, navigate]);
}

/**
 * Sidebar Guard - Validates sidebar links
 */
export function validateSidebarLinks(links: Array<{ path: string; label: string }>): Array<{ path: string; label: string; valid: boolean }> {
  return links.map(link => ({
    ...link,
    valid: isValidRoute(link.path) || getLegacyRedirect(link.path) !== null,
  }));
}

/**
 * Listening Mode Guard
 * Ensures Spotify failures don't break the UI
 */
export interface ListeningModeState {
  isSpotifyAvailable: boolean;
  isEmbedMode: boolean;
  errorMessage: string | null;
}

export function createListeningModeGuard(): ListeningModeState {
  // Default to embed mode (always works)
  return {
    isSpotifyAvailable: true,  // Embed mode is always available
    isEmbedMode: true,         // Default to embed mode
    errorMessage: null,
  };
}

export function handleSpotifyError(error: Error): ListeningModeState {
  console.warn('[ListeningModeGuard] Spotify error (graceful fallback):', error.message);
  
  return {
    isSpotifyAvailable: true,  // Embed mode still works
    isEmbedMode: true,
    errorMessage: 'Full Spotify features unavailable. Using embed mode.',
  };
}

/**
 * Safe navigation helper
 * Validates route before navigation
 */
export function createSafeNavigate(navigate: ReturnType<typeof useNavigate>) {
  return (to: string, options?: { replace?: boolean }) => {
    // Check for legacy redirect first
    const redirect = getLegacyRedirect(to);
    if (redirect) {
      navigate(redirect, { ...options, replace: true });
      return;
    }

    // Validate route
    if (!isValidRoute(to)) {
      console.warn(`[SafeNavigate] Attempted navigation to unknown route: ${to}`);
      // Navigate anyway - let the app handle it
    }

    navigate(to, options);
  };
}

/**
 * Global error boundary helper
 */
export function isNavigationError(error: Error): boolean {
  return error.message.includes('No route matches') ||
         error.message.includes('404') ||
         error.message.includes('not found');
}
