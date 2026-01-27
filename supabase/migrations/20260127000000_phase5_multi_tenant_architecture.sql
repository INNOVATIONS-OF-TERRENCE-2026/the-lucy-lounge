-- ============================================================================
-- THE LUCY LOUNGE — PHASE 5: MULTI-TENANT ARCHITECTURE
-- ============================================================================
-- This migration introduces:
-- 1. Organization-scoped data model
-- 2. White-label branding system
-- 3. Custom domain support
-- 4. Org-level billing & usage
-- 5. Admin & superadmin roles
-- ============================================================================

-- ============================================================================
-- ORGANIZATION CORE TABLES
-- ============================================================================

-- Main organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    
    -- Type
    type TEXT NOT NULL DEFAULT 'personal' CHECK (type IN ('personal', 'team', 'enterprise', 'platform')),
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending', 'archived')),
    
    -- Owner (initial creator)
    owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    
    -- Platform flags
    is_platform_org BOOLEAN DEFAULT false,  -- Lucy HQ org
    is_verified BOOLEAN DEFAULT false,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization members (user-org relationship)
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Role within org
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer', 'billing')),
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended', 'removed')),
    
    -- Invitation tracking
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(org_id, user_id)
);

-- Organization invitations (pending invites)
CREATE TABLE IF NOT EXISTS organization_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Invite target
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer', 'billing')),
    
    -- Invite details
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    
    -- Expiry
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
    
    -- Tracking
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(org_id, email, status)
);

-- ============================================================================
-- ORGANIZATION SETTINGS & BRANDING
-- ============================================================================

-- Organization settings (feature flags, limits, preferences)
CREATE TABLE IF NOT EXISTS organization_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
    
    -- Feature flags
    features_enabled JSONB DEFAULT '{
        "chat": true,
        "tools": true,
        "media": true,
        "rooms": true,
        "arcade": false,
        "studios": false,
        "ai_generation": true
    }',
    
    -- Tool access overrides
    tool_access JSONB DEFAULT '{}',  -- {"image": true, "video": false, ...}
    
    -- Model access overrides
    model_access JSONB DEFAULT '{}',  -- {"gpt-5": true, "claude": false, ...}
    
    -- Limits
    max_members INTEGER DEFAULT 5,
    max_storage_gb INTEGER DEFAULT 10,
    max_ai_calls_per_day INTEGER DEFAULT 1000,
    
    -- Preferences
    default_theme TEXT DEFAULT 'purple',
    default_density TEXT DEFAULT 'comfortable' CHECK (default_density IN ('compact', 'comfortable', 'spacious')),
    timezone TEXT DEFAULT 'UTC',
    locale TEXT DEFAULT 'en-US',
    
    -- Privacy
    allow_public_profiles BOOLEAN DEFAULT true,
    allow_public_rooms BOOLEAN DEFAULT true,
    require_2fa BOOLEAN DEFAULT false,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization branding (white-label customization)
CREATE TABLE IF NOT EXISTS organization_branding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
    
    -- Brand identity
    brand_name TEXT,  -- Display name (e.g., "Acme AI")
    brand_tagline TEXT,  -- Tagline (e.g., "Your AI Assistant")
    brand_description TEXT,  -- Full description
    
    -- Visual identity
    logo_url TEXT,  -- Primary logo URL
    logo_dark_url TEXT,  -- Logo for dark mode
    favicon_url TEXT,  -- Favicon URL
    og_image_url TEXT,  -- Open Graph image
    
    -- Colors (hex values)
    color_primary TEXT DEFAULT '#7B3FF2',
    color_secondary TEXT DEFAULT '#4F46E5',
    color_accent TEXT DEFAULT '#F59E0B',
    color_background TEXT DEFAULT '#1a0f2e',
    color_text TEXT DEFAULT '#FFFFFF',
    
    -- Theme customization
    glass_intensity DECIMAL(3,2) DEFAULT 0.15 CHECK (glass_intensity >= 0 AND glass_intensity <= 1),
    gradient_intensity DECIMAL(3,2) DEFAULT 0.5 CHECK (gradient_intensity >= 0 AND gradient_intensity <= 1),
    border_radius TEXT DEFAULT 'lg' CHECK (border_radius IN ('none', 'sm', 'md', 'lg', 'xl', 'full')),
    
    -- Typography
    font_heading TEXT DEFAULT 'Montserrat',
    font_body TEXT DEFAULT 'Inter',
    
    -- Custom CSS (advanced)
    custom_css TEXT,
    
    -- SEO
    seo_title_suffix TEXT,  -- e.g., " | Acme AI"
    seo_default_description TEXT,
    
    -- Social
    twitter_handle TEXT,
    support_email TEXT,
    support_url TEXT,
    privacy_url TEXT,
    terms_url TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CUSTOM DOMAINS
