/**
 * THE LUCY LOUNGE - SUPABASE MODULE INDEX
 * 
 * Central export for Supabase client and related modules.
 */

// Re-export the main Supabase client
export { supabase } from '@/integrations/supabase/client';

// Export memory module
export {
  memory,
  saveMemory,
  getMemories,
  updateMemory,
  deleteMemory,
  clearMemories,
  saveConversationContext,
  loadConversationContext,
  savePreferences,
  loadPreferences,
  getMemoryStats,
  applyMemoryDecay,
  pruneMemories,
  type MemoryType,
  type UserMemory,
  type MemoryInsert,
  type MemorySearchOptions,
  type ConversationContext,
  type UserPreferences,
  type MemoryStats,
} from './memory';
