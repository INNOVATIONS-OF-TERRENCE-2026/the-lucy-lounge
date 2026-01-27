/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — SUBSCRIPTION & TIER MANAGEMENT HOOK                      │
 * │                                                                             │
 * │ Central hook for all monetization, tier gating, and usage tracking         │
 * │ Provides real-time access control for all platform tools                   │
 * │                                                                             │
 * │ Lucy monetizes through VALUE, not lock-in.                                 │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback, useMemo, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// =============================================================================
// TYPES - Aligned with backend schema
// =============================================================================

export type UserTier = 'free' | 'pro' | 'power' | 'enterprise';

export type ToolId = 
  | 'chat' 
  | 'image' 
  | 'video' 
  | 'music' 
  | 'voice' 
  | 'pdf' 
  | 'code' 
  | 'web_fetch' 
  | 'calculator'
  | 'summarizer'
  | 'captioning'
  | 'code-executor'
  | 'web-fetcher';

export interface ToolQuota {
  tier: UserTier;
  toolId: ToolId;
  dailyLimit: number;
  dailyUsed: number;
  monthlyLimit: number;
  monthlyUsed: number;
  isEnabled: boolean;
  allowedModels: string[];
}

export interface AccessCheckResult {
  allowed: boolean;
  reason: string;
  dailyRemaining: number;
  tier: UserTier;
  upgradeAvailable: boolean;
}

export interface UsageStats {
  toolId: ToolId;
  requestsToday: number;
  requestsThisMonth: number;
  successRate: number;
  totalCost: number;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: UserTier;
  status: 'active' | 'canceled' | 'past_due' | 'expired' | 'trialing';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  canceledAt?: Date;
  trialEnd?: Date;
}

export interface SubscriptionContextValue {
  // State
  subscription: Subscription | null;
  tier: UserTier;
  quotas: ToolQuota[];
  loading: boolean;
  error: string | null;
  
  // Access control
  canAccessTool: (toolId: ToolId, model?: string) => Promise<AccessCheckResult>;
  checkToolAccess: (toolId: ToolId, model?: string) => AccessCheckResult | null;
  
  // Usage
  getToolQuota: (toolId: ToolId) => ToolQuota | null;
  getDailyRemaining: (toolId: ToolId) => number;
  isAtLimit: (toolId: ToolId) => boolean;
  
  // Upgrade prompts
  getUpgradePrompt: (toolId: ToolId) => string;
  shouldShowUpgrade: (toolId: ToolId) => boolean;
  
  // Actions
  recordUsage: (toolId: ToolId, eventType: 'request' | 'success' | 'failure', metadata?: Record<string, any>) => Promise<void>;
  refreshQuotas: () => Promise<void>;
  
  // Tier utilities
  tierAllowsModel: (model: string, toolId: ToolId) => boolean;
  getTierDisplayName: () => string;
  getTierBadgeColor: () => string;
}

// =============================================================================
// TIER CONFIGURATION
// =============================================================================

const TIER_DISPLAY_NAMES: Record<UserTier, string> = {
  free: 'Free',
  pro: 'Pro',
  power: 'Power',
  enterprise: 'Enterprise',
};

const TIER_BADGE_COLORS: Record<UserTier, string> = {
  free: 'bg-gray-500',
  pro: 'bg-blue-500',
  power: 'bg-purple-500',
  enterprise: 'bg-amber-500',
};

