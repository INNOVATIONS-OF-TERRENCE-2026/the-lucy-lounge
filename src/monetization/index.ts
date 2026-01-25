/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — MONETIZATION MODULE EXPORTS                              │
 * │                                                                             │
 * │ Revenue without regret                                                     │
 * │ Fair exchange, transparent value.                                          │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

// Types
export * from './types';

// Subscription Plans
export {
  SUBSCRIPTION_PLANS,
  TRIAL_OFFERS,
  FEATURE_GATES,
  getPlanByTier,
  getAnnualSavings,
  getAnnualSavingsPercent,
  canAccessFeature,
  getUpgradeRecommendation,
} from './plans';

// Affiliate Middleware
export {
  generateDeepLink,
  generateSmartLinks,
  trackAffiliateClick,
  trackConversion,
  handleAffiliateClick,
  getAttributionStats,
  getConversionStats,
  type DeepLinkParams,
  type SmartLinkOptions,
  type SmartLinkResult,
} from './affiliateMiddleware';