-- ============================================================================

-- Organization domains (custom domain mapping)
CREATE TABLE IF NOT EXISTS organization_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Domain
    domain TEXT NOT NULL UNIQUE,  -- e.g., "app.acme.com"
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verification_token TEXT DEFAULT encode(gen_random_bytes(16), 'hex'),
    verification_method TEXT DEFAULT 'dns' CHECK (verification_method IN ('dns', 'file', 'meta')),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- SSL
    ssl_status TEXT DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'active', 'failed', 'expired')),
    ssl_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Priority (for multiple domains)
    is_primary BOOLEAN DEFAULT false,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'removed')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ORG-LEVEL SUBSCRIPTIONS & BILLING
-- ============================================================================

-- Organization subscriptions (extends user_subscriptions to org level)
CREATE TABLE IF NOT EXISTS organization_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Plan
    plan_id TEXT NOT NULL DEFAULT 'org_free',
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'business', 'enterprise')),
    
    -- Billing
    billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
    seats_included INTEGER DEFAULT 5,
    seats_used INTEGER DEFAULT 1,
    price_per_seat DECIMAL(10,2) DEFAULT 0,
    
    -- Stripe integration (ready)
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'expired')),
    
    -- Dates
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
    trial_end TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization usage (aggregate usage per org)
CREATE TABLE IF NOT EXISTS organization_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Counts
    total_requests INTEGER DEFAULT 0,
    total_ai_calls INTEGER DEFAULT 0,
    total_tool_uses INTEGER DEFAULT 0,
    total_storage_bytes BIGINT DEFAULT 0,
    
    -- By tool
    usage_by_tool JSONB DEFAULT '{}',  -- {"chat": 100, "image": 50, ...}
    
    -- By user
    usage_by_user JSONB DEFAULT '{}',  -- {"user_id": 50, ...}
    
    -- Cost tracking
    estimated_cost DECIMAL(10,4) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(org_id, usage_date)
);

-- ============================================================================
-- SUPERADMIN & AUDIT
-- ============================================================================

-- Platform admins (Lucy HQ superadmins)
CREATE TABLE IF NOT EXISTS platform_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Role
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin', 'support', 'readonly')),
    
    -- Permissions
    permissions JSONB DEFAULT '{
        "view_all_orgs": true,
        "manage_orgs": false,
        "view_telemetry": true,
        "manage_users": false,
        "manage_billing": false,
        "platform_settings": false
    }',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Audit
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization audit log (tracks admin actions)
CREATE TABLE IF NOT EXISTS organization_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Actor
    actor_user_id UUID REFERENCES auth.users(id),
    actor_type TEXT NOT NULL DEFAULT 'user' CHECK (actor_type IN ('user', 'system', 'platform_admin')),
    
    -- Action
    action TEXT NOT NULL,  -- e.g., "member.invited", "settings.updated", "branding.changed"
    resource_type TEXT,  -- e.g., "member", "settings", "branding"
    resource_id TEXT,
    
    -- Details
    old_value JSONB,
    new_value JSONB,
    metadata JSONB DEFAULT '{}',
    
    -- Context
    ip_address TEXT,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Organizations
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);

-- Members
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON organization_members(role);
CREATE INDEX IF NOT EXISTS idx_org_members_status ON organization_members(status);

-- Invitations
CREATE INDEX IF NOT EXISTS idx_org_invitations_org ON organization_invitations(org_id);
CREATE INDEX IF NOT EXISTS idx_org_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_org_invitations_token ON organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_org_invitations_status ON organization_invitations(status);

-- Domains
CREATE INDEX IF NOT EXISTS idx_org_domains_org ON organization_domains(org_id);
CREATE INDEX IF NOT EXISTS idx_org_domains_domain ON organization_domains(domain);
CREATE INDEX IF NOT EXISTS idx_org_domains_verified ON organization_domains(is_verified);

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_org ON organization_subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_status ON organization_subscriptions(status);

