/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — CANDIDATE GENERATOR                                      │
 * │                                                                             │
 * │ First stage of the recommendation pipeline: generates candidate items      │
 * │ based on user taste profile, history, and contextual signals               │
 * │ PHASE 2 IMPLEMENTATION                                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  MediaNode,
  MediaCategory,
  UserTasteProfile,
} from '@/media/types';

// =============================================================================
// TYPES
// =============================================================================

export interface CandidateGeneratorConfig {
  maxCandidates: number;
  genreWeight: number;
  moodWeight: number;
  recencyWeight: number;
  popularityWeight: number;
  similarityWeight: number;
}

export interface GeneratorContext {
  userId: string;
  category?: MediaCategory;
  mood?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'late_night';
  excludeIds?: string[];
  tasteProfile?: UserTasteProfile;
}

export interface Candidate {
  node: MediaNode;
  score: number;
  sources: CandidateSource[];
}

export type CandidateSource =
  | 'genre_match'
  | 'mood_match'
  | 'similar_to_watched'
  | 'similar_to_listened'
  | 'trending'
  | 'new_release'
  | 'same_creator'
  | 'editorial_pick'
  | 'cold_start_popular';

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

export const DEFAULT_CANDIDATE_CONFIG: CandidateGeneratorConfig = {
  maxCandidates: 200,
  genreWeight: 0.35,
  moodWeight: 0.25,
  recencyWeight: 0.15,
  popularityWeight: 0.15,
  similarityWeight: 0.10,
};

// =============================================================================
// CANDIDATE GENERATOR CLASS
// =============================================================================

export class CandidateGenerator {
  private config: CandidateGeneratorConfig;

  constructor(config: Partial<CandidateGeneratorConfig> = {}) {
    this.config = { ...DEFAULT_CANDIDATE_CONFIG, ...config };
  }

  /**
   * Main entry point: generates candidates based on context
   */
  async generateCandidates(context: GeneratorContext): Promise<Candidate[]> {
    const candidates: Map<string, Candidate> = new Map();

    // Run all generators in parallel
    const [
      genreCandidates,
      moodCandidates,
      similarityCandidates,
      trendingCandidates,
      newReleaseCandidates,
    ] = await Promise.all([
      this.generateFromGenres(context),
      this.generateFromMood(context),
      this.generateFromSimilarity(context),
      this.generateFromTrending(context),
      this.generateFromNewReleases(context),
    ]);

    // Merge all candidates
    this.mergeCandidates(candidates, genreCandidates);
    this.mergeCandidates(candidates, moodCandidates);
    this.mergeCandidates(candidates, similarityCandidates);
    this.mergeCandidates(candidates, trendingCandidates);
    this.mergeCandidates(candidates, newReleaseCandidates);

    // Filter by exclusions
    if (context.excludeIds && context.excludeIds.length > 0) {
      for (const id of context.excludeIds) {
        candidates.delete(id);
      }
    }

    // Convert to array and sort by score
    const sorted = Array.from(candidates.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.maxCandidates);

    return sorted;
  }

  /**
   * Generate candidates from user's top genres
   */
  private async generateFromGenres(context: GeneratorContext): Promise<Candidate[]> {
    if (!context.tasteProfile?.genre_scores) {
      return [];
    }

    const topGenres = Object.entries(context.tasteProfile.genre_scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre);

    if (topGenres.length === 0) {
      return [];
    }

    let query = supabase
      .from('media_node_tags')
      .select(`
        relevance,
        media_nodes!inner (*)
      `)
      .in('media_tags.slug', topGenres)
      .order('relevance', { ascending: false })
      .limit(50);

    if (context.category) {
      query = query.eq('media_nodes.category', context.category);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error('[CandidateGenerator] genreFromGenres error:', error);
      return [];
    }

    return data.map((item: any) => ({
      node: item.media_nodes as MediaNode,
      score: (item.relevance || 0.5) * this.config.genreWeight,
      sources: ['genre_match'] as CandidateSource[],
    }));
  }

