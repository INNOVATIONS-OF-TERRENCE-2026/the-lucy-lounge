// =============================================================================
// THE LUCY LOUNGE - RECOMMENDATION ENGINE INDEX
// =============================================================================
// Unified exports for the Lucy Recommendation Engine
// =============================================================================

// Core recommendation engine
export {
  LucyRecommendationEngine,
  createRecommendationEngine,
  SIGNAL_WEIGHTS,
  type RecommendationCandidate,
  type RecommendationReason,
  type RecommendationReasonType,
  type RecommendationParams,
  type TasteProfileUpdate,
} from './recommendationEngine';

// Cold start strategy
export {
  ColdStartEngine,
  createColdStartEngine,
  DEFAULT_COLD_START_CONFIG,
  VIDEO_TASTE_QUESTIONS,
  AUDIO_TASTE_QUESTIONS,
  type ColdStartConfig,
  type TasteQuizQuestion,
  type TasteQuizOption,
  type TasteQuizResponse,
} from './coldStartStrategy';

// Semantic similarity
export {
  SemanticSearchEngine,
  createSemanticSearchEngine,
  DEFAULT_EMBEDDING_CONFIG,
  type SemanticSearchResult,
  type TasteVector,
  type EmbeddingConfig,
} from './semanticSimilarity';

// =============================================================================
// UNIFIED ENGINE FACTORY
// =============================================================================

import { LucyRecommendationEngine } from './recommendationEngine';
import { ColdStartEngine, ColdStartConfig } from './coldStartStrategy';
import { SemanticSearchEngine, EmbeddingConfig } from './semanticSimilarity';
import type {
  MediaCategory,
  MediaType,
  RecommendationRow,
  LucyJourney,
  MediaNode,
} from '../types';

export interface UnifiedEngineConfig {
  coldStart?: Partial<ColdStartConfig>;
  semantic?: Partial<EmbeddingConfig>;
}

/**
 * Unified recommendation engine that combines all strategies
 */
export class UnifiedRecommendationEngine {
  private userId: string;
  private recommendationEngine: LucyRecommendationEngine;
  private coldStartEngine: ColdStartEngine;
  private semanticEngine: SemanticSearchEngine;
  private isColdStart?: boolean;
  
  constructor(userId: string, config: UnifiedEngineConfig = {}) {
    this.userId = userId;
    this.recommendationEngine = new LucyRecommendationEngine(userId);
    this.coldStartEngine = new ColdStartEngine(config.coldStart);
    this.semanticEngine = new SemanticSearchEngine(config.semantic);
  }
  
  /**
   * Get personalized recommendations (auto-detects cold start)
   */
  async getRecommendations(params: {
    category?: MediaCategory;
    mediaType?: MediaType;
    mood?: string;
    limit?: number;
    excludeIds?: string[];
    forceColdStart?: boolean;
  } = {}): Promise<RecommendationRow[]> {
    // Check cold start state if not cached
    if (this.isColdStart === undefined || params.forceColdStart !== undefined) {
      this.isColdStart = params.forceColdStart ?? await this.coldStartEngine.isUserColdStart(this.userId);
    }
    
    if (this.isColdStart) {
      return this.coldStartEngine.getColdStartRecommendations(this.userId, params.category);
    }
    
    return this.recommendationEngine.getRecommendations({
      userId: this.userId,
      ...params,
    });
  }
  
  /**
   * Get continue watching/listening
   */
  async getContinueWatching(limit?: number): Promise<MediaNode[]> {
    return this.recommendationEngine.getContinueWatching(limit);
  }
  
  async getContinueListening(limit?: number): Promise<MediaNode[]> {
    return this.recommendationEngine.getContinueListening(limit);
  }
  
  /**
   * Search using semantic similarity
   */
  async semanticSearch(
    query: string,
    options?: {
      category?: MediaCategory;
      limit?: number;
      threshold?: number;
    }
  ) {
    return this.semanticEngine.semanticSearch(query, options);
  }
  
  /**
   * Find similar content
   */
  async findSimilar(nodeId: string, limit?: number) {
    return this.semanticEngine.findSimilar(nodeId, { limit });
  }
  
  /**
   * Get journeys
   */
  async getJourneys(params?: {
    mood?: string;
    category?: MediaCategory;
    featured?: boolean;
    limit?: number;
  }): Promise<LucyJourney[]> {
    return this.recommendationEngine.getJourneys(params || {});
  }
  
  /**
   * Get mood discovery content
   */
  async getMoodDiscovery(moodSlug: string, limit?: number): Promise<MediaNode[]> {
    return this.recommendationEngine.getMoodDiscovery(moodSlug, limit);
  }
  
  /**
   * Get "Because you watched X"
   */
  async getBecauseYouWatched(nodeId: string, limit?: number): Promise<MediaNode[]> {
    return this.recommendationEngine.getBecauseYouWatched(nodeId, limit);
  }
  
  /**
   * Update taste profile with new signals
   */
  async updateTasteProfile(update: {
    genre_scores?: Record<string, number>;
    mood_scores?: Record<string, number>;
    media_type_scores?: Record<MediaType, number>;
  }) {
    return this.recommendationEngine.updateTasteProfile(update);
  }
  
  /**
   * Rebuild taste vector from embeddings
   */
  async rebuildTasteVector() {
    return this.semanticEngine.buildTasteVector(this.userId);
  }
  
  /**
   * Get onboarding quiz questions
   */
  getQuizQuestions(category?: MediaCategory) {
    return this.coldStartEngine.getQuizQuestions(category);
  }
  
  /**
   * Process quiz responses
   */
  async processQuizResponses(responses: any[]) {
    await this.coldStartEngine.processTasteQuiz(this.userId, responses);
    this.isColdStart = false; // User is no longer cold start after quiz
  }
  
  /**
   * Check if user is in cold start state
   */
  async checkColdStart(): Promise<boolean> {
    this.isColdStart = await this.coldStartEngine.isUserColdStart(this.userId);
    return this.isColdStart;
  }
}

/**
 * Factory function for unified engine
 */
export function createUnifiedEngine(
  userId: string,
  config?: UnifiedEngineConfig
): UnifiedRecommendationEngine {
  return new UnifiedRecommendationEngine(userId, config);
}
