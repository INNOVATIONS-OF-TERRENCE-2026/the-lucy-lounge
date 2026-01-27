/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — USER USAGE DASHBOARD                                     │
 * │                                                                             │
 * │ Personal usage tracking and subscription management                        │
 * │ Lucy shows you exactly where you stand.                                    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Image, 
  Video, 
  Music, 
  Mic, 
  FileText, 
  Code, 
  Globe, 
  Calculator,
  Crown,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSubscription, ToolId, TIER_DISPLAY_NAMES, TIER_BADGE_COLORS } from '@/hooks/useSubscription';
import { LoadingState } from '@/components/platform/LoadingStates';

// =============================================================================
// TOOL ICONS
// =============================================================================

const TOOL_ICONS: Record<ToolId, React.ReactNode> = {
  chat: <Zap className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  music: <Music className="w-4 h-4" />,
  voice: <Mic className="w-4 h-4" />,
  pdf: <FileText className="w-4 h-4" />,
  code: <Code className="w-4 h-4" />,
  web_fetch: <Globe className="w-4 h-4" />,
  calculator: <Calculator className="w-4 h-4" />,
};

const TOOL_NAMES: Record<ToolId, string> = {
  chat: 'Chat',
  image: 'Image Generation',
  video: 'Video Generation',
  music: 'Music Generation',
  voice: 'Voice Synthesis',
  pdf: 'PDF Generation',
  code: 'Code Execution',
  web_fetch: 'Web Fetching',
  calculator: 'Calculator',
};

// =============================================================================
// USAGE CARD COMPONENT
// =============================================================================

interface UsageCardProps {
  toolId: ToolId;
  dailyUsed: number;
  dailyLimit: number;
  monthlyUsed: number;
  monthlyLimit: number;
  isEnabled: boolean;
}

function UsageCard({ toolId, dailyUsed, dailyLimit, monthlyUsed, monthlyLimit, isEnabled }: UsageCardProps) {
  const navigate = useNavigate();
  const isUnlimited = dailyLimit < 0;
  const dailyPercentage = isUnlimited ? 0 : Math.min(100, (dailyUsed / dailyLimit) * 100);
  const isNearLimit = !isUnlimited && dailyPercentage >= 80;
  const isAtLimit = !isUnlimited && dailyUsed >= dailyLimit;

  if (!isEnabled) {
    return (
      <Card className="border-muted bg-muted/20 opacity-60">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {TOOL_ICONS[toolId]}
              <span className="font-medium">{TOOL_NAMES[toolId]}</span>
            </div>
            <Badge variant="outline">Locked</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Upgrade to unlock this tool
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isAtLimit ? 'border-amber-500/30' : ''}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {TOOL_ICONS[toolId]}
            <span className="font-medium">{TOOL_NAMES[toolId]}</span>
          </div>
          {isUnlimited ? (
            <Badge variant="secondary" className="bg-green-500/10 text-green-500">
              Unlimited
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">
              {dailyUsed} / {dailyLimit}
            </span>
          )}
        </div>

        {!isUnlimited && (
          <>
            <Progress 
              value={dailyPercentage} 
              className={`h-2 ${isNearLimit ? 'bg-amber-100' : ''}`}
            />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>Daily</span>
              <span>
                {dailyLimit - dailyUsed} remaining
              </span>
            </div>
          </>
        )}

        {monthlyLimit >= 0 && (
          <div className="mt-2 pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Monthly</span>
              <span>{monthlyUsed} / {monthlyLimit}</span>
            </div>
          </div>
        )}

        {isAtLimit && (
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full mt-3 text-amber-600 border-amber-500/30"
            onClick={() => navigate('/upgrade')}
          >
            <Crown className="w-3 h-3 mr-1" />
            Upgrade for more
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// SUBSCRIPTION CARD
// =============================================================================

function SubscriptionCard() {
  const navigate = useNavigate();
  const { subscription, tier, getTierDisplayName, getTierBadgeColor } = useSubscription();

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Your Plan
          </CardTitle>
          <Badge className={`${getTierBadgeColor()} text-white`}>
            {getTierDisplayName()}
          </Badge>
        </div>
        <CardDescription>
          {subscription?.status === 'active' 
            ? 'Your subscription is active'
            : 'You are on the free plan'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription?.currentPeriodEnd && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {subscription.status === 'active' 
                ? `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                : `Expires ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
            </span>
          </div>
        )}

        {tier !== 'enterprise' && (
          <Button 
            onClick={() => navigate('/upgrade')}
            className="w-full"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// MAIN DASHBOARD
// =============================================================================

export function UsageDashboard() {
  const { quotas, loading, tier, refreshQuotas } = useSubscription();

  if (loading) {
    return <LoadingState context="general" variant="card" message="Loading usage..." />;
  }

  // Calculate total usage stats
  const totalDailyUsed = quotas.reduce((sum, q) => sum + q.dailyUsed, 0);
  const totalMonthlyUsed = quotas.reduce((sum, q) => sum + q.monthlyUsed, 0);
  const enabledTools = quotas.filter(q => q.isEnabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Usage</h2>
          <p className="text-sm text-muted-foreground">
            Track your tool usage and limits
          </p>
        </div>
        <Button onClick={refreshQuotas} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SubscriptionCard />
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDailyUsed}</div>
            <p className="text-xs text-muted-foreground">
              Total requests across all tools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMonthlyUsed}</div>
            <p className="text-xs text-muted-foreground">
              {enabledTools} tools available on your plan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tool Usage Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Tool Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quotas.map((quota) => (
            <UsageCard
              key={quota.toolId}
              toolId={quota.toolId}
              dailyUsed={quota.dailyUsed}
              dailyLimit={quota.dailyLimit}
              monthlyUsed={quota.monthlyUsed}
              monthlyLimit={quota.monthlyLimit}
              isEnabled={quota.isEnabled}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default UsageDashboard;
