/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — SUPABASE USER STATE ACCESS LAYER                         │
 * │                                                                             │
 * │ User-isolated queries for media state, collections, and taste profiles     │
 * │ PHASE 2 IMPLEMENTATION                                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  MediaNode,
  MediaCategory,
  MediaType,
  UserMediaState,
  UserTasteProfile,
} from '@/media/types';

// =============================================================================
// USER MEDIA STATE
// =============================================================================

/**
 * Get user's media state for a specific node
 */
export async function getUserMediaState(
  userId: string,
  nodeId: string
): Promise<UserMediaState | null> {
  const { data, error } = await supabase
    .from('user_media_state')
    .select('*')
    .eq('user_id', userId)
    .eq('media_node_id', nodeId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') { // Not found is OK
      console.error('[UserState] getUserMediaState error:', error);
    }
    return null;
  }

  return data as UserMediaState;
}

/**
 * Upsert user's media state (via RPC for atomic update)
 */
export async function upsertUserMediaState(
  userId: string,
  nodeId: string,
  progressSeconds: number
): Promise<boolean> {
  const { error } = await supabase.rpc('upsert_media_state', {
    p_user_id: userId,
    p_media_node_id: nodeId,
    p_progress_seconds: progressSeconds,
  });

  if (error) {
    console.error('[UserState] upsertUserMediaState error:', error);
    return false;
  }

  return true;
}

/**
 * Mark media as completed
 */
export async function markMediaCompleted(
  userId: string,
  nodeId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('user_media_state')
    .upsert({
      user_id: userId,
      media_node_id: nodeId,
      is_completed: true,
      completed_at: new Date().toISOString(),
      last_played_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,media_node_id',
    });

  if (error) {
    console.error('[UserState] markMediaCompleted error:', error);
    return false;
  }

  return true;
}

// =============================================================================
// CONTINUE WATCHING / LISTENING
// =============================================================================

/**
 * Get continue watching items for a user
 */
export async function getContinueWatching(
  userId: string,
  limit: number = 20
): Promise<MediaNode[]> {
  // Try the view first
  const { data, error } = await supabase
    .from('continue_watching')
    .select('*')
    .eq('user_id', userId)
    .limit(limit);

  if (error) {
    console.error('[UserState] getContinueWatching view error:', error);
    
    // Fallback to direct query
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('user_media_state')
      .select(`
        progress_seconds,
        last_played_at,
        media_nodes!inner (*)
      `)
      .eq('user_id', userId)
      .eq('is_completed', false)
      .gt('progress_seconds', 0)
      .order('last_played_at', { ascending: false })
      .limit(limit);

    if (fallbackError) {
      console.error('[UserState] getContinueWatching fallback error:', fallbackError);
      return [];
    }

    return (fallbackData || [])
      .filter((item: any) => item.media_nodes?.category === 'video')
      .map((item: any) => ({
        ...item.media_nodes,
        _progress: item.progress_seconds,
        _lastPlayed: item.last_played_at,
      })) as MediaNode[];
  }

  return (data || []).map((row: any) => ({
    id: row.media_node_id,
    title: row.title,
    thumbnail_url: row.thumbnail_url,
    poster_url: row.poster_url,
    media_type: row.media_type,
    category: row.category,
    duration_seconds: row.duration_seconds,
    _progress: row.progress_seconds,
    _lastPlayed: row.last_played_at,
  })) as MediaNode[];
}

/**
 * Get continue listening items for a user
 */
export async function getContinueListening(
  userId: string,
  limit: number = 20
): Promise<MediaNode[]> {
  // Try the view first
  const { data, error } = await supabase
    .from('continue_listening')
    .select('*')
    .eq('user_id', userId)
    .limit(limit);

  if (error) {
    console.error('[UserState] getContinueListening view error:', error);
    
    // Fallback to direct query
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('user_media_state')
      .select(`
        progress_seconds,
        last_played_at,
        media_nodes!inner (*)
      `)
      .eq('user_id', userId)
      .eq('is_completed', false)
      .gt('progress_seconds', 0)
      .order('last_played_at', { ascending: false })
      .limit(limit);

    if (fallbackError) {
      console.error('[UserState] getContinueListening fallback error:', fallbackError);
      return [];
    }

    return (fallbackData || [])
      .filter((item: any) => item.media_nodes?.category === 'audio')
      .map((item: any) => ({
        ...item.media_nodes,
        _progress: item.progress_seconds,
        _lastPlayed: item.last_played_at,
      })) as MediaNode[];
  }

  return (data || []).map((row: any) => ({
    id: row.media_node_id,
    title: row.title,
    thumbnail_url: row.thumbnail_url,
    poster_url: row.poster_url,
    media_type: row.media_type,
    category: row.category,
    duration_seconds: row.duration_seconds,
    _progress: row.progress_seconds,
    _lastPlayed: row.last_played_at,
  })) as MediaNode[];
}

