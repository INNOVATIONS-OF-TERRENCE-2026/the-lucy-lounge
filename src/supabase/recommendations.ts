/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — SUPABASE RECOMMENDATIONS ACCESS LAYER                    │
 * │                                                                             │
 * │ User-isolated queries for recommendations, journeys, and discovery         │
 * │ PHASE 2 IMPLEMENTATION                                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  MediaNode,
  MediaCategory,
  MediaType,
  LucyJourney,
  MoodDiscoveryConfig,
  RecommendationRow,
} from '@/media/types';

// =============================================================================
// RECOMMENDATION QUERIES
// =============================================================================

/**
 * Get recommendations by genre (SQL-based candidate generation)
 */
export async function getRecommendationsByGenre(
  genreSlugs: string[],
  limit: number = 20,
  excludeIds: string[] = []
): Promise<MediaNode[]> {
  // Try RPC function first
  const { data, error } = await supabase.rpc('get_recommendations_by_genre', {
    genre_slugs: genreSlugs,
    result_limit: limit,
    exclude_node_ids: excludeIds,
  });

  if (!error && data) {
    return data as MediaNode[];
  }

  // Fallback to direct query
  const { data: fallbackData, error: fallbackError } = await supabase
    .from('media_node_tags')
    .select(`
      media_nodes!inner (*)
    `)
    .in('media_tags.slug', genreSlugs)
    .not('media_nodes.id', 'in', `(${excludeIds.join(',')})`)
    .limit(limit);

  if (fallbackError) {
    console.error('[Recommendations] getRecommendationsByGenre error:', fallbackError);
    return [];
  }

  return (fallbackData || []).map((t: any) => t.media_nodes as MediaNode);
}

/**
 * Get personalized recommendations for a user
 */
export async function getPersonalizedRecommendations(
  userId: string,
  category?: MediaCategory,
  limit: number = 30
): Promise<MediaNode[]> {
  // Get user's taste profile
  const { data: profile } = await supabase
    .from('user_taste_profiles')
    .select('genre_scores, mood_scores, taste_embedding_combined')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    // Cold start - return popular content
    return getPopularContent(category, limit);
  }

  // Get top genres from profile
  const genreScores = profile.genre_scores as Record<string, number> || {};
  const topGenres = Object.entries(genreScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre]) => genre);

  if (topGenres.length === 0) {
    return getPopularContent(category, limit);
  }

  // Get recently interacted items to exclude
  const { data: recentState } = await supabase
    .from('user_media_state')
    .select('media_node_id')
    .eq('user_id', userId)
    .order('last_played_at', { ascending: false })
    .limit(50);

  const excludeIds = (recentState || []).map(s => s.media_node_id);

  // Get recommendations by genre
  const recommendations = await getRecommendationsByGenre(topGenres, limit * 2, excludeIds);

  // Filter by category if specified
  let filtered = recommendations;
  if (category) {
    filtered = recommendations.filter(node => node.category === category);
  }

  return filtered.slice(0, limit);
}

/**
 * Get popular content (fallback for cold start)
 */
export async function getPopularContent(
  category?: MediaCategory,
  limit: number = 20
): Promise<MediaNode[]> {
  let query = supabase
    .from('media_nodes')
    .select('*')
    .order('popularity_score', { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Recommendations] getPopularContent error:', error);
    return getFallbackContent(category, limit);
  }

  // If no data, return fallback content
  if (!data || data.length === 0) {
    return getFallbackContent(category, limit);
  }

  return data as MediaNode[];
}

/**
 * Fallback content when database is empty
 * This ensures "For You" always has something to show
 */
