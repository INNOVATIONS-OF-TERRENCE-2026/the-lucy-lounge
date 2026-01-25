/**
 * THE LUCY LOUNGE - SUPABASE MEMORY MODULE
 * 
 * Production-ready memory management with pgvector support.
 * Handles user memories, conversation context, and semantic search.
 * 
 * FEATURES:
 * - Store memories with automatic embedding generation
 * - Semantic search via pgvector cosine similarity
 * - Memory importance scoring and decay
 * - Conversation context management
 * - User preference storage
 * 
 * SCHEMA REQUIREMENTS:
 * - user_memories table with pgvector extension
 * - embedding column of type vector(384)
 * - Full-text search index on content
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type MemoryType = 
  | 'conversation'
  | 'preference'
  | 'fact'
  | 'context'
  | 'persona'
  | 'instruction';

export interface UserMemory {
  id: string;
  user_id: string;
  content: string;
  memory_type: MemoryType;
  importance_score: number;
  embedding?: number[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  last_accessed_at?: string;
  access_count: number;
}

export interface MemoryInsert {
  content: string;
  memoryType?: MemoryType;
  importanceScore?: number;
  embedding?: number[];
  metadata?: Record<string, unknown>;
}

export interface MemorySearchOptions {
  query?: string;
  embedding?: number[];
  memoryType?: MemoryType;
  minImportance?: number;
  limit?: number;
  offset?: number;
}

export interface ConversationContext {
  userId: string;
  conversationId: string;
  messages: { role: string; content: string; timestamp: string }[];
  summary?: string;
  topics?: string[];
}

// ============================================================================
// MEMORY STORAGE
// ============================================================================

/**
 * Store a memory for a user
 */
export async function saveMemory(
  userId: string,
  memory: MemoryInsert
): Promise<{ id: string; success: boolean }> {
  const {
    content,
    memoryType = 'conversation',
    importanceScore = 0.5,
    embedding,
    metadata,
  } = memory;

  try {
    // Use edge function for server-side embedding generation
    const { data, error } = await supabase.functions.invoke('memory-save', {
      body: {
        userId,
        content,
        memoryType,
        importanceScore,
        embedding,
        metadata,
      },
    });

    if (error) {
      console.error('[Memory] Save failed:', error);
      return { id: '', success: false };
    }

    return { id: data?.id ?? '', success: true };
  } catch (e) {
    console.error('[Memory] Save error:', e);
    return { id: '', success: false };
  }
}

/**
 * Retrieve memories for a user
 */
export async function getMemories(
  userId: string,
  options: MemorySearchOptions = {}
): Promise<UserMemory[]> {
  const {
    query,
    embedding,
    memoryType,
    minImportance = 0,
    limit = 10,
    offset = 0,
  } = options;

  try {
    // Use edge function for semantic search
    const { data, error } = await supabase.functions.invoke('memory-search', {
      body: {
        userId,
        query,
        embedding,
        memoryType,
        minImportance,
        topK: limit,
        offset,
      },
    });

    if (error) {
      console.error('[Memory] Search failed:', error);
      return [];
    }

    return (data?.memories ?? []) as UserMemory[];
  } catch (e) {
    console.error('[Memory] Search error:', e);
    return [];
  }
}

/**
 * Update a memory's importance or metadata
 */
export async function updateMemory(
  memoryId: string,
  updates: Partial<Pick<UserMemory, 'importance_score' | 'metadata'>>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_memories')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memoryId);

    return !error;
  } catch (e) {
    console.error('[Memory] Update error:', e);
    return false;
  }
}

/**
 * Delete a memory
 */
export async function deleteMemory(memoryId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_memories')
      .delete()
      .eq('id', memoryId);

    return !error;
  } catch (e) {
    console.error('[Memory] Delete error:', e);
    return false;
  }
}

/**
 * Clear all memories for a user (with optional type filter)
 */
export async function clearMemories(
  userId: string,
  memoryType?: MemoryType
): Promise<boolean> {
  try {
    let query = supabase
      .from('user_memories')
      .delete()
      .eq('user_id', userId);

    if (memoryType) {
      query = query.eq('memory_type', memoryType);
    }

    const { error } = await query;
    return !error;
  } catch (e) {
    console.error('[Memory] Clear error:', e);
    return false;
  }
}

// ============================================================================
// CONVERSATION CONTEXT
// ============================================================================

/**
 * Save conversation context for resumption
 */
export async function saveConversationContext(
  context: ConversationContext
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('conversation_contexts')
      .upsert({
        user_id: context.userId,
        conversation_id: context.conversationId,
        messages: context.messages,
        summary: context.summary,
        topics: context.topics,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'conversation_id',
      });

    return !error;
  } catch (e) {
    console.error('[Memory] Save context error:', e);
    return false;
  }
}

/**
 * Load conversation context
 */
