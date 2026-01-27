/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — MONETIZATION TYPE SYSTEM                                 │
 * │                                                                             │
 * │ Revenue infrastructure without compromising user experience                 │
 * │ Value exchange that feels earned, not extorted.                            │
 * │                                                                             │
 * │ Lucy monetizes through LOVE, not lock-in.                                  │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

// =============================================================================
// SUBSCRIPTION TIERS
// =============================================================================

// Backend-aligned tiers (used for tool access and AI routing)
export type UserTier = 'free' | 'pro' | 'power' | 'enterprise';

// Legacy frontend tiers (kept for backward compatibility with plans UI)
export type SubscriptionTier = 'free' | 'plus' | 'pro' | 'family' | 'creator';

// Mapping from legacy tiers to backend tiers
export const TIER_MAPPING: Record<SubscriptionTier, UserTier> = {
  free: 'free',
  plus: 'pro',      // Plus maps to Pro tier
  pro: 'power',     // Pro maps to Power tier
  family: 'power',  // Family maps to Power tier
  creator: 'enterprise', // Creator maps to Enterprise tier
};

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  tagline: string;
  price: {
    monthly: number;
    annual: number;
    currency: string;
  };
  features: SubscriptionFeature[];
  limits: SubscriptionLimits;
  upsells: string[];              // Feature IDs to highlight for upgrade
}

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;                 // null = unlimited
  highlight: boolean;             // Should this be emphasized?
}

export interface SubscriptionLimits {
  // Audio
  monthlyListeningHours?: number;
  offlineDownloads?: number;
  audioQuality: 'standard' | 'high' | 'lossless';
  crossDeviceSync: boolean;
  
  // Lucy Intelligence
  lucyConversationsPerDay?: number;
  lucyMemoryRetention: 'session' | '30_days' | 'unlimited';
  lucyJourneyCreation: boolean;
  
  // Social
  roomCreation: boolean;
  roomParticipants?: number;
  privateRooms: boolean;
  
  // Content
  podcastsIncluded: boolean;
  audiobooksIncluded: boolean;
  adFree: boolean;
  
  // Creator
  uploadStorage?: number;          // GB
  audienceInsights: boolean;
  promotionTools: boolean;
}

// =============================================================================
// AFFILIATE & TRACKING
// =============================================================================

export type AffiliatePartner = 
  | 'amazon_music'
  | 'apple_music' 
  | 'spotify_premium'
  | 'audible'
  | 'kindle_unlimited'
  | 'youtube_premium'
  | 'netflix'
  | 'hbo_max'
  | 'disney_plus'
  | 'paramount'
  | 'peacock'
  | 'tubi'
  | 'pluto'
  | 'plex';

export interface AffiliateLink {
  id: string;
  partner: AffiliatePartner;
  baseUrl: string;
  affiliateTag: string;
  deepLinkTemplate: string;
  commissionRate: number;         // Percentage
  cookieDuration: number;         // Days
  
  // Tracking
  enabled: boolean;
  requiresAttribution: boolean;
}

export interface AttributionEvent {
  id: string;
  userId?: string;
  sessionId: string;
  
  // What was clicked
  partner: AffiliatePartner;
  mediaNodeId?: string;
  deepLinkUrl: string;
  
  // Context
  source: 'recommendation' | 'search' | 'journey' | 'room' | 'direct';
  componentPath: string;          // UI component that generated click
  
  // Timing
  timestamp: Date;
  
  // Conversion tracking
  convertedAt?: Date;
  revenueGenerated?: number;
}

export interface ConversionEvent {
  id: string;
  attributionId: string;
  partner: AffiliatePartner;
  
  type: 'signup' | 'subscription' | 'purchase' | 'rental';
  revenue: number;
  commission: number;
  currency: string;
  
  // Lucy credit
  lucyInfluenceScore: number;     // 0-1, how much Lucy drove this
  
  timestamp: Date;
}

// =============================================================================
// REVENUE STREAMS
// =============================================================================

export type RevenueSource = 
  | 'subscription'
  | 'affiliate'
  | 'tips'
  | 'creator_subscription'
  | 'advertising'
  | 'sponsorship';

export interface RevenueEvent {
  id: string;
  source: RevenueSource;
  amount: number;
  currency: string;
  timestamp: Date;
  
  // Attribution
  userId?: string;
  creatorId?: string;
  partnerId?: string;
  
  // Processing
  grossAmount: number;
  platformFee: number;
  processingFee: number;
  netAmount: number;
  
  // Payout
  payoutStatus: 'pending' | 'processing' | 'paid' | 'failed';
  payoutDate?: Date;
}

// =============================================================================
// TIPPING & CREATOR SUPPORT
// =============================================================================

