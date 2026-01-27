/**
 * THE LUCY LOUNGE — RAIL SYSTEM EXPORTS
 */

export {
  RAIL_CONFIGS,
  fetchRailItems,
  fetchAllRails,
  getRailConfig,
  filterViableRails,
  type RailConfig,
  type RailData,
} from './railConfig';

// Personalized Recommendation Rails
export {
  useRecommendationSignals,
  useForYouRail,
  useContinueWatchingRail,
  useBecauseYouWatchedRail,
  useMoodRail,
  useTrendingRail,
  SIGNAL_WEIGHTS,
  type PersonalizedRail,
  type RecommendationSignals,
  type RecommendationOptions,
} from './personalizedRails';
