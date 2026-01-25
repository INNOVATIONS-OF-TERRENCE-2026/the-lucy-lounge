/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — SUPABASE MEDIA ACCESS LAYER                              │
 * │                                                                             │
 * │ User-isolated queries for Universal Media Graph                            │
 * │ PHASE 2 IMPLEMENTATION                                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  MediaNode,
  MediaSeries,
  MediaCategory,
  MediaType,
  ProviderType,
} from '@/media/types';

// =============================================================================
// TYPES
// =============================================================================

export interface MediaQueryParams {
  category?: MediaCategory;
  mediaType?: MediaType;
  provider?: ProviderType;
  genres?: string[];
  moods?: string[];
  limit?: number;
  offset?: number;
}

export interface MediaSearchParams extends MediaQueryParams {
  query: string;
  threshold?: number;
}

export interface TrendingParams {
  category?: MediaCategory;
  mediaType?: MediaType;
  limit?: number;
  timeframe?: 'day' | 'week' | 'month';
}

// =============================================================================
// MEDIA NODE QUERIES
// =============================================================================

/**
 * Get a single media node by ID
 */
export async function getMediaNode(nodeId: string): Promise<MediaNode | null> {
  const { data, error } = await supabase
    .from('media_nodes')
    .select('*')
    .eq('id', nodeId)
    .single();

  if (error) {
    console.error('[MediaAccess] getMediaNode error:', error);
    return null;
  }

  return data as MediaNode;
}

/**
 * Get a media node by canonical ID
 */
export async function getMediaNodeByCanonicalId(canonicalId: string): Promise<MediaNode | null> {
  const { data, error } = await supabase
    .from('media_nodes')
    .select('*')
    .eq('canonical_id', canonicalId)
    .single();

  if (error) {
    console.error('[MediaAccess] getMediaNodeByCanonicalId error:', error);
    return null;
  }

  return data as MediaNode;
}

/**
 * Get media node with full details (series, availability, credits, tags)
 */
export async function getMediaNodeWithDetails(nodeId: string) {
  const [nodeResult, availResult, creditsResult, tagsResult, relResult] = await Promise.all([
    supabase.from('media_nodes').select('*').eq('id', nodeId).single(),
    supabase.from('media_availability').select('*, media_providers(*)').eq('media_node_id', nodeId),
    supabase.from('media_credits').select('*, media_people(*)').eq('media_node_id', nodeId),
    supabase.from('media_node_tags').select('*, media_tags(*)').eq('media_node_id', nodeId),
    supabase.from('media_relationships').select('*').or(`source_id.eq.${nodeId},target_id.eq.${nodeId}`),
  ]);

  if (nodeResult.error || !nodeResult.data) {
    console.error('[MediaAccess] getMediaNodeWithDetails error:', nodeResult.error);
    return null;
  }

  return {
    node: nodeResult.data as MediaNode,
    availability: availResult.data || [],
    credits: creditsResult.data || [],
    tags: (tagsResult.data || []).map((t: any) => t.media_tags),
    relationships: relResult.data || [],
  };
}

/**
 * Query media nodes with filters
 */
export async function queryMediaNodes(params: MediaQueryParams): Promise<MediaNode[]> {
  const { category, mediaType, genres, moods, limit = 20, offset = 0 } = params;

  let query = supabase
    .from('media_nodes')
    .select('*')
    .order('popularity_score', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq('category', category);
  }

  if (mediaType) {
    query = query.eq('media_type', mediaType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[MediaAccess] queryMediaNodes error:', error);
    return [];
  }

  // Filter by tags if genres/moods specified (post-query for now)
  // TODO: Optimize with proper tag join query
  return (data || []) as MediaNode[];
}

/**
 * Search media nodes by text
 */
export async function searchMediaNodes(params: MediaSearchParams): Promise<MediaNode[]> {
  const { query, category, limit = 20 } = params;

  let searchQuery = supabase
    .from('media_nodes')
    .select('*')
    .textSearch('search_vector', query, { type: 'websearch', config: 'english' })
    .limit(limit);

  if (category) {
    searchQuery = searchQuery.eq('category', category);
  }

  const { data, error } = await searchQuery;

  if (error) {
    console.error('[MediaAccess] searchMediaNodes error:', error);
    return [];
  }

  return (data || []) as MediaNode[];
}

/**
 * Semantic search using pgvector embeddings
 */
export async function semanticSearchMedia(
  queryEmbedding: number[],
  options: {
    category?: MediaCategory;
    limit?: number;
    threshold?: number;
  } = {}
): Promise<Array<MediaNode & { similarity: number }>> {
  const { category, limit = 20, threshold = 0.5 } = options;

  const { data, error } = await supabase.rpc('search_media_semantic', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: limit,
    category_filter: category || null,
  });

  if (error) {
    console.error('[MediaAccess] semanticSearchMedia error:', error);
    return [];
  }

  return data || [];
}

