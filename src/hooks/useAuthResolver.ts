/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — AUTH RESOLVER HOOK                                       │
 * │                                                                             │
 * │ DO NOT REMOVE: This is the SINGLE SOURCE OF TRUTH for auth resolution      │
 * │ DO NOT MODIFY: Governed by /docs/MOBILE_RUNTIME_CONTRACT.md                │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * GUARANTEES:
 * 1. `resolved` will ALWAYS become true (never hang forever)
 * 2. `session` will be either valid OR null (never undefined after resolution)
 * 3. Maximum wait time: 3 seconds, then force-resolves as unauthenticated
 * 
 * USAGE:
 * ```tsx
 * const { session, user, resolved, error } = useAuthResolver();
 * if (!resolved) return <LoadingScreen />;
 * if (!user) return <LoginPrompt />;
 * return <AuthenticatedContent />;
 * ```
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/** Maximum time to wait for auth resolution before forcing fallback */
const AUTH_TIMEOUT_MS = 3000;

/** DEV-ONLY logging prefix */
const LOG_PREFIX = '[AUTH_RESOLVER]';

interface AuthResolverState {
  /** Current session (null if not authenticated) */
  session: Session | null;
  /** Current user (null if not authenticated) */
  user: User | null;
  /** Whether auth check has completed (GUARANTEED to become true) */
  resolved: boolean;
  /** Whether auth timed out (forced to null state) */
  timedOut: boolean;
  /** Any error that occurred during auth check */
  error: Error | null;
  /** The auth event that triggered the last state change */
  lastEvent: AuthChangeEvent | null;
}

interface UseAuthResolverReturn extends AuthResolverState {
  /** Force re-check auth state */
  refresh: () => Promise<void>;
  /** Sign out and clear session */
  signOut: () => Promise<void>;
}

/**
 * Single source of truth for Supabase auth resolution.
 * 
 * NEVER hangs forever. Guaranteed to resolve within AUTH_TIMEOUT_MS.
 * 
 * CRITICAL: All auth logic is INSIDE the useEffect to avoid stale closures.
 * The onAuthStateChange callback will always have fresh references.
 */
export function useAuthResolver(): UseAuthResolverReturn {
  const [state, setState] = useState<AuthResolverState>({
    session: null,
    user: null,
    resolved: false,
    timedOut: false,
    error: null,
    lastEvent: null,
  });

  const mountedRef = useRef(true);
  const resolvedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN AUTH EFFECT - ALL LOGIC INSIDE TO PREVENT STALE CLOSURES
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    mountedRef.current = true;
    let localResolved = false; // Local flag to prevent race conditions

    /**
     * Mark auth as resolved with given session.
     * This function is INSIDE the effect to avoid stale closures.
     */
    const resolveAuth = (
      session: Session | null,
      event: AuthChangeEvent | null = null,
      error: Error | null = null,
      timedOut = false
    ) => {
      if (!mountedRef.current) return;

      // If already resolved, just update session/user (for subsequent auth changes)
      if (localResolved && resolvedRef.current && !timedOut) {
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          lastEvent: event ?? prev.lastEvent,
          error: error ?? prev.error,
        }));
        return;
      }

      // Clear timeout if pending
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Mark as resolved
      localResolved = true;
      resolvedRef.current = true;

      if (import.meta.env.DEV) {
        console.info(LOG_PREFIX, timedOut ? 'TIMEOUT - forcing resolution' : 'Resolved', {
          hasSession: !!session,
          event,
          timedOut,
          error: error?.message,
        });
      }

      setState({
        session,
        user: session?.user ?? null,
        resolved: true,
        timedOut,
        error,
        lastEvent: event,
      });
    };

    /**
     * Force timeout - resolve as unauthenticated.
     * This is the ESCAPE HATCH that prevents infinite loading.
     */
    const forceTimeout = () => {
      if (localResolved || resolvedRef.current) return;

      console.warn(LOG_PREFIX, `Auth did not resolve within ${AUTH_TIMEOUT_MS}ms. Forcing fallback state.`);

      resolveAuth(null, null, new Error('Auth timeout'), true);
    };

    /**
     * Check current session.
     */
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!mountedRef.current) return;

        if (error) {
          console.error(LOG_PREFIX, 'getSession error:', error);
          resolveAuth(null, 'INITIAL_SESSION' as AuthChangeEvent, error as Error);
          return;
        }

        resolveAuth(data.session, 'INITIAL_SESSION' as AuthChangeEvent);
      } catch (err) {
        if (!mountedRef.current) return;
        console.error(LOG_PREFIX, 'Session check failed:', err);
        resolveAuth(null, null, err instanceof Error ? err : new Error(String(err)));
      }
    };

    // Start the hard timeout (ESCAPE HATCH - guarantees we never hang)
    timeoutRef.current = setTimeout(forceTimeout, AUTH_TIMEOUT_MS);

    // Check session immediately
    checkSession();

    // Subscribe to auth changes - the callback has fresh references to resolveAuth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (!mountedRef.current) return;

        if (import.meta.env.DEV) {
          console.info(LOG_PREFIX, 'Auth state change:', event, { hasSession: !!session });
        }

        // This resolveAuth is the FRESH one from this effect closure
        resolveAuth(session, event);
      }
    );

    return () => {
      mountedRef.current = false;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      subscription.unsubscribe();
    };
  }, []); // Empty deps is correct - all functions are INSIDE the effect

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTERNAL API METHODS (safe to use useCallback since they don't affect effect)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Refresh auth state manually.
   */
  const refresh = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (!mountedRef.current) return;

      if (error) {
        setState(prev => ({ ...prev, error: error as Error }));
        return;
      }

      setState(prev => ({
        ...prev,
        session: data.session,
        user: data.session?.user ?? null,
        error: null,
      }));
    } catch (err) {
      if (!mountedRef.current) return;
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
    }
  }, []);

  /**
   * Sign out and clear session.
   */
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      if (!mountedRef.current) return;

      setState(prev => ({
        ...prev,
        session: null,
        user: null,
        lastEvent: 'SIGNED_OUT',
        error: null,
      }));
    } catch (err) {
      console.error(LOG_PREFIX, 'Sign out error:', err);
      // Still clear local state even if server call fails
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          session: null,
          user: null,
          error: err instanceof Error ? err : new Error(String(err)),
        }));
      }
    }
  }, []);

  return {
    ...state,
    refresh,
    signOut,
  };
}

export default useAuthResolver;