export interface TipEvent {
  id: string;
  fromUserId: string;
  toCreatorId: string;
  
  amount: number;
  currency: string;
  message?: string;
  
  // Context
  mediaNodeId?: string;           // What content inspired the tip
  roomId?: string;                // If tipped during room session
  
  // Processing
  platformFee: number;
  creatorReceived: number;
  
  timestamp: Date;
}

export interface CreatorSubscription {
  id: string;
  subscriberId: string;
  creatorId: string;
  
  tier: 'supporter' | 'patron' | 'superfan';
  price: number;
  currency: string;
  
  // Perks
  perks: string[];
  
  // Billing
  startedAt: Date;
  renewsAt: Date;
  canceledAt?: Date;
  
  status: 'active' | 'canceled' | 'expired' | 'past_due';
}

// =============================================================================
// ADVERTISING (NON-INTRUSIVE)
// =============================================================================

export type AdPlacement = 
  | 'journey_interstitial'        // Between journey steps (skippable)
  | 'room_ambient'                // Ambient branding in rooms
  | 'recommendation_sponsored'    // Sponsored recommendation slot
  | 'search_promoted'             // Promoted search result
  | 'podcast_native'              // Native podcast ad read
  | 'app_launch';                 // Launch screen (one per session)

export interface AdUnit {
  id: string;
  advertiserId: string;
  placement: AdPlacement;
  
  // Creative
  headline: string;
  body: string;
  imageUrl?: string;
  ctaText: string;
  destinationUrl: string;
  
  // Targeting
  targetAudience: AdTargeting;
  
  // Budget
  bidAmount: number;
  dailyBudget: number;
  totalBudget: number;
  
  // Schedule
  startDate: Date;
  endDate: Date;
  
  // Performance
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
}

export interface AdTargeting {
  ageRange?: { min: number; max: number };
  genders?: ('male' | 'female' | 'other')[];
  locations?: string[];           // Country codes
  interests?: string[];           // Genre affinities
  moods?: string[];
  timeOfDay?: string[];
  
  // Exclusions
  excludeSubscribers: boolean;    // Don't show to paying users
  frequencyCap: number;           // Max impressions per user per day
}

export interface AdImpression {
  id: string;
  adId: string;
  userId?: string;
  sessionId: string;
  
  placement: AdPlacement;
  bidAmount: number;
  
  viewedAt: Date;
  viewDuration: number;           // Seconds
  
  clickedAt?: Date;
  convertedAt?: Date;
}

// =============================================================================
// ANALYTICS
// =============================================================================

export interface RevenueAnalytics {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
  
  // Totals
  totalRevenue: number;
  totalTransactions: number;
  
  // By source
  bySource: {
    source: RevenueSource;
    revenue: number;
    transactions: number;
    growth: number;               // vs previous period
  }[];
  
  // By partner (affiliate)
  byPartner: {
    partner: AffiliatePartner;
    clicks: number;
    conversions: number;
    revenue: number;
    commissionEarned: number;
  }[];
  
  // User metrics
  arpu: number;                   // Average revenue per user
  ltv: number;                    // Lifetime value estimate
  conversionRate: number;         // Free to paid
  
  // Trends
  dailyRevenue: { date: string; revenue: number }[];
}

export interface UserMonetizationProfile {
  userId: string;
  
  // Subscription
  tier: SubscriptionTier;
  subscribedAt?: Date;
  subscriptionValue: number;      // Total paid to date
  
  // Engagement value
  listeningHours: number;
  roomsCreated: number;
  roomsJoined: number;
  
  // Referral value
  referralsGenerated: number;
  referralRevenue: number;
  
  // Affiliate value
  affiliateClicks: number;
  affiliateConversions: number;
  affiliateRevenue: number;
  
  // Creator support
  tipsGiven: number;
  tipsAmount: number;
  creatorSubscriptions: number;
  
  // Calculated
  estimatedLTV: number;
  engagementScore: number;
  monetizationPotential: 'low' | 'medium' | 'high' | 'whale';
}

// =============================================================================
// PAYOUTS
// =============================================================================

export interface PayoutMethod {
  id: string;
  userId: string;
  
  type: 'stripe' | 'paypal' | 'bank_transfer';
  
  // Details (encrypted reference)
  accountReference: string;
  
  // Verification
  verified: boolean;
  verifiedAt?: Date;
  
  // Status
  isDefault: boolean;
  createdAt: Date;
}

export interface PayoutRequest {
  id: string;
  creatorId: string;
  methodId: string;
  
  amount: number;
  currency: string;
  
  // Breakdown
  subscriptionRevenue: number;
  tipRevenue: number;
  otherRevenue: number;
  
  // Processing
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  processedAt?: Date;
  
  // External
  externalTransactionId?: string;
  failureReason?: string;
}