export function getFallbackContent(
  category?: MediaCategory,
  limit: number = 20
): MediaNode[] {
  const audioFallback: MediaNode[] = [
    {
      id: 'fallback-audio-1',
      title: 'Chill Vibes Mix',
      media_type: 'audio',
      category: 'music',
      description: 'Relaxing lo-fi beats to help you unwind',
      thumbnail_url: '/fallback/chill-vibes.jpg',
      popularity_score: 100,
      metadata: { genre: 'lo-fi', mood: 'relaxing', duration: 3600 }
    },
    {
      id: 'fallback-audio-2',
      title: 'Focus Flow',
      media_type: 'audio',
      category: 'music',
      description: 'Ambient sounds for deep concentration',
      thumbnail_url: '/fallback/focus-flow.jpg',
      popularity_score: 95,
      metadata: { genre: 'ambient', mood: 'focused', duration: 3600 }
    },
    {
      id: 'fallback-audio-3',
      title: 'Upbeat Energy',
      media_type: 'audio',
      category: 'music',
      description: 'High-energy electronic tracks to boost your mood',
      thumbnail_url: '/fallback/upbeat-energy.jpg',
      popularity_score: 90,
      metadata: { genre: 'electronic', mood: 'energetic', duration: 2400 }
    },
    {
      id: 'fallback-audio-4',
      title: 'Jazz Essentials',
      media_type: 'audio',
      category: 'music',
      description: 'Smooth jazz classics for any occasion',
      thumbnail_url: '/fallback/jazz-essentials.jpg',
      popularity_score: 85,
      metadata: { genre: 'jazz', mood: 'smooth', duration: 3600 }
    },
    {
      id: 'fallback-audio-5',
      title: 'Classical Focus',
      media_type: 'audio',
      category: 'music',
      description: 'Timeless classical pieces for productivity',
      thumbnail_url: '/fallback/classical-focus.jpg',
      popularity_score: 80,
      metadata: { genre: 'classical', mood: 'focused', duration: 4200 }
    },
    {
      id: 'fallback-audio-6',
      title: 'Indie Discoveries',
      media_type: 'audio',
      category: 'music',
      description: 'Fresh indie tracks you haven\'t heard yet',
      thumbnail_url: '/fallback/indie-discoveries.jpg',
      popularity_score: 75,
      metadata: { genre: 'indie', mood: 'exploratory', duration: 2700 }
    },
    {
      id: 'fallback-audio-7',
      title: 'R&B Nights',
      media_type: 'audio',
      category: 'music',
      description: 'Soulful R&B for late night vibes',
      thumbnail_url: '/fallback/rnb-nights.jpg',
      popularity_score: 70,
      metadata: { genre: 'r&b', mood: 'romantic', duration: 3000 }
    },
    {
      id: 'fallback-audio-8',
      title: 'Hip Hop Hits',
      media_type: 'audio',
      category: 'music',
      description: 'Top hip hop tracks of the moment',
      thumbnail_url: '/fallback/hiphop-hits.jpg',
      popularity_score: 65,
      metadata: { genre: 'hip-hop', mood: 'energetic', duration: 2400 }
    },
  ];

  const videoFallback: MediaNode[] = [
    {
      id: 'fallback-video-1',
      title: 'Trending Now',
      media_type: 'video',
      category: 'entertainment',
      description: 'The most popular content this week',
      thumbnail_url: '/fallback/trending.jpg',
      popularity_score: 100,
      metadata: { genre: 'trending', duration: 5400 }
    },
    {
      id: 'fallback-video-2',
      title: 'Documentary Picks',
      media_type: 'video',
      category: 'documentary',
      description: 'Eye-opening documentaries to expand your mind',
      thumbnail_url: '/fallback/documentary.jpg',
      popularity_score: 95,
      metadata: { genre: 'documentary', duration: 7200 }
    },
    {
      id: 'fallback-video-3',
      title: 'Comedy Highlights',
      media_type: 'video',
      category: 'comedy',
      description: 'Laugh out loud with these comedy gems',
      thumbnail_url: '/fallback/comedy.jpg',
      popularity_score: 90,
      metadata: { genre: 'comedy', duration: 5400 }
    },
    {
      id: 'fallback-video-4',
      title: 'Action Essentials',
      media_type: 'video',
      category: 'action',
      description: 'Heart-pumping action for thrill seekers',
      thumbnail_url: '/fallback/action.jpg',
      popularity_score: 85,
      metadata: { genre: 'action', duration: 7200 }
    },
    {
      id: 'fallback-video-5',
      title: 'Drama Collection',
      media_type: 'video',
      category: 'drama',
      description: 'Compelling dramas that tell powerful stories',
      thumbnail_url: '/fallback/drama.jpg',
      popularity_score: 80,
      metadata: { genre: 'drama', duration: 6600 }
    },
    {
      id: 'fallback-video-6',
      title: 'Sci-Fi Adventures',
      media_type: 'video',
      category: 'sci-fi',
      description: 'Journey to the future and beyond',
      thumbnail_url: '/fallback/scifi.jpg',
      popularity_score: 75,
      metadata: { genre: 'sci-fi', duration: 7800 }
    },
    {
      id: 'fallback-video-7',
      title: 'Thriller Picks',
      media_type: 'video',
      category: 'thriller',
      description: 'Edge-of-your-seat suspense',
      thumbnail_url: '/fallback/thriller.jpg',
      popularity_score: 70,
      metadata: { genre: 'thriller', duration: 6000 }
    },
    {
      id: 'fallback-video-8',
      title: 'Animation Favorites',
      media_type: 'video',
      category: 'animation',
      description: 'Animated stories for all ages',
      thumbnail_url: '/fallback/animation.jpg',
      popularity_score: 65,
      metadata: { genre: 'animation', duration: 5400 }
    },
  ];

  let content: MediaNode[];
  
  if (category === 'music' || category === 'podcast') {
    content = audioFallback;
  } else if (category) {
    content = videoFallback.filter(v => v.category === category);
    if (content.length === 0) content = videoFallback;
  } else {
    content = [...audioFallback.slice(0, 4), ...videoFallback.slice(0, 4)];
  }

  return content.slice(0, limit);
}