  /**
   * Generate candidates matching requested mood
   */
  private async generateFromMood(context: GeneratorContext): Promise<Candidate[]> {
    if (!context.mood) {
      return [];
    }

    // Get mood config for genre weights
    const { data: moodConfig } = await supabase
      .from('mood_discovery_config')
      .select('*')
      .eq('mood_slug', context.mood)
      .single();

    if (!moodConfig) {
      return [];
    }

    const genreWeights = moodConfig.genre_weights as Record<string, number>;
    const topGenres = Object.entries(genreWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);

    let query = supabase
      .from('media_node_tags')
      .select(`
        relevance,
        media_nodes!inner (*)
      `)
      .in('media_tags.slug', topGenres)
      .limit(30);

    if (context.category) {
      query = query.eq('media_nodes.category', context.category);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data.map((item: any) => ({
      node: item.media_nodes as MediaNode,
      score: (item.relevance || 0.5) * this.config.moodWeight,
      sources: ['mood_match'] as CandidateSource[],
    }));
  }

  /**
   * Generate candidates similar to recently watched/listened
   */
  private async generateFromSimilarity(context: GeneratorContext): Promise<Candidate[]> {
    // Get user's recent items
    const { data: recentState } = await supabase
      .from('user_media_state')
      .select('media_node_id')
      .eq('user_id', context.userId)
      .order('last_played_at', { ascending: false })
      .limit(10);

    if (!recentState || recentState.length === 0) {
      return [];
    }

    const recentIds = recentState.map(s => s.media_node_id);

    // Get related content via relationships
    const { data: relationships } = await supabase
      .from('media_relationships')
      .select(`
        weight,
        media_nodes!media_relationships_target_id_fkey (*)
      `)
      .in('source_id', recentIds)
      .in('relationship_type', ['similar_to', 'recommended_after', 'same_creator'])
      .order('weight', { ascending: false })
      .limit(50);

    if (!relationships) {
      return [];
    }

    const sourceType: CandidateSource = context.category === 'video' 
      ? 'similar_to_watched' 
      : 'similar_to_listened';

    return relationships
      .filter((r: any) => r.media_nodes)
      .map((r: any) => ({
        node: r.media_nodes as MediaNode,
        score: (r.weight || 0.5) * this.config.similarityWeight,
        sources: [sourceType] as CandidateSource[],
      }));
  }

  /**
   * Generate candidates from trending content
   */
  private async generateFromTrending(context: GeneratorContext): Promise<Candidate[]> {
    let query = supabase
      .from('media_nodes')
      .select('*')
      .order('popularity_score', { ascending: false })
      .limit(30);

    if (context.category) {
      query = query.eq('category', context.category);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data.map((node: any, index: number) => ({
      node: node as MediaNode,
      // Decay score by position
      score: this.config.popularityWeight * (1 - index / 30),
      sources: ['trending'] as CandidateSource[],
    }));
  }

  /**
   * Generate candidates from new releases
   */
  private async generateFromNewReleases(context: GeneratorContext): Promise<Candidate[]> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    let query = supabase
      .from('media_nodes')
      .select('*')
      .gte('release_date', sevenDaysAgo.toISOString())
      .order('release_date', { ascending: false })
      .limit(20);

    if (context.category) {
      query = query.eq('category', context.category);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data.map((node: any, index: number) => ({
      node: node as MediaNode,
      score: this.config.recencyWeight * (1 - index / 20),
      sources: ['new_release'] as CandidateSource[],
    }));
  }

  /**
   * Merge candidates, combining scores for duplicates
   */
  private mergeCandidates(
    target: Map<string, Candidate>,
    source: Candidate[]
  ): void {
    for (const candidate of source) {
      const existing = target.get(candidate.node.id);
      
      if (existing) {
        // Combine scores and sources
        existing.score += candidate.score;
        existing.sources = [...new Set([...existing.sources, ...candidate.sources])];
      } else {
        target.set(candidate.node.id, candidate);
      }
    }
  }
}

// =============================================================================
// FACTORY
// =============================================================================

export function createCandidateGenerator(
  config?: Partial<CandidateGeneratorConfig>
): CandidateGenerator {
  return new CandidateGenerator(config);
}

export default CandidateGenerator;
