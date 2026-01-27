/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — TELEMETRY DASHBOARD                                      │
 * │                                                                             │
 * │ Admin-only observability dashboard for platform health                     │
 * │ Lucy observes herself.                                                     │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  Clock, 
  DollarSign, 
  RefreshCw, 
  Server, 
  Users, 
  Zap,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { LoadingState } from '@/components/platform/LoadingStates';

// =============================================================================
// TYPES
// =============================================================================

interface DashboardStats {
  totalUsers: number;
  activeUsersToday: number;
  totalRequestsToday: number;
  totalAiCallsToday: number;
  errorsToday: number;
  topTools: { tool_id: string; count: number }[];
  tierDistribution: { tier: string; count: number }[];
}

interface ToolHealth {
  toolId: string;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgLatencyMs: number;
  lastUsed: string;
}

interface TelemetryEvent {
  id: string;
  eventCategory: string;
  eventName: string;
  severity: string;
  functionName: string;
  durationMs: number;
  statusCode: number;
  message: string;
  createdAt: string;
}

interface UsageEvent {
  id: string;
  userId: string;
  toolId: string;
  eventType: string;
  modelUsed: string;
  tokensInput: number;
  tokensOutput: number;
  latencyMs: number;
  estimatedCost: number;
  createdAt: string;
}

// =============================================================================
// STAT CARD COMPONENT
// =============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

