/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — RECOMMENDATION PIPELINE INDEX                            │
 * │                                                                             │
 * │ Central export for recommendation pipeline components                      │
 * │ PHASE 2 IMPLEMENTATION                                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

// Candidate Generation
export {
  CandidateGenerator,
  createCandidateGenerator,
  DEFAULT_CANDIDATE_CONFIG,
  type CandidateGeneratorConfig,
  type GeneratorContext,
  type Candidate,
  type CandidateSource,
} from './candidateGenerator';

// Ranking
export {
  Ranker,
  createRanker,
  DEFAULT_RANKER_CONFIG,
  type RankerConfig,
  type RankerContext,
  type RankedCandidate,
  type RankReason,
} from './ranker';

// Diversity
export {
  DiversityPass,
  createDiversityPass,
  DEFAULT_DIVERSITY_CONFIG,
  type DiversityConfig,
  type DiversityContext,
  type DiversifiedResult,
  type DiversityReport,
} from './diversityPass';

// Journey Building
export {
  JourneyBuilder,
  createJourneyBuilder,
  DEFAULT_JOURNEY_CONFIG,
  type JourneyBuilderConfig,
  type JourneyBuildContext,
  type GeneratedJourney,
} from './journeyBuilder';

// =============================================================================
// UNIFIED PIPELINE
// =============================================================================

import { CandidateGenerator, GeneratorContext } from './candidateGenerator';
import { Ranker, RankerContext } from './ranker';
import { DiversityPass, DiversityContext, DiversifiedResult } from './diversityPass';
import type { MediaCategory, UserTasteProfile, RecommendationRow } from '@/media/types';

export interface PipelineConfig {
  candidateGenerator?: Partial<import('./candidateGenerator').CandidateGeneratorConfig>;
  ranker?: Partial<import('./ranker').RankerConfig>;
  diversity?: Partial<import('./diversityPass').DiversityConfig>;
}

export interface PipelineContext {
  userId: string;
  category?: MediaCategory;
  mood?: string;
  tasteProfile?: UserTasteProfile;
  targetSize?: number;
  excludeIds?: string[];
  recentlyShownIds?: string[];
}

/**
 * Unified recommendation pipeline that runs all stages
 */
export class RecommendationPipeline {
  private candidateGenerator: CandidateGenerator;
  private ranker: Ranker;
  private diversityPass: DiversityPass;

  constructor(config: PipelineConfig = {}) {
    this.candidateGenerator = new CandidateGenerator(config.candidateGenerator);
    this.ranker = new Ranker(config.ranker);
    this.diversityPass = new DiversityPass(config.diversity);
  }

  /**
   * Run the full recommendation pipeline
   */
  async getRecommendations(context: PipelineContext): Promise<DiversifiedResult> {
    const targetSize = context.targetSize || 20;

    // Stage 1: Generate candidates
    const generatorContext: GeneratorContext = {
      userId: context.userId,
      category: context.category,
      mood: context.mood,
      excludeIds: context.excludeIds,
      tasteProfile: context.tasteProfile,
    };

    const candidates = await this.candidateGenerator.generateCandidates(generatorContext);

    // Stage 2: Rank candidates
    const rankerContext: RankerContext = {
      userId: context.userId,
      category: context.category,
      tasteProfile: context.tasteProfile,
      currentTime: new Date(),
    };

    const rankedCandidates = await this.ranker.rankCandidates(candidates, rankerContext);

    // Stage 3: Apply diversity
    const diversityContext: DiversityContext = {
      targetSize,
      category: context.category,
      recentlyShownIds: context.recentlyShownIds,
    };

    const result = this.diversityPass.applyDiversity(rankedCandidates, diversityContext);

    return result;
  }

  /**
   * Build recommendation rows for UI display
   */
  async buildRows(context: PipelineContext): Promise<RecommendationRow[]> {
    const result = await this.getRecommendations(context);
    const rows: RecommendationRow[] = [];

    // Group by source for different row types
    const forYouItems = result.items.filter(i => 
      i.sources.some(s => ['genre_match', 'mood_match', 'similar_to_watched', 'similar_to_listened'].includes(s))
    );

    const trendingItems = result.items.filter(i => 
      i.sources.includes('trending')
    );

    const newReleaseItems = result.items.filter(i => 
      i.sources.includes('new_release')
    );

    if (forYouItems.length > 0) {
      rows.push({
        id: 'for-you',
        title: 'For You',
        reason: 'Based on your taste',
        reason_type: 'similar',
        items: forYouItems.slice(0, 15).map(i => i.node),
      });
    }

    if (trendingItems.length > 0) {
      rows.push({
        id: 'trending',
        title: 'Trending Now',
        reason: "What everyone's enjoying",
        reason_type: 'trending',
        items: trendingItems.slice(0, 10).map(i => i.node),
      });
    }

    if (newReleaseItems.length > 0) {
      rows.push({
        id: 'new-releases',
        title: 'New Releases',
        reason: 'Just dropped',
        reason_type: 'history',
        items: newReleaseItems.slice(0, 10).map(i => i.node),
      });
    }

    return rows;
  }
}

/**
 * Factory function for pipeline
 */
export function createRecommendationPipeline(
  config?: PipelineConfig
): RecommendationPipeline {
  return new RecommendationPipeline(config);
}