-- Usage
CREATE INDEX IF NOT EXISTS idx_org_usage_org_date ON organization_usage(org_id, usage_date DESC);

-- Audit
CREATE INDEX IF NOT EXISTS idx_org_audit_org ON organization_audit_log(org_id);
CREATE INDEX IF NOT EXISTS idx_org_audit_actor ON organization_audit_log(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_org_audit_action ON organization_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_org_audit_created ON organization_audit_log(created_at DESC);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user is member of org
CREATE OR REPLACE FUNCTION is_org_member(p_org_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_members
        WHERE org_id = p_org_id 
        AND user_id = p_user_id 
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if user is org admin
CREATE OR REPLACE FUNCTION is_org_admin(p_org_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_members
        WHERE org_id = p_org_id 
        AND user_id = p_user_id 
        AND role IN ('owner', 'admin')
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if user is platform admin
CREATE OR REPLACE FUNCTION is_platform_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM platform_admins
        WHERE user_id = p_user_id 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Get user's primary org
CREATE OR REPLACE FUNCTION get_user_primary_org(p_user_id UUID DEFAULT auth.uid())
RETURNS UUID AS $$
DECLARE
    v_org_id UUID;
BEGIN
    -- First try to find org where user is owner
    SELECT org_id INTO v_org_id
    FROM organization_members
    WHERE user_id = p_user_id AND role = 'owner' AND status = 'active'
    ORDER BY joined_at ASC
    LIMIT 1;
    
    -- If not owner anywhere, get first active membership
    IF v_org_id IS NULL THEN
        SELECT org_id INTO v_org_id
        FROM organization_members
        WHERE user_id = p_user_id AND status = 'active'
        ORDER BY joined_at ASC
        LIMIT 1;
    END IF;
    
    RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations: Members can view, admins can update
CREATE POLICY "org_select_members" ON organizations
    FOR SELECT USING (
        is_org_member(id) OR is_platform_admin()
    );

CREATE POLICY "org_update_admins" ON organizations
    FOR UPDATE USING (
        is_org_admin(id) OR is_platform_admin()
    );

CREATE POLICY "org_insert_authenticated" ON organizations
    FOR INSERT WITH CHECK (
        auth.uid() = owner_user_id
    );

-- Members: Members can view their org's members, admins can manage
CREATE POLICY "members_select" ON organization_members
    FOR SELECT USING (
        is_org_member(org_id) OR is_platform_admin()
    );

CREATE POLICY "members_insert" ON organization_members
    FOR INSERT WITH CHECK (
        is_org_admin(org_id) OR is_platform_admin()
    );

CREATE POLICY "members_update" ON organization_members
    FOR UPDATE USING (
        is_org_admin(org_id) OR is_platform_admin()
    );

CREATE POLICY "members_delete" ON organization_members
    FOR DELETE USING (
        is_org_admin(org_id) OR is_platform_admin()
    );

-- Invitations: Admins can manage
CREATE POLICY "invitations_select" ON organization_invitations
    FOR SELECT USING (
        is_org_admin(org_id) OR is_platform_admin()
    );

CREATE POLICY "invitations_insert" ON organization_invitations
    FOR INSERT WITH CHECK (
        is_org_admin(org_id)
    );

CREATE POLICY "invitations_update" ON organization_invitations
    FOR UPDATE USING (
        is_org_admin(org_id) OR is_platform_admin()
    );

-- Settings: Members can view, admins can update
CREATE POLICY "settings_select" ON organization_settings
    FOR SELECT USING (
        is_org_member(org_id) OR is_platform_admin()
    );

CREATE POLICY "settings_update" ON organization_settings
    FOR UPDATE USING (
        is_org_admin(org_id) OR is_platform_admin()
    );

CREATE POLICY "settings_insert" ON organization_settings
    FOR INSERT WITH CHECK (
        is_org_admin(org_id) OR is_platform_admin()
    );

-- Branding: Public read (for domain resolution), admins can update
CREATE POLICY "branding_select_public" ON organization_branding
    FOR SELECT USING (true);

CREATE POLICY "branding_update" ON organization_branding
    FOR UPDATE USING (
        is_org_admin(org_id) OR is_platform_admin()
    );

CREATE POLICY "branding_insert" ON organization_branding
    FOR INSERT WITH CHECK (
        is_org_admin(org_id) OR is_platform_admin()
    );

-- Domains: Public read (for resolution), admins can manage
CREATE POLICY "domains_select_public" ON organization_domains
    FOR SELECT USING (true);

CREATE POLICY "domains_insert" ON organization_domains
    FOR INSERT WITH CHECK (
        is_org_admin(org_id) OR is_platform_admin()
    );

CREATE POLICY "domains_update" ON organization_domains
    FOR UPDATE USING (
        is_org_admin(org_id) OR is_platform_admin()
    );

CREATE POLICY "domains_delete" ON organization_domains
    FOR DELETE USING (
        is_org_admin(org_id) OR is_platform_admin()
    );

-- Subscriptions: Admins and billing role can view/manage
CREATE POLICY "subscriptions_select" ON organization_subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE org_id = organization_subscriptions.org_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin', 'billing')
            AND status = 'active'
        ) OR is_platform_admin()
    );

CREATE POLICY "subscriptions_update" ON organization_subscriptions
    FOR UPDATE USING (
        is_org_admin(org_id) OR is_platform_admin()
    );

-- Usage: Members can view their org's usage
CREATE POLICY "usage_select" ON organization_usage
    FOR SELECT USING (
        is_org_member(org_id) OR is_platform_admin()
    );

CREATE POLICY "usage_insert" ON organization_usage
    FOR INSERT WITH CHECK (true);  -- Service role inserts

CREATE POLICY "usage_update" ON organization_usage
    FOR UPDATE USING (true);  -- Service role updates

-- Platform admins: Only superadmins can manage
CREATE POLICY "platform_admins_select" ON platform_admins
    FOR SELECT USING (
        user_id = auth.uid() OR is_platform_admin()
    );

CREATE POLICY "platform_admins_manage" ON platform_admins
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM platform_admins
            WHERE user_id = auth.uid() AND role = 'superadmin' AND is_active = true
        )
    );

