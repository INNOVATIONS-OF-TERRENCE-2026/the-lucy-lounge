// =============================================================================
// THE LUCY LOUNGE - LUCY RECOMMENDATION ENGINE
// =============================================================================
// Hybrid recommendation system using:
// - Explicit signals (likes, saves, ratings)
// - Implicit signals (watch time, skips, session length)
// - Temporal patterns (recency, time-of-day)
// - Graph relationships (soundtrack, sequel, same_creator)
// - Semantic similarity (embeddings via pgvector)
// =============================================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  MediaNode,
  MediaType,
  MediaCategory,
  UserTasteProfile,
  RecommendationRow,
  MoodDiscoveryConfig,
  LucyJourney,
} from '../types';

// =============================================================================
// SIGNAL WEIGHTS (Configurable)
// =============================================================================

export const SIGNAL_WEIGHTS = {
  // Explicit signals
  explicit_like: 10,
  explicit_save: 8,
  explicit_rating: 7,    // Scaled by rating value
  
  // Implicit signals
  watch_completion: 5,    // Scaled by completion %
  listen_completion: 5,
  replay_count: 3,
  skip_penalty: -4,
  
  // Temporal signals
  recency_decay: 0.95,    // Per day decay factor
  time_of_day_match: 2,
  weekend_match: 1.5,
  
  // Graph signals
  same_genre: 3,
  same_creator: 4,
  soundtrack_of: 5,
  sequel_to: 4,
  similar_to: 3,
  
  // Popularity signals
  trending_boost: 2,
  popularity_factor: 0.5,  // Dampened to not dominate
  
  // Diversity signals
  novelty_boost: 1.5,      // For exploration
  serendipity_factor: 0.1, // Random injection
} as const;

// =============================================================================
// TYPES
// =============================================================================

export interface RecommendationCandidate {
  node: MediaNode;
  score: number;
  reasons: RecommendationReason[];
}

export interface RecommendationReason {
  type: RecommendationReasonType;
  weight: number;
  context?: string;        // e.g., "Because you watched The Matrix"
  source_node_id?: string;
}

export type RecommendationReasonType =
  | 'explicit_like'
  | 'explicit_save'
  | 'watch_history'
  | 'listen_history'
  | 'genre_match'
  | 'creator_match'
  | 'mood_match'
  | 'trending'
  | 'new_release'
  | 'relationship'
  | 'semantic_similar'
  | 'serendipity';

export interface RecommendationParams {
  userId: string;
  category?: MediaCategory;
  mediaType?: MediaType;
  mood?: string;
  limit?: number;
  excludeIds?: string[];
  includeTrending?: boolean;
  includeNewReleases?: boolean;
  diversityFactor?: number;  // 0-1, higher = more diverse
}

export interface TasteProfileUpdate {
  genre_scores?: Record<string, number>;
  mood_scores?: Record<string, number>;
  media_type_scores?: Record<MediaType, number>;
}

// =============================================================================
// RECOMMENDATION ENGINE
// =============================================================================

export class LucyRecommendationEngine {
  private userId: string;
  private tasteProfile?: UserTasteProfile;
  private candidateCache = new Map<string, RecommendationCandidate[]>();
  
  constructor(userId: string) {
    this.userId = userId;
  }
  
  // =========================================================================
  // MAIN RECOMMENDATION METHODS
  // =========================================================================
  
