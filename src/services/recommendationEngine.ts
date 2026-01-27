/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — RECOMMENDATION ENGINE                                    │
 * │                                                                             │
 * │ Embedding-based recommendation system with user taste vectors,             │
 * │ session learning, and cross-mode intelligence                              │
 * │                                                                             │
 * │ Lucy knows what you like.                                                  │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { supabase } from '@/integrations/supabase/client';

// =============================================================================
// TYPES
// =============================================================================

export interface TasteVector {
  genres: Record<string, number>;
  moods: Record<string, number>;
  artists: Record<string, number>;
  eras: Record<string, number>;
  tempos: Record<string, number>;
  energy: number;
  valence: number;
  acousticness: number;
  danceability: number;
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'track' | 'album' | 'playlist' | 'video' | 'movie' | 'show';
  category: string;
  thumbnail?: string;
  metadata: Record<string, unknown>;
  embedding?: number[];
  score?: number;
  reason?: string;
}

export interface RecommendationRow {
  id: string;
  title: string;
  reason: string;
  reasonType: 'personalized' | 'trending' | 'mood' | 'similar' | 'discovery' | 'because_you_liked';
  items: MediaItem[];
  sourceItem?: MediaItem;
}

export interface UserInteraction {
  itemId: string;
  type: 'play' | 'like' | 'skip' | 'save' | 'share' | 'complete';
  duration?: number;
  timestamp: Date;
}

export interface SessionContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
  recentMoods: string[];
  recentGenres: string[];
  currentActivity?: string;
}

// =============================================================================
// TASTE VECTOR MANAGEMENT
// =============================================================================

const DEFAULT_TASTE_VECTOR: TasteVector = {
  genres: {},
  moods: {},
  artists: {},
  eras: {},
  tempos: {},
  energy: 0.5,
  valence: 0.5,
  acousticness: 0.5,
  danceability: 0.5,
};

/**
 * Get user's taste vector from database or create default
 */
export async function getUserTasteVector(userId: string): Promise<TasteVector> {
  try {
    const { data, error } = await supabase
      .from('user_taste_profiles')
      .select('genre_scores, mood_scores, taste_embedding_combined')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return DEFAULT_TASTE_VECTOR;
    }

    return {
      genres: data.genre_scores || {},
      moods: data.mood_scores || {},
      artists: {},
      eras: {},
      tempos: {},
      energy: 0.5,
      valence: 0.5,
      acousticness: 0.5,
      danceability: 0.5,
    };
  } catch {
    return DEFAULT_TASTE_VECTOR;
  }
}

/**
 * Update user's taste vector based on interaction
 */