-- Audit log: Admins can view their org's logs
CREATE POLICY "audit_select" ON organization_audit_log
    FOR SELECT USING (
        is_org_admin(org_id) OR is_platform_admin()
    );

CREATE POLICY "audit_insert" ON organization_audit_log
    FOR INSERT WITH CHECK (true);  -- Service role inserts

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

-- Create organization (with automatic membership)
CREATE OR REPLACE FUNCTION create_organization(
    p_name TEXT,
    p_slug TEXT,
    p_type TEXT DEFAULT 'personal'
)
RETURNS UUID AS $$
DECLARE
    v_org_id UUID;
    v_user_id UUID := auth.uid();
BEGIN
    -- Create org
    INSERT INTO organizations (name, slug, type, owner_user_id)
    VALUES (p_name, p_slug, p_type, v_user_id)
    RETURNING id INTO v_org_id;
    
    -- Add owner as member
    INSERT INTO organization_members (org_id, user_id, role, status, joined_at)
    VALUES (v_org_id, v_user_id, 'owner', 'active', NOW());
    
    -- Create default settings
    INSERT INTO organization_settings (org_id)
    VALUES (v_org_id);
    
    -- Create default branding
    INSERT INTO organization_branding (org_id, brand_name)
    VALUES (v_org_id, p_name);
    
    -- Create default subscription
    INSERT INTO organization_subscriptions (org_id)
    VALUES (v_org_id);
    
    RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Invite member to organization
CREATE OR REPLACE FUNCTION invite_org_member(
    p_org_id UUID,
    p_email TEXT,
    p_role TEXT DEFAULT 'member'
)
RETURNS UUID AS $$
DECLARE
    v_invite_id UUID;
BEGIN
    -- Check if caller is admin
    IF NOT is_org_admin(p_org_id) THEN
        RAISE EXCEPTION 'Only org admins can invite members';
    END IF;
    
    -- Create invitation
    INSERT INTO organization_invitations (org_id, email, role, invited_by)
    VALUES (p_org_id, p_email, p_role, auth.uid())
    RETURNING id INTO v_invite_id;
    
    -- Log audit
    INSERT INTO organization_audit_log (org_id, actor_user_id, action, resource_type, new_value)
    VALUES (p_org_id, auth.uid(), 'member.invited', 'invitation', jsonb_build_object('email', p_email, 'role', p_role));
    
    RETURN v_invite_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accept invitation
