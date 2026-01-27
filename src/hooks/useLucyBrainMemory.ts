/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * THE LUCY LOUNGE - Lucy Brain Memory Hook
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * CROSS-STUDIO INTELLIGENCE CLIENT
 * 
 * This hook enables any studio/component to:
 * - Store memories that persist across sessions
 * - Retrieve context from other studios
 * - Subscribe to cross-studio events
 * - Access user preferences
 * 
 * USAGE:
 * ```tsx
 * const { storeMemory, recallMemories, context, preferences } = useLucyBrainMemory('audio');
 * 
 * // Store a memory
 * await storeMemory('User prefers lofi beats', 'preference');
 * 
 * // Get context for prompt injection
 * const promptContext = context.recentMemories.map(m => m.summary).join('\n');
 * ```
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Types
export type MemorySource = 'chat' | 'audio' | 'lounge' | 'tool' | 'studio' | 'arcade' | 'system';
export type MemoryType = 'fact' | 'preference' | 'creation' | 'insight' | 'emotion' | 'context' | 'topic';
export type StudioType = 'chat' | 'audio' | 'lounge' | 'tool';

export interface BrainMemory {
  id: string;
  source: MemorySource;
  type: MemoryType;
  content: string;
  summary: string;
  importance: number;
  createdAt: string;
}

export interface BrainPreferences {
  tonePreference: string;
  creativityLevel: number;
  musicStyles: string[];
  verbosity: string;
  audioEnergy?: string;
  preferredGenres?: string[];
  ambientStyle?: string;
  humorLevel?: string;
  learningStyle?: string;
  topicsOfInterest?: string[];
}

export interface BrainContext {
  sessionId: string | null;
  emotionalState?: string;
  currentTopic?: string;
  preferences: BrainPreferences;
  recentMemories: BrainMemory[];
  studioSpecific: Record<string, unknown>;
}

export interface BrainEvent {
  id: string;
  eventType: string;
  source: string;
  target?: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

interface UseLucyBrainMemoryReturn {
  // Context
  context: BrainContext | null;
  preferences: BrainPreferences | null;
  isLoading: boolean;
  error: string | null;
  
  // Memory operations
  storeMemory: (content: string, memoryType?: MemoryType, importance?: number) => Promise<boolean>;
  recallMemories: (options?: { types?: MemoryType[]; limit?: number }) => Promise<BrainMemory[]>;
  
  // Preference operations
  updatePreference: (key: string, value: string | number | string[]) => Promise<boolean>;
  
  // Cross-studio events
  emitEvent: (eventType: string, payload?: Record<string, unknown>, target?: StudioType) => Promise<boolean>;
  
  // Context refresh
  refreshContext: () => Promise<void>;
  
  // Session state
  updateSessionState: (state: { emotionalState?: string; currentTopic?: string }) => Promise<boolean>;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vabrcwdngngdbjmtpwxp.supabase.co';

export function useLucyBrainMemory(studio: StudioType): UseLucyBrainMemoryReturn {
  const [context, setContext] = useState<BrainContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);
  const userIdRef = useRef<string | null>(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH CONTEXT
  // ═══════════════════════════════════════════════════════════════════════════

  const fetchContext = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setContext(getDefaultContext());
        setIsLoading(false);
        return;
      }

      userIdRef.current = session.user.id;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/lucy-brain-memory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          studio,
          includePreferences: true,
          includeRecentMemories: true,
          includeSessionState: true,
          memoryLimit: 10,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch brain context');
      }

      const data = await response.json();
      