// =============================================================================
// USER COLLECTIONS (WATCHLIST, FAVORITES)
// =============================================================================

/**
 * Get user's collections
 */
export async function getUserCollections(userId: string) {
  const { data, error } = await supabase
    .from('user_collections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[UserState] getUserCollections error:', error);
    return [];
  }

  return data || [];
}

/**
 * Get or create a specific collection (watchlist, favorites, etc.)
 */
export async function getOrCreateCollection(
  userId: string,
  collectionType: 'watchlist' | 'favorites' | 'listen_later'
): Promise<string | null> {
  // Try to get existing
  const { data: existing } = await supabase
    .from('user_collections')
    .select('id')
    .eq('user_id', userId)
    .eq('collection_type', collectionType)
    .single();

  if (existing) {
    return existing.id;
  }

  // Create new
  const { data: created, error } = await supabase
    .from('user_collections')
    .insert({
      user_id: userId,
      collection_type: collectionType,
      name: collectionType === 'watchlist' ? 'Watchlist' :
            collectionType === 'favorites' ? 'Favorites' : 'Listen Later',
      is_public: false,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[UserState] getOrCreateCollection error:', error);
    return null;
  }

  return created?.id || null;
}

/**
 * Get items in a collection
 */
export async function getCollectionItems(
  collectionId: string,
  limit: number = 50
): Promise<MediaNode[]> {
  const { data, error } = await supabase
    .from('user_collection_items')
    .select(`
      added_at,
      media_nodes!inner (*)
    `)
    .eq('collection_id', collectionId)
    .order('added_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[UserState] getCollectionItems error:', error);
    return [];
  }

  return (data || []).map((item: any) => item.media_nodes as MediaNode);
}

/**
 * Add item to collection
 */
export async function addToCollection(
  collectionId: string,
  nodeId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('user_collection_items')
    .upsert({
      collection_id: collectionId,
      media_node_id: nodeId,
      added_at: new Date().toISOString(),
    }, {
      onConflict: 'collection_id,media_node_id',
    });

  if (error) {
    console.error('[UserState] addToCollection error:', error);
    return false;
  }

  return true;
}

/**
 * Remove item from collection
 */
export async function removeFromCollection(
  collectionId: string,
  nodeId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('user_collection_items')
    .delete()
    .eq('collection_id', collectionId)
    .eq('media_node_id', nodeId);

  if (error) {
    console.error('[UserState] removeFromCollection error:', error);
    return false;
  }

  return true;
}

/**
 * Check if item is in collection
 */
export async function isInCollection(
  collectionId: string,
  nodeId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_collection_items')
    .select('id')
    .eq('collection_id', collectionId)
    .eq('media_node_id', nodeId)
    .single();

  if (error) {
    return false;
  }

  return !!data;
}

// =============================================================================
// USER RATINGS
// =============================================================================

/**
 * Get user's rating for a media node
 */
export async function getUserRating(
  userId: string,
  nodeId: string
): Promise<number | null> {
  const { data, error } = await supabase
    .from('user_ratings')
    .select('rating')
    .eq('user_id', userId)
    .eq('media_node_id', nodeId)
    .single();

  if (error) {
    return null;
  }

  return data?.rating || null;
}

/**
 * Set user's rating for a media node
 */
export async function setUserRating(
  userId: string,
  nodeId: string,
  rating: number
): Promise<boolean> {
  const { error } = await supabase
    .from('user_ratings')
    .upsert({
      user_id: userId,
      media_node_id: nodeId,
      rating,
      created_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,media_node_id',
    });

  if (error) {
    console.error('[UserState] setUserRating error:', error);
    return false;
  }

  return true;
}

// =============================================================================
// USER TASTE PROFILE
// =============================================================================

/**
 * Get or create user's taste profile
 */