CREATE OR REPLACE FUNCTION accept_org_invitation(p_token TEXT)
RETURNS UUID AS $$
DECLARE
    v_invite organization_invitations%ROWTYPE;
    v_user_id UUID := auth.uid();
BEGIN
    -- Find valid invitation
    SELECT * INTO v_invite
    FROM organization_invitations
    WHERE token = p_token 
    AND status = 'pending'
    AND expires_at > NOW();
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or expired invitation';
    END IF;
    
    -- Add member
    INSERT INTO organization_members (org_id, user_id, role, status, invited_by, invited_at, joined_at)
    VALUES (v_invite.org_id, v_user_id, v_invite.role, 'active', v_invite.invited_by, v_invite.created_at, NOW())
    ON CONFLICT (org_id, user_id) DO UPDATE SET
        role = EXCLUDED.role,
        status = 'active',
        joined_at = NOW();
    
    -- Update invitation
    UPDATE organization_invitations
    SET status = 'accepted', accepted_at = NOW(), accepted_by = v_user_id
    WHERE id = v_invite.id;
    
    -- Log audit
    INSERT INTO organization_audit_log (org_id, actor_user_id, action, resource_type, new_value)
    VALUES (v_invite.org_id, v_user_id, 'member.joined', 'member', jsonb_build_object('role', v_invite.role));
    
    RETURN v_invite.org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Resolve organization by domain