function StatCard({ title, value, description, icon, trend, trendValue, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-green-500/30 bg-green-500/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    error: 'border-red-500/30 bg-red-500/5',
  };

  return (
    <Card className={variantStyles[variant]}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && trendValue && (
          <div className="flex items-center gap-1 mt-1">
            {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
            <span className={`text-xs ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}>
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// TOOL HEALTH TABLE
// =============================================================================

function ToolHealthTable({ tools }: { tools: ToolHealth[] }) {
  const getHealthStatus = (successRate: number) => {
    if (successRate >= 99) return { label: 'Healthy', color: 'bg-green-500' };
    if (successRate >= 95) return { label: 'Good', color: 'bg-blue-500' };
    if (successRate >= 90) return { label: 'Warning', color: 'bg-amber-500' };
    return { label: 'Critical', color: 'bg-red-500' };
  };

  return (
    <div className="space-y-3">
      {tools.map((tool) => {
        const status = getHealthStatus(tool.successRate);
        return (
          <div key={tool.toolId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${status.color}`} />
              <div>
                <p className="font-medium capitalize">{tool.toolId.replace('_', ' ')}</p>
                <p className="text-xs text-muted-foreground">
                  {tool.successCount + tool.failureCount} requests • {tool.avgLatencyMs}ms avg
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={tool.successRate >= 95 ? 'default' : 'destructive'}>
                {tool.successRate.toFixed(1)}%
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {tool.failureCount} failures
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// RECENT EVENTS TABLE
// =============================================================================

function RecentEventsTable({ events }: { events: TelemetryEvent[] }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-500';
      case 'critical': return 'text-red-600 font-bold';
      case 'warn': return 'text-amber-500';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {events.map((event) => (
        <div key={event.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
          {getSeverityIcon(event.severity)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{event.eventName}</span>
              <Badge variant="outline" className="text-xs">
                {event.eventCategory}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {event.functionName && `${event.functionName} • `}
              {event.message || 'No message'}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(event.createdAt).toLocaleTimeString()}
              {event.durationMs && ` • ${event.durationMs}ms`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// TIER DISTRIBUTION CHART
// =============================================================================

function TierDistribution({ distribution }: { distribution: { tier: string; count: number }[] }) {
  const total = distribution.reduce((sum, d) => sum + d.count, 0);
  const tierColors: Record<string, string> = {
    free: 'bg-gray-500',
    pro: 'bg-blue-500',
    power: 'bg-purple-500',
    enterprise: 'bg-amber-500',
  };

  return (
    <div className="space-y-3">
      {distribution.map((item) => {
        const percentage = total > 0 ? (item.count / total) * 100 : 0;
        return (
          <div key={item.tier} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="capitalize">{item.tier}</span>
              <span className="text-muted-foreground">{item.count} users ({percentage.toFixed(1)}%)</span>
            </div>
            <Progress value={percentage} className={tierColors[item.tier] || 'bg-primary'} />
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// MAIN DASHBOARD COMPONENT
// =============================================================================

export function TelemetryDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [toolHealth, setToolHealth] = useState<ToolHealth[]>([]);
  const [recentEvents, setRecentEvents] = useState<TelemetryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch dashboard stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_admin_dashboard_stats');

      if (statsError) throw statsError;

      if (statsData && statsData.length > 0) {
        const row = statsData[0];
        setStats({
          totalUsers: row.total_users || 0,
          activeUsersToday: row.active_users_today || 0,
          totalRequestsToday: row.total_requests_today || 0,
          totalAiCallsToday: row.total_ai_calls_today || 0,
          errorsToday: row.errors_today || 0,
          topTools: row.top_tools || [],
          tierDistribution: row.tier_distribution || [],
        });
      }

      // Fetch tool health from view
      const { data: healthData, error: healthError } = await supabase
        .from('tool_health_status')
        .select('*');

      if (!healthError && healthData) {
        setToolHealth(healthData.map((h: any) => ({
          toolId: h.tool_id,
          successCount: h.success_count || 0,
          failureCount: h.failure_count || 0,
          successRate: h.success_rate || 0,
          avgLatencyMs: h.avg_latency_ms || 0,
          lastUsed: h.last_used,
        })));
      }

      // Fetch recent telemetry events
      const { data: eventsData, error: eventsError } = await supabase
        .from('platform_telemetry')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!eventsError && eventsData) {
        setRecentEvents(eventsData.map((e: any) => ({
          id: e.id,
          eventCategory: e.event_category,
          eventName: e.event_name,
          severity: e.severity,
          functionName: e.function_name,
          durationMs: e.duration_ms,
          statusCode: e.status_code,
          message: e.message,
          createdAt: e.created_at,
        })));
      }

      setLastRefresh(new Date());
    } catch (err) {
      console.error('[TelemetryDashboard] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading && !stats) {
    return <LoadingState context="general" variant="card" message="Loading telemetry..." />;
  }

  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="py-8 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto text-destructive mb-4" />
          <p className="font-medium">Failed to load telemetry</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchDashboardData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const errorRate = stats && stats.totalRequestsToday > 0 
    ? ((stats.errorsToday / stats.totalRequestsToday) * 100).toFixed(2)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Platform Telemetry</h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          description="All registered users"
          icon={<Users className="w-4 h-4 text-muted-foreground" />}
        />
        <StatCard
          title="Active Today"
          value={stats?.activeUsersToday?.toLocaleString() || '0'}
          description="Users with activity"
          icon={<Activity className="w-4 h-4 text-muted-foreground" />}
          trend="up"
          trendValue="Active now"
        />
        <StatCard
          title="Requests Today"
          value={stats?.totalRequestsToday?.toLocaleString() || '0'}
          description="Total tool invocations"
          icon={<Zap className="w-4 h-4 text-muted-foreground" />}
        />
        <StatCard
          title="Error Rate"
          value={`${errorRate}%`}
          description={`${stats?.errorsToday || 0} errors today`}
          icon={<AlertTriangle className="w-4 h-4 text-muted-foreground" />}
          variant={Number(errorRate) > 5 ? 'error' : Number(errorRate) > 1 ? 'warning' : 'success'}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health">
            <Server className="w-4 h-4 mr-2" />
            Tool Health
          </TabsTrigger>
          <TabsTrigger value="events">
            <Activity className="w-4 h-4 mr-2" />
            Recent Events
          </TabsTrigger>
          <TabsTrigger value="distribution">
            <BarChart3 className="w-4 h-4 mr-2" />
            Tier Distribution
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle>Tool Health Status</CardTitle>
              <CardDescription>Success rates and latency for all tools (last 24h)</CardDescription>
            </CardHeader>
            <CardContent>
              {toolHealth.length > 0 ? (
                <ToolHealthTable tools={toolHealth} />
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No tool usage data available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Recent Platform Events</CardTitle>
              <CardDescription>Latest telemetry events and errors</CardDescription>
            </CardHeader>
            <CardContent>
              {recentEvents.length > 0 ? (
                <RecentEventsTable events={recentEvents} />
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No recent events
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>User Tier Distribution</CardTitle>
              <CardDescription>Breakdown of users by subscription tier</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.tierDistribution && stats.tierDistribution.length > 0 ? (
                <TierDistribution distribution={stats.tierDistribution} />
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No tier data available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Tools */}
      {stats?.topTools && stats.topTools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Tools Today</CardTitle>
            <CardDescription>Most used tools in the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.topTools.map((tool, i) => (
                <Badge key={tool.tool_id} variant={i === 0 ? 'default' : 'secondary'}>
                  {tool.tool_id}: {tool.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TelemetryDashboard;
