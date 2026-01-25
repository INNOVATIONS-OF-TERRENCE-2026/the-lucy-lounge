/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — SUBSCRIPTION PLANS                                       │
 * │                                                                             │
 * │ Fair pricing that scales with value delivered                              │
 * │ Free tier is genuinely useful. Paid tiers are genuinely better.            │
 * │                                                                             │
 * │ No dark patterns. No bait-and-switch. Just honest value.                   │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import type { SubscriptionPlan, SubscriptionTier } from './types';

// =============================================================================
// SUBSCRIPTION PLANS
// =============================================================================

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    id: 'lucy-free',
    tier: 'free',
    name: 'Lucy Free',
    tagline: 'Your media companion, no strings attached',
    price: {
      monthly: 0,
      annual: 0,
      currency: 'USD',
    },
    features: [
      { id: 'listening', name: 'Unlimited Listening', description: 'Stream music and podcasts without limits', included: true, highlight: true },
      { id: 'lucy-chat', name: 'Lucy Chat', description: 'Talk to Lucy about music, moods, and moments', included: true, limit: 20, highlight: true },
      { id: 'rooms', name: 'Join Rooms', description: 'Join listening rooms others create', included: true, highlight: false },
      { id: 'recommendations', name: 'Basic Recommendations', description: 'Get personalized suggestions', included: true, highlight: false },
      { id: 'cross-device', name: 'Cross-Device Sync', description: 'Pick up where you left off', included: false, highlight: false },
      { id: 'offline', name: 'Offline Mode', description: 'Download for offline listening', included: false, highlight: false },
      { id: 'ad-free', name: 'Ad-Free Experience', description: 'No interruptions', included: false, highlight: false },
    ],
    limits: {
      monthlyListeningHours: undefined, // Unlimited
      offlineDownloads: 0,
      audioQuality: 'standard',
      crossDeviceSync: false,
      lucyConversationsPerDay: 20,
      lucyMemoryRetention: 'session',
      lucyJourneyCreation: false,
      roomCreation: false,
      roomParticipants: undefined,
      privateRooms: false,
      podcastsIncluded: true,
      audiobooksIncluded: true,
      adFree: false,
      uploadStorage: 0,
      audienceInsights: false,
      promotionTools: false,
    },
    upsells: ['cross-device', 'lucy-memory', 'room-creation'],
  },
  
  plus: {
    id: 'lucy-plus',
    tier: 'plus',
    name: 'Lucy Plus',
    tagline: 'Lucy remembers you',
    price: {
      monthly: 4.99,
      annual: 49.99,    // ~$4.17/month
      currency: 'USD',
    },
    features: [
      { id: 'listening', name: 'Unlimited Listening', description: 'Stream music and podcasts without limits', included: true, highlight: false },
      { id: 'lucy-chat', name: 'Unlimited Lucy Chat', description: 'No limits on conversations', included: true, limit: undefined, highlight: true },
      { id: 'lucy-memory', name: 'Lucy Memory', description: 'Lucy remembers your preferences for 30 days', included: true, highlight: true },
      { id: 'rooms', name: 'Create & Join Rooms', description: 'Create your own listening rooms', included: true, highlight: true },
      { id: 'cross-device', name: 'Cross-Device Sync', description: 'Seamless handoff between devices', included: true, highlight: true },
      { id: 'recommendations', name: 'Smart Recommendations', description: 'AI-powered suggestions', included: true, highlight: false },
      { id: 'offline', name: 'Offline Mode', description: '50 downloads for offline', included: true, limit: 50, highlight: false },
      { id: 'audio-quality', name: 'High Quality Audio', description: '320kbps streaming', included: true, highlight: false },
      { id: 'ad-free', name: 'Ad-Free Experience', description: 'No interruptions', included: true, highlight: true },
    ],
    limits: {
      monthlyListeningHours: undefined,
      offlineDownloads: 50,
      audioQuality: 'high',
      crossDeviceSync: true,
      lucyConversationsPerDay: undefined,
      lucyMemoryRetention: '30_days',
      lucyJourneyCreation: false,
      roomCreation: true,
      roomParticipants: 10,
      privateRooms: false,
      podcastsIncluded: true,
      audiobooksIncluded: true,
      adFree: true,
      uploadStorage: 0,
      audienceInsights: false,
      promotionTools: false,
    },
    upsells: ['lucy-journeys', 'private-rooms', 'lossless-audio'],
  },
  
  pro: {
    id: 'lucy-pro',
    tier: 'pro',
    name: 'Lucy Pro',
    tagline: 'The complete Lucy experience',
    price: {
      monthly: 9.99,
      annual: 99.99,    // ~$8.33/month
      currency: 'USD',
    },
    features: [
      { id: 'listening', name: 'Unlimited Listening', description: 'Stream everything without limits', included: true, highlight: false },
      { id: 'lucy-chat', name: 'Unlimited Lucy Chat', description: 'Lucy is always there for you', included: true, highlight: false },
      { id: 'lucy-memory', name: 'Permanent Lucy Memory', description: 'Lucy remembers everything, forever', included: true, highlight: true },
      { id: 'lucy-journeys', name: 'Custom Journeys', description: 'Create personalized sonic journeys', included: true, highlight: true },
      { id: 'rooms', name: 'Private Rooms', description: 'Create private listening rooms for 25', included: true, highlight: true },
      { id: 'cross-device', name: 'Cross-Device Sync', description: 'Seamless everywhere', included: true, highlight: false },
      { id: 'offline', name: 'Unlimited Offline', description: 'Download anything', included: true, limit: undefined, highlight: true },
      { id: 'audio-quality', name: 'Lossless Audio', description: 'CD-quality streaming', included: true, highlight: true },
      { id: 'ad-free', name: 'Ad-Free Experience', description: 'Pure focus', included: true, highlight: false },
      { id: 'early-access', name: 'Early Access', description: 'New features before everyone else', included: true, highlight: false },
    ],
    limits: {
      monthlyListeningHours: undefined,
      offlineDownloads: undefined,
      audioQuality: 'lossless',
      crossDeviceSync: true,
      lucyConversationsPerDay: undefined,
      lucyMemoryRetention: 'unlimited',
      lucyJourneyCreation: true,
      roomCreation: true,
      roomParticipants: 25,
      privateRooms: true,
      podcastsIncluded: true,
      audiobooksIncluded: true,
      adFree: true,
      uploadStorage: 0,
      audienceInsights: false,
      promotionTools: false,
    },
    upsells: ['creator-tools'],
  },
  
  family: {
    id: 'lucy-family',
    tier: 'family',
    name: 'Lucy Family',
    tagline: 'Lucy for everyone at home',
    price: {
      monthly: 14.99,
      annual: 149.99,   // ~$12.50/month
      currency: 'USD',
    },
    features: [
      { id: 'accounts', name: 'Up to 6 Accounts', description: 'Everyone gets their own Lucy', included: true, highlight: true },
      { id: 'listening', name: 'Unlimited Listening', description: 'Stream everything for everyone', included: true, highlight: false },
      { id: 'lucy-memory', name: 'Individual Lucy Memory', description: 'Lucy remembers each person', included: true, highlight: true },
      { id: 'parental', name: 'Parental Controls', description: 'Keep it family-friendly', included: true, highlight: true },
      { id: 'shared-rooms', name: 'Family Rooms', description: 'Listen together, even apart', included: true, highlight: true },
      { id: 'cross-device', name: 'Cross-Device Sync', description: 'Any device, any family member', included: true, highlight: false },
      { id: 'offline', name: 'Offline Mode', description: '200 downloads per account', included: true, limit: 200, highlight: false },
      { id: 'audio-quality', name: 'High Quality Audio', description: '320kbps for all', included: true, highlight: false },
      { id: 'ad-free', name: 'Ad-Free Experience', description: 'No ads for anyone', included: true, highlight: false },
    ],
    limits: {
      monthlyListeningHours: undefined,
      offlineDownloads: 200,
      audioQuality: 'high',
      crossDeviceSync: true,
      lucyConversationsPerDay: undefined,
      lucyMemoryRetention: 'unlimited',
      lucyJourneyCreation: true,
      roomCreation: true,
      roomParticipants: 6,
      privateRooms: true,
      podcastsIncluded: true,
      audiobooksIncluded: true,
      adFree: true,
      uploadStorage: 0,
      audienceInsights: false,
      promotionTools: false,
    },
    upsells: [],
  },
  
  creator: {
    id: 'lucy-creator',
    tier: 'creator',
    name: 'Lucy Creator',
    tagline: 'Build your audience with Lucy',
    price: {
      monthly: 19.99,
      annual: 199.99,   // ~$16.67/month
      currency: 'USD',
    },
    features: [
      { id: 'pro-features', name: 'All Pro Features', description: 'Everything in Lucy Pro', included: true, highlight: false },
      { id: 'upload', name: '100GB Upload Storage', description: 'Upload your own content', included: true, highlight: true },
      { id: 'analytics', name: 'Audience Insights', description: 'Understand who listens', included: true, highlight: true },
      { id: 'promotion', name: 'Promotion Tools', description: 'Get discovered by new fans', included: true, highlight: true },
      { id: 'monetization', name: 'Creator Monetization', description: 'Accept tips and subscriptions', included: true, highlight: true },
      { id: 'rooms', name: 'Broadcast Rooms', description: 'Host listening events for 100', included: true, highlight: true },
      { id: 'priority', name: 'Priority Support', description: 'Direct line to our team', included: true, highlight: false },
      { id: 'verification', name: 'Creator Verification', description: 'Verified creator badge', included: true, highlight: false },
    ],
    limits: {
      monthlyListeningHours: undefined,
      offlineDownloads: undefined,
      audioQuality: 'lossless',
      crossDeviceSync: true,
      lucyConversationsPerDay: undefined,
      lucyMemoryRetention: 'unlimited',
      lucyJourneyCreation: true,
      roomCreation: true,
      roomParticipants: 100,
      privateRooms: true,
      podcastsIncluded: true,
      audiobooksIncluded: true,
      adFree: true,
      uploadStorage: 100,
      audienceInsights: true,
      promotionTools: true,
    },
    upsells: [],
  },
};

