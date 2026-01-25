/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — RANKER                                                    │
 * │                                                                             │
 * │ Second stage of the recommendation pipeline: ranks candidates based on     │
 * │ personalization signals, quality, and freshness                            │
 * │ PHASE 2 IMPLEMENTATION                                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import type {
  MediaNode,
  MediaCategory,
  UserTasteProfile,
} from '@/media/types';
import type { Candidate, CandidateSource } from './candidateGenerator';

// =============================================================================
// TYPES
// =============================================================================

export interface RankerConfig {
  // Base weights
  candidateScoreWeight: number;
  qualityWeight: number;
  freshnessWeight: number;
  personalizationWeight: number;
  
  // Freshness decay
  freshnessHalfLifeDays: number;
  
  // Quality thresholds
  minRatingThreshold: number;
  minPopularityThreshold: number;
  
  // Boosting
  sourceBoosts: Partial<Record<CandidateSource, number>>;
}

export interface RankerContext {
  userId: string;
  category?: MediaCategory;
  tasteProfile?: UserTasteProfile;
  currentTime?: Date;
  recentlyWatchedIds?: string[];
  recentlyListenedIds?: string[];
}

export interface RankedCandidate extends Candidate {
  rankScore: number;
  rankReasons: RankReason[];
}

export interface RankReason {
  type: 'quality' | 'freshness' | 'personalization' | 'source_boost' | 'temporal_match';
  contribution: number;
  description: string;
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

export const DEFAULT_RANKER_CONFIG: RankerConfig = {
  candidateScoreWeight: 0.30,
  qualityWeight: 0.25,
  freshnessWeight: 0.15,
  personalizationWeight: 0.30,
  freshnessHalfLifeDays: 30,
  minRatingThreshold: 5.0,
  minPopularityThreshold: 0.1,
  sourceBoosts: {
    'genre_match': 1.2,
    'mood_match': 1.3,
    'similar_to_watched': 1.15,
    'similar_to_listened': 1.15,
    'trending': 1.0,
    'new_release': 1.1,
    'same_creator': 1.25,
    'editorial_pick': 1.4,
    'cold_start_popular': 0.9,
  },
};

// =============================================================================
// RANKER CLASS
// =============================================================================

export class Ranker {
  private config: RankerConfig;

  constructor(config: Partial<RankerConfig> = {}) {
    this.config = { ...DEFAULT_RANKER_CONFIG, ...config };
  }

  /**
   * Main entry point: ranks candidates
   */
  async rankCandidates(
    candidates: Candidate[],
    context: RankerContext
  ): Promise<RankedCandidate[]> {
    const currentTime = context.currentTime || new Date();
    const currentHour = currentTime.getHours();

    const rankedCandidates: RankedCandidate[] = candidates.map(candidate => {
      const reasons: RankReason[] = [];

      // 1. Base candidate score
      const baseScore = candidate.score * this.config.candidateScoreWeight;
      reasons.push({
        type: 'source_boost',
        contribution: baseScore,
        description: `Candidate sources: ${candidate.sources.join(', ')}`,
      });

      // 2. Quality score
      const qualityScore = this.computeQualityScore(candidate.node);
      reasons.push({
        type: 'quality',
        contribution: qualityScore * this.config.qualityWeight,
        description: `Rating: ${candidate.node.average_rating || 'N/A'}, Popularity: ${candidate.node.popularity_score || 'N/A'}`,
      });

      // 3. Freshness score
      const freshnessScore = this.computeFreshnessScore(candidate.node, currentTime);
      reasons.push({
        type: 'freshness',
        contribution: freshnessScore * this.config.freshnessWeight,
        description: `Release: ${candidate.node.release_date || 'Unknown'}`,
      });

      // 4. Personalization score
      const personalizationScore = this.computePersonalizationScore(
        candidate.node,
        context.tasteProfile
      );
      reasons.push({
        type: 'personalization',
        contribution: personalizationScore * this.config.personalizationWeight,
        description: 'Matches taste profile',
      });

      // 5. Temporal match bonus
      const temporalBonus = this.computeTemporalBonus(candidate.node, currentHour);
      if (temporalBonus > 0) {
        reasons.push({
          type: 'temporal_match',
          contribution: temporalBonus,
          description: `Good for ${this.getTimeOfDayLabel(currentHour)}`,
        });
      }

      // 6. Source boost
      const sourceBoost = this.computeSourceBoost(candidate.sources);

      // Calculate final rank score
      const rawScore = baseScore +
        qualityScore * this.config.qualityWeight +
        freshnessScore * this.config.freshnessWeight +
        personalizationScore * this.config.personalizationWeight +
        temporalBonus;

      const rankScore = rawScore * sourceBoost;

      return {
        ...candidate,
        rankScore,
        rankReasons: reasons,
      };
    });

    // Sort by rank score
    return rankedCandidates.sort((a, b) => b.rankScore - a.rankScore);
  }

