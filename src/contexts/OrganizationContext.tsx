/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — ORGANIZATION CONTEXT                                     │
 * │                                                                             │
 * │ Manages user's organization membership and current org state               │
 * │ Provides org-scoped data access throughout the app                         │
 * │                                                                             │
 * │ Lucy knows which team you're on.                                           │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// =============================================================================
// TYPES
// =============================================================================

export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer' | 'billing';
export type OrgMemberStatus = 'active' | 'invited' | 'suspended' | 'removed';

export interface OrganizationMember {
  id: string;
  orgId: string;
  userId: string;
  role: OrgRole;
  status: OrgMemberStatus;
  joinedAt: Date;
  user?: {
    email: string;
    fullName?: string;
    avatarUrl?: string;
  };
}

export interface UserOrganization {
  id: string;
  name: string;
  slug: string;
  type: 'personal' | 'team' | 'enterprise' | 'platform';
  status: 'active' | 'suspended' | 'pending' | 'archived';
  role: OrgRole;
  isPlatformOrg: boolean;
  isVerified: boolean;
  memberCount?: number;
}

export interface OrganizationContextValue {
  // State
  currentOrg: UserOrganization | null;
  userOrgs: UserOrganization[];
  members: OrganizationMember[];
  loading: boolean;
  error: string | null;
  
  // Derived
  isOrgAdmin: boolean;
  isOrgOwner: boolean;
  canManageMembers: boolean;
  canManageSettings: boolean;
  canManageBilling: boolean;
  
  // Actions
  switchOrg: (orgId: string) => Promise<void>;
  refreshOrgs: () => Promise<void>;
  refreshMembers: () => Promise<void>;
  createOrg: (name: string, slug: string, type?: string) => Promise<string>;
  inviteMember: (email: string, role?: OrgRole) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: OrgRole) => Promise<void>;
  leaveOrg: () => Promise<void>;
}

