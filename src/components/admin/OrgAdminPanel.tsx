/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — ORGANIZATION ADMIN PANEL                                 │
 * │                                                                             │
 * │ Admin dashboard for managing organization settings, members, and branding  │
 * │                                                                             │
 * │ Lucy empowers org admins to customize their experience.                    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState } from 'react';
import { 
  Users, 
  Settings, 
  Palette, 
  Globe, 
  CreditCard, 
  Shield,
  Building2,
  UserPlus,
  Trash2,
  Crown,
  Mail,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useOrganization, OrgRole } from '@/contexts/OrganizationContext';
import { useBranding } from '@/contexts/BrandingContext';
import { supabase } from '@/integrations/supabase/client';
import { LoadingState } from '@/components/platform/LoadingStates';

// =============================================================================
// MEMBERS TAB
// =============================================================================

function MembersTab() {
  const { toast } = useToast();
  const { currentOrg, members, canManageMembers, inviteMember, removeMember, updateMemberRole, refreshMembers } = useOrganization();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrgRole>('member');
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    
    setInviting(true);
    try {
      await inviteMember(inviteEmail.trim(), inviteRole);
      toast({ title: 'Invitation sent', description: `Invited ${inviteEmail} as ${inviteRole}` });
      setInviteEmail('');
    } catch (err) {
      toast({ 
        title: 'Failed to invite', 
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from the organization?`)) return;
    
    try {
      await removeMember(memberId);
      toast({ title: 'Member removed', description: `${memberName} has been removed` });
    } catch (err) {
      toast({ 
        title: 'Failed to remove', 
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  const handleRoleChange = async (memberId: string, newRole: OrgRole) => {
    try {
      await updateMemberRole(memberId, newRole);
      toast({ title: 'Role updated' });
    } catch (err) {
      toast({ 
        title: 'Failed to update role', 
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  const getRoleBadgeColor = (role: OrgRole) => {
    switch (role) {
      case 'owner': return 'bg-amber-500';
      case 'admin': return 'bg-purple-500';
      case 'billing': return 'bg-green-500';
      case 'member': return 'bg-blue-500';
      case 'viewer': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Invite Form */}
      {canManageMembers && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Invite Member
            </CardTitle>
            <CardDescription>
              Send an invitation to join your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as OrgRole)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                Invite
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    {member.role === 'owner' ? (
                      <Crown className="w-5 h-5 text-amber-500" />
                    ) : (
                      <span className="text-sm font-medium">
                        {member.user?.fullName?.[0] || '?'}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{member.user?.fullName || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {member.joinedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {canManageMembers && member.role !== 'owner' ? (
                    <Select 
                      value={member.role} 
                      onValueChange={(v) => handleRoleChange(member.id, v as OrgRole)}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={`${getRoleBadgeColor(member.role)} text-white`}>
                      {member.role}
                    </Badge>
                  )}
                  {canManageMembers && member.role !== 'owner' && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemove(member.id, member.user?.fullName || 'member')}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
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
// BRANDING TAB
// =============================================================================

function BrandingTab() {
  const { toast } = useToast();
  const { currentOrg, canManageSettings } = useOrganization();
  const { branding, refreshBranding } = useBranding();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    brandName: branding.brandName,
    brandTagline: branding.brandTagline,
    logoUrl: branding.logoUrl,
    colorPrimary: branding.colorPrimary,
    colorSecondary: branding.colorSecondary,
    colorAccent: branding.colorAccent,
  });

  const handleSave = async () => {
    if (!currentOrg?.id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('organization_branding')
        .update({
          brand_name: formData.brandName,
          brand_tagline: formData.brandTagline,
          logo_url: formData.logoUrl,
          color_primary: formData.colorPrimary,
          color_secondary: formData.colorSecondary,
          color_accent: formData.colorAccent,
        })
        .eq('org_id', currentOrg.id);

      if (error) throw error;

      await refreshBranding();
      toast({ title: 'Branding updated' });
    } catch (err) {
      toast({ 
        title: 'Failed to save', 
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (!canManageSettings) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p>You don't have permission to manage branding.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Brand Identity
          </CardTitle>
          <CardDescription>
            Customize how your organization appears to members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Brand Name</Label>
              <Input
                value={formData.brandName}
                onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                placeholder="Your Brand"
              />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input
                value={formData.brandTagline}
                onChange={(e) => setFormData(prev => ({ ...prev, brandTagline: e.target.value }))}
                placeholder="Your tagline"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input
              value={formData.logoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Colors</CardTitle>
          <CardDescription>
            Define your brand colors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Primary</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.colorPrimary}
                  onChange={(e) => setFormData(prev => ({ ...prev, colorPrimary: e.target.value }))}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={formData.colorPrimary}
                  onChange={(e) => setFormData(prev => ({ ...prev, colorPrimary: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secondary</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.colorSecondary}
                  onChange={(e) => setFormData(prev => ({ ...prev, colorSecondary: e.target.value }))}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={formData.colorSecondary}
                  onChange={(e) => setFormData(prev => ({ ...prev, colorSecondary: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Accent</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.colorAccent}
                  onChange={(e) => setFormData(prev => ({ ...prev, colorAccent: e.target.value }))}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={formData.colorAccent}
                  onChange={(e) => setFormData(prev => ({ ...prev, colorAccent: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          
          {/* Preview */}
          <div className="p-4 rounded-lg border" style={{ backgroundColor: formData.colorPrimary + '20' }}>
            <p className="text-sm text-muted-foreground mb-2">Preview</p>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg" 
                style={{ backgroundColor: formData.colorPrimary }}
              />
              <div 
                className="w-10 h-10 rounded-lg" 
                style={{ backgroundColor: formData.colorSecondary }}
              />
              <div 
                className="w-10 h-10 rounded-lg" 
                style={{ backgroundColor: formData.colorAccent }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
        Save Branding
      </Button>
    </div>
  );
}

// =============================================================================
// SETTINGS TAB
// =============================================================================

function SettingsTab() {
  const { toast } = useToast();
  const { currentOrg, canManageSettings } = useOrganization();
  const { settings, refreshBranding } = useBranding();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    allowPublicProfiles: settings.allowPublicProfiles,
    allowPublicRooms: settings.allowPublicRooms,
    require2fa: settings.require2fa,
    defaultTheme: settings.defaultTheme,
    defaultDensity: settings.defaultDensity,
  });

  const handleSave = async () => {
    if (!currentOrg?.id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('organization_settings')
        .update({
          allow_public_profiles: formData.allowPublicProfiles,
          allow_public_rooms: formData.allowPublicRooms,
          require_2fa: formData.require2fa,
          default_theme: formData.defaultTheme,
          default_density: formData.defaultDensity,
        })
        .eq('org_id', currentOrg.id);

      if (error) throw error;

      await refreshBranding();
      toast({ title: 'Settings updated' });
    } catch (err) {
      toast({ 
        title: 'Failed to save', 
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (!canManageSettings) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p>You don't have permission to manage settings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Public Profiles</p>
              <p className="text-sm text-muted-foreground">Allow members to have public profiles</p>
            </div>
            <Switch
              checked={formData.allowPublicProfiles}
              onCheckedChange={(v) => setFormData(prev => ({ ...prev, allowPublicProfiles: v }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Public Rooms</p>
              <p className="text-sm text-muted-foreground">Allow creation of public chat rooms</p>
            </div>
            <Switch
              checked={formData.allowPublicRooms}
              onCheckedChange={(v) => setFormData(prev => ({ ...prev, allowPublicRooms: v }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require 2FA</p>
              <p className="text-sm text-muted-foreground">Require two-factor authentication for all members</p>
            </div>
            <Switch
              checked={formData.require2fa}
              onCheckedChange={(v) => setFormData(prev => ({ ...prev, require2fa: v }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Defaults
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Theme</Label>
              <Select 
                value={formData.defaultTheme} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, defaultTheme: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default Density</Label>
              <Select 
                value={formData.defaultDensity} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, defaultDensity: v as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="spacious">Spacious</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
        Save Settings
      </Button>
    </div>
  );
}

// =============================================================================
// DOMAINS TAB
// =============================================================================

function DomainsTab() {
  const { toast } = useToast();
  const { currentOrg, canManageSettings } = useOrganization();
  const [domains, setDomains] = useState<any[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const fetchDomains = async () => {
    if (!currentOrg?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organization_domains')
        .select('*')
        .eq('org_id', currentOrg.id);

      if (error) throw error;
      setDomains(data || []);
    } catch (err) {
      console.error('Failed to fetch domains:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!currentOrg?.id || !newDomain.trim()) return;
    
    setAdding(true);
    try {
      const { error } = await supabase
        .from('organization_domains')
        .insert({
          org_id: currentOrg.id,
          domain: newDomain.trim().toLowerCase(),
        });

      if (error) throw error;

      toast({ title: 'Domain added', description: 'Verify your domain to activate it' });
      setNewDomain('');
      fetchDomains();
    } catch (err) {
      toast({ 
        title: 'Failed to add domain', 
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveDomain = async (domainId: string) => {
    if (!confirm('Remove this domain?')) return;
    
    try {
      const { error } = await supabase
        .from('organization_domains')
        .delete()
        .eq('id', domainId);

      if (error) throw error;

      toast({ title: 'Domain removed' });
      fetchDomains();
    } catch (err) {
      toast({ 
        title: 'Failed to remove', 
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  // Initial fetch
  useState(() => {
    fetchDomains();
  });

  if (!canManageSettings) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p>You don't have permission to manage domains.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Custom Domains
          </CardTitle>
          <CardDescription>
            Add custom domains to white-label your Lucy experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="app.yourdomain.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
            />
            <Button onClick={handleAddDomain} disabled={adding || !newDomain.trim()}>
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
            </Button>
          </div>

          {loading ? (
            <LoadingState context="general" variant="minimal" />
          ) : domains.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No custom domains configured
            </p>
          ) : (
            <div className="space-y-2">
              {domains.map((domain) => (
                <div key={domain.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{domain.domain}</p>
                      <p className="text-xs text-muted-foreground">
                        {domain.is_verified ? 'Verified' : 'Pending verification'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {domain.is_verified ? (
                      <Badge className="bg-green-500 text-white">
                        <Check className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveDomain(domain.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {domains.some(d => !d.is_verified) && (
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="pt-4">
                <p className="text-sm">
                  <strong>To verify your domain:</strong> Add a TXT record to your DNS with the verification token shown above.
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// MAIN PANEL
// =============================================================================

export function OrgAdminPanel() {
  const { currentOrg, loading, isOrgAdmin } = useOrganization();

  if (loading) {
    return <LoadingState context="general" variant="card" message="Loading organization..." />;
  }

  if (!currentOrg) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p>No organization selected</p>
        </CardContent>
      </Card>
    );
  }

  if (!isOrgAdmin) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p>You need admin access to manage this organization.</p>
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
            <Building2 className="w-6 h-6" />
            {currentOrg.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            Organization Admin Panel
          </p>
        </div>
        <Badge variant="outline" className="capitalize">
          {currentOrg.type}
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="members">
            <Users className="w-4 h-4 mr-2" />
            Members
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Palette className="w-4 h-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="domains">
            <Globe className="w-4 h-4 mr-2" />
            Domains
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <MembersTab />
        </TabsContent>

        <TabsContent value="branding">
          <BrandingTab />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>

        <TabsContent value="domains">
          <DomainsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default OrgAdminPanel;