  /**
   * Generate personalized recommendations
   */
  async getRecommendations(params: RecommendationParams): Promise<RecommendationRow[]> {
    const { 
      category, 
      mediaType, 
      mood, 
      limit = 50, 
      excludeIds = [],
      includeTrending = true,
      includeNewReleases = true,
      diversityFactor = 0.3,
    } = params;
    
    // Load taste profile if not cached
    if (!this.tasteProfile) {
      this.tasteProfile = await this.loadTasteProfile();
    }
    
    // Generate candidates from multiple sources
    const candidates: RecommendationCandidate[] = [];
    
    // 1. History-based candidates
    const historyCandidates = await this.getCandidatesFromHistory(category, mediaType, limit * 2);
    candidates.push(...historyCandidates);
    
    // 2. Graph-based candidates (related content)
    const graphCandidates = await this.getCandidatesFromGraph(category, limit);
    candidates.push(...graphCandidates);
    
    // 3. Taste profile-based candidates
    const tasteCandidates = await this.getCandidatesFromTasteProfile(category, mediaType, limit);
    candidates.push(...tasteCandidates);
    
    // 4. Mood-based candidates
    if (mood) {
      const moodCandidates = await this.getCandidatesFromMood(mood, category, limit);
      candidates.push(...moodCandidates);
    }
    
    // 5. Trending candidates
    if (includeTrending) {
      const trendingCandidates = await this.getTrendingCandidates(category, Math.floor(limit * 0.2));
      candidates.push(...trendingCandidates);
    }
    
    // 6. New release candidates
    if (includeNewReleases) {
      const newReleaseCandidates = await this.getNewReleaseCandidates(category, Math.floor(limit * 0.15));
      candidates.push(...newReleaseCandidates);
    }
    
    // 7. Serendipity candidates (controlled novelty)
    const serendipityCandidates = await this.getSerendipityCandidates(category, Math.floor(limit * 0.1));
    candidates.push(...serendipityCandidates);
    
    // Deduplicate and merge scores
    const merged = this.mergeCandidates(candidates);
    
    // Filter excluded
    const filtered = merged.filter(c => !excludeIds.includes(c.node.id));
    
    // Apply diversity re-ranking
    const diversified = this.applyDiversityReranking(filtered, diversityFactor, limit);
    
    // Group into recommendation rows
    return this.groupIntoRows(diversified);
  }
  
  /**
   * Get continue watching items
   */
  async getContinueWatching(limit: number = 20): Promise<MediaNode[]> {
    const { data, error } = await supabase
      .from('continue_watching')
      .select('*')
      .eq('user_id', this.userId)
      .limit(limit);
    
    if (error || !data) return [];
    
    return data.map(row => ({
      id: row.media_node_id,
      canonical_id: '',
      media_type: row.media_type,
      category: row.category,
      title: row.title,
      thumbnail_url: row.thumbnail_url,
      poster_url: row.poster_url,
      duration_seconds: row.duration_seconds,
      created_at: '',
      updated_at: '',
    })) as MediaNode[];
  }
  
  /**
   * Get continue listening items
   */
  async getContinueListening(limit: number = 20): Promise<MediaNode[]> {
    const { data, error } = await supabase
      .from('continue_listening')
      .select('*')
      .eq('user_id', this.userId)
      .limit(limit);
    
    if (error || !data) return [];
    
    return data.map(row => ({
      id: row.media_node_id,
      canonical_id: '',
      media_type: row.media_type,
      category: row.category,
      title: row.title,
      thumbnail_url: row.thumbnail_url,
      poster_url: row.poster_url,
      duration_seconds: row.duration_seconds,
      created_at: '',
      updated_at: '',
    })) as MediaNode[];
  }
  
  /**
   * Get "Because you watched X" recommendations
   */
  async getBecauseYouWatched(sourceNodeId: string, limit: number = 10): Promise<MediaNode[]> {
    // Get related content via graph relationships
    const { data, error } = await supabase
      .from('media_relationships')
      .select(`
        target_id,
        relationship_type,
        weight,
        media_nodes!media_relationships_target_id_fkey (*)
      `)
      .eq('source_id', sourceNodeId)
      .in('relationship_type', ['similar_to', 'recommended_after', 'same_franchise'])
      .order('weight', { ascending: false })
      .limit(limit);
    
    if (error || !data) return [];
    
    return data
      .filter((r: any) => r.media_nodes)
      .map((r: any) => r.media_nodes as MediaNode);
  }
  
  /**
   * Get mood-based discovery content
   */
  async getMoodDiscovery(moodSlug: string, limit: number = 30): Promise<MediaNode[]> {
    // Get mood config
    const { data: moodConfig } = await supabase
      .from('mood_discovery_config')
      .select('*')
      .eq('mood_slug', moodSlug)
      .single();
    
    if (!moodConfig) {
      // Fallback to genre search
      return this.getCandidatesFromTasteProfile(undefined, undefined, limit)
        .then(candidates => candidates.map(c => c.node));
    }
    
    // Get content matching mood's genre weights
    const genreWeights = moodConfig.genre_weights as Record<string, number>;
    const topGenres = Object.entries(genreWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre);
    
    // Query nodes with matching tags
    const { data: taggedNodes } = await supabase
      .from('media_node_tags')
      .select(`
        media_node_id,
        relevance,
        media_tags!inner (slug),
        media_nodes!inner (*)
      `)
      .in('media_tags.slug', topGenres)
      .order('relevance', { ascending: false })
      .limit(limit);
    
    if (!taggedNodes) return [];
    
    return taggedNodes.map((t: any) => t.media_nodes as MediaNode);
  }
  
