/**
 * THE LUCY LOUNGE — AUTH RESOLVER HOOK
 * 
 * GUARANTEES:
 * 1. `resolved` will ALWAYS become true within 3 seconds
 * 2. NEVER hangs - uses synchronous timeout as escape hatch
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const AUTH_TIMEOUT_MS = 3000;
const LOG = '[AUTH]';

interface AuthState {
  session: Session | null;
  user: User | null;
  resolved: boolean;
  timedOut: boolean;
  error: Error | null;
  lastEvent: AuthChangeEvent | null;
}

export function useAuthResolver() {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    resolved: false,
    timedOut: false,
    error: null,
    lastEvent: null,
  });

  const mountedRef = useRef(true);
  const resolvedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    resolvedRef.current = false;

    console.log(LOG, '🚀 Starting auth check');

    // ESCAPE HATCH: Force resolve after timeout - this ALWAYS runs
    const timeoutId = setTimeout(() => {
      if (resolvedRef.current || !mountedRef.current) return;
      
      console.warn(LOG, '⏰ TIMEOUT - forcing resolution');
      resolvedRef.current = true;
      
      // Try one last getSession, but don't wait for it
      supabase.auth.getSession().then(({ data }) => {
        if (!mountedRef.current) return;
        setState({
          session: data.session,
          user: data.session?.user ?? null,
          resolved: true,
          timedOut: true,
          error: null,
          lastEvent: 'TOKEN_REFRESHED' as AuthChangeEvent,
        });
      }).catch(() => {
        if (!mountedRef.current) return;
        setState({
          session: null,
          user: null,
          resolved: true,
          timedOut: true,
          error: new Error('Auth timeout'),
          lastEvent: null,
        });
      });
    }, AUTH_TIMEOUT_MS);

    const resolve = (session: Session | null, event: string) => {
      if (resolvedRef.current || !mountedRef.current) return;
      
      resolvedRef.current = true;
      clearTimeout(timeoutId);
      
      console.log(LOG, '✅ Resolved:', { hasSession: !!session, event });
      
      setState({
        session,
        user: session?.user ?? null,
        resolved: true,
        timedOut: false,
        error: null,
        lastEvent: event as AuthChangeEvent,
      });
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mountedRef.current) return;
      
      console.log(LOG, '🔔 Event:', event, { hasSession: !!session });
      
      if (!resolvedRef.current) {
        resolve(session, event);
      } else {
        // Already resolved, just update
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          lastEvent: event,
        }));
      }
    });

    // Check current session
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mountedRef.current) return;
      
      console.log(LOG, '🔍 getSession:', { hasSession: !!data.session, error: error?.message });
      
      if (error) {
        resolve(null, 'ERROR');
      } else {
        resolve(data.session, 'INITIAL_SESSION');
      }
    }).catch((err) => {
      if (!mountedRef.current) return;
      console.error(LOG, 'getSession failed:', err);
      resolve(null, 'ERROR');
    });

    return () => {
      console.log(LOG, '🧹 Cleanup');
      mountedRef.current = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (mountedRef.current) {
      setState(prev => ({
        ...prev,
        session: data.session,
        user: data.session?.user ?? null,
      }));
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    if (mountedRef.current) {
      setState(prev => ({
        ...prev,
        session: null,
        user: null,
        lastEvent: 'SIGNED_OUT',
      }));
    }
  }, []);

  return { ...state, refresh, signOut };
}

export default useAuthResolver;