// =============================================================================
// CONTEXT
// =============================================================================

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [currentOrg, setCurrentOrg] = useState<UserOrganization | null>(null);
  const [userOrgs, setUserOrgs] = useState<UserOrganization[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's organizations
  const fetchUserOrgs = useCallback(async () => {
    if (!user?.id) {
      setUserOrgs([]);
      setCurrentOrg(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('organization_members')
        .select(`
          role,
          status,
          joined_at,
          organizations (
            id,
            name,
            slug,
            type,
            status,
            is_platform_org,
            is_verified
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (fetchError) throw fetchError;

      const orgs: UserOrganization[] = (data || [])
        .filter((m: any) => m.organizations)
        .map((m: any) => ({
          id: m.organizations.id,
          name: m.organizations.name,
          slug: m.organizations.slug,
          type: m.organizations.type,
          status: m.organizations.status,
          role: m.role as OrgRole,
          isPlatformOrg: m.organizations.is_platform_org,
          isVerified: m.organizations.is_verified,
        }));

      setUserOrgs(orgs);

      // Set current org from localStorage or first org
      const savedOrgId = localStorage.getItem('lucy-current-org');
      const savedOrg = orgs.find(o => o.id === savedOrgId);
      
      if (savedOrg) {
        setCurrentOrg(savedOrg);
      } else if (orgs.length > 0) {
        // Prefer personal org, then first org
        const personalOrg = orgs.find(o => o.type === 'personal');
        setCurrentOrg(personalOrg || orgs[0]);
      }

    } catch (err) {
      console.error('[Organization] Error fetching orgs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch members of current org
  const fetchMembers = useCallback(async () => {
    if (!currentOrg?.id) {
      setMembers([]);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('organization_members')
        .select(`
          id,
          org_id,
          user_id,
          role,
          status,
          joined_at,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('org_id', currentOrg.id)
        .eq('status', 'active');

      if (fetchError) throw fetchError;

      // Get emails from auth.users (requires service role or RPC)
      const memberList: OrganizationMember[] = (data || []).map((m: any) => ({
        id: m.id,
        orgId: m.org_id,
        userId: m.user_id,
        role: m.role as OrgRole,
        status: m.status as OrgMemberStatus,
        joinedAt: new Date(m.joined_at),
        user: m.profiles ? {
          email: '', // Would need RPC to get email
          fullName: m.profiles.full_name,
          avatarUrl: m.profiles.avatar_url,
        } : undefined,
      }));

      setMembers(memberList);
    } catch (err) {
      console.error('[Organization] Error fetching members:', err);
    }
  }, [currentOrg?.id]);

  // Switch current organization
  const switchOrg = useCallback(async (orgId: string) => {
    const org = userOrgs.find(o => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem('lucy-current-org', orgId);
      console.log('[Organization] Switched to:', org.name);
    }
  }, [userOrgs]);

  // Create new organization
  const createOrg = useCallback(async (name: string, slug: string, type = 'team'): Promise<string> => {
    if (!user?.id) throw new Error('Not authenticated');

    const { data, error: createError } = await supabase
      .rpc('create_organization', {
        p_name: name,
        p_slug: slug,
        p_type: type,
      });

    if (createError) throw createError;

    // Refresh orgs list
    await fetchUserOrgs();

    return data as string;
  }, [user?.id, fetchUserOrgs]);

  // Invite member
  const inviteMember = useCallback(async (email: string, role: OrgRole = 'member') => {
    if (!currentOrg?.id) throw new Error('No organization selected');

    const { error: inviteError } = await supabase
      .rpc('invite_org_member', {
        p_org_id: currentOrg.id,
        p_email: email,
        p_role: role,
      });

    if (inviteError) throw inviteError;

    // Refresh members
    await fetchMembers();
  }, [currentOrg?.id, fetchMembers]);

  // Remove member
  const removeMember = useCallback(async (memberId: string) => {
    if (!currentOrg?.id) throw new Error('No organization selected');

    const { error: removeError } = await supabase
      .from('organization_members')
      .update({ status: 'removed' })
      .eq('id', memberId)
      .eq('org_id', currentOrg.id);

    if (removeError) throw removeError;

    // Refresh members
    await fetchMembers();
  }, [currentOrg?.id, fetchMembers]);

  // Update member role
  const updateMemberRole = useCallback(async (memberId: string, role: OrgRole) => {
    if (!currentOrg?.id) throw new Error('No organization selected');

    const { error: updateError } = await supabase
      .from('organization_members')
      .update({ role })
      .eq('id', memberId)
      .eq('org_id', currentOrg.id);

    if (updateError) throw updateError;

    // Refresh members
    await fetchMembers();
  }, [currentOrg?.id, fetchMembers]);

  // Leave organization
  const leaveOrg = useCallback(async () => {
    if (!currentOrg?.id || !user?.id) throw new Error('No organization selected');

    // Can't leave if owner
    if (currentOrg.role === 'owner') {
      throw new Error('Owners cannot leave. Transfer ownership first.');
    }

    const { error: leaveError } = await supabase
      .from('organization_members')
      .update({ status: 'removed' })
      .eq('org_id', currentOrg.id)
      .eq('user_id', user.id);

    if (leaveError) throw leaveError;

    // Refresh orgs and switch to another
    await fetchUserOrgs();
  }, [currentOrg, user?.id, fetchUserOrgs]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserOrgs();
    } else {
      setUserOrgs([]);
      setCurrentOrg(null);
      setMembers([]);
      setLoading(false);
    }
  }, [isAuthenticated, fetchUserOrgs]);

  // Fetch members when org changes
  useEffect(() => {
    if (currentOrg) {
      fetchMembers();
    }
  }, [currentOrg, fetchMembers]);

  // Derived permissions
  const isOrgOwner = currentOrg?.role === 'owner';
  const isOrgAdmin = currentOrg?.role === 'owner' || currentOrg?.role === 'admin';
  const canManageMembers = isOrgAdmin;
  const canManageSettings = isOrgAdmin;
  const canManageBilling = isOrgOwner || currentOrg?.role === 'billing' || currentOrg?.role === 'admin';

  const value: OrganizationContextValue = useMemo(() => ({
    currentOrg,
    userOrgs,
    members,
    loading,
    error,
    isOrgAdmin,
    isOrgOwner,
    canManageMembers,
    canManageSettings,
    canManageBilling,
    switchOrg,
    refreshOrgs: fetchUserOrgs,
    refreshMembers: fetchMembers,
    createOrg,
    inviteMember,
    removeMember,
    updateMemberRole,
    leaveOrg,
  }), [
    currentOrg,
    userOrgs,
    members,
    loading,
    error,
    isOrgAdmin,
    isOrgOwner,
    canManageMembers,
    canManageSettings,
    canManageBilling,
    switchOrg,
    fetchUserOrgs,
    fetchMembers,
    createOrg,
    inviteMember,
    removeMember,
    updateMemberRole,
    leaveOrg,
  ]);

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useOrganization(): OrganizationContextValue {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook to get the current org ID for queries
 */
export function useCurrentOrgId(): string | null {
  const { currentOrg } = useOrganization();
  return currentOrg?.id ?? null;
}

/**
 * Hook to check if user can perform an action
 */
export function useOrgPermission(permission: 'members' | 'settings' | 'billing'): boolean {
  const { canManageMembers, canManageSettings, canManageBilling } = useOrganization();
  
  switch (permission) {
    case 'members': return canManageMembers;
    case 'settings': return canManageSettings;
    case 'billing': return canManageBilling;
    default: return false;
  }
}

export default OrganizationProvider;