  /**
   * Get Lucy Journeys (curated multi-step sequences)
   */
  async getJourneys(params: {
    mood?: string;
    category?: MediaCategory;
    featured?: boolean;
    limit?: number;
  }): Promise<LucyJourney[]> {
    let query = supabase.from('lucy_journeys').select('*');
    
    if (params.mood) {
      query = query.contains('moods', [params.mood]);
    }
    
    if (params.category) {
      query = query.contains('media_categories', [params.category]);
    }
    
    if (params.featured) {
      query = query.eq('is_featured', true);
    }
    
    const { data, error } = await query
      .order('popularity_score', { ascending: false })
      .limit(params.limit || 10);
    
    if (error || !data) return [];
    
    return data as LucyJourney[];
  }
  
  // =========================================================================
  // CANDIDATE GENERATION
  // =========================================================================
  
  private async getCandidatesFromHistory(
    category?: MediaCategory,
    mediaType?: MediaType,
    limit: number = 50
  ): Promise<RecommendationCandidate[]> {
    // Get recently watched/listened
    const isVideo = category === 'video' || !category;
    const isAudio = category === 'audio' || !category;
    
    const candidates: RecommendationCandidate[] = [];
    
    if (isVideo) {
      const { data: watchHistory } = await supabase
        .from('user_watch_events')
        .select(`
          media_node_id,
          duration_watched_seconds,
          completed,
          media_nodes!inner (*)
        `)
        .eq('user_id', this.userId)
        .order('started_at', { ascending: false })
        .limit(20);
      
      if (watchHistory) {
        // Get related content for each watched item
        for (const event of watchHistory) {
          const node = (event as any).media_nodes as MediaNode;
          const completionScore = event.completed 
            ? SIGNAL_WEIGHTS.watch_completion 
            : (event.duration_watched_seconds / (node.duration_seconds || 1)) * SIGNAL_WEIGHTS.watch_completion;
          
          // Get similar content
          const similar = await this.getSimilarContent(event.media_node_id, 5);
          
          for (const simNode of similar) {
            candidates.push({
              node: simNode,
              score: completionScore * SIGNAL_WEIGHTS.similar_to,
              reasons: [{
                type: 'watch_history',
                weight: completionScore,
                context: `Because you watched ${node.title}`,
                source_node_id: node.id,
              }],
            });
          }
        }
      }
    }
    
    if (isAudio) {
      const { data: listenHistory } = await supabase
        .from('user_listen_events')
        .select(`
          media_node_id,
          duration_listened_seconds,
          skipped,
          media_nodes!inner (*)
        `)
        .eq('user_id', this.userId)
        .order('started_at', { ascending: false })
        .limit(20);
      
      if (listenHistory) {
        for (const event of listenHistory) {
          const node = (event as any).media_nodes as MediaNode;
          let score = SIGNAL_WEIGHTS.listen_completion;
          
          if (event.skipped) {
            score = SIGNAL_WEIGHTS.skip_penalty;
          }
          
          // Get similar content
          const similar = await this.getSimilarContent(event.media_node_id, 5);
          
          for (const simNode of similar) {
            candidates.push({
              node: simNode,
              score: score * SIGNAL_WEIGHTS.similar_to,
              reasons: [{
                type: 'listen_history',
                weight: score,
                context: `Because you listened to ${node.title}`,
                source_node_id: node.id,
              }],
            });
          }
        }
      }
    }
    
    return candidates.slice(0, limit);
  }
  
