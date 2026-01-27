/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * THE LUCY LOUNGE - Lucy Brain Cross-Studio Sync Utilities
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Utilities for cross-studio intelligence synchronization.
 * 
 * FEATURES:
 * - Emit events from any studio
 * - Store memories with auto-categorization
 * - Build context strings for prompt injection
 * - Learn preferences from user behavior
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vabrcwdngngdbjmtpwxp.supabase.co';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type BrainSource = 'chat' | 'audio' | 'lounge' | 'tool' | 'studio' | 'arcade';
export type BrainMemoryType = 'fact' | 'preference' | 'creation' | 'insight' | 'emotion' | 'context' | 'topic';

export type BrainEventType = 
  | 'chat_message' 
  | 'chat_response' 
  | 'audio_generated' 
  | 'audio_played'
  | 'lounge_entered' 
  | 'lounge_mood_changed'
  | 'tool_used' 
  | 'preference_changed'
  | 'memory_created' 
  | 'context_switched';

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY STORAGE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Store a memory from any studio
 */
export async function storeBrainMemory(
  source: BrainSource,
  content: string,
  options: {
    memoryType?: BrainMemoryType;
    importance?: number;
    sourceId?: string;
  } = {}
): Promise<boolean> {
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
        source,
        content,
        memoryType: options.memoryType || 'fact',
        importance: options.importance,
        sourceId: options.sourceId,
      }),
    });

    return response.ok;
  } catch (err) {
    console.error('[lucyBrainSync] Error storing memory:', err);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT EMISSION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Emit a cross-studio event
 */
export async function emitBrainEvent(
  eventType: BrainEventType,
  source: BrainSource,
  payload: Record<string, unknown> = {},
  target?: BrainSource
): Promise<boolean> {
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
        source,
        payload,
        target,
      }),
    });

    return response.ok;
  } catch (err) {
    console.error('[lucyBrainSync] Error emitting event:', err);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PREFERENCE LEARNING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Learn a user preference from their behavior
 */
export async function learnPreference(
  key: string,
  value: string | number | string[]
): Promise<boolean> {
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

    return response.ok;
  } catch (err) {
    console.error('[lucyBrainSync] Error learning preference:', err);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO STUDIO INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Record an audio generation for cross-studio context
 */
export async function recordAudioGeneration(
  prompt: string,
  style: string,
  generationId?: string
): Promise<void> {
  // Store as creation memory
  await storeBrainMemory('audio', `Generated audio: "${prompt}" in ${style} style`, {
    memoryType: 'creation',
    importance: 0.7,
    sourceId: generationId,
  });

  // Emit event for other studios
  await emitBrainEvent('audio_generated', 'audio', {
    prompt,
    style,
    generationId,
  });

  // Learn music preference if pattern detected
  if (style) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      // Get current music styles
      const { data: prefs } = await supabase
        .from('lucy_brain_preferences')
        .select('music_style')
        .eq('user_id', session.user.id)
        .single();
      
      const currentStyles = prefs?.music_style || [];
      if (!currentStyles.includes(style)) {
        const updatedStyles = [...currentStyles, style].slice(-5); // Keep last 5
        await learnPreference('music_style', updatedStyles);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOUNGE INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Record a lounge session for cross-studio context
 */
export async function recordLoungeSession(
  loungeType: string,
  mood: string,
  insights?: string[]
): Promise<void> {
  // Store lounge experience
  await storeBrainMemory('lounge', `${loungeType} lounge session with ${mood} mood`, {
    memoryType: 'emotion',
    importance: 0.5,
  });

  // Store any insights
  if (insights?.length) {
    for (const insight of insights) {
      await storeBrainMemory('lounge', insight, {
        memoryType: 'insight',
        importance: 0.6,
      });
    }
  }

  // Emit event
  await emitBrainEvent('lounge_entered', 'lounge', {
    loungeType,
    mood,
    insightCount: insights?.length || 0,
  });

  // Learn ambient preference
  await learnPreference('ambient_style', mood);
}

/**
 * Record a mood change in lounge
 */
export async function recordMoodChange(
  previousMood: string,
  newMood: string,
  source: 'user' | 'system' = 'user'
): Promise<void> {
  await emitBrainEvent('lounge_mood_changed', 'lounge', {
    previousMood,
    newMood,
    source,
  }, 'chat'); // Notify chat to adjust tone
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Record a chat interaction for cross-studio context
 */
export async function recordChatInteraction(
  userMessage: string,
  lucyResponse: string,
  options: {
    conversationId?: string;
    topic?: string;
    emotion?: string;
  } = {}
): Promise<void> {
  // Only store significant exchanges
  if (userMessage.length > 50 || lucyResponse.length > 100) {
    // Detect important content
    const keywords = ['remember', 'important', 'always', 'never', 'prefer', 'like', 'hate', 'love'];
    const isImportant = keywords.some(kw => 
      userMessage.toLowerCase().includes(kw) || 
      lucyResponse.toLowerCase().includes(kw)
    );

    if (isImportant) {
      await storeBrainMemory('chat', `User said: "${userMessage.slice(0, 100)}..." | Lucy responded about: ${lucyResponse.slice(0, 100)}...`, {
        memoryType: 'context',
        importance: 0.6,
        sourceId: options.conversationId,
      });
    }

    // Detect topics for future reference
    if (options.topic) {
      await storeBrainMemory('chat', `Discussed topic: ${options.topic}`, {
        memoryType: 'topic',
        importance: 0.4,
      });
    }

    // Detect emotional state
    if (options.emotion) {
      await emitBrainEvent('chat_message', 'chat', {
        emotion: options.emotion,
        topic: options.topic,
      }, 'lounge'); // Notify lounge to potentially adjust ambiance
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Record a tool usage for cross-studio context
 */
export async function recordToolUsage(
  toolName: string,
  input: string,
  output: string,
  success: boolean
): Promise<void> {
  if (success) {
    await storeBrainMemory('tool', `Used ${toolName}: ${input.slice(0, 100)}`, {
      memoryType: 'fact',
      importance: 0.4,
    });
  }

  await emitBrainEvent('tool_used', 'tool', {
    toolName,
    success,
    inputLength: input.length,
    outputLength: output.length,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT BUILDING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build a context string for prompt injection
 */
export function buildPromptContext(
  memories: Array<{ summary: string; source: string; importance: number }>,
  preferences: Record<string, unknown>,
  options: {
    maxMemories?: number;
    includePreferences?: boolean;
  } = {}
): string {
  const { maxMemories = 5, includePreferences = true } = options;
  const parts: string[] = [];

  // Add memories
  if (memories.length > 0) {
    const topMemories = memories
      .sort((a, b) => b.importance - a.importance)
      .slice(0, maxMemories);
    
    const memoryLines = topMemories.map(m => {
      const sourceTag = m.source !== 'chat' ? ` [${m.source}]` : '';
      return `- ${m.summary}${sourceTag}`;
    });
    
    parts.push(`[Cross-Studio Context]\n${memoryLines.join('\n')}`);
  }

  // Add preferences
  if (includePreferences && Object.keys(preferences).length > 0) {
    const prefLines: string[] = [];
    
    if (preferences.tonePreference && preferences.tonePreference !== 'friendly') {
      prefLines.push(`Communication style: ${preferences.tonePreference}`);
    }
    if (Array.isArray(preferences.musicStyles) && preferences.musicStyles.length > 0) {
      prefLines.push(`Music taste: ${preferences.musicStyles.join(', ')}`);
    }
    if (Array.isArray(preferences.topicsOfInterest) && preferences.topicsOfInterest.length > 0) {
      prefLines.push(`Interested in: ${preferences.topicsOfInterest.join(', ')}`);
    }
    
    if (prefLines.length > 0) {
      parts.push(`[User Preferences]\n${prefLines.join('\n')}`);
    }
  }

  return parts.join('\n\n');
}

export default {
  storeBrainMemory,
  emitBrainEvent,
  learnPreference,
  recordAudioGeneration,
  recordLoungeSession,
  recordMoodChange,
  recordChatInteraction,
  recordToolUsage,
  buildPromptContext,
};