/**
 * Get "Because you watched X" recommendations
 */
export async function getBecauseYouWatched(
  userId: string,
  limit: number = 3
): Promise<Array<{ sourceNode: MediaNode; recommendations: MediaNode[] }>> {
  // Get user's recent completed items
  const { data: recentCompleted } = await supabase
    .from('user_media_state')
    .select(`
      media_nodes!inner (*)
    `)
    .eq('user_id', userId)
    .eq('is_completed', true)
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (!recentCompleted || recentCompleted.length === 0) {
    return [];
  }

  const results: Array<{ sourceNode: MediaNode; recommendations: MediaNode[] }> = [];

  for (const item of recentCompleted) {
    const sourceNode = (item as any).media_nodes as MediaNode;

    // Get related content
    const { data: related } = await supabase
      .from('media_relationships')
      .select(`
        media_nodes!media_relationships_target_id_fkey (*)
      `)
      .eq('source_id', sourceNode.id)
      .in('relationship_type', ['similar_to', 'recommended_after', 'same_franchise'])
      .order('weight', { ascending: false })
      .limit(10);

    const recommendations = (related || [])
      .filter((r: any) => r.media_nodes)
      .map((r: any) => r.media_nodes as MediaNode);

    if (recommendations.length > 0) {
      results.push({ sourceNode, recommendations });
    }
  }

  return results;
}

// =============================================================================
// LUCY JOURNEYS
// =============================================================================

/**
 * Get featured Lucy Journeys
 */
export async function getFeaturedJourneys(
  category?: MediaCategory,
  limit: number = 10
): Promise<LucyJourney[]> {
  let query = supabase
    .from('lucy_journeys')
    .select('*')
    .eq('is_featured', true)
    .order('popularity_score', { ascending: false })
    .limit(limit);

  if (category) {
    query = query.contains('media_categories', [category]);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Recommendations] getFeaturedJourneys error:', error);
    return [];
  }

  return (data || []) as LucyJourney[];
}

/**
 * Get journeys by mood
 */