// =============================================================================
// PRICING UTILITIES
// =============================================================================

export function getPlanByTier(tier: SubscriptionTier): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[tier];
}

export function getAnnualSavings(tier: SubscriptionTier): number {
  const plan = SUBSCRIPTION_PLANS[tier];
  const monthlyCost = plan.price.monthly * 12;
  const annualCost = plan.price.annual;
  return monthlyCost - annualCost;
}

export function getAnnualSavingsPercent(tier: SubscriptionTier): number {
  const plan = SUBSCRIPTION_PLANS[tier];
  if (plan.price.monthly === 0) return 0;
  const monthlyCost = plan.price.monthly * 12;
  const savings = monthlyCost - plan.price.annual;
  return Math.round((savings / monthlyCost) * 100);
}

export function canAccessFeature(userTier: SubscriptionTier, featureId: string): boolean {
  const plan = SUBSCRIPTION_PLANS[userTier];
  const feature = plan.features.find(f => f.id === featureId);
  return feature?.included ?? false;
}

export function getUpgradeRecommendation(currentTier: SubscriptionTier, desiredFeature: string): SubscriptionTier | null {
  const tiers: SubscriptionTier[] = ['free', 'plus', 'pro', 'family', 'creator'];
  const currentIndex = tiers.indexOf(currentTier);
  
  for (let i = currentIndex + 1; i < tiers.length; i++) {
    if (canAccessFeature(tiers[i], desiredFeature)) {
      return tiers[i];
    }
  }
  
  return null;
}

