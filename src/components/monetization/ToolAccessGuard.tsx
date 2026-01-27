/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — TOOL ACCESS GUARD                                        │
 * │                                                                             │
 * │ Wraps tool components with tier-based access control                       │
 * │ Shows upgrade prompts when access is denied                                │
 * │                                                                             │
 * │ Lucy gates with grace, not frustration.                                    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Zap, ArrowRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useSubscription, ToolId, useFeatureGate } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';

// =============================================================================
// TYPES
// =============================================================================

interface ToolAccessGuardProps {
  toolId: ToolId;
  toolName: string;
  toolDescription?: string;
  model?: string;
  children: ReactNode;
  showUsageMeter?: boolean;
  onAccessDenied?: (reason: string) => void;
}

// =============================================================================
// USAGE METER COMPONENT
// =============================================================================

interface UsageMeterProps {
  toolId: ToolId;
  compact?: boolean;
}

export function UsageMeter({ toolId, compact = false }: UsageMeterProps) {
  const { getToolQuota, tier, getTierDisplayName, getTierBadgeColor } = useSubscription();
  const quota = getToolQuota(toolId);

  if (!quota) return null;

  const isUnlimited = quota.dailyLimit < 0;
  const percentage = isUnlimited ? 0 : Math.min(100, (quota.dailyUsed / quota.dailyLimit) * 100);
  const remaining = isUnlimited ? -1 : quota.dailyLimit - quota.dailyUsed;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {isUnlimited ? (
          <span className="text-green-500">Unlimited</span>
        ) : (
          <>
            <span>{remaining} / {quota.dailyLimit} today</span>
            <Progress value={percentage} className="w-16 h-1.5" />
          </>
        )}
      </div>
    );
  }

  return (
    <Card className="border-border/50">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Daily Usage</span>
            <Badge variant="secondary" className={`${getTierBadgeColor()} text-white text-xs`}>
              {getTierDisplayName()}
            </Badge>
          </div>
          {isUnlimited ? (
            <span className="text-sm text-green-500 font-medium">Unlimited</span>
          ) : (
            <span className="text-sm text-muted-foreground">
              {quota.dailyUsed} / {quota.dailyLimit}
            </span>
          )}
        </div>
        {!isUnlimited && (
          <Progress 
            value={percentage} 
            className={`h-2 ${percentage >= 80 ? 'bg-amber-100' : ''}`}
          />
        )}
        {percentage >= 80 && !isUnlimited && (
          <p className="text-xs text-amber-600 mt-2">
            Running low! Consider upgrading for more.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// UPGRADE PROMPT COMPONENT
// =============================================================================

interface UpgradePromptProps {
  toolId: ToolId;
  toolName: string;
  reason: string;
  onUpgrade?: () => void;
}

export function UpgradePrompt({ toolId, toolName, reason, onUpgrade }: UpgradePromptProps) {
  const navigate = useNavigate();
  const { getUpgradePrompt, tier } = useSubscription();
  const upgradePrompt = getUpgradePrompt(toolId);

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate(`/upgrade?tool=${toolId}&from=${tier}`);
    }
  };

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-amber-500" />
        </div>
        <CardTitle className="text-xl">{toolName} is Locked</CardTitle>
        <CardDescription className="text-base">{reason}</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">{upgradePrompt}</p>
        <Button 
          onClick={handleUpgrade}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          <Zap className="w-4 h-4 mr-2" />
          Upgrade Now
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <p className="text-xs text-muted-foreground">
          Start with a free trial. Cancel anytime.
        </p>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// SIGN IN PROMPT
// =============================================================================

function SignInPrompt({ toolName }: { toolName: string }) {
  const navigate = useNavigate();

  return (
    <Card className="border-primary/30">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-xl">Sign In Required</CardTitle>
        <CardDescription className="text-base">
          Please sign in to use {toolName}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          Create a free account to access Lucy's tools and track your usage.
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => navigate('/auth')} variant="default">
            Sign In
          </Button>
          <Button onClick={() => navigate('/auth?mode=signup')} variant="outline">
            Create Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// LOADING STATE
// =============================================================================

function LoadingState({ toolName }: { toolName: string }) {
  return (
    <Card className="border-border/50">
      <CardContent className="py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Checking access to {toolName}...</p>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// ERROR STATE
// =============================================================================

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-destructive/30">
      <CardContent className="py-8 text-center space-y-4">
        <AlertCircle className="w-8 h-8 mx-auto text-destructive" />
        <div>
          <p className="font-medium">Failed to check access</p>
          <p className="text-sm text-muted-foreground">Please try again</p>
        </div>
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// MAIN GUARD COMPONENT
// =============================================================================

export function ToolAccessGuard({
  toolId,
  toolName,
  toolDescription,
  model,
  children,
  showUsageMeter = true,
  onAccessDenied,
}: ToolAccessGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const { loading: subLoading, error, refreshQuotas, recordUsage } = useSubscription();
  const { canAccess, isChecking, accessResult, checkAccess } = useFeatureGate({
    toolId,
    model,
    onAccessDenied,
  });

  const [hasChecked, setHasChecked] = useState(false);

  // Check access on mount
  useEffect(() => {
    if (!authLoading && !subLoading && user && !hasChecked) {
      checkAccess().then(() => setHasChecked(true));
    }
  }, [authLoading, subLoading, user, hasChecked, checkAccess]);

  // Loading state
  if (authLoading || subLoading || isChecking) {
    return <LoadingState toolName={toolName} />;
  }

  // Not authenticated
  if (!user) {
    return <SignInPrompt toolName={toolName} />;
  }

  // Error state
  if (error) {
    return <ErrorState onRetry={refreshQuotas} />;
  }

  // Access denied
  if (!canAccess && accessResult) {
    return (
      <UpgradePrompt
        toolId={toolId}
        toolName={toolName}
        reason={accessResult.reason}
      />
    );
  }

  // Access granted - render children with usage meter
  return (
    <div className="space-y-4">
      {showUsageMeter && <UsageMeter toolId={toolId} />}
      {children}
    </div>
  );
}

// =============================================================================
// HOC FOR WRAPPING TOOL PAGES
// =============================================================================

interface WithToolAccessOptions {
  toolId: ToolId;
  toolName: string;
  toolDescription?: string;
  showUsageMeter?: boolean;
}

export function withToolAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithToolAccessOptions
) {
  return function WithToolAccessWrapper(props: P) {
    return (
      <ToolAccessGuard
        toolId={options.toolId}
        toolName={options.toolName}
        toolDescription={options.toolDescription}
        showUsageMeter={options.showUsageMeter}
      >
        <WrappedComponent {...props} />
      </ToolAccessGuard>
    );
  };
}

// =============================================================================
// INLINE ACCESS CHECK HOOK
// =============================================================================

interface UseToolAccessOptions {
  toolId: ToolId;
  model?: string;
  autoRecord?: boolean;
}

export function useToolAccess({ toolId, model, autoRecord = true }: UseToolAccessOptions) {
  const { canAccessTool, recordUsage, isAtLimit, getDailyRemaining, getUpgradePrompt } = useSubscription();
  const [lastCheck, setLastCheck] = useState<{ allowed: boolean; reason: string } | null>(null);

  const executeWithAccessCheck = async <T,>(
    action: () => Promise<T>,
    onDenied?: (reason: string) => void
  ): Promise<T | null> => {
    // Check access first
    const access = await canAccessTool(toolId, model);
    setLastCheck({ allowed: access.allowed, reason: access.reason });

    if (!access.allowed) {
      if (onDenied) {
        onDenied(access.reason);
      }
      return null;
    }

    // Record the request
    if (autoRecord) {
      await recordUsage(toolId, 'request');
    }

    try {
      const result = await action();
      
      // Record success
      if (autoRecord) {
        await recordUsage(toolId, 'success');
      }
      
      return result;
    } catch (error) {
      // Record failure
      if (autoRecord) {
        await recordUsage(toolId, 'failure', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      throw error;
    }
  };

  return {
    executeWithAccessCheck,
    lastCheck,
    isAtLimit: isAtLimit(toolId),
    dailyRemaining: getDailyRemaining(toolId),
    upgradePrompt: getUpgradePrompt(toolId),
  };
}

export default ToolAccessGuard;