export async function getJourneysByMood(
  mood: string,
  limit: number = 10
): Promise<LucyJourney[]> {
  const { data, error } = await supabase
    .from('lucy_journeys')
    .select('*')
    .contains('moods', [mood])
    .order('popularity_score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[Recommendations] getJourneysByMood error:', error);
    return [];
  }

  return (data || []) as LucyJourney[];
}

/**
 * Get a specific journey with its steps
 */
export async function getJourneyWithSteps(journeyId: string): Promise<{
  journey: LucyJourney;
  nodes: MediaNode[];
} | null> {
  const { data: journey, error } = await supabase
    .from('lucy_journeys')
    .select('*')
    .eq('id', journeyId)
    .single();

  if (error || !journey) {
    console.error('[Recommendations] getJourneyWithSteps error:', error);
    return null;
  }

  // Get nodes from journey steps
  const steps = journey.steps as Array<{ media_node_id: string; description?: string }>;
  const nodeIds = steps.map(s => s.media_node_id);

  const { data: nodes } = await supabase
    .from('media_nodes')
    .select('*')
    .in('id', nodeIds);

  // Order nodes by step order
  const orderedNodes = nodeIds
    .map(id => (nodes || []).find(n => n.id === id))
    .filter(Boolean) as MediaNode[];

  return {
    journey: journey as LucyJourney,
    nodes: orderedNodes,
  };
}

// =============================================================================
// MOOD DISCOVERY
// =============================================================================

/**
 * Get all mood discovery configs
 */
export async function getMoodDiscoveryConfigs(): Promise<MoodDiscoveryConfig[]> {
  const { data, error } = await supabase
    .from('mood_discovery_config')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[Recommendations] getMoodDiscoveryConfigs error:', error);
    return [];
  }

  return (data || []) as MoodDiscoveryConfig[];
}

/**
 * Get content for a specific mood
 */
export async function getMoodContent(
  moodSlug: string,
  category?: MediaCategory,
  limit: number = 30
): Promise<MediaNode[]> {
  // Get mood config
  const { data: moodConfig } = await supabase
    .from('mood_discovery_config')
    .select('*')
    .eq('mood_slug', moodSlug)
    .single();

  if (!moodConfig) {
    return [];
  }

  const genreWeights = moodConfig.genre_weights as Record<string, number>;
  const topGenres = Object.entries(genreWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre]) => genre);

  // Get content with matching tags
  const { data, error } = await supabase
    .from('media_node_tags')
    .select(`
      relevance,
      media_nodes!inner (*)
    `)
    .in('media_tags.slug', topGenres)
    .order('relevance', { ascending: false })
    .limit(limit * 2);

  if (error) {
    console.error('[Recommendations] getMoodContent error:', error);
    return [];
  }

  let result = (data || []).map((t: any) => t.media_nodes as MediaNode);

  if (category) {
    result = result.filter(node => node.category === category);
  }

  return result.slice(0, limit);
}

// =============================================================================
// TIME-BASED DISCOVERY
// =============================================================================

/**
 * Get content appropriate for the current time of day
 */
export async function getTimeBasedContent(
  category?: MediaCategory,
  limit: number = 20
): Promise<MediaNode[]> {
  const hour = new Date().getHours();
  let mood: string;

  // Map time to mood
  if (hour >= 6 && hour < 12) {
    mood = 'uplifting';
  } else if (hour >= 12 && hour < 17) {
    mood = 'focus';
  } else if (hour >= 17 && hour < 22) {
    mood = 'relaxing';
  } else {
    mood = 'chill';
  }

  return getMoodContent(mood, category, limit);
}

// =============================================================================
// COLD START HELPERS
// =============================================================================

/**
 * Check if user is in cold start state
 */
