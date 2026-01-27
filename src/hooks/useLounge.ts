/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — LOUNGE HOOK                                              │
 * │                                                                             │
 * │ React hook for lounge session management and AI integration                │
 * │                                                                             │
 * │ Lucy's lounges are spaces for deep work and reflection.                    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import loungeService, { 
  LoungeType, 
  AIMode, 
  LoungeSession, 
  LoungeArtifact,
  LoungePresence 
} from '@/services/loungeService';

// =============================================================================
// TYPES
// =============================================================================

export interface UseLoungeOptions {
  loungeType: LoungeType;
  aiMode?: AIMode;
  autoStartSession?: boolean;
  trackPresence?: boolean;
}

export interface UseLoungeReturn {
  // Session
  session: LoungeSession | null;
  isSessionActive: boolean;
  sessionDuration: number;
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  
  // Artifacts
  artifacts: LoungeArtifact[];
  saveArtifact: (type: string, title: string, content: string, contentJson?: Record<string, unknown>, tags?: string[]) => Promise<string | null>;
  loadArtifacts: () => Promise<void>;
  
  // Presence
  presence: LoungePresence | null;
  updateActivity: (activityType: string) => Promise<void>;
  
  // State
  loading: boolean;
  error: string | null;
}

// =============================================================================
// HOOK
// =============================================================================

export function useLounge({
  loungeType,
  aiMode,
  autoStartSession = true,
  trackPresence = true,
}: UseLoungeOptions): UseLoungeReturn {
  const { user, isAuthenticated } = useAuth();
  
  const [session, setSession] = useState<LoungeSession | null>(null);
  const [artifacts, setArtifacts] = useState<LoungeArtifact[]>([]);
  const [presence, setPresence] = useState<LoungePresence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const presenceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start session
  const startSession = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Please sign in to start a session');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const sessionId = await loungeService.startSession(loungeType, aiMode);
      const activeSession = await loungeService.getActiveSession(loungeType);
      setSession(activeSession);
      
      // Start duration counter
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      durationIntervalRef.current = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('[useLounge] Start session error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, loungeType, aiMode]);

  // End session
  const endSession = useCallback(async () => {
    if (!session?.id) return;

    try {
      await loungeService.endSession(session.id);
      setSession(null);
      setSessionDuration(0);
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      
      // Clear presence
      if (trackPresence) {
        await loungeService.clearPresence(loungeType);
      }
    } catch (err) {
      console.error('[useLounge] End session error:', err);
    }
  }, [session?.id, loungeType, trackPresence]);

  // Save artifact
  const saveArtifact = useCallback(async (
    type: string,
    title: string,
    content: string,
    contentJson?: Record<string, unknown>,
    tags: string[] = []
  ): Promise<string | null> => {
    if (!isAuthenticated) {
      setError('Please sign in to save artifacts');
      return null;
    }

    try {
      const artifactId = await loungeService.saveArtifact(
        session?.id || null,
        type,
        title,
        content,
        contentJson,
        tags
      );
      
      // Reload artifacts
      await loadArtifacts();
      
      return artifactId;
    } catch (err) {
      console.error('[useLounge] Save artifact error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save artifact');
      return null;
    }
  }, [isAuthenticated, session?.id]);

  // Load artifacts
  const loadArtifacts = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const loadedArtifacts = await loungeService.getArtifacts(session?.id);
      setArtifacts(loadedArtifacts);
    } catch (err) {
      console.error('[useLounge] Load artifacts error:', err);
    }
  }, [isAuthenticated, session?.id]);

  // Update activity
  const updateActivity = useCallback(async (activityType: string) => {
    if (!isAuthenticated || !trackPresence) return;

    try {
      await loungeService.updatePresence(loungeType, activityType);
    } catch (err) {
      console.error('[useLounge] Update activity error:', err);
    }
  }, [isAuthenticated, loungeType, trackPresence]);

  // Fetch presence
  const fetchPresence = useCallback(async () => {
    if (!trackPresence) return;

    try {
      const presenceData = await loungeService.getPresence(loungeType);
      setPresence(presenceData);
    } catch (err) {
      console.error('[useLounge] Fetch presence error:', err);
    }
  }, [loungeType, trackPresence]);

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      
      try {
        // Check for existing session
        if (isAuthenticated) {
          const existingSession = await loungeService.getActiveSession(loungeType);
          if (existingSession) {
            setSession(existingSession);
            // Calculate duration from session start
            const startTime = existingSession.startedAt.getTime();
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            setSessionDuration(elapsed);
            
            // Start duration counter
            durationIntervalRef.current = setInterval(() => {
              setSessionDuration(prev => prev + 1);
            }, 1000);
          } else if (autoStartSession) {
            await startSession();
          }
          
          // Load artifacts
          await loadArtifacts();
        }
        
        // Fetch initial presence
        await fetchPresence();
        
        // Set up presence polling
        if (trackPresence) {
          presenceIntervalRef.current = setInterval(fetchPresence, 30000);
        }
        
      } catch (err) {
        console.error('[useLounge] Initialize error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize lounge');
      } finally {
        setLoading(false);
      }
    };

    initialize();

    // Cleanup on unmount
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (presenceIntervalRef.current) {
        clearInterval(presenceIntervalRef.current);
      }
      
      // Clear presence on unmount
      if (trackPresence && isAuthenticated) {
        loungeService.clearPresence(loungeType).catch(console.error);
      }
    };
  }, [isAuthenticated, loungeType, autoStartSession, trackPresence]);

  // Update presence periodically when session is active
  useEffect(() => {
    if (session && trackPresence && isAuthenticated) {
      loungeService.updatePresence(loungeType, 'active').catch(console.error);
    }
  }, [session, loungeType, trackPresence, isAuthenticated]);

  return {
    session,
    isSessionActive: !!session,
    sessionDuration,
    startSession,
    endSession,
    artifacts,
    saveArtifact,
    loadArtifacts,
    presence,
    updateActivity,
    loading,
    error,
  };
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Format session duration as HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default useLounge;