  private async getCandidatesFromGraph(
    category?: MediaCategory,
    limit: number = 30
  ): Promise<RecommendationCandidate[]> {
    // Get user's saved/favorited content
    const { data: collections } = await supabase
      .from('user_collections')
      .select(`
        id,
        user_collection_items!inner (
          media_node_id,
          media_nodes!inner (*)
        )
      `)
      .eq('user_id', this.userId)
      .in('collection_type', ['favorites', 'watchlist']);
    
    if (!collections) return [];
    
    const candidates: RecommendationCandidate[] = [];
    const savedNodeIds: string[] = [];
    
    for (const collection of collections) {
      const items = (collection as any).user_collection_items || [];
      for (const item of items) {
        savedNodeIds.push(item.media_node_id);
      }
    }
    
    // Get graph-connected content
    const { data: relationships } = await supabase
      .from('media_relationships')
      .select(`
        target_id,
        relationship_type,
        weight,
        media_nodes!media_relationships_target_id_fkey (*)
      `)
      .in('source_id', savedNodeIds)
      .order('weight', { ascending: false })
      .limit(limit);
    
    if (relationships) {
      for (const rel of relationships) {
        const node = (rel as any).media_nodes as MediaNode;
        if (!node) continue;
        
        // Filter by category if specified
        if (category && node.category !== category) continue;
        
        const weightMap: Record<string, number> = {
          'soundtrack_of': SIGNAL_WEIGHTS.soundtrack_of,
          'sequel_to': SIGNAL_WEIGHTS.sequel_to,
          'same_creator': SIGNAL_WEIGHTS.same_creator,
          'similar_to': SIGNAL_WEIGHTS.similar_to,
          'same_franchise': SIGNAL_WEIGHTS.same_creator,
        };
        
        const weight = weightMap[rel.relationship_type] || 1;
        
        candidates.push({
          node,
          score: weight * (rel.weight || 1),
          reasons: [{
            type: 'relationship',
            weight,
            context: this.getRelationshipContext(rel.relationship_type),
          }],
        });
      }
    }
    
    return candidates;
  }
  