export async function updateTasteVector(
  userId: string,
  interaction: UserInteraction,
  itemMetadata: Record<string, unknown>
): Promise<void> {
  const weights: Record<string, number> = {
    play: 0.1,
    like: 0.3,
    skip: -0.2,
    save: 0.4,
    share: 0.5,
    complete: 0.2,
  };

  const weight = weights[interaction.type] || 0;
  if (weight === 0) return;

  try {
    // Get current profile
    const { data: profile } = await supabase
      .from('user_taste_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const genreScores = (profile?.genre_scores as Record<string, number>) || {};
    const moodScores = (profile?.mood_scores as Record<string, number>) || {};

    // Update genre scores
    const genres = (itemMetadata.genres as string[]) || [];
    for (const genre of genres) {
      genreScores[genre] = (genreScores[genre] || 0) + weight;
      // Normalize to [-1, 1]
      genreScores[genre] = Math.max(-1, Math.min(1, genreScores[genre]));
    }

    // Update mood scores
    const moods = (itemMetadata.moods as string[]) || [];
    for (const mood of moods) {
      moodScores[mood] = (moodScores[mood] || 0) + weight;
      moodScores[mood] = Math.max(-1, Math.min(1, moodScores[mood]));
    }

    // Upsert profile
    await supabase
      .from('user_taste_profiles')
      .upsert({
        user_id: userId,
        genre_scores: genreScores,
        mood_scores: moodScores,
        last_computed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    // Record interaction
    await supabase
      .from('user_media_interactions')
      .insert({
        user_id: userId,
        media_node_id: interaction.itemId,
        interaction_type: interaction.type,
        duration_seconds: interaction.duration,
      });

  } catch (err) {
    console.error('[RecommendationEngine] Update taste vector error:', err);
  }
}

// =============================================================================
// SESSION CONTEXT
// =============================================================================

/**
 * Get current session context
 */
export function getSessionContext(): SessionContext {
  const now = new Date();
  const hour = now.getHours();
  
  let timeOfDay: SessionContext['timeOfDay'];
  if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
  else timeOfDay = 'night';

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = days[now.getDay()];

  return {
    timeOfDay,
    dayOfWeek,
    recentMoods: [],
    recentGenres: [],
  };
}

/**
 * Get mood suggestions based on time of day
 */
export function getTimeMoodSuggestions(context: SessionContext): string[] {
  const moodMap: Record<string, string[]> = {
    morning: ['energetic', 'uplifting', 'motivational', 'fresh'],
    afternoon: ['focused', 'productive', 'chill', 'groovy'],
    evening: ['relaxing', 'romantic', 'smooth', 'mellow'],
    night: ['calm', 'ambient', 'dreamy', 'introspective'],
  };

  return moodMap[context.timeOfDay] || ['chill'];
}

// =============================================================================
// RECOMMENDATION ALGORITHMS
// =============================================================================

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Convert taste vector to embedding array
 */
function tasteVectorToEmbedding(taste: TasteVector): number[] {
  const embedding: number[] = [];
  
  // Add genre scores (normalized)
  const genres = Object.values(taste.genres);
  const genreSum = genres.reduce((a, b) => a + Math.abs(b), 0) || 1;
  embedding.push(...genres.map(g => g / genreSum).slice(0, 20));
  while (embedding.length < 20) embedding.push(0);
  
  // Add mood scores
  const moods = Object.values(taste.moods);
  const moodSum = moods.reduce((a, b) => a + Math.abs(b), 0) || 1;
  embedding.push(...moods.map(m => m / moodSum).slice(0, 10));
  while (embedding.length < 30) embedding.push(0);
  
  // Add audio features
  embedding.push(taste.energy, taste.valence, taste.acousticness, taste.danceability);
  
  return embedding;
}

/**
 * Get personalized recommendations based on taste vector
 */
export async function getPersonalizedRecommendations(
  userId: string,
  category?: string,
  limit = 20
): Promise<MediaItem[]> {
  try {
    const taste = await getUserTasteVector(userId);
    const topGenres = Object.entries(taste.genres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre);

    if (topGenres.length === 0) {
      // Cold start - return popular content
      return getPopularContent(category, limit);
    }

    // Query items matching top genres
    let query = supabase
      .from('media_nodes')
      .select('*')
      .order('popularity_score', { ascending: false })
      .limit(limit * 3);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Score and rank items
    const scored = (data || []).map(item => {
      let score = item.popularity_score || 0;
      
      // Boost items matching user's genres
      const itemGenres = (item.metadata as any)?.genres || [];
      for (const genre of itemGenres) {
        if (taste.genres[genre]) {
          score += taste.genres[genre] * 10;
        }
      }
      
      // Boost items matching user's moods
      const itemMoods = (item.metadata as any)?.moods || [];
      for (const mood of itemMoods) {
        if (taste.moods[mood]) {
          score += taste.moods[mood] * 5;
        }
      }

      return {
        id: item.id,
        title: item.title,
        type: item.media_type as MediaItem['type'],
        category: item.category,
        thumbnail: item.thumbnail_url,
        metadata: item.metadata || {},
        score,
        reason: 'Based on your taste',
      };
    });

    // Sort by score and return top items
    return scored
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);

  } catch (err) {
    console.error('[RecommendationEngine] Personalized recommendations error:', err);
    return getPopularContent(category, limit);
  }
}

/**
 * Get similar items based on embedding similarity
 */
export async function getSimilarItems(
  itemId: string,
  limit = 10
): Promise<MediaItem[]> {
  try {
    // Get source item
    const { data: sourceItem } = await supabase
      .from('media_nodes')
      .select('*')
      .eq('id', itemId)
      .single();

    if (!sourceItem) return [];

    // Get items in same category
    const { data: candidates } = await supabase
      .from('media_nodes')
      .select('*')
      .eq('category', sourceItem.category)
      .neq('id', itemId)
      .limit(100);

    if (!candidates) return [];

    // Score by metadata similarity
    const sourceGenres = new Set((sourceItem.metadata as any)?.genres || []);
    const sourceMoods = new Set((sourceItem.metadata as any)?.moods || []);

    const scored = candidates.map(item => {
      let score = 0;
      
      const itemGenres = (item.metadata as any)?.genres || [];
      const itemMoods = (item.metadata as any)?.moods || [];
      
      // Genre overlap
      for (const genre of itemGenres) {
        if (sourceGenres.has(genre)) score += 2;
      }
      
      // Mood overlap
      for (const mood of itemMoods) {
        if (sourceMoods.has(mood)) score += 1;
      }

      return {
        id: item.id,
        title: item.title,
        type: item.media_type as MediaItem['type'],
        category: item.category,
        thumbnail: item.thumbnail_url,
        metadata: item.metadata || {},
        score,
        reason: `Similar to ${sourceItem.title}`,
      };
    });

    return scored
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);

  } catch (err) {
    console.error('[RecommendationEngine] Similar items error:', err);
    return [];
  }
}

/**
 * Get mood-based recommendations
 */
export async function getMoodRecommendations(
  mood: string,
  category?: string,
  limit = 20
): Promise<MediaItem[]> {
  try {
    // Get mood config
    const { data: moodConfig } = await supabase
      .from('mood_discovery_config')
      .select('*')
      .eq('mood_slug', mood)
      .single();

    const genreWeights = (moodConfig?.genre_weights as Record<string, number>) || {};
    const topGenres = Object.entries(genreWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre);

    let query = supabase
      .from('media_nodes')
      .select('*')
      .order('popularity_score', { ascending: false })
      .limit(limit * 2);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Filter and score by mood match
    const scored = (data || [])
      .filter(item => {
        const itemMoods = (item.metadata as any)?.moods || [];
        const itemGenres = (item.metadata as any)?.genres || [];
        return itemMoods.includes(mood) || itemGenres.some((g: string) => topGenres.includes(g));
      })
      .map(item => ({
        id: item.id,
        title: item.title,
        type: item.media_type as MediaItem['type'],
        category: item.category,
        thumbnail: item.thumbnail_url,
        metadata: item.metadata || {},
        reason: `Perfect for ${mood} vibes`,
      }));

    return scored.slice(0, limit);

  } catch (err) {
    console.error('[RecommendationEngine] Mood recommendations error:', err);
    return [];
  }
}

/**
 * Get trending/popular content
 */
export async function getPopularContent(
  category?: string,
  limit = 20
): Promise<MediaItem[]> {
  try {
    let query = supabase
      .from('media_nodes')
      .select('*')
      .order('popularity_score', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    
    if (error || !data || data.length === 0) {
      return getFallbackContent(category, limit);
    }

    return data.map(item => ({
      id: item.id,
      title: item.title,
      type: item.media_type as MediaItem['type'],
      category: item.category,
      thumbnail: item.thumbnail_url,
      metadata: item.metadata || {},
      reason: 'Trending now',
    }));

  } catch {
    return getFallbackContent(category, limit);
  }
}

/**
 * Get discovery recommendations (new/unexplored content)
 */
export async function getDiscoveryRecommendations(
  userId: string,
  category?: string,
  limit = 20
): Promise<MediaItem[]> {
  try {
    // Get user's interaction history
    const { data: interactions } = await supabase
      .from('user_media_interactions')
      .select('media_node_id')
      .eq('user_id', userId)
      .limit(500);

    const interactedIds = new Set((interactions || []).map(i => i.media_node_id));

    // Get recent releases not yet interacted with
    let query = supabase
      .from('media_nodes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit * 3);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Filter out already interacted items
    const newItems = (data || [])
      .filter(item => !interactedIds.has(item.id))
      .slice(0, limit)
      .map(item => ({
        id: item.id,
        title: item.title,
        type: item.media_type as MediaItem['type'],
        category: item.category,
        thumbnail: item.thumbnail_url,
        metadata: item.metadata || {},
        reason: 'New discovery for you',
      }));

    return newItems;

  } catch (err) {
    console.error('[RecommendationEngine] Discovery recommendations error:', err);
    return [];
  }
}

// =============================================================================
// RECOMMENDATION ROWS BUILDER
// =============================================================================

/**
 * Build complete recommendation rows for a page
 */
export async function buildRecommendationRows(
  userId: string | null,
  category?: string,
  options: {
    includePersonalized?: boolean;
    includeTrending?: boolean;
    includeMoods?: boolean;
    includeDiscovery?: boolean;
    includeSimilar?: boolean;
    recentItemId?: string;
  } = {}
): Promise<RecommendationRow[]> {
  const {
    includePersonalized = true,
    includeTrending = true,
    includeMoods = true,
    includeDiscovery = true,
    includeSimilar = true,
    recentItemId,
  } = options;

  const rows: RecommendationRow[] = [];
  const context = getSessionContext();

  // Personalized "For You" row
  if (includePersonalized && userId) {
    const personalized = await getPersonalizedRecommendations(userId, category, 15);
    if (personalized.length > 0) {
      rows.push({
        id: 'for-you',
        title: 'For You',
        reason: 'Based on your taste',
        reasonType: 'personalized',
        items: personalized,
      });
    }
  }

  // Similar to recently played
  if (includeSimilar && recentItemId) {
    const similar = await getSimilarItems(recentItemId, 10);
    if (similar.length > 0) {
      rows.push({
        id: `similar-${recentItemId}`,
        title: 'More Like This',
        reason: similar[0].reason || 'Similar vibes',
        reasonType: 'similar',
        items: similar,
      });
    }
  }

  // Trending
  if (includeTrending) {
    const trending = await getPopularContent(category, 15);
    if (trending.length > 0) {
      rows.push({
        id: 'trending',
        title: 'Trending Now',
        reason: "What everyone's listening to",
        reasonType: 'trending',
        items: trending,
      });
    }
  }

  // Mood-based rows
  if (includeMoods) {
    const suggestedMoods = getTimeMoodSuggestions(context);
    for (const mood of suggestedMoods.slice(0, 2)) {
      const moodItems = await getMoodRecommendations(mood, category, 10);
      if (moodItems.length > 0) {
        rows.push({
          id: `mood-${mood}`,
          title: `${mood.charAt(0).toUpperCase() + mood.slice(1)} Vibes`,
          reason: `Perfect for ${context.timeOfDay}`,
          reasonType: 'mood',
          items: moodItems,
        });
      }
    }
  }

  // Discovery
  if (includeDiscovery && userId) {
    const discovery = await getDiscoveryRecommendations(userId, category, 15);
    if (discovery.length > 0) {
      rows.push({
        id: 'discovery',
        title: 'Discover Something New',
        reason: 'Fresh picks for you',
        reasonType: 'discovery',
        items: discovery,
      });
    }
  }

  return rows;
}

// =============================================================================
// FALLBACK CONTENT
// =============================================================================

function getFallbackContent(category?: string, limit = 20): MediaItem[] {
  const audioFallback: MediaItem[] = [
    { id: 'fb-1', title: 'Chill Vibes Mix', type: 'playlist', category: 'music', metadata: { genre: 'lo-fi', mood: 'relaxing' } },
    { id: 'fb-2', title: 'Focus Flow', type: 'playlist', category: 'music', metadata: { genre: 'ambient', mood: 'focused' } },
    { id: 'fb-3', title: 'Upbeat Energy', type: 'playlist', category: 'music', metadata: { genre: 'electronic', mood: 'energetic' } },
    { id: 'fb-4', title: 'Jazz Essentials', type: 'playlist', category: 'music', metadata: { genre: 'jazz', mood: 'smooth' } },
    { id: 'fb-5', title: 'Classical Focus', type: 'playlist', category: 'music', metadata: { genre: 'classical', mood: 'focused' } },
    { id: 'fb-6', title: 'Indie Discoveries', type: 'playlist', category: 'music', metadata: { genre: 'indie', mood: 'exploratory' } },
    { id: 'fb-7', title: 'R&B Nights', type: 'playlist', category: 'music', metadata: { genre: 'r&b', mood: 'romantic' } },
    { id: 'fb-8', title: 'Hip Hop Hits', type: 'playlist', category: 'music', metadata: { genre: 'hip-hop', mood: 'energetic' } },
  ];

  const videoFallback: MediaItem[] = [
    { id: 'fb-v1', title: 'Trending Now', type: 'video', category: 'entertainment', metadata: { genre: 'trending' } },
    { id: 'fb-v2', title: 'Documentary Picks', type: 'video', category: 'documentary', metadata: { genre: 'documentary' } },
    { id: 'fb-v3', title: 'Comedy Highlights', type: 'video', category: 'comedy', metadata: { genre: 'comedy' } },
    { id: 'fb-v4', title: 'Action Essentials', type: 'video', category: 'action', metadata: { genre: 'action' } },
    { id: 'fb-v5', title: 'Drama Collection', type: 'video', category: 'drama', metadata: { genre: 'drama' } },
    { id: 'fb-v6', title: 'Sci-Fi Adventures', type: 'video', category: 'sci-fi', metadata: { genre: 'sci-fi' } },
  ];

  let content: MediaItem[];
  
  if (category === 'music' || category === 'podcast') {
    content = audioFallback;
  } else if (category) {
    content = videoFallback;
  } else {
    content = [...audioFallback.slice(0, 4), ...videoFallback.slice(0, 4)];
  }

  return content.slice(0, limit).map(item => ({
    ...item,
    reason: 'Popular pick',
  }));
}

export default {
  getUserTasteVector,
  updateTasteVector,
  getSessionContext,
  getTimeMoodSuggestions,
  getPersonalizedRecommendations,
  getSimilarItems,
  getMoodRecommendations,
  getPopularContent,
  getDiscoveryRecommendations,
  buildRecommendationRows,
};
