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

  /**
   * Mark auth as resolved with given session.
   * Clears timeout and prevents duplicate resolution.
   */
  const resolveAuth = useCallback((
    session: Session | null,
    event: AuthChangeEvent | null = null,
    error: Error | null = null,
    timedOut = false
  ) => {
    if (!mountedRef.current) return;
    if (resolvedRef.current && !timedOut) {
      // Already resolved, just update session/user
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
  }, []);

  /**
   * Force timeout - resolve as unauthenticated.
   * This is the ESCAPE HATCH that prevents infinite loading.
   */
  const forceTimeout = useCallback(() => {
    if (resolvedRef.current) return;

    console.warn(LOG_PREFIX, `Auth did not resolve within ${AUTH_TIMEOUT_MS}ms. Forcing fallback state.`);

    resolveAuth(null, null, new Error('Auth timeout'), true);
  }, [resolveAuth]);

  /**
   * Check current session with timeout protection.
   */
  const checkSession = useCallback(async () => {
    try {
      // Race between getSession and timeout
      const sessionPromise = supabase.auth.getSession();
      
      const result = await Promise.race([
        sessionPromise,
        new Promise<{ data: { session: null }, error: Error }>((_, reject) =>
          setTimeout(() => reject(new Error('getSession timeout')), AUTH_TIMEOUT_MS - 500)
        ),
      ]);

      if (!mountedRef.current) return;

      const { data, error } = result as { data: { session: Session | null }, error: Error | null };
      
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
  }, [resolveAuth]);

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

  useEffect(() => {
    mountedRef.current = true;

    // Only initialize once - don't reset on re-renders
    if (resolvedRef.current) return;

    // Start the hard timeout (ESCAPE HATCH)
    timeoutRef.current = setTimeout(forceTimeout, AUTH_TIMEOUT_MS);

    // Start checking session
    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (!mountedRef.current) return;

        if (import.meta.env.DEV) {
          console.info(LOG_PREFIX, 'Auth state change:', event, { hasSession: !!session });
        }

        // Resolve or update based on event
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  return {
    ...state,
    refresh,
    signOut,
  };
}

export default useAuthResolver;