export async function isUserColdStart(userId: string): Promise<boolean> {
  const [watchCount, listenCount, ratingCount] = await Promise.all([
    supabase.from('user_watch_events').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('user_listen_events').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('user_ratings').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);

  const totalInteractions = 
    (watchCount.count || 0) + 
    (listenCount.count || 0) + 
    (ratingCount.count || 0);

  return totalInteractions < 5;
}

/**
 * Save quiz responses to bootstrap taste profile
 */
export async function saveQuizResponses(
  userId: string,
  genreScores: Record<string, number>,
  moodScores: Record<string, number>
): Promise<boolean> {
  const { error } = await supabase
    .from('user_taste_profiles')
    .upsert({
      user_id: userId,
      genre_scores: genreScores,
      mood_scores: moodScores,
      media_type_scores: {},
      quiz_completed: true,
      quiz_completed_at: new Date().toISOString(),
      last_computed_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('[Recommendations] saveQuizResponses error:', error);
    return false;
  }

  return true;
}

// =============================================================================
// RECOMMENDATION ROWS (For UI)
// =============================================================================

/**
 * Build complete recommendation rows for a page
 */
export async function buildRecommendationRows(
  userId: string | null,
  category?: MediaCategory,
  options: {
    includeTrending?: boolean;
    includeNewReleases?: boolean;
    includeJourneys?: boolean;
    includeMoods?: boolean;
    includeBecauseYouWatched?: boolean;
  } = {}
): Promise<RecommendationRow[]> {
  const rows: RecommendationRow[] = [];
  const {
    includeTrending = true,
    includeNewReleases = true,
    includeJourneys = true,
    includeMoods = true,
    includeBecauseYouWatched = true,
  } = options;

  // Personalized recommendations (if user is logged in)
  if (userId) {
    const personalized = await getPersonalizedRecommendations(userId, category, 15);
    if (personalized.length > 0) {
      rows.push({
        id: 'personalized',
        title: 'For You',
        reason: 'Based on your taste',
        reason_type: 'personalized',
        items: personalized,
      });
    }

    // Because you watched
    if (includeBecauseYouWatched) {
      const becauseYouWatched = await getBecauseYouWatched(userId, 2);
      for (const { sourceNode, recommendations } of becauseYouWatched) {
        rows.push({
          id: `because-${sourceNode.id}`,
          title: `Because You Watched ${sourceNode.title}`,
          reason: `Based on ${sourceNode.title}`,
          reason_type: 'because_you_watched',
          items: recommendations,
        });
      }
    }
  } else {
    // For anonymous users, show "Popular" as "For You"
    const popular = await getPopularContent(category, 15);
    if (popular.length > 0) {
      rows.push({
        id: 'personalized',
        title: 'For You',
        reason: 'Popular picks to get you started',
        reason_type: 'personalized',
        items: popular,
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
        reason: 'What everyone\'s watching',
        reason_type: 'trending',
        items: trending,
      });
    }
  }

  // New releases
  if (includeNewReleases) {
    let query = supabase
      .from('media_nodes')
      .select('*')
      .gte('release_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('release_date', { ascending: false })
      .limit(15);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: newReleases } = await query;
    if (newReleases && newReleases.length > 0) {
      rows.push({
        id: 'new-releases',
        title: 'New Releases',
        reason: 'Just dropped',
        reason_type: 'new_release',
        items: newReleases as MediaNode[],
      });
    }
  }

  // Lucy Journeys
  if (includeJourneys) {
    const journeys = await getFeaturedJourneys(category, 5);
    if (journeys.length > 0) {
      rows.push({
        id: 'journeys',
        title: 'Lucy Journeys',
        reason: 'Curated adventures',
        reason_type: 'journey',
        items: [],
        journeys,
      } as any);
    }
  }

  // Mood discovery rows
  if (includeMoods) {
    const moodConfigs = await getMoodDiscoveryConfigs();
    for (const mood of moodConfigs.slice(0, 3)) {
      const moodContent = await getMoodContent(mood.mood_slug, category, 10);
      if (moodContent.length > 0) {
        rows.push({
          id: `mood-${mood.mood_slug}`,
          title: mood.display_name,
          reason: mood.description || `Perfect for ${mood.mood_slug} vibes`,
          reason_type: 'mood',
          items: moodContent,
        });
      }
    }
  }

  return rows;
}
