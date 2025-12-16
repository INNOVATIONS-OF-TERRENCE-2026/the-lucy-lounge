/**
 * Feature flags for route-scoped safety fuses.
 * Used for emergency disabling of modules that cause crashes.
 */

const SAFE_MODE_PARAM = 'safe';

/**
 * Check if safe mode is enabled via URL query parameter.
 * When ?safe=1 is present, heavy features are disabled.
 */
export const isSafeMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get(SAFE_MODE_PARAM) === '1';
  } catch {
    return false;
  }
};

/**
 * Check if Spotify is enabled for a specific route.
 * Acts as an emergency fuse - returns false only if Spotify is causing crashes.
 * Currently Spotify is allowed everywhere unless safe mode is active.
 */
export const isSpotifyEnabledForRoute = (route: string): boolean => {
  if (isSafeMode()) return false;
  // Spotify is enabled for all routes by default
  // Change to false for specific routes if they crash due to Spotify
  return true;
};

/**
 * Check if heavy animations should be enabled.
 * Returns false in safe mode to provide minimal UI.
 */
export const isAnimationsEnabled = (): boolean => {
  return !isSafeMode();
};

/**
 * Check if weather effects should be enabled.
 * Returns false in safe mode.
 */
export const isWeatherEffectsEnabled = (): boolean => {
  return !isSafeMode();
};