const UPGRADE_PROMPTS: Record<ToolId, Record<UserTier, string>> = {
  chat: {
    free: 'Upgrade to Pro for unlimited conversations and smarter models',
    pro: 'Upgrade to Power for GPT-5 and Claude access',
    power: 'Upgrade to Enterprise for priority support',
    enterprise: '',
  },
  image: {
    free: 'Upgrade to Pro for 50 images/day with FLUX models',
    pro: 'Upgrade to Power for 200 images/day with FLUX.1-dev',
    power: 'Upgrade to Enterprise for unlimited image generation',
    enterprise: '',
  },
  video: {
    free: 'Upgrade to Pro to unlock video generation',
    pro: 'Upgrade to Power for 50 videos/day',
    power: 'Upgrade to Enterprise for unlimited video generation',
    enterprise: '',
  },
  music: {
    free: 'Upgrade to Pro for 30 tracks/day with MusicGen Medium',
    pro: 'Upgrade to Power for 100 tracks/day with MusicGen Large',
    power: 'Upgrade to Enterprise for unlimited music generation',
    enterprise: '',
  },
  voice: {
    free: 'Upgrade to Pro for 50 voice generations/day',
    pro: 'Upgrade to Power for 200 voice generations/day',
    power: 'Upgrade to Enterprise for unlimited voice synthesis',
    enterprise: '',
  },
  pdf: {
    free: 'Upgrade to Pro for 100 PDFs/day',
    pro: 'Upgrade to Power for unlimited PDF generation',
    power: '',
    enterprise: '',
  },
  code: {
    free: 'Upgrade to Pro for 200 code executions/day with Pro models',
    pro: 'Upgrade to Power for unlimited code execution',
    power: '',
    enterprise: '',
  },
  web_fetch: {
    free: 'Upgrade to Pro for 200 web fetches/day',
    pro: 'Upgrade to Power for unlimited web fetching',
    power: '',
    enterprise: '',
  },
  calculator: {
    free: 'Upgrade to Pro for unlimited calculations',
    pro: '',
    power: '',
    enterprise: '',
  },
};

