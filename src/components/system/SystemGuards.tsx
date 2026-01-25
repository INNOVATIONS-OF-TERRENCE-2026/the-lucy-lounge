/**
 * THE LUCY LOUNGE - System Guards Provider
 * 
 * Combines all runtime guards in a single provider:
 * - First-run user bootstrap
 * - Route guards for legacy redirects
 * - Spotify failure handling
 */

import { useEffect } from 'react';
import { useFirstRunBootstrap } from '@/hooks/useFirstRunBootstrap';
import { useRouteGuard } from '@/lib/regressionGuards';

/**
 * System Guards Hook
 * Call this from a component inside BrowserRouter
 */
export function useSystemGuards() {
  // Bootstrap user on first run
  useFirstRunBootstrap();
  
  // Route guards for legacy redirects
  useRouteGuard();
}

/**
 * System Guards Provider Component
 * Add this inside BrowserRouter to enable all guards
 */
export function SystemGuards({ children }: { children?: React.ReactNode }) {
  useSystemGuards();
  
  useEffect(() => {
    console.log('[SystemGuards] Guards initialized');
  }, []);
  
  return <>{children}</>;
}

export default SystemGuards;