CREATE OR REPLACE FUNCTION resolve_org_by_domain(p_domain TEXT)
RETURNS TABLE (
    org_id UUID,
    org_name TEXT,
    org_slug TEXT,
    branding JSONB,
    settings JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.name,
        o.slug,
        to_jsonb(b.*) - 'id' - 'org_id' - 'created_at' - 'updated_at',
        to_jsonb(s.*) - 'id' - 'org_id' - 'created_at' - 'updated_at'
    FROM organization_domains d
    JOIN organizations o ON o.id = d.org_id
    LEFT JOIN organization_branding b ON b.org_id = o.id
    LEFT JOIN organization_settings s ON s.org_id = o.id
    WHERE d.domain = p_domain
    AND d.is_verified = true
    AND d.status = 'active'
    AND o.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get organization dashboard stats
CREATE OR REPLACE FUNCTION get_org_dashboard_stats(p_org_id UUID)
RETURNS TABLE (
    total_members BIGINT,
    active_members BIGINT,
    total_usage_today BIGINT,
    total_ai_calls_today BIGINT,
    subscription_tier TEXT,
    seats_used INTEGER,
    seats_included INTEGER
) AS $$
BEGIN
    -- Check access
    IF NOT is_org_member(p_org_id) AND NOT is_platform_admin() THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM organization_members WHERE org_id = p_org_id),
        (SELECT COUNT(*) FROM organization_members WHERE org_id = p_org_id AND status = 'active'),
        COALESCE((SELECT total_requests FROM organization_usage WHERE org_id = p_org_id AND usage_date = CURRENT_DATE), 0)::BIGINT,
        COALESCE((SELECT total_ai_calls FROM organization_usage WHERE org_id = p_org_id AND usage_date = CURRENT_DATE), 0)::BIGINT,
        (SELECT tier FROM organization_subscriptions WHERE org_id = p_org_id AND status = 'active' LIMIT 1),
        (SELECT os.seats_used FROM organization_subscriptions os WHERE os.org_id = p_org_id AND os.status = 'active' LIMIT 1),
        (SELECT os.seats_included FROM organization_subscriptions os WHERE os.org_id = p_org_id AND os.status = 'active' LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DEFAULT DATA MIGRATION
-- ============================================================================

-- Create Lucy HQ platform organization
DO $$
DECLARE
    v_platform_org_id UUID;
BEGIN
    -- Check if platform org exists
    SELECT id INTO v_platform_org_id FROM organizations WHERE is_platform_org = true LIMIT 1;
    
    IF v_platform_org_id IS NULL THEN
        -- Create platform org (will need owner assigned later)
        INSERT INTO organizations (name, slug, type, owner_user_id, is_platform_org, is_verified, status)
        SELECT 
            'Lucy HQ',
            'lucy-hq',
            'platform',
            id,  -- First user becomes owner
            true,
            true,
            'active'
        FROM auth.users
        ORDER BY created_at ASC
        LIMIT 1
        RETURNING id INTO v_platform_org_id;
        
        -- Create settings for platform org
        IF v_platform_org_id IS NOT NULL THEN
            INSERT INTO organization_settings (org_id, max_members, max_storage_gb, max_ai_calls_per_day)
            VALUES (v_platform_org_id, -1, -1, -1);  -- Unlimited for platform
            
            INSERT INTO organization_branding (org_id, brand_name, brand_tagline, color_primary)
            VALUES (v_platform_org_id, 'The Lucy Lounge', 'Beyond Intelligence', '#7B3FF2');
            
            INSERT INTO organization_subscriptions (org_id, plan_id, tier, seats_included)
            VALUES (v_platform_org_id, 'platform', 'enterprise', -1);
        END IF;
    END IF;
END $$;

-- Create default personal orgs for existing users
DO $$
DECLARE
    v_user RECORD;
    v_org_id UUID;
BEGIN
    FOR v_user IN 
        SELECT u.id, u.email, p.full_name
        FROM auth.users u
        LEFT JOIN profiles p ON p.id = u.id
        WHERE NOT EXISTS (
            SELECT 1 FROM organization_members om WHERE om.user_id = u.id
        )
    LOOP
        -- Create personal org
        INSERT INTO organizations (
            name, 
            slug, 
            type, 
            owner_user_id, 
            status
        )
        VALUES (
            COALESCE(v_user.full_name, split_part(v_user.email, '@', 1)) || '''s Workspace',
            'user-' || replace(v_user.id::text, '-', ''),
            'personal',
            v_user.id,
            'active'
        )
        RETURNING id INTO v_org_id;
        
        -- Add as owner
        INSERT INTO organization_members (org_id, user_id, role, status)
        VALUES (v_org_id, v_user.id, 'owner', 'active');
        
        -- Create settings
        INSERT INTO organization_settings (org_id)
        VALUES (v_org_id);
        
        -- Create branding
        INSERT INTO organization_branding (org_id)
        VALUES (v_org_id);
        
        -- Create subscription
        INSERT INTO organization_subscriptions (org_id)
        VALUES (v_org_id);
    END LOOP;
END $$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-create org for new users
CREATE OR REPLACE FUNCTION auto_create_user_org()
RETURNS TRIGGER AS $$
DECLARE
    v_org_id UUID;
BEGIN
    -- Create personal org
    INSERT INTO organizations (
        name,
        slug,
        type,
        owner_user_id,
        status
    )
    VALUES (
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)) || '''s Workspace',
        'user-' || replace(NEW.id::text, '-', ''),
        'personal',
        NEW.id,
        'active'
    )
    RETURNING id INTO v_org_id;
    
    -- Add as owner
    INSERT INTO organization_members (org_id, user_id, role, status)
    VALUES (v_org_id, NEW.id, 'owner', 'active');
    
    -- Create settings
    INSERT INTO organization_settings (org_id)
    VALUES (v_org_id);
    
    -- Create branding
    INSERT INTO organization_branding (org_id)
    VALUES (v_org_id);
    
    -- Create subscription
    INSERT INTO organization_subscriptions (org_id)
    VALUES (v_org_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_org'
    ) THEN
        CREATE TRIGGER on_auth_user_created_org
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION auto_create_user_org();
    END IF;
END $$;

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_org_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_org_updated_at();

CREATE TRIGGER update_org_members_updated_at
    BEFORE UPDATE ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION update_org_updated_at();

CREATE TRIGGER update_org_settings_updated_at
    BEFORE UPDATE ON organization_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_org_updated_at();

CREATE TRIGGER update_org_branding_updated_at
    BEFORE UPDATE ON organization_branding
    FOR EACH ROW
    EXECUTE FUNCTION update_org_updated_at();

CREATE TRIGGER update_org_domains_updated_at
    BEFORE UPDATE ON organization_domains
    FOR EACH ROW
    EXECUTE FUNCTION update_org_updated_at();

CREATE TRIGGER update_org_subscriptions_updated_at
    BEFORE UPDATE ON organization_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_org_updated_at();

CREATE TRIGGER update_org_usage_updated_at
    BEFORE UPDATE ON organization_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_org_updated_at();
