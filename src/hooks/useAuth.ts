/**
 * THE LUCY LOUNGE — Auth Hook Wrapper
 * 
 * Provides a consistent auth interface across the application.
 * Wraps useAuthResolver for compatibility.
 */

import { useAuthResolver } from './useAuthResolver';

export function useAuth() {
  const auth = useAuthResolver();
  
  return {
    user: auth.user,
    session: auth.session,
    loading: !auth.resolved,
    isAuthenticated: !!auth.session,
    signOut: auth.signOut,
    refresh: auth.refresh,
  };
}

export default useAuth;
