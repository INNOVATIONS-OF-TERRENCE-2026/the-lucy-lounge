/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — SUBSCRIPTION GATE HOOK                                   │
 * │                                                                             │
 * │ Feature gating that respects users                                         │
 * │ Clear value proposition, not frustration funnel.                           │
 * │                                                                             │
 * │ Upgrade prompts that make sense, not dark patterns.                        │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  SUBSCRIPTION_PLANS, 
  canAccessFeature,
  getUpgradeRecommendation,
  FEATURE_GATES 
} from '@/monetization/plans';
import type { SubscriptionTier, SubscriptionPlan, SubscriptionLimits } from '@/monetization/types';

// =============================================================================
// HOOK TYPES
// =============================================================================

export interface UseSubscriptionReturn {
  // Current state
  tier: SubscriptionTier;
  plan: SubscriptionPlan;
  limits: SubscriptionLimits;
  isLoading: boolean;
  
  // Feature checks
  canAccess: (featureId: string) => boolean;
  getLimit: <K extends keyof SubscriptionLimits>(key: K) => SubscriptionLimits[K];
  
  // Usage tracking
  usageStats: UsageStats;
  isAtLimit: (limitKey: keyof UsageLimits) => boolean;
  
  // Upgrade prompts
  getUpgradePrompt: (featureId: string) => UpgradePrompt | null;
  
  // Actions
  refreshSubscription: () => Promise<void>;
}

export interface UsageStats {
  lucyConversationsToday: number;
  offlineDownloads: number;
  roomsCreated: number;
  uploadStorageUsed: number;
}

export interface UsageLimits {
  lucyConversations: boolean;
  offlineDownloads: boolean;
  roomCreation: boolean;
  uploadStorage: boolean;
}

export interface UpgradePrompt {
  featureId: string;
  headline: string;
  description: string;
  recommendedTier: SubscriptionTier;
  recommendedPlan: SubscriptionPlan;
  ctaText: string;
  ctaUrl: string;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useSubscription(): UseSubscriptionReturn {
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [usageStats, setUsageStats] = useState<UsageStats>({
    lucyConversationsToday: 0,
    offlineDownloads: 0,
    roomsCreated: 0,
    uploadStorageUsed: 0,
  });
  
  // Derived state
  const plan = SUBSCRIPTION_PLANS[tier];
  const limits = plan.limits;
  
  // ===========================================================================
  // FETCH SUBSCRIPTION
  // ===========================================================================
  
  const fetchSubscription = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setTier('free');
        setIsLoading(false);
        return;
      }
      
      // Fetch subscription from database
      // Would be replaced with actual Supabase query
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('tier, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
      
      if (subscription?.tier) {
        setTier(subscription.tier as SubscriptionTier);
      } else {
        setTier('free');
      }
      
      // Fetch usage stats
      const today = new Date().toISOString().split('T')[0];
      
      const { data: conversations } = await supabase
        .from('lucy_conversations')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', today)
        .limit(100);
      
      setUsageStats(prev => ({
        ...prev,
        lucyConversationsToday: conversations?.length || 0,
      }));
      
    } catch (error) {
      console.error('[useSubscription] Failed to fetch:', error);
      setTier('free');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchSubscription();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchSubscription();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchSubscription]);
  
  // ===========================================================================
  // FEATURE ACCESS
  // ===========================================================================
  
  const canAccess = useCallback((featureId: string): boolean => {
    return canAccessFeature(tier, featureId);
  }, [tier]);
  
  const getLimit = useCallback(<K extends keyof SubscriptionLimits>(key: K): SubscriptionLimits[K] => {
    return limits[key];
  }, [limits]);
  
  // ===========================================================================
  // USAGE LIMITS
  // ===========================================================================
  
  const isAtLimit = useCallback((limitKey: keyof UsageLimits): boolean => {
    switch (limitKey) {
      case 'lucyConversations':
        if (!limits.lucyConversationsPerDay) return false;
        return usageStats.lucyConversationsToday >= limits.lucyConversationsPerDay;
        
      case 'offlineDownloads':
        if (!limits.offlineDownloads) return false;
        return usageStats.offlineDownloads >= limits.offlineDownloads;
        
      case 'roomCreation':
        return !limits.roomCreation;
        
      case 'uploadStorage':
        if (!limits.uploadStorage) return false;
        return usageStats.uploadStorageUsed >= limits.uploadStorage;
        
      default:
        return false;
    }
  }, [limits, usageStats]);
  
  // ===========================================================================
  // UPGRADE PROMPTS
  // ===========================================================================
  
  const getUpgradePrompt = useCallback((featureId: string): UpgradePrompt | null => {
    // Already has access
    if (canAccessFeature(tier, featureId)) {
      return null;
    }
    
    const gate = FEATURE_GATES[featureId];
    if (!gate) return null;
    
    const recommendedTier = getUpgradeRecommendation(tier, featureId);
    if (!recommendedTier) return null;
    
    const recommendedPlan = SUBSCRIPTION_PLANS[recommendedTier];
    
    return {
      featureId,
      headline: gate.upgradePrompt,
      description: `Unlock this with ${recommendedPlan.name}`,
      recommendedTier,
      recommendedPlan,
      ctaText: `Try ${recommendedPlan.name}`,
      ctaUrl: gate.upgradeUrl,
    };
  }, [tier]);
  
  return {
    tier,
    plan,
    limits,
    isLoading,
    canAccess,
    getLimit,
    usageStats,
    isAtLimit,
    getUpgradePrompt,
    refreshSubscription: fetchSubscription,
  };
}

// =============================================================================
// FEATURE GATE COMPONENT HELPER
// =============================================================================

export interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUpgradeClick?: () => void;
}

/**
 * Usage:
 * <FeatureGate feature="lucy-memory">
 *   <LucyMemoryFeature />
 * </FeatureGate>
 */
export function useFeatureGate(featureId: string) {
  const { canAccess, getUpgradePrompt } = useSubscription();
  
  const hasAccess = canAccess(featureId);
  const upgradePrompt = hasAccess ? null : getUpgradePrompt(featureId);
  
  return {
    hasAccess,
    upgradePrompt,
  };
}