  /**
   * Compute quality score based on rating and popularity
   */
  private computeQualityScore(node: MediaNode): number {
    let score = 0.5; // Default score

    // Rating contribution (normalized to 0-1)
    if (node.average_rating) {
      const normalizedRating = Math.max(0, Math.min(10, node.average_rating)) / 10;
      score = normalizedRating * 0.6;
    }

    // Popularity contribution
    if (node.popularity_score) {
      const normalizedPopularity = Math.max(0, Math.min(1, node.popularity_score));
      score += normalizedPopularity * 0.4;
    }

    // Penalize low-quality content
    if (node.average_rating && node.average_rating < this.config.minRatingThreshold) {
      score *= 0.7;
    }

    return score;
  }

  /**
   * Compute freshness score with exponential decay
   */
  private computeFreshnessScore(node: MediaNode, currentTime: Date): number {
    if (!node.release_date) {
      return 0.3; // Default for unknown release dates
    }

    const releaseDate = new Date(node.release_date);
    const daysSinceRelease = (currentTime.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24);

    // Exponential decay
    const halfLife = this.config.freshnessHalfLifeDays;
    const freshnessScore = Math.pow(0.5, daysSinceRelease / halfLife);

    return Math.max(0, Math.min(1, freshnessScore));
  }

  /**
   * Compute personalization score based on taste profile
   */
  private computePersonalizationScore(
    node: MediaNode,
    tasteProfile?: UserTasteProfile
  ): number {
    if (!tasteProfile) {
      return 0.5; // Neutral score without profile
    }

    let score = 0;
    let weights = 0;

    // Genre match
    if (tasteProfile.genre_scores) {
      // In a real implementation, we'd check node's tags against genre_scores
      // For now, use a placeholder
      score += 0.5;
      weights += 1;
    }

    // Media type preference
    if (tasteProfile.media_type_scores && node.media_type) {
      const typeScore = tasteProfile.media_type_scores[node.media_type] || 0.5;
      score += typeScore;
      weights += 1;
    }

    return weights > 0 ? score / weights : 0.5;
  }

  /**
   * Compute temporal bonus based on time of day
   */
  private computeTemporalBonus(node: MediaNode, currentHour: number): number {
    // Different content types have different optimal times
    const timeOfDay = this.getTimeOfDay(currentHour);

    // Movies/TV shows are better for evening/late night
    if (node.category === 'video') {
      if (timeOfDay === 'evening' || timeOfDay === 'late_night') {
        return 0.1;
      }
    }

    // Podcasts/audiobooks good for morning/afternoon
    if (node.media_type === 'podcast_episode' || node.media_type === 'audiobook') {
      if (timeOfDay === 'morning' || timeOfDay === 'afternoon') {
        return 0.1;
      }
    }

    // Music is always appropriate
    if (node.category === 'audio' && node.media_type === 'music_track') {
      return 0.05;
    }

    return 0;
  }

  /**
   * Compute source boost multiplier
   */
  private computeSourceBoost(sources: CandidateSource[]): number {
    let maxBoost = 1.0;

    for (const source of sources) {
      const boost = this.config.sourceBoosts[source] || 1.0;
      maxBoost = Math.max(maxBoost, boost);
    }

    return maxBoost;
  }

  /**
   * Get time of day from hour
   */
  private getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'late_night' {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'late_night';
  }

  /**
   * Get human-readable time of day label
   */
  private getTimeOfDayLabel(hour: number): string {
    const timeOfDay = this.getTimeOfDay(hour);
    const labels: Record<string, string> = {
      morning: 'morning listening',
      afternoon: 'afternoon vibes',
      evening: 'evening viewing',
      late_night: 'late night',
    };
    return labels[timeOfDay];
  }
}

// =============================================================================
// FACTORY
// =============================================================================

export function createRanker(config?: Partial<RankerConfig>): Ranker {
  return new Ranker(config);
}

export default Ranker;