export async function getOrCreateTasteProfile(userId: string): Promise<UserTasteProfile | null> {
  // Try RPC first
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_or_create_taste_profile', {
    p_user_id: userId,
  });

  if (!rpcError && rpcData) {
    return rpcData as UserTasteProfile;
  }

  // Fallback: direct query/insert
  const { data: existing } = await supabase
    .from('user_taste_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existing) {
    return existing as UserTasteProfile;
  }

  // Create new profile
  const { data: created, error } = await supabase
    .from('user_taste_profiles')
    .insert({
      user_id: userId,
      genre_scores: {},
      mood_scores: {},
      media_type_scores: {},
    })
    .select('*')
    .single();

  if (error) {
    console.error('[UserState] getOrCreateTasteProfile error:', error);
    return null;
  }

  return created as UserTasteProfile;
}

/**
 * Update user's taste profile
 */
export async function updateTasteProfile(
  userId: string,
  updates: {
    genre_scores?: Record<string, number>;
    mood_scores?: Record<string, number>;
    media_type_scores?: Record<MediaType, number>;
  }
): Promise<boolean> {
  const current = await getOrCreateTasteProfile(userId);
  
  if (!current) {
    return false;
  }

  const { error } = await supabase
    .from('user_taste_profiles')
    .update({
      genre_scores: {
        ...(current.genre_scores || {}),
        ...updates.genre_scores,
      },
      mood_scores: {
        ...(current.mood_scores || {}),
        ...updates.mood_scores,
      },
      media_type_scores: {
        ...(current.media_type_scores || {}),
        ...updates.media_type_scores,
      },
      last_computed_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    console.error('[UserState] updateTasteProfile error:', error);
    return false;
  }

  return true;
}

/**
 * Update taste vector embeddings
 */
export async function updateTasteVectors(
  userId: string,
  vectors: {
    video?: number[];
    audio?: number[];
    combined?: number[];
  }
): Promise<boolean> {
  const { error } = await supabase
    .from('user_taste_profiles')
    .update({
      taste_embedding_video: vectors.video || null,
      taste_embedding_audio: vectors.audio || null,
      taste_embedding_combined: vectors.combined || null,
      last_computed_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    console.error('[UserState] updateTasteVectors error:', error);
    return false;
  }

  return true;
}

// =============================================================================
// WATCH / LISTEN EVENTS (Analytics)
// =============================================================================

/**
 * Record a watch event
 */
export async function recordWatchEvent(
  userId: string,
  nodeId: string,
  durationWatched: number,
  completed: boolean,
  metadata?: Record<string, any>
): Promise<boolean> {
  const { error } = await supabase
    .from('user_watch_events')
    .insert({
      user_id: userId,
      media_node_id: nodeId,
      duration_watched_seconds: durationWatched,
      completed,
      started_at: new Date().toISOString(),
      metadata,
    });

  if (error) {
    console.error('[UserState] recordWatchEvent error:', error);
    return false;
  }

  return true;
}

/**
 * Record a listen event
 */
export async function recordListenEvent(
  userId: string,
  nodeId: string,
  durationListened: number,
  skipped: boolean,
  metadata?: Record<string, any>
): Promise<boolean> {
  const { error } = await supabase
    .from('user_listen_events')
    .insert({
      user_id: userId,
      media_node_id: nodeId,
      duration_listened_seconds: durationListened,
      skipped,
      started_at: new Date().toISOString(),
      metadata,
    });

  if (error) {
    console.error('[UserState] recordListenEvent error:', error);
    return false;
  }

  return true;
}

// =============================================================================
// USER LIBRARY VIEW
// =============================================================================

/**
 * Get user's complete library (all saved content)
 */
export async function getUserLibrary(
  userId: string,
  category?: MediaCategory,
  limit: number = 50
): Promise<MediaNode[]> {
  // Try the view first
  const { data, error } = await supabase
    .from('user_library')
    .select('*')
    .eq('user_id', userId)
    .limit(limit);

  if (error) {
    console.error('[UserState] getUserLibrary view error:', error);
    return [];
  }

  let result = data || [];

  if (category) {
    result = result.filter((item: any) => item.category === category);
  }

  return result.map((row: any) => ({
    id: row.media_node_id,
    title: row.title,
    thumbnail_url: row.thumbnail_url,
    poster_url: row.poster_url,
    media_type: row.media_type,
    category: row.category,
    _source: row.source_collection,
    _addedAt: row.added_at,
  })) as MediaNode[];
}
