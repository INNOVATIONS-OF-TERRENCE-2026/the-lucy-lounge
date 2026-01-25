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
 * 3. Maximum wait time: 3 seconds, then force-resolves
 * 
 * CRITICAL FIX: This version waits 500ms before declaring "logged out"
 * to handle the race condition where navigation happens before session persists.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/** Maximum time to wait for auth resolution */
const AUTH_TIMEOUT_MS = 3000;

/** Delay before confirming logged out state - handles session persistence race */
const LOGGED_OUT_DELAY_MS = 500;

/** DEV-ONLY logging prefix */
const LOG_PREFIX = '[AUTH_RESOLVER]';

interface AuthResolverState {
  session: Session | null;
  user: User | null;
  resolved: boolean;
  timedOut: boolean;
  error: Error | null;
  lastEvent: AuthChangeEvent | null;
}

interface UseAuthResolverReturn extends AuthResolverState {
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

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

  useEffect(() => {
    mountedRef.current = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let delayedCheckId: ReturnType<typeof setTimeout> | null = null;
    let hasResolved = false;

    console.log(LOG_PREFIX, '🚀 Mounting');

    const resolve = (
      session: Session | null,
      event: string,
      timedOut = false,
      error: Error | null = null
    ) => {
      if (!mountedRef.current || hasResolved) return;
      
      hasResolved = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (delayedCheckId) clearTimeout(delayedCheckId);

      console.log(LOG_PREFIX, '✅ RESOLVED:', {
        hasSession: !!session,
        userId: session?.user?.id?.slice(0, 8),
        event,
        timedOut,
      });

      setState({
        session,
        user: session?.user ?? null,
        resolved: true,
        timedOut,
        error,
        lastEvent: event as AuthChangeEvent,
      });
    };

    const updateSession = (session: Session | null, event: string) => {
      if (!mountedRef.current) return;

      console.log(LOG_PREFIX, '🔄 Update:', event, { hasSession: !!session });

      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        lastEvent: event as AuthChangeEvent,
      }));
    };

    // Subscribe to auth changes FIRST (before checking session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (!mountedRef.current) return;

        console.log(LOG_PREFIX, '🔔 Event:', event, { hasSession: !!session, hasResolved });

        if (!hasResolved) {
          if (session) {
            // Got a session - resolve immediately
            resolve(session, event);
          } else if (event === 'SIGNED_OUT') {
            // Explicit sign out
            resolve(null, event);
          }
        } else {
          // Already resolved - just update
          updateSession(session, event);
        }
      }
    );

    // Check current session
    const checkSession = async () => {
      try {
        console.log(LOG_PREFIX, '🔍 Checking session...');
        const { data, error } = await supabase.auth.getSession();

        if (!mountedRef.current || hasResolved) return;

        console.log(LOG_PREFIX, '🔍 Result:', {
          hasSession: !!data.session,
          userId: data.session?.user?.id?.slice(0, 8),
          error: error?.message,
        });

        if (error) {
          resolve(null, 'ERROR', false, error as Error);
          return;
        }

        if (data.session) {
          resolve(data.session, 'INITIAL_SESSION');
        } else {
          // NO SESSION - but wait before confirming logged out
          // This handles the race where user just signed in but session hasn't persisted yet
          console.log(LOG_PREFIX, `⏳ No session, waiting ${LOGGED_OUT_DELAY_MS}ms...`);
          
          delayedCheckId = setTimeout(async () => {
            if (!mountedRef.current || hasResolved) return;
            
            // Final check
            const { data: finalData } = await supabase.auth.getSession();
            
            if (!mountedRef.current || hasResolved) return;
            
            console.log(LOG_PREFIX, '🔍 Final check:', { hasSession: !!finalData.session });
            resolve(finalData.session, 'FINAL_CHECK');
          }, LOGGED_OUT_DELAY_MS);
        }
      } catch (err) {
        if (!mountedRef.current || hasResolved) return;
        console.error(LOG_PREFIX, 'Error:', err);
        resolve(null, 'ERROR', false, err instanceof Error ? err : new Error(String(err)));
      }
    };

    checkSession();

    // Hard timeout - escape hatch
    timeoutId = setTimeout(async () => {
      if (hasResolved || !mountedRef.current) return;
      
      console.warn(LOG_PREFIX, '⏰ Timeout');
      
      // One final check
      const { data } = await supabase.auth.getSession();
      if (!mountedRef.current || hasResolved) return;
      resolve(data.session, 'TIMEOUT', true);
    }, AUTH_TIMEOUT_MS);

    return () => {
      console.log(LOG_PREFIX, '🧹 Unmounting');
      mountedRef.current = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (delayedCheckId) clearTimeout(delayedCheckId);
      subscription.unsubscribe();
    };
  }, []);

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