// =============================================================================
// MEDIA SERIES QUERIES
// =============================================================================

/**
 * Get a media series with all items
 */
export async function getMediaSeries(seriesId: string): Promise<{
  series: MediaSeries;
  items: MediaNode[];
} | null> {
  const { data: series, error } = await supabase
    .from('media_series')
    .select('*')
    .eq('id', seriesId)
    .single();

  if (error || !series) {
    console.error('[MediaAccess] getMediaSeries error:', error);
    return null;
  }

  const { data: items } = await supabase
    .from('media_nodes')
    .select('*')
    .eq('parent_series_id', seriesId)
    .order('episode_number', { ascending: true });

  return {
    series: series as MediaSeries,
    items: (items || []) as MediaNode[],
  };
}

// =============================================================================
// TRENDING & DISCOVERY QUERIES
// =============================================================================

/**
 * Get trending content
 */
export async function getTrendingContent(params: TrendingParams = {}): Promise<MediaNode[]> {
  const { category, mediaType, limit = 20 } = params;

  const { data, error } = await supabase
    .from('trending_content')
    .select('*')
    .limit(limit);

  if (error) {
    console.error('[MediaAccess] getTrendingContent error:', error);
    
    // Fallback to direct query if view doesn't exist
    let fallbackQuery = supabase
      .from('media_nodes')
      .select('*')
      .order('popularity_score', { ascending: false })
      .limit(limit);

    if (category) {
      fallbackQuery = fallbackQuery.eq('category', category);
    }

    if (mediaType) {
      fallbackQuery = fallbackQuery.eq('media_type', mediaType);
    }

    const { data: fallbackData } = await fallbackQuery;
    return (fallbackData || []) as MediaNode[];
  }

  let result = data || [];

  if (category) {
    result = result.filter((item: any) => item.category === category);
  }

  if (mediaType) {
    result = result.filter((item: any) => item.media_type === mediaType);
  }

  return result as MediaNode[];
}

/**
 * Get new releases
 */