  private async getCandidatesFromTasteProfile(
    category?: MediaCategory,
    mediaType?: MediaType,
    limit: number = 30
  ): Promise<RecommendationCandidate[]> {
    if (!this.tasteProfile) return [];
    
    const candidates: RecommendationCandidate[] = [];
    
    // Get top genres from taste profile
    const topGenres = Object.entries(this.tasteProfile.genre_scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, score]) => ({ genre, score }));
    
    // Query content matching top genres
    for (const { genre, score } of topGenres) {
      const { data: taggedNodes } = await supabase
        .from('media_node_tags')
        .select(`
          media_nodes!inner (*)
        `)
        .eq('media_tags.slug', genre)
        .limit(Math.ceil(limit / topGenres.length));
      
      if (taggedNodes) {
        for (const tagged of taggedNodes) {
          const node = (tagged as any).media_nodes as MediaNode;
          
          // Filter by category/type
          if (category && node.category !== category) continue;
          if (mediaType && node.media_type !== mediaType) continue;
          
          candidates.push({
            node,
            score: score * SIGNAL_WEIGHTS.same_genre,
            reasons: [{
              type: 'genre_match',
              weight: score,
              context: `Based on your love of ${genre}`,
            }],
          });
        }
      }
    }
    
    return candidates;
  }
  
  private async getCandidatesFromMood(
    mood: string,
    category?: MediaCategory,
    limit: number = 20
  ): Promise<RecommendationCandidate[]> {
    const nodes = await this.getMoodDiscovery(mood, limit);
    
    return nodes.map(node => ({
      node,
      score: SIGNAL_WEIGHTS.time_of_day_match,
      reasons: [{
        type: 'mood_match',
        weight: SIGNAL_WEIGHTS.time_of_day_match,
        context: `Perfect for ${mood} vibes`,
      }],
    }));
  }
  
  private async getTrendingCandidates(
    category?: MediaCategory,
    limit: number = 10
  ): Promise<RecommendationCandidate[]> {
    let query = supabase
      .from('trending_content')
      .select('*')
      .limit(limit);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data } = await query;
    
    if (!data) return [];
    
    return data.map(row => ({
      node: row as unknown as MediaNode,
      score: SIGNAL_WEIGHTS.trending_boost + (row.popularity_score || 0) * SIGNAL_WEIGHTS.popularity_factor,
      reasons: [{
        type: 'trending',
        weight: SIGNAL_WEIGHTS.trending_boost,
        context: 'Trending now',
      }],
    }));
  }
  
  private async getNewReleaseCandidates(
    category?: MediaCategory,
    limit: number = 8
  ): Promise<RecommendationCandidate[]> {
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
    
    const { data } = await query;
    
    if (!data) return [];
    
    return data.map(node => ({
      node: node as MediaNode,
      score: SIGNAL_WEIGHTS.trending_boost,
      reasons: [{
        type: 'new_release',
        weight: SIGNAL_WEIGHTS.trending_boost,
        context: 'Just released',
      }],
    }));
  }
  
  private async getSerendipityCandidates(
    category?: MediaCategory,
    limit: number = 5
  ): Promise<RecommendationCandidate[]> {
    // Get random high-quality content user hasn't seen
    let query = supabase
      .from('media_nodes')
      .select('*')
      .gte('average_rating', 7)
      .order('created_at', { ascending: false }) // Using created_at as pseudo-random for determinism
      .limit(limit * 3); // Over-fetch to filter
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data } = await query;
    
    if (!data) return [];
    
    // Shuffle and take limit
    const shuffled = data.sort(() => Math.random() - 0.5).slice(0, limit);
    
    return shuffled.map(node => ({
      node: node as MediaNode,
      score: SIGNAL_WEIGHTS.novelty_boost,
      reasons: [{
        type: 'serendipity',
        weight: SIGNAL_WEIGHTS.novelty_boost,
        context: 'Something different',
      }],
    }));
  }
  
  // =========================================================================
  // RANKING & DIVERSITY
  // =========================================================================
  
  private mergeCandidates(candidates: RecommendationCandidate[]): RecommendationCandidate[] {
    const merged = new Map<string, RecommendationCandidate>();
    
    for (const candidate of candidates) {
      const existing = merged.get(candidate.node.id);
      
      if (existing) {
        // Combine scores and reasons
        existing.score += candidate.score;
        existing.reasons.push(...candidate.reasons);
      } else {
        merged.set(candidate.node.id, { ...candidate });
      }
    }
    
    // Sort by score
    return Array.from(merged.values()).sort((a, b) => b.score - a.score);
  }
  
  private applyDiversityReranking(
    candidates: RecommendationCandidate[],
    diversityFactor: number,
    limit: number
  ): RecommendationCandidate[] {
    if (candidates.length <= limit) return candidates;
    
    const selected: RecommendationCandidate[] = [];
    const remaining = [...candidates];
    const seenGenres = new Set<string>();
    const seenCreators = new Set<string>();
    
    // Maximal Marginal Relevance (MMR) approach
    while (selected.length < limit && remaining.length > 0) {
      let bestIdx = 0;
      let bestScore = -Infinity;
      
      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i];
        const node = candidate.node;
        
        // Calculate diversity bonus
        let diversityBonus = 0;
        
        // Bonus for new genres
        // (In production, would get genres from node tags)
        if (node.media_type && !seenGenres.has(node.media_type)) {
          diversityBonus += 0.5;
        }
        
        // Final score = relevance * (1 - diversity) + diversity * diversityBonus
        const finalScore = candidate.score * (1 - diversityFactor) + diversityBonus * diversityFactor;
        
        if (finalScore > bestScore) {
          bestScore = finalScore;
          bestIdx = i;
        }
      }
      
      const best = remaining.splice(bestIdx, 1)[0];
      selected.push(best);
      
      // Track seen attributes
      if (best.node.media_type) {
        seenGenres.add(best.node.media_type);
      }
    }
    
    return selected;
  }
  
  private groupIntoRows(candidates: RecommendationCandidate[]): RecommendationRow[] {
    const rows: RecommendationRow[] = [];
    
    // Group by primary reason type
    const byReason = new Map<string, RecommendationCandidate[]>();
    
    for (const candidate of candidates) {
      const primaryReason = candidate.reasons[0]?.type || 'serendipity';
      
      if (!byReason.has(primaryReason)) {
        byReason.set(primaryReason, []);
      }
      byReason.get(primaryReason)!.push(candidate);
    }
    
    // Create row for each reason type
    const reasonTitles: Record<string, string> = {
      'watch_history': 'Based on Your Watching',
      'listen_history': 'Based on Your Listening',
      'genre_match': 'More from Genres You Love',
      'creator_match': 'From Creators You Follow',
      'mood_match': 'Perfect for Your Mood',
      'trending': 'Trending Now',
      'new_release': 'New Releases',
      'relationship': 'You Might Also Like',
      'serendipity': 'Something Different',
    };
    
    for (const [reasonType, candidateList] of byReason) {
      if (candidateList.length === 0) continue;
      
      const primaryContext = candidateList[0].reasons[0]?.context;
      
      rows.push({
        id: `row-${reasonType}-${Date.now()}`,
        title: reasonTitles[reasonType] || 'Recommended for You',
        reason: primaryContext || reasonTitles[reasonType],
        reason_type: reasonType as any,
        items: candidateList.map(c => c.node),
      });
    }
    
    return rows;
  }
  
  // =========================================================================
  // TASTE PROFILE MANAGEMENT
  // =========================================================================
  
  private async loadTasteProfile(): Promise<UserTasteProfile | undefined> {
    const { data } = await supabase
      .from('user_taste_profiles')
      .select('*')
      .eq('user_id', this.userId)
      .single();
    
    return data as UserTasteProfile | undefined;
  }
  
  /**
   * Update taste profile based on user action
   */
  async updateTasteProfile(update: TasteProfileUpdate): Promise<void> {
    const current = await this.loadTasteProfile();
    
    const newGenreScores = {
      ...(current?.genre_scores || {}),
      ...update.genre_scores,
    };
    
    const newMoodScores = {
      ...(current?.mood_scores || {}),
      ...update.mood_scores,
    };
    
    const newMediaTypeScores = {
      ...(current?.media_type_scores || {}),
      ...update.media_type_scores,
    };
    
    await supabase.from('user_taste_profiles').upsert({
      user_id: this.userId,
      genre_scores: newGenreScores,
      mood_scores: newMoodScores,
      media_type_scores: newMediaTypeScores,
      last_computed_at: new Date().toISOString(),
    });
    
    // Update local cache
    this.tasteProfile = {
      ...current,
      genre_scores: newGenreScores,
      mood_scores: newMoodScores,
      media_type_scores: newMediaTypeScores,
    } as UserTasteProfile;
  }
  
  /**
   * Recompute full taste profile from history
   */
  async recomputeTasteProfile(): Promise<UserTasteProfile> {
    // Get all user signals
    const [watchData, listenData, ratingsData, collectionsData] = await Promise.all([
      supabase
        .from('user_watch_events')
        .select('media_node_id, duration_watched_seconds, completed')
        .eq('user_id', this.userId),
      supabase
        .from('user_listen_events')
        .select('media_node_id, duration_listened_seconds, skipped')
        .eq('user_id', this.userId),
      supabase
        .from('user_ratings')
        .select('media_node_id, rating')
        .eq('user_id', this.userId),
      supabase
        .from('user_collections')
        .select('user_collection_items(media_node_id)')
        .eq('user_id', this.userId)
        .eq('collection_type', 'favorites'),
    ]);
    
    // Aggregate genre scores
    const genreScores: Record<string, number> = {};
    const moodScores: Record<string, number> = {};
    const mediaTypeScores: Record<string, number> = {};
    
    // Process watch history
    for (const event of watchData.data || []) {
      // Would need to join with tags to get genres
      // Simplified: just track media type
    }
    
    // Process listen history
    for (const event of listenData.data || []) {
      // Similar processing
    }
    
    // Process ratings
    for (const rating of ratingsData.data || []) {
      // Boost genres of highly-rated content
    }
    
    // Save computed profile
    const profile: Partial<UserTasteProfile> = {
      user_id: this.userId,
      genre_scores: genreScores,
      mood_scores: moodScores,
      media_type_scores: mediaTypeScores,
      last_computed_at: new Date().toISOString(),
      computation_version: 1,
    };
    
    await supabase.from('user_taste_profiles').upsert(profile);
    
    this.tasteProfile = profile as UserTasteProfile;
    return this.tasteProfile;
  }
  
  // =========================================================================
  // HELPER METHODS
  // =========================================================================
  
  private async getSimilarContent(nodeId: string, limit: number): Promise<MediaNode[]> {
    const { data } = await supabase
      .from('media_relationships')
      .select(`
        media_nodes!media_relationships_target_id_fkey (*)
      `)
      .eq('source_id', nodeId)
      .eq('relationship_type', 'similar_to')
      .limit(limit);
    
    if (!data) return [];
    
    return data
      .filter((r: any) => r.media_nodes)
      .map((r: any) => r.media_nodes as MediaNode);
  }
  
  private getRelationshipContext(relType: string): string {
    const contexts: Record<string, string> = {
      'soundtrack_of': 'Featured in this soundtrack',
      'sequel_to': 'Next in the series',
      'same_creator': 'From the same creator',
      'similar_to': 'Similar vibes',
      'same_franchise': 'Part of the same universe',
      'recommended_after': 'Great follow-up',
    };
    
    return contexts[relType] || 'You might like';
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a recommendation engine instance for a user
 */
export function createRecommendationEngine(userId: string): LucyRecommendationEngine {
  return new LucyRecommendationEngine(userId);
}