export async function loadConversationContext(
  conversationId: string
): Promise<ConversationContext | null> {
  try {
    const { data, error } = await supabase
      .from('conversation_contexts')
      .select('*')
      .eq('conversation_id', conversationId)
      .single();

    if (error || !data) return null;

    return {
      userId: data.user_id,
      conversationId: data.conversation_id,
      messages: data.messages ?? [],
      summary: data.summary,
      topics: data.topics,
    };
  } catch (e) {
    console.error('[Memory] Load context error:', e);
    return null;
  }
}

// ============================================================================
// USER PREFERENCES
// ============================================================================

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  voiceEnabled?: boolean;
  preferredVoice?: string;
  preferredModel?: string;
  notifications?: boolean;
  autoplay?: boolean;
  [key: string]: unknown;
}

/**
 * Save user preferences
 */
export async function savePreferences(
  userId: string,
  preferences: UserPreferences
): Promise<boolean> {
  try {
    // Store as a preference-type memory
    const { success } = await saveMemory(userId, {
      content: JSON.stringify(preferences),
      memoryType: 'preference',
      importanceScore: 1.0, // Preferences are always important
      metadata: { type: 'user_preferences', version: 1 },
    });

    return success;
  } catch (e) {
    console.error('[Memory] Save preferences error:', e);
    return false;
  }
}

/**
 * Load user preferences
 */
export async function loadPreferences(userId: string): Promise<UserPreferences> {
  try {
    const memories = await getMemories(userId, {
      memoryType: 'preference',
      limit: 1,
    });

    if (memories.length > 0) {
      const prefMemory = memories[0];
      return JSON.parse(prefMemory.content);
    }

    return {};
  } catch (e) {
    console.error('[Memory] Load preferences error:', e);
    return {};
  }
}

// ============================================================================
// MEMORY ANALYTICS
// ============================================================================

export interface MemoryStats {
  totalCount: number;
  byType: Record<MemoryType, number>;
  avgImportance: number;
  oldestMemory?: string;
  newestMemory?: string;
}

/**
 * Get memory statistics for a user
 */
export async function getMemoryStats(userId: string): Promise<MemoryStats> {
  try {
    const { data, error } = await supabase
      .from('user_memories')
      .select('memory_type, importance_score, created_at')
      .eq('user_id', userId);

    if (error || !data) {
      return {
        totalCount: 0,
        byType: {} as Record<MemoryType, number>,
        avgImportance: 0,
      };
    }

    const byType: Record<string, number> = {};
    let totalImportance = 0;
    let oldest: string | undefined;
    let newest: string | undefined;

    for (const memory of data) {
      byType[memory.memory_type] = (byType[memory.memory_type] ?? 0) + 1;
      totalImportance += memory.importance_score ?? 0;

      if (!oldest || memory.created_at < oldest) oldest = memory.created_at;
      if (!newest || memory.created_at > newest) newest = memory.created_at;
    }

    return {
      totalCount: data.length,
      byType: byType as Record<MemoryType, number>,
      avgImportance: data.length > 0 ? totalImportance / data.length : 0,
      oldestMemory: oldest,
      newestMemory: newest,
    };
  } catch (e) {
    console.error('[Memory] Stats error:', e);
    return {
      totalCount: 0,
      byType: {} as Record<MemoryType, number>,
      avgImportance: 0,
    };
  }
}

// ============================================================================
// MEMORY DECAY
// ============================================================================

/**
 * Apply time-based decay to memory importance scores
 * Should be called periodically (e.g., daily via cron)
 */
export async function applyMemoryDecay(
  userId: string,
  decayRate: number = 0.01
): Promise<number> {
  try {
    // Decay non-essential memories (not preferences or instructions)
    const { data, error } = await supabase.rpc('decay_user_memories', {
      p_user_id: userId,
      p_decay_rate: decayRate,
    });

    if (error) {
      console.error('[Memory] Decay error:', error);
      return 0;
    }

    return data ?? 0;
  } catch (e) {
    console.error('[Memory] Decay error:', e);
    return 0;
  }
}

/**
 * Prune low-importance memories
 */
export async function pruneMemories(
  userId: string,
  threshold: number = 0.1
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('user_memories')
      .delete()
      .eq('user_id', userId)
      .lt('importance_score', threshold)
      .neq('memory_type', 'preference')
      .neq('memory_type', 'instruction')
      .select('id');

    if (error) {
      console.error('[Memory] Prune error:', error);
      return 0;
    }

    return data?.length ?? 0;
  } catch (e) {
    console.error('[Memory] Prune error:', e);
    return 0;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const memory = {
  // Core CRUD
  save: saveMemory,
  get: getMemories,
  update: updateMemory,
  delete: deleteMemory,
  clear: clearMemories,

  // Context
  saveContext: saveConversationContext,
  loadContext: loadConversationContext,

  // Preferences
  savePrefs: savePreferences,
  loadPrefs: loadPreferences,

  // Analytics
  stats: getMemoryStats,

  // Maintenance
  decay: applyMemoryDecay,
  prune: pruneMemories,
};

export default memory;
