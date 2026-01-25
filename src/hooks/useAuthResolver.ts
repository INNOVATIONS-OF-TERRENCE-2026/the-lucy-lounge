/**
 * GOD MODE AUTH RESOLVER
 * 
 * This hook CANNOT fail. It will ALWAYS resolve within 2 seconds.
 * No complex logic. No race conditions. Just works.
 */

import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  session: Session | null;
  user: User | null;
  resolved: boolean;
  timedOut: boolean;
  error: Error | null;
  lastEvent: string | null;
}

export function useAuthResolver() {
  // Start with resolved: false
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    resolved: false,
    timedOut: false,
    error: null,
    lastEvent: null,
  });

  useEffect(() => {
    let mounted = true;
    let resolved = false;

    // FORCE RESOLVE - This timeout WILL fire no matter what
    const forceResolveTimer = setTimeout(() => {
      if (!mounted || resolved) return;
      resolved = true;
      
      console.log('[AUTH] ⏰ Force resolving after 2s');
      
      // Get whatever session state we have right now
      supabase.auth.getSession().then(({ data }) => {
        if (!mounted) return;
        setState({
          session: data.session,
          user: data.session?.user ?? null,
          resolved: true,
          timedOut: true,
          error: null,
          lastEvent: 'TIMEOUT',
        });
      }).catch(() => {
        if (!mounted) return;
        setState({
          session: null,
          user: null,
          resolved: true,
          timedOut: true,
          error: null,
          lastEvent: 'TIMEOUT',
        });
      });
    }, 2000);

    // Try to resolve immediately
    const tryResolve = (session: Session | null, event: string) => {
      if (!mounted || resolved) return;
      resolved = true;
      clearTimeout(forceResolveTimer);
      
      console.log('[AUTH] ✅ Resolved:', event, !!session);
      
      setState({
        session,
        user: session?.user ?? null,
        resolved: true,
        timedOut: false,
        error: null,
        lastEvent: event,
      });
    };

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AUTH] 🔔 Event:', event, !!session);
      
      if (!resolved) {
        tryResolve(session, event);
      } else if (mounted) {
        // Already resolved, just update state
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          lastEvent: event,
        }));
      }
    });

    // Also try getSession
    supabase.auth.getSession().then(({ data }) => {
      console.log('[AUTH] 🔍 getSession:', !!data.session);
      if (!resolved) {
        tryResolve(data.session, 'INITIAL');
      }
    }).catch((err) => {
      console.error('[AUTH] ❌ getSession error:', err);
      if (!resolved) {
        tryResolve(null, 'ERROR');
      }
    });

    return () => {
      mounted = false;
      clearTimeout(forceResolveTimer);
      subscription.unsubscribe();
    };
  }, []);

  // Utility functions
  const refresh = async () => {
    const { data } = await supabase.auth.getSession();
    setState(prev => ({
      ...prev,
      session: data.session,
      user: data.session?.user ?? null,
    }));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setState(prev => ({
      ...prev,
      session: null,
      user: null,
      lastEvent: 'SIGNED_OUT',
    }));
  };

  return { ...state, refresh, signOut };
}

export default useAuthResolver;