// =============================================================================
// TRIAL & PROMOTIONS
// =============================================================================

export interface TrialOffer {
  id: string;
  tier: SubscriptionTier;
  durationDays: number;
  headline: string;
  description: string;
  requiresPaymentMethod: boolean;
}

export const TRIAL_OFFERS: TrialOffer[] = [
  {
    id: 'plus-7day',
    tier: 'plus',
    durationDays: 7,
    headline: 'Try Lucy Plus Free',
    description: 'Experience Lucy with memory for 7 days. No credit card required.',
    requiresPaymentMethod: false,
  },
  {
    id: 'pro-14day',
    tier: 'pro',
    durationDays: 14,
    headline: '14 Days of Lucy Pro',
    description: 'The complete Lucy experience. Start your free trial.',
    requiresPaymentMethod: true,
  },
];

// =============================================================================
// FEATURE GATES
// =============================================================================

export interface FeatureGate {
  featureId: string;
  requiredTier: SubscriptionTier;
  upgradePrompt: string;
  upgradeUrl: string;
}

export const FEATURE_GATES: Record<string, FeatureGate> = {
  'cross-device-sync': {
    featureId: 'cross-device',
    requiredTier: 'plus',
    upgradePrompt: 'Continue listening on any device with Lucy Plus',
    upgradeUrl: '/upgrade?feature=cross-device',
  },
  'lucy-memory': {
    featureId: 'lucy-memory',
    requiredTier: 'plus',
    upgradePrompt: 'Let Lucy remember your preferences with Lucy Plus',
    upgradeUrl: '/upgrade?feature=lucy-memory',
  },
  'room-creation': {
    featureId: 'rooms',
    requiredTier: 'plus',
    upgradePrompt: 'Create your own listening rooms with Lucy Plus',
    upgradeUrl: '/upgrade?feature=rooms',
  },
  'private-rooms': {
    featureId: 'private-rooms',
    requiredTier: 'pro',
    upgradePrompt: 'Create private rooms with Lucy Pro',
    upgradeUrl: '/upgrade?feature=private-rooms',
  },
  'lucy-journeys': {
    featureId: 'lucy-journeys',
    requiredTier: 'pro',
    upgradePrompt: 'Create custom sonic journeys with Lucy Pro',
    upgradeUrl: '/upgrade?feature=lucy-journeys',
  },
  'lossless-audio': {
    featureId: 'audio-quality',
    requiredTier: 'pro',
    upgradePrompt: 'Hear every detail with lossless audio on Lucy Pro',
    upgradeUrl: '/upgrade?feature=lossless',
  },
  'creator-upload': {
    featureId: 'upload',
    requiredTier: 'creator',
    upgradePrompt: 'Upload your own content with Lucy Creator',
    upgradeUrl: '/upgrade?feature=creator',
  },
};