export async function getNewReleases(params: MediaQueryParams = {}): Promise<MediaNode[]> {
  const { category, mediaType, limit = 20 } = params;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let query = supabase
    .from('media_nodes')
    .select('*')
    .gte('release_date', sevenDaysAgo.toISOString())
    .order('release_date', { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq('category', category);
  }

  if (mediaType) {
    query = query.eq('media_type', mediaType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[MediaAccess] getNewReleases error:', error);
    return [];
  }

  return (data || []) as MediaNode[];
}

/**
 * Get content by genre/tag
 */
export async function getContentByGenre(
  genre: string,
  params: MediaQueryParams = {}
): Promise<MediaNode[]> {
  const { category, limit = 20 } = params;

  const { data, error } = await supabase
    .from('media_node_tags')
    .select(`
      media_nodes!inner (*)
    `)
    .eq('media_tags.slug', genre)
    .limit(limit);

  if (error) {
    console.error('[MediaAccess] getContentByGenre error:', error);
    return [];
  }

  let result = (data || []).map((t: any) => t.media_nodes as MediaNode);

  if (category) {
    result = result.filter(node => node.category === category);
  }

  return result;
}

/**
 * Get content by mood
 */
export async function getContentByMood(
  moodSlug: string,
  params: MediaQueryParams = {}
): Promise<MediaNode[]> {
  const { category, limit = 20 } = params;

  // Get mood config
  const { data: moodConfig } = await supabase
    .from('mood_discovery_config')
    .select('genre_weights')
    .eq('mood_slug', moodSlug)
    .single();

  if (!moodConfig) {
    return [];
  }

  const genreWeights = moodConfig.genre_weights as Record<string, number>;
  const topGenres = Object.keys(genreWeights).slice(0, 5);

  // Get content with matching tags
  const { data, error } = await supabase
    .from('media_node_tags')
    .select(`
      media_nodes!inner (*)
    `)
    .in('media_tags.slug', topGenres)
    .limit(limit);

  if (error) {
    console.error('[MediaAccess] getContentByMood error:', error);
    return [];
  }

  let result = (data || []).map((t: any) => t.media_nodes as MediaNode);

  if (category) {
    result = result.filter(node => node.category === category);
  }

  return result;
}

// =============================================================================
// AVAILABILITY QUERIES
// =============================================================================

/**
 * Get availability for a media node
 */
export async function getMediaAvailability(nodeId: string) {
  const { data, error } = await supabase
    .from('media_availability')
    .select('*, media_providers(*)')
    .eq('media_node_id', nodeId)
    .eq('is_available', true);

  if (error) {
    console.error('[MediaAccess] getMediaAvailability error:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all active providers
 */
export async function getActiveProviders() {
  const { data, error } = await supabase
    .from('media_providers')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: true });

  if (error) {
    console.error('[MediaAccess] getActiveProviders error:', error);
    return [];
  }

  return data || [];
}

// =============================================================================
// RELATIONSHIP QUERIES
// =============================================================================

/**
 * Get related content for a media node
 */
export async function getRelatedContent(
  nodeId: string,
  relationshipTypes?: string[]
): Promise<Array<{ node: MediaNode; relationshipType: string; weight: number }>> {
  let query = supabase
    .from('media_relationships')
    .select(`
      target_id,
      relationship_type,
      weight,
      media_nodes!media_relationships_target_id_fkey (*)
    `)
    .eq('source_id', nodeId)
    .order('weight', { ascending: false });

  if (relationshipTypes && relationshipTypes.length > 0) {
    query = query.in('relationship_type', relationshipTypes);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[MediaAccess] getRelatedContent error:', error);
    return [];
  }

  return (data || [])
    .filter((r: any) => r.media_nodes)
    .map((r: any) => ({
      node: r.media_nodes as MediaNode,
      relationshipType: r.relationship_type,
      weight: r.weight,
    }));
}

// =============================================================================
// CREDITS QUERIES
// =============================================================================

/**
 * Get credits for a media node
 */
export async function getMediaCredits(nodeId: string) {
  const { data, error } = await supabase
    .from('media_credits')
    .select('*, media_people(*)')
    .eq('media_node_id', nodeId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[MediaAccess] getMediaCredits error:', error);
    return [];
  }

  return data || [];
}

/**
 * Get content by person
 */
export async function getContentByPerson(personId: string, limit: number = 20) {
  const { data, error } = await supabase
    .from('media_credits')
    .select(`
      credit_role,
      media_nodes!inner (*)
    `)
    .eq('person_id', personId)
    .limit(limit);

  if (error) {
    console.error('[MediaAccess] getContentByPerson error:', error);
    return [];
  }

  return (data || []).map((c: any) => ({
    role: c.credit_role,
    node: c.media_nodes as MediaNode,
  }));
}

// =============================================================================
// TAG QUERIES
// =============================================================================

/**
 * Get all tags
 */
export async function getAllTags(type?: string) {
  let query = supabase.from('media_tags').select('*').order('name');

  if (type) {
    query = query.eq('tag_type', type);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[MediaAccess] getAllTags error:', error);
    return [];
  }

  return data || [];
}

/**
 * Get tags for a media node
 */
export async function getMediaTags(nodeId: string) {
  const { data, error } = await supabase
    .from('media_node_tags')
    .select('media_tags(*), relevance')
    .eq('media_node_id', nodeId)
    .order('relevance', { ascending: false });

  if (error) {
    console.error('[MediaAccess] getMediaTags error:', error);
    return [];
  }

  return (data || []).map((t: any) => ({
    ...t.media_tags,
    relevance: t.relevance,
  }));
}