      if (data.ok && data.context) {
        setContext(data.context);
      } else {
        setContext(getDefaultContext());
      }
      
    } catch (err) {
      console.error('[useLucyBrainMemory] Error fetching context:', err);
      setError('Failed to load Lucy Brain context');
      setContext(getDefaultContext());
    } finally {
      setIsLoading(false);
    }
  }, [studio]);

  // ═══════════════════════════════════════════════════════════════════════════
  // REALTIME SUBSCRIPTION
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    fetchContext();

    // Subscribe to brain events
    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      // Clean up existing channel
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }

      // Subscribe to brain events for this user
      const channel = supabase
        .channel(`brain-events-${session.user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'lucy_brain_events',
            filter: `user_id=eq.${session.user.id}`,
          },
          (payload) => {
            const event = payload.new as any;
            
            // If this event targets our studio or is global, refresh context
            if (!event.target || event.target === studio) {
              console.log(`[useLucyBrainMemory] Received event: ${event.event_type} from ${event.source}`);
              
              // Refresh context when relevant events occur
              if (['memory_created', 'preference_changed', 'context_switched'].includes(event.event_type)) {
                fetchContext();
              }
            }
          }
        )
        .subscribe();

      realtimeChannelRef.current = channel;
    };

    setupRealtime();

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [fetchContext, studio]);

  // ═══════════════════════════════════════════════════════════════════════════
  // STORE MEMORY
  // ═══════════════════════════════════════════════════════════════════════════

  const storeMemory = useCallback(async (
    content: string,
    memoryType: MemoryType = 'fact',
    importance?: number
  ): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return false;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/lucy-brain-memory/store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          source: studio,
          content,
          memoryType,
          importance,
        }),
      });

      return response.ok;
    } catch (err) {
      console.error('[useLucyBrainMemory] Error storing memory:', err);
      return false;
    }
  }, [studio]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RECALL MEMORIES
  // ═══════════════════════════════════════════════════════════════════════════

  const recallMemories = useCallback(async (options?: {
    types?: MemoryType[];
    limit?: number;
  }): Promise<BrainMemory[]> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return [];

      const response = await fetch(`${SUPABASE_URL}/functions/v1/lucy-brain-memory/recall`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          memoryTypes: options?.types,
          limit: options?.limit || 10,
        }),
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data.memories || [];
    } catch (err) {
      console.error('[useLucyBrainMemory] Error recalling memories:', err);
      return [];
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE PREFERENCE
  // ═══════════════════════════════════════════════════════════════════════════

  const updatePreference = useCallback(async (
    key: string,
    value: string | number | string[]
  ): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return false;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/lucy-brain-memory/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          update: { [key]: value },
        }),
      });

      if (response.ok) {
        // Update local context
        setContext(prev => prev ? {
          ...prev,
          preferences: { ...prev.preferences, [key]: value },
        } : null);
      }

      return response.ok;
    } catch (err) {
      console.error('[useLucyBrainMemory] Error updating preference:', err);
      return false;
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // EMIT EVENT
  // ═══════════════════════════════════════════════════════════════════════════

  const emitEvent = useCallback(async (
    eventType: string,
    payload: Record<string, unknown> = {},
    target?: StudioType
  ): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return false;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/lucy-brain-memory/emit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          eventType,
          source: studio,
          payload,
          target,
        }),
      });

      return response.ok;
    } catch (err) {
      console.error('[useLucyBrainMemory] Error emitting event:', err);
      return false;
    }
  }, [studio]);

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE SESSION STATE
  // ═══════════════════════════════════════════════════════════════════════════

  const updateSessionState = useCallback(async (state: {
    emotionalState?: string;
    currentTopic?: string;
  }): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token || !context?.sessionId) return false;

      const { error } = await supabase
        .from('lucy_brain_sessions')
        .update({
          emotional_state: state.emotionalState,
          current_topic: state.currentTopic,
          updated_at: new Date().toISOString(),
        })
        .eq('id', context.sessionId);

      if (!error) {
        setContext(prev => prev ? {
          ...prev,
          emotionalState: state.emotionalState || prev.emotionalState,
          currentTopic: state.currentTopic || prev.currentTopic,
        } : null);
      }

      return !error;
    } catch (err) {
      console.error('[useLucyBrainMemory] Error updating session state:', err);
      return false;
    }
  }, [context?.sessionId]);

  // ═══════════════════════════════════════════════════════════════════════════
  // REFRESH CONTEXT
  // ═══════════════════════════════════════════════════════════════════════════

  const refreshContext = useCallback(async () => {
    setIsLoading(true);
    await fetchContext();
  }, [fetchContext]);

  return {
    context,
    preferences: context?.preferences || null,
    isLoading,
    error,
    storeMemory,
    recallMemories,
    updatePreference,
    emitEvent,
    refreshContext,
    updateSessionState,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════

function getDefaultContext(): BrainContext {
  return {
    sessionId: null,
    preferences: {
      tonePreference: 'friendly',
      creativityLevel: 0.7,
      musicStyles: [],
      verbosity: 'balanced',
    },
    recentMemories: [],
    studioSpecific: {},
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY: Build context string for prompt injection
// ═══════════════════════════════════════════════════════════════════════════════

export function buildContextString(context: BrainContext | null): string {
  if (!context) return '';

  const parts: string[] = [];

  // Add emotional state
  if (context.emotionalState) {
    parts.push(`User's current mood: ${context.emotionalState}`);
  }

  // Add current topic
  if (context.currentTopic) {
    parts.push(`Currently discussing: ${context.currentTopic}`);
  }

  // Add preferences
  if (context.preferences) {
    const prefs = context.preferences;
    if (prefs.tonePreference !== 'friendly') {
      parts.push(`Communication style preference: ${prefs.tonePreference}`);
    }
    if (prefs.musicStyles?.length) {
      parts.push(`Music preferences: ${prefs.musicStyles.join(', ')}`);
    }
    if (prefs.topicsOfInterest?.length) {
      parts.push(`Interested in: ${prefs.topicsOfInterest.join(', ')}`);
    }
  }

  // Add recent memories
  if (context.recentMemories?.length) {
    const memoryText = context.recentMemories
      .slice(0, 5)
      .map(m => `- ${m.summary}`)
      .join('\n');
    parts.push(`Recent context:\n${memoryText}`);
  }

  return parts.join('\n\n');
}

export default useLucyBrainMemory;
