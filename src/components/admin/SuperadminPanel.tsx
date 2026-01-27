/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — SUPERADMIN PANEL                                         │
 * │                                                                             │
 * │ Platform-wide administration for Lucy HQ                                   │
 * │ View all orgs, override settings, inspect telemetry                        │
 * │                                                                             │
 * │ Lucy HQ sees all, controls all.                                            │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Users, 
  Activity, 
  Shield,
  Search,
  Eye,
  Settings,
  Ban,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Crown,
  Globe,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/platform/LoadingStates';

// =============================================================================
// TYPES
// =============================================================================

interface PlatformOrg {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  isPlatformOrg: boolean;
  isVerified: boolean;
  memberCount: number;
  createdAt: Date;
}

interface PlatformStats {
  totalOrgs: number;
  totalUsers: number;
  activeOrgsToday: number;
  totalRequestsToday: number;
  orgsByType: { type: string; count: number }[];
  orgsByStatus: { status: string; count: number }[];
}

// =============================================================================
// ORGANIZATIONS TAB
// =============================================================================

function OrganizationsTab() {
  const [orgs, setOrgs] = useState<PlatformOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<PlatformOrg | null>(null);

  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          slug,
          type,
          status,
          is_platform_org,
          is_verified,
          created_at,
          organization_members (count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedOrgs: PlatformOrg[] = (data || []).map((o: any) => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        type: o.type,
        status: o.status,
        isPlatformOrg: o.is_platform_org,
        isVerified: o.is_verified,
        memberCount: o.organization_members?.[0]?.count || 0,
        createdAt: new Date(o.created_at),
      }));

      setOrgs(mappedOrgs);
    } catch (err) {
      console.error('[Superadmin] Failed to fetch orgs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  const filteredOrgs = orgs.filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleSuspendOrg = async (orgId: string) => {
    if (!confirm('Suspend this organization?')) return;
    
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ status: 'suspended' })
        .eq('id', orgId);

      if (error) throw error;
      fetchOrgs();
    } catch (err) {
      console.error('Failed to suspend org:', err);
    }
  };

  const handleActivateOrg = async (orgId: string) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ status: 'active' })
        .eq('id', orgId);

      if (error) throw error;
      fetchOrgs();
    } catch (err) {
      console.error('Failed to activate org:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'suspended': return <Badge className="bg-red-500 text-white">Suspended</Badge>;
      case 'pending': return <Badge className="bg-amber-500 text-white">Pending</Badge>;
      case 'archived': return <Badge variant="outline">Archived</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'platform': return <Badge className="bg-purple-500 text-white">Platform</Badge>;
      case 'enterprise': return <Badge className="bg-blue-500 text-white">Enterprise</Badge>;
      case 'team': return <Badge className="bg-cyan-500 text-white">Team</Badge>;
      case 'personal': return <Badge variant="secondary">Personal</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (loading) {
    return <LoadingState context="general" variant="card" message="Loading organizations..." />;
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={fetchOrgs}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{orgs.length}</div>
            <p className="text-sm text-muted-foreground">Total Organizations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{orgs.filter(o => o.status === 'active').length}</div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{orgs.filter(o => o.type === 'enterprise').length}</div>
            <p className="text-sm text-muted-foreground">Enterprise</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{orgs.reduce((sum, o) => sum + o.memberCount, 0)}</div>
            <p className="text-sm text-muted-foreground">Total Members</p>
          </CardContent>
        </Card>
      </div>

      {/* Organizations List */}
      <Card>
        <CardHeader>
          <CardTitle>All Organizations ({filteredOrgs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredOrgs.map((org) => (
              <div 
                key={org.id} 
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    {org.isPlatformOrg ? (
                      <Crown className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Building2 className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{org.name}</p>
                      {org.isVerified && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {org.slug} • {org.memberCount} members • Created {org.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getTypeBadge(org.type)}
                  {getStatusBadge(org.status)}
                  <Button variant="ghost" size="icon" onClick={() => setSelectedOrg(org)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  {org.status === 'active' && !org.isPlatformOrg && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleSuspendOrg(org.id)}
                    >
                      <Ban className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                  {org.status === 'suspended' && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleActivateOrg(org.id)}
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// PLATFORM STATS TAB
// =============================================================================

function PlatformStatsTab() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch org counts
      const { data: orgsData } = await supabase
        .from('organizations')
        .select('type, status');

      // Fetch user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Calculate stats
      const orgsByType: Record<string, number> = {};
      const orgsByStatus: Record<string, number> = {};
      
      (orgsData || []).forEach((o: any) => {
        orgsByType[o.type] = (orgsByType[o.type] || 0) + 1;
        orgsByStatus[o.status] = (orgsByStatus[o.status] || 0) + 1;
      });

      setStats({
        totalOrgs: orgsData?.length || 0,
        totalUsers: userCount || 0,
        activeOrgsToday: 0, // Would need usage data
        totalRequestsToday: 0, // Would need usage data
        orgsByType: Object.entries(orgsByType).map(([type, count]) => ({ type, count })),
        orgsByStatus: Object.entries(orgsByStatus).map(([status, count]) => ({ status, count })),
      });
    } catch (err) {
      console.error('[Superadmin] Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return <LoadingState context="general" variant="card" message="Loading platform stats..." />;
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
          <p>Failed to load platform statistics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{stats.totalOrgs}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Organizations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold">{stats.totalUsers}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold">{stats.activeOrgsToday}</span>
            </div>
            <p className="text-sm text-muted-foreground">Active Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="text-2xl font-bold">{stats.totalRequestsToday}</span>
            </div>
            <p className="text-sm text-muted-foreground">Requests Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Organizations by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.orgsByType.map(({ type, count }) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="capitalize">{type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${(count / stats.totalOrgs) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organizations by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.orgsByStatus.map(({ status, count }) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="capitalize">{status}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          status === 'active' ? 'bg-green-500' :
                          status === 'suspended' ? 'bg-red-500' :
                          'bg-amber-500'
                        }`}
                        style={{ width: `${(count / stats.totalOrgs) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// =============================================================================
// PLATFORM ADMINS TAB
// =============================================================================

function PlatformAdminsTab() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('platform_admins')
        .select(`
          id,
          user_id,
          role,
          permissions,
          is_active,
          granted_at,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .order('granted_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (err) {
      console.error('[Superadmin] Failed to fetch admins:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  if (loading) {
    return <LoadingState context="general" variant="card" message="Loading platform admins..." />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Platform Administrators
        </CardTitle>
        <CardDescription>
          Users with platform-wide administrative access
        </CardDescription>
      </CardHeader>
      <CardContent>
        {admins.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No platform admins configured
          </p>
        ) : (
          <div className="space-y-3">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{admin.profiles?.full_name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">
                      Granted {new Date(admin.granted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={admin.role === 'superadmin' ? 'bg-purple-500 text-white' : ''}>
                    {admin.role}
                  </Badge>
                  {admin.is_active ? (
                    <Badge className="bg-green-500 text-white">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// MAIN PANEL
// =============================================================================

export function SuperadminPanel() {
  const { user } = useAuth();
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is platform admin
  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.id) {
        setIsPlatformAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('platform_admins')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        setIsPlatformAdmin(!!data && !error);
      } catch (err) {
        console.error('[Superadmin] Access check failed:', err);
        setIsPlatformAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user?.id]);

  if (loading) {
    return <LoadingState context="general" variant="card" message="Checking access..." />;
  }

  if (!isPlatformAdmin) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have platform administrator access.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            Lucy HQ Superadmin
          </h2>
          <p className="text-sm text-muted-foreground">
            Platform-wide administration and oversight
          </p>
        </div>
        <Badge className="bg-purple-500 text-white">
          <Shield className="w-3 h-3 mr-1" />
          Superadmin
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organizations">
            <Building2 className="w-4 h-4 mr-2" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="stats">
            <Activity className="w-4 h-4 mr-2" />
            Platform Stats
          </TabsTrigger>
          <TabsTrigger value="admins">
            <Shield className="w-4 h-4 mr-2" />
            Platform Admins
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations">
          <OrganizationsTab />
        </TabsContent>

        <TabsContent value="stats">
          <PlatformStatsTab />
        </TabsContent>

        <TabsContent value="admins">
          <PlatformAdminsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SuperadminPanel;