// =============================================================================
// CONTEXT
// =============================================================================

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { user, session } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [quotas, setQuotas] = useState<ToolQuota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cache for access checks
  const [accessCache, setAccessCache] = useState<Map<string, AccessCheckResult>>(new Map());

  // Derived tier
  const tier: UserTier = subscription?.tier || 'free';

  // Fetch subscription and quotas
  const fetchSubscriptionData = useCallback(async () => {
    if (!user?.id) {
      setSubscription(null);
      setQuotas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch subscription
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subError && subError.code !== 'PGRST116') {
        console.error('[useSubscription] Subscription fetch error:', subError);
      }

      const sub: Subscription | null = subData ? {
        id: subData.id,
        userId: subData.user_id,
        tier: (subData.tier as UserTier) || 'free',
        status: subData.status,
        stripeCustomerId: subData.stripe_customer_id,
        stripeSubscriptionId: subData.stripe_subscription_id,
        currentPeriodStart: subData.current_period_start ? new Date(subData.current_period_start) : undefined,
        currentPeriodEnd: subData.current_period_end ? new Date(subData.current_period_end) : undefined,
        canceledAt: subData.canceled_at ? new Date(subData.canceled_at) : undefined,
        trialEnd: subData.trial_end ? new Date(subData.trial_end) : undefined,
      } : null;

      setSubscription(sub);

      // Fetch quotas
      const { data: quotaData, error: quotaError } = await supabase
        .rpc('get_user_tier_quotas', { p_user_id: user.id });

      if (quotaError) {
        console.error('[useSubscription] Quota fetch error:', quotaError);
      }

      if (quotaData && Array.isArray(quotaData)) {
        const mappedQuotas: ToolQuota[] = quotaData.map((q: any) => ({
          tier: q.tier as UserTier,
          toolId: q.tool_id as ToolId,
          dailyLimit: q.daily_limit,
          dailyUsed: q.daily_used,
          monthlyLimit: q.monthly_limit,
          monthlyUsed: q.monthly_used,
          isEnabled: q.is_enabled,
          allowedModels: q.allowed_models || [],
        }));
        setQuotas(mappedQuotas);
      }

      // Clear access cache on refresh
      setAccessCache(new Map());

    } catch (err) {
      console.error('[useSubscription] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  // Real-time subscription updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchSubscriptionData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchSubscriptionData]);

  // Check tool access (async, calls RPC)
  const canAccessTool = useCallback(async (toolId: ToolId, model?: string): Promise<AccessCheckResult> => {
    if (!user?.id) {
      return {
        allowed: false,
        reason: 'Please sign in to use this tool',
        dailyRemaining: 0,
        tier: 'free',
        upgradeAvailable: true,
      };
    }

    const cacheKey = `${toolId}:${model || 'default'}`;
    const cached = accessCache.get(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase.rpc('check_tool_access', {
        p_user_id: user.id,
        p_tool_id: toolId,
        p_model: model || null,
      });

      if (error) {
        console.error('[useSubscription] Access check error:', error);
        // Fail closed for security
        return {
          allowed: false,
          reason: 'Access check failed',
          dailyRemaining: 0,
          tier: tier,
          upgradeAvailable: true,
        };
      }

      if (data && data.length > 0) {
        const result: AccessCheckResult = {
          allowed: data[0].allowed,
          reason: data[0].reason,
          dailyRemaining: data[0].daily_remaining,
          tier: data[0].tier as UserTier,
          upgradeAvailable: data[0].upgrade_available,
        };

        // Cache the result
        setAccessCache(prev => new Map(prev).set(cacheKey, result));
        return result;
      }

      return {
        allowed: true,
        reason: 'Access granted',
        dailyRemaining: -1,
        tier: tier,
        upgradeAvailable: tier !== 'enterprise',
      };
    } catch (err) {
      console.error('[useSubscription] Access check exception:', err);
      return {
        allowed: false,
        reason: 'Access check failed',
        dailyRemaining: 0,
        tier: tier,
        upgradeAvailable: true,
      };
    }
  }, [user?.id, tier, accessCache]);

  // Synchronous access check from cached quotas
  const checkToolAccess = useCallback((toolId: ToolId, model?: string): AccessCheckResult | null => {
    const quota = quotas.find(q => q.toolId === toolId);
    if (!quota) return null;

    // Check if tool is enabled
    if (!quota.isEnabled) {
      return {
        allowed: false,
        reason: 'Upgrade required to access this tool',
        dailyRemaining: 0,
        tier: tier,
        upgradeAvailable: true,
      };
    }

    // Check daily limit (-1 = unlimited)
    if (quota.dailyLimit >= 0 && quota.dailyUsed >= quota.dailyLimit) {
      return {
        allowed: false,
        reason: 'Daily limit reached',
        dailyRemaining: 0,
        tier: tier,
        upgradeAvailable: true,
      };
    }

    // Check monthly limit
    if (quota.monthlyLimit >= 0 && quota.monthlyUsed >= quota.monthlyLimit) {
      return {
        allowed: false,
        reason: 'Monthly limit reached',
        dailyRemaining: quota.dailyLimit < 0 ? -1 : quota.dailyLimit - quota.dailyUsed,
        tier: tier,
        upgradeAvailable: true,
      };
    }

    // Check model access
    if (model && quota.allowedModels.length > 0 && !quota.allowedModels.includes(model)) {
      return {
        allowed: false,
        reason: 'Model not available on your plan',
        dailyRemaining: quota.dailyLimit < 0 ? -1 : quota.dailyLimit - quota.dailyUsed,
        tier: tier,
        upgradeAvailable: true,
      };
    }

    return {
      allowed: true,
      reason: 'Access granted',
      dailyRemaining: quota.dailyLimit < 0 ? -1 : quota.dailyLimit - quota.dailyUsed,
      tier: tier,
      upgradeAvailable: tier !== 'enterprise',
    };
  }, [quotas, tier]);

  // Get quota for a specific tool
  const getToolQuota = useCallback((toolId: ToolId): ToolQuota | null => {
    return quotas.find(q => q.toolId === toolId) || null;
  }, [quotas]);

  // Get daily remaining for a tool
  const getDailyRemaining = useCallback((toolId: ToolId): number => {
    const quota = quotas.find(q => q.toolId === toolId);
    if (!quota) return 0;
    if (quota.dailyLimit < 0) return -1; // Unlimited
    return Math.max(0, quota.dailyLimit - quota.dailyUsed);
  }, [quotas]);

  // Check if at limit
  const isAtLimit = useCallback((toolId: ToolId): boolean => {
    const quota = quotas.find(q => q.toolId === toolId);
    if (!quota) return true;
    if (!quota.isEnabled) return true;
    if (quota.dailyLimit < 0) return false; // Unlimited
    return quota.dailyUsed >= quota.dailyLimit;
  }, [quotas]);

  // Get upgrade prompt
  const getUpgradePrompt = useCallback((toolId: ToolId): string => {
    return UPGRADE_PROMPTS[toolId]?.[tier] || 'Upgrade for more access';
  }, [tier]);

  // Should show upgrade
  const shouldShowUpgrade = useCallback((toolId: ToolId): boolean => {
    if (tier === 'enterprise') return false;
    const quota = quotas.find(q => q.toolId === toolId);
    if (!quota) return true;
    if (!quota.isEnabled) return true;
    if (quota.dailyLimit < 0) return false;
    // Show upgrade if at 80% or more of limit
    return quota.dailyUsed >= quota.dailyLimit * 0.8;
  }, [quotas, tier]);

  // Record usage
  const recordUsage = useCallback(async (
    toolId: ToolId, 
    eventType: 'request' | 'success' | 'failure',
    metadata?: Record<string, any>
  ): Promise<void> => {
    if (!user?.id) return;

    try {
      await supabase.rpc('record_tool_usage', {
        p_user_id: user.id,
        p_tool_id: toolId,
        p_event_type: eventType,
        p_metadata: metadata || {},
      });

      // Invalidate cache and refresh quotas on success
      if (eventType === 'request') {
        setAccessCache(new Map());
        // Optimistically update local quota
        setQuotas(prev => prev.map(q => 
          q.toolId === toolId 
            ? { ...q, dailyUsed: q.dailyUsed + 1, monthlyUsed: q.monthlyUsed + 1 }
            : q
        ));
      }
    } catch (err) {
      console.error('[useSubscription] Record usage error:', err);
    }
  }, [user?.id]);

  // Refresh quotas
  const refreshQuotas = useCallback(async (): Promise<void> => {
    await fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  // Check if tier allows a model
  const tierAllowsModel = useCallback((model: string, toolId: ToolId): boolean => {
    const quota = quotas.find(q => q.toolId === toolId);
    if (!quota) return false;
    if (quota.allowedModels.length === 0) return true;
    return quota.allowedModels.includes(model);
  }, [quotas]);

  // Get tier display name
  const getTierDisplayName = useCallback((): string => {
    return TIER_DISPLAY_NAMES[tier];
  }, [tier]);

  // Get tier badge color
  const getTierBadgeColor = useCallback((): string => {
    return TIER_BADGE_COLORS[tier];
  }, [tier]);

  const value: SubscriptionContextValue = useMemo(() => ({
    subscription,
    tier,
    quotas,
    loading,
    error,
    canAccessTool,
    checkToolAccess,
    getToolQuota,
    getDailyRemaining,
    isAtLimit,
    getUpgradePrompt,
    shouldShowUpgrade,
    recordUsage,
    refreshQuotas,
    tierAllowsModel,
    getTierDisplayName,
    getTierBadgeColor,
  }), [
    subscription,
    tier,
    quotas,
    loading,
    error,
    canAccessTool,
    checkToolAccess,
    getToolQuota,
    getDailyRemaining,
    isAtLimit,
    getUpgradePrompt,
    shouldShowUpgrade,
    recordUsage,
    refreshQuotas,
    tierAllowsModel,
    getTierDisplayName,
    getTierBadgeColor,
  ]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

// =============================================================================
// FEATURE GATE HOOK
// =============================================================================

interface UseFeatureGateOptions {
  toolId: ToolId;
  model?: string;
  onAccessDenied?: (reason: string) => void;
}

interface UseFeatureGateResult {
  canAccess: boolean;
  isChecking: boolean;
  accessResult: AccessCheckResult | null;
  checkAccess: () => Promise<boolean>;
  upgradePrompt: string;
  dailyRemaining: number;
}

export function useFeatureGate({ toolId, model, onAccessDenied }: UseFeatureGateOptions): UseFeatureGateResult {
  const { canAccessTool, checkToolAccess, getUpgradePrompt, getDailyRemaining } = useSubscription();
  const [isChecking, setIsChecking] = useState(false);
  const [accessResult, setAccessResult] = useState<AccessCheckResult | null>(null);

  // Synchronous check from cache
  const cachedResult = checkToolAccess(toolId, model);
  const canAccess = cachedResult?.allowed ?? false;

  const checkAccess = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      const result = await canAccessTool(toolId, model);
      setAccessResult(result);
      
      if (!result.allowed && onAccessDenied) {
        onAccessDenied(result.reason);
      }
      
      return result.allowed;
    } finally {
      setIsChecking(false);
    }
  }, [canAccessTool, toolId, model, onAccessDenied]);

  return {
    canAccess,
    isChecking,
    accessResult: accessResult || cachedResult,
    checkAccess,
    upgradePrompt: getUpgradePrompt(toolId),
    dailyRemaining: getDailyRemaining(toolId),
  };
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export { TIER_DISPLAY_NAMES, TIER_BADGE_COLORS, UPGRADE_PROMPTS };
