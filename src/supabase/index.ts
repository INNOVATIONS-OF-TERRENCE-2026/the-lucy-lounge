/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — SUPABASE MODULE INDEX                                    │
 * │                                                                             │
 * │ Central export for Supabase client, memory, media, and recommendation      │
 * │ modules. PHASE 2 IMPLEMENTATION                                            │
 * └─────────────────────────────────────────────────────────────────────────────┘
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

// =============================================================================
// PHASE 2: UNIVERSAL MEDIA GRAPH ACCESS LAYER
// =============================================================================

// Media node queries
export {
  getMediaNode,
  getMediaNodeWithDetails,
  queryMediaNodes,
  searchMediaNodes,
  semanticSearchMedia,
  getMediaSeries,
  getTrendingContent,
  getNewReleases,
  getContentByGenre,
  getContentByMood,
  getMediaAvailability,
  getActiveProviders,
  getRelatedContent,
  getMediaCredits,
  getAllTags,
  getMediaTags,
} from './media';

// User state & collections
export {
  getUserMediaState,
  upsertUserMediaState,
  markMediaCompleted,
  getContinueWatching,
  getContinueListening,
  getUserCollections,
  getOrCreateCollection,
  getCollectionItems,
  addToCollection,
  removeFromCollection,
  isInCollection,
  getUserRating,
  setUserRating,
  getOrCreateTasteProfile,
  updateTasteProfile,
  updateTasteVectors,
  recordWatchEvent,
  recordListenEvent,
  getUserLibrary,
} from './userState';

// Recommendations & discovery
export {
  getRecommendationsByGenre,
  getPersonalizedRecommendations,
  getPopularContent,
  getBecauseYouWatched,
  getFeaturedJourneys,
  getJourneysByMood,
  getJourneyWithSteps,
  getMoodDiscoveryConfigs,
  getMoodContent,
  getTimeBasedContent,
  isUserColdStart,
  saveQuizResponses,
  buildRecommendationRows,
} from './recommendations';
