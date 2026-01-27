-- ============================================================================
-- THE LUCY LOUNGE — PHASE 4: MONETIZATION, AI ROUTING & OBSERVABILITY
-- ============================================================================
-- This migration adds:
-- 1. User tier quotas with tool-level limits
-- 2. Usage events for all platform actions
-- 3. Platform telemetry for observability
-- 4. AI routing decision logs with cost tracking
-- 5. Admin-only views for diagnostics
-- ============================================================================

-- ============================================================================
-- USER TIER DEFINITIONS
-- ============================================================================

-- Update existing user_subscriptions tier options
ALTER TABLE user_subscriptions 
  DROP CONSTRAINT IF EXISTS user_subscriptions_tier_check;
ALTER TABLE user_subscriptions
  ADD CONSTRAINT user_subscriptions_tier_check 
  CHECK (tier IN ('free', 'pro', 'power', 'enterprise'));

-- ============================================================================
-- QUOTA DEFINITIONS
-- ============================================================================

-- Tool quota configurations per tier
CREATE TABLE IF NOT EXISTS tier_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'power', 'enterprise')),
    tool_id TEXT NOT NULL,  -- e.g., 'chat', 'image', 'video', 'music', 'pdf', 'code'
    
    -- Limits
    daily_limit INTEGER DEFAULT 10,
    monthly_limit INTEGER DEFAULT 100,
    
    -- Model access
    allowed_models TEXT[] DEFAULT '{}',
    max_prompt_length INTEGER DEFAULT 4000,
    max_output_length INTEGER DEFAULT 8000,
    
    -- Cost tracking
    cost_per_use DECIMAL(10, 6) DEFAULT 0,
    
    -- Flags
    is_enabled BOOLEAN DEFAULT true,
    priority_queue BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tier, tool_id)
);

-- Insert default quota configurations
INSERT INTO tier_quotas (tier, tool_id, daily_limit, monthly_limit, allowed_models, priority_queue) VALUES
-- FREE TIER
('free', 'chat', 50, 500, ARRAY['google/gemini-2.5-flash-lite', 'google/gemini-2.5-flash'], false),
('free', 'image', 5, 30, ARRAY['stabilityai/stable-diffusion-xl-base-1.0'], false),
('free', 'video', 0, 0, ARRAY[]::TEXT[], false),
('free', 'music', 3, 15, ARRAY['facebook/musicgen-small'], false),
('free', 'voice', 5, 25, ARRAY['eleven_multilingual_v2'], false),
('free', 'pdf', 10, 50, ARRAY['internal-pdf-generator'], false),
('free', 'code', 20, 100, ARRAY['google/gemini-2.5-flash'], false),
('free', 'web_fetch', 20, 100, ARRAY['browser-fetch'], false),
('free', 'calculator', 100, 1000, ARRAY['local'], false),

-- PRO TIER
('pro', 'chat', 500, 10000, ARRAY['google/gemini-2.5-flash-lite', 'google/gemini-2.5-flash', 'google/gemini-2.5-pro'], true),
('pro', 'image', 50, 500, ARRAY['stabilityai/stable-diffusion-xl-base-1.0', 'black-forest-labs/FLUX.1-schnell'], true),
('pro', 'video', 10, 50, ARRAY['ali-vilab/text-to-video-ms-1.7b'], true),
('pro', 'music', 30, 200, ARRAY['facebook/musicgen-small', 'facebook/musicgen-medium'], true),
('pro', 'voice', 50, 500, ARRAY['eleven_multilingual_v2', 'eleven_turbo_v2'], true),
('pro', 'pdf', 100, 1000, ARRAY['internal-pdf-generator'], true),
('pro', 'code', 200, 2000, ARRAY['google/gemini-2.5-flash', 'google/gemini-2.5-pro'], true),
('pro', 'web_fetch', 200, 2000, ARRAY['browser-fetch'], true),
('pro', 'calculator', -1, -1, ARRAY['local'], true), -- -1 = unlimited

-- POWER TIER
('power', 'chat', -1, -1, ARRAY['google/gemini-2.5-flash-lite', 'google/gemini-2.5-flash', 'google/gemini-2.5-pro', 'openai/gpt-5-mini'], true),
('power', 'image', 200, 2000, ARRAY['stabilityai/stable-diffusion-xl-base-1.0', 'black-forest-labs/FLUX.1-schnell', 'black-forest-labs/FLUX.1-dev'], true),
('power', 'video', 50, 250, ARRAY['ali-vilab/text-to-video-ms-1.7b', 'stabilityai/stable-video-diffusion-img2vid-xt'], true),
('power', 'music', 100, 1000, ARRAY['facebook/musicgen-small', 'facebook/musicgen-medium', 'facebook/musicgen-large'], true),
('power', 'voice', 200, 2000, ARRAY['eleven_multilingual_v2', 'eleven_turbo_v2', 'eleven_english_sts_v2'], true),
('power', 'pdf', -1, -1, ARRAY['internal-pdf-generator'], true),
('power', 'code', -1, -1, ARRAY['google/gemini-2.5-flash', 'google/gemini-2.5-pro', 'openai/gpt-5-mini'], true),
('power', 'web_fetch', -1, -1, ARRAY['browser-fetch'], true),
('power', 'calculator', -1, -1, ARRAY['local'], true),

-- ENTERPRISE TIER (unlimited everything)
('enterprise', 'chat', -1, -1, ARRAY['google/gemini-2.5-flash-lite', 'google/gemini-2.5-flash', 'google/gemini-2.5-pro', 'openai/gpt-5-mini', 'anthropic/claude-3.5-sonnet'], true),
('enterprise', 'image', -1, -1, ARRAY['stabilityai/stable-diffusion-xl-base-1.0', 'black-forest-labs/FLUX.1-schnell', 'black-forest-labs/FLUX.1-dev', 'midjourney/mj-v6'], true),
('enterprise', 'video', -1, -1, ARRAY['ali-vilab/text-to-video-ms-1.7b', 'stabilityai/stable-video-diffusion-img2vid-xt', 'runway/gen-3-alpha'], true),
('enterprise', 'music', -1, -1, ARRAY['facebook/musicgen-small', 'facebook/musicgen-medium', 'facebook/musicgen-large', 'suno/v3.5'], true),
('enterprise', 'voice', -1, -1, ARRAY['eleven_multilingual_v2', 'eleven_turbo_v2', 'eleven_english_sts_v2'], true),
('enterprise', 'pdf', -1, -1, ARRAY['internal-pdf-generator'], true),
('enterprise', 'code', -1, -1, ARRAY['google/gemini-2.5-flash', 'google/gemini-2.5-pro', 'openai/gpt-5-mini', 'anthropic/claude-3.5-sonnet'], true),
('enterprise', 'web_fetch', -1, -1, ARRAY['browser-fetch'], true),
('enterprise', 'calculator', -1, -1, ARRAY['local'], true)
ON CONFLICT (tier, tool_id) DO UPDATE SET
  daily_limit = EXCLUDED.daily_limit,
  monthly_limit = EXCLUDED.monthly_limit,
  allowed_models = EXCLUDED.allowed_models;

-- ============================================================================
-- USAGE EVENTS (Time-series)
-- ============================================================================

CREATE TABLE IF NOT EXISTS usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Event details
    tool_id TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('request', 'success', 'failure', 'limit_hit', 'upgrade_prompt')),
    
    -- Resource tracking
    model_used TEXT,
    tokens_input INTEGER DEFAULT 0,
    tokens_output INTEGER DEFAULT 0,
    latency_ms INTEGER,
    
    -- Cost tracking
    estimated_cost DECIMAL(10, 6) DEFAULT 0,
    
    -- Context
    session_id TEXT,
    source TEXT,  -- 'chat', 'tools_page', 'api', etc.
    
    -- Error context
    error_code TEXT,
    error_message TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics (time-series optimized)
CREATE INDEX IF NOT EXISTS idx_usage_events_user_time ON usage_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_events_tool_time ON usage_events(tool_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_events_type ON usage_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_events_daily ON usage_events(user_id, tool_id, date_trunc('day', created_at));

-- ============================================================================
-- PLATFORM TELEMETRY (Observability)
-- ============================================================================

CREATE TABLE IF NOT EXISTS platform_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Event classification
    event_category TEXT NOT NULL CHECK (event_category IN (
        'ai_routing', 'edge_function', 'rls_event', 'auth_event', 
        'error', 'performance', 'security', 'billing', 'admin'
    )),
    event_name TEXT NOT NULL,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warn', 'error', 'critical')),
    
    -- Context
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    function_name TEXT,
    route_path TEXT,
    
    -- Metrics
    duration_ms INTEGER,
    status_code INTEGER,
    
    -- Details
    message TEXT,
    details JSONB DEFAULT '{}',
    stack_trace TEXT,
    
    -- Environment
    user_agent TEXT,
    ip_hash TEXT,  -- Hashed for privacy
    device_type TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for observability
CREATE INDEX IF NOT EXISTS idx_telemetry_category ON platform_telemetry(event_category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_severity ON platform_telemetry(severity, created_at DESC) WHERE severity IN ('warn', 'error', 'critical');
CREATE INDEX IF NOT EXISTS idx_telemetry_function ON platform_telemetry(function_name, created_at DESC) WHERE function_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_telemetry_user ON platform_telemetry(user_id, created_at DESC) WHERE user_id IS NOT NULL;

-- ============================================================================
-- AI ROUTING DECISIONS (Enhanced)
-- ============================================================================

-- Add cost and tier columns to existing model_usage_logs if needed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'model_usage_logs' AND column_name = 'user_tier') THEN
    ALTER TABLE model_usage_logs ADD COLUMN user_tier TEXT DEFAULT 'free';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'model_usage_logs' AND column_name = 'quota_remaining') THEN
    ALTER TABLE model_usage_logs ADD COLUMN quota_remaining INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'model_usage_logs' AND column_name = 'was_downgraded') THEN
    ALTER TABLE model_usage_logs ADD COLUMN was_downgraded BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'model_usage_logs' AND column_name = 'downgrade_reason') THEN
    ALTER TABLE model_usage_logs ADD COLUMN downgrade_reason TEXT;
  END IF;
END $$;

-- ============================================================================
-- USER DAILY USAGE TRACKING (Materialized for performance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_daily_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_id TEXT NOT NULL,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Counts
    request_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    
    -- Resource usage
    total_tokens_input INTEGER DEFAULT 0,
    total_tokens_output INTEGER DEFAULT 0,
    total_latency_ms BIGINT DEFAULT 0,
    
    -- Cost
    total_cost DECIMAL(10, 6) DEFAULT 0,
    
    -- Timestamps
    first_request_at TIMESTAMP WITH TIME ZONE,
    last_request_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, tool_id, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_usage_user ON user_daily_usage(user_id, usage_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_usage_tool ON user_daily_usage(tool_id, usage_date DESC);

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

-- Get user's current tier and quotas
CREATE OR REPLACE FUNCTION get_user_tier_quotas(p_user_id UUID)
RETURNS TABLE (
    tier TEXT,
    tool_id TEXT,
    daily_limit INTEGER,
    daily_used INTEGER,
    monthly_limit INTEGER,
    monthly_used INTEGER,
    is_enabled BOOLEAN,
    allowed_models TEXT[]
) AS $$
DECLARE
    v_tier TEXT;
BEGIN
    -- Get user tier (default to 'free')
    SELECT COALESCE(us.tier, 'free') INTO v_tier
    FROM user_subscriptions us
    WHERE us.user_id = p_user_id AND us.status = 'active';
    
    IF v_tier IS NULL THEN
        v_tier := 'free';
    END IF;
    
    RETURN QUERY
    SELECT 
        v_tier,
        tq.tool_id,
        tq.daily_limit,
        COALESCE(udu.request_count, 0)::INTEGER,
        tq.monthly_limit,
        COALESCE(
            (SELECT SUM(request_count) FROM user_daily_usage 
             WHERE user_id = p_user_id 
             AND tool_id = tq.tool_id 
             AND usage_date >= DATE_TRUNC('month', CURRENT_DATE)),
            0
        )::INTEGER,
        tq.is_enabled,
        tq.allowed_models
    FROM tier_quotas tq
    LEFT JOIN user_daily_usage udu ON 
        udu.user_id = p_user_id AND 
        udu.tool_id = tq.tool_id AND 
        udu.usage_date = CURRENT_DATE
    WHERE tq.tier = v_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can use a tool
CREATE OR REPLACE FUNCTION check_tool_access(
    p_user_id UUID,
    p_tool_id TEXT,
    p_model TEXT DEFAULT NULL
)
RETURNS TABLE (
    allowed BOOLEAN,
    reason TEXT,
    daily_remaining INTEGER,
    tier TEXT,
    upgrade_available BOOLEAN
) AS $$
DECLARE
    v_tier TEXT;
    v_daily_limit INTEGER;
    v_daily_used INTEGER;
    v_monthly_limit INTEGER;
    v_monthly_used INTEGER;
    v_allowed_models TEXT[];
    v_is_enabled BOOLEAN;
BEGIN
    -- Get user tier
    SELECT COALESCE(us.tier, 'free') INTO v_tier
    FROM user_subscriptions us
    WHERE us.user_id = p_user_id AND us.status = 'active';
    
    IF v_tier IS NULL THEN
        v_tier := 'free';
    END IF;
    
    -- Get quota for this tool
    SELECT 
        tq.daily_limit,
        tq.monthly_limit,
        tq.allowed_models,
        tq.is_enabled
    INTO v_daily_limit, v_monthly_limit, v_allowed_models, v_is_enabled
    FROM tier_quotas tq
    WHERE tq.tier = v_tier AND tq.tool_id = p_tool_id;
    
    -- Tool not found in quotas
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Tool not available', 0, v_tier, true;
        RETURN;
    END IF;
    
    -- Tool disabled for this tier
    IF NOT v_is_enabled THEN
        RETURN QUERY SELECT false, 'Upgrade required to access this tool', 0, v_tier, true;
        RETURN;
    END IF;
    
    -- Get current usage
    SELECT COALESCE(udu.request_count, 0) INTO v_daily_used
    FROM user_daily_usage udu
    WHERE udu.user_id = p_user_id 
      AND udu.tool_id = p_tool_id 
      AND udu.usage_date = CURRENT_DATE;
    
    IF v_daily_used IS NULL THEN
        v_daily_used := 0;
    END IF;
    
    -- Get monthly usage
    SELECT COALESCE(SUM(request_count), 0) INTO v_monthly_used
    FROM user_daily_usage
    WHERE user_id = p_user_id 
      AND tool_id = p_tool_id 
      AND usage_date >= DATE_TRUNC('month', CURRENT_DATE);
    
    -- Check daily limit (-1 = unlimited)
    IF v_daily_limit >= 0 AND v_daily_used >= v_daily_limit THEN
        RETURN QUERY SELECT false, 'Daily limit reached', 0, v_tier, true;
        RETURN;
    END IF;
    
    -- Check monthly limit
    IF v_monthly_limit >= 0 AND v_monthly_used >= v_monthly_limit THEN
        RETURN QUERY SELECT false, 'Monthly limit reached', 0, v_tier, true;
        RETURN;
    END IF;
    
    -- Check model access
    IF p_model IS NOT NULL AND array_length(v_allowed_models, 1) > 0 THEN
        IF NOT p_model = ANY(v_allowed_models) THEN
            RETURN QUERY SELECT false, 'Model not available on your plan', 
                CASE WHEN v_daily_limit < 0 THEN -1 ELSE v_daily_limit - v_daily_used END,
                v_tier, true;
            RETURN;
        END IF;
    END IF;
    
    -- Access granted
    RETURN QUERY SELECT 
        true, 
        'Access granted',
        CASE WHEN v_daily_limit < 0 THEN -1 ELSE v_daily_limit - v_daily_used END,
        v_tier,
        v_tier != 'enterprise';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record tool usage (called by edge functions)
CREATE OR REPLACE FUNCTION record_tool_usage(
    p_user_id UUID,
    p_tool_id TEXT,
    p_event_type TEXT,
    p_model TEXT DEFAULT NULL,
    p_tokens_input INTEGER DEFAULT 0,
    p_tokens_output INTEGER DEFAULT 0,
    p_latency_ms INTEGER DEFAULT 0,
    p_cost DECIMAL DEFAULT 0,
    p_error_code TEXT DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
    -- Insert usage event
    INSERT INTO usage_events (
        user_id, tool_id, event_type, model_used,
        tokens_input, tokens_output, latency_ms,
        estimated_cost, error_code, error_message, metadata
    ) VALUES (
        p_user_id, p_tool_id, p_event_type, p_model,
        p_tokens_input, p_tokens_output, p_latency_ms,
        p_cost, p_error_code, p_error_message, p_metadata
    );
    
    -- Update daily usage
    INSERT INTO user_daily_usage (
        user_id, tool_id, usage_date,
        request_count, success_count, failure_count,
        total_tokens_input, total_tokens_output, total_latency_ms,
        total_cost, first_request_at, last_request_at
    ) VALUES (
        p_user_id, p_tool_id, CURRENT_DATE,
        1,
        CASE WHEN p_event_type = 'success' THEN 1 ELSE 0 END,
        CASE WHEN p_event_type = 'failure' THEN 1 ELSE 0 END,
        p_tokens_input, p_tokens_output, p_latency_ms,
        p_cost, NOW(), NOW()
    )
    ON CONFLICT (user_id, tool_id, usage_date) DO UPDATE SET
        request_count = user_daily_usage.request_count + 1,
        success_count = user_daily_usage.success_count + 
            CASE WHEN p_event_type = 'success' THEN 1 ELSE 0 END,
        failure_count = user_daily_usage.failure_count + 
            CASE WHEN p_event_type = 'failure' THEN 1 ELSE 0 END,
        total_tokens_input = user_daily_usage.total_tokens_input + p_tokens_input,
        total_tokens_output = user_daily_usage.total_tokens_output + p_tokens_output,
        total_latency_ms = user_daily_usage.total_latency_ms + p_latency_ms,
        total_cost = user_daily_usage.total_cost + p_cost,
        last_request_at = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log platform telemetry (for edge functions)
CREATE OR REPLACE FUNCTION log_platform_event(
    p_category TEXT,
    p_event_name TEXT,
    p_severity TEXT DEFAULT 'info',
    p_user_id UUID DEFAULT NULL,
    p_function_name TEXT DEFAULT NULL,
    p_duration_ms INTEGER DEFAULT NULL,
    p_status_code INTEGER DEFAULT NULL,
    p_message TEXT DEFAULT NULL,
    p_details JSONB DEFAULT '{}',
    p_stack_trace TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO platform_telemetry (
        event_category, event_name, severity,
        user_id, function_name, duration_ms, status_code,
        message, details, stack_trace
    ) VALUES (
        p_category, p_event_name, p_severity,
        p_user_id, p_function_name, p_duration_ms, p_status_code,
        p_message, p_details, p_stack_trace
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE (
    total_users BIGINT,
    active_users_today BIGINT,
    total_requests_today BIGINT,
    total_ai_calls_today BIGINT,
    errors_today BIGINT,
    top_tools JSONB,
    tier_distribution JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM auth.users),
        (SELECT COUNT(DISTINCT user_id) FROM usage_events WHERE date_trunc('day', created_at) = CURRENT_DATE),
        (SELECT COUNT(*) FROM usage_events WHERE date_trunc('day', created_at) = CURRENT_DATE),
        (SELECT COUNT(*) FROM model_usage_logs WHERE date_trunc('day', created_at) = CURRENT_DATE),
        (SELECT COUNT(*) FROM platform_telemetry WHERE severity IN ('error', 'critical') AND date_trunc('day', created_at) = CURRENT_DATE),
        (SELECT jsonb_agg(t) FROM (
            SELECT tool_id, COUNT(*) as count 
            FROM usage_events 
            WHERE date_trunc('day', created_at) = CURRENT_DATE
            GROUP BY tool_id 
            ORDER BY count DESC 
            LIMIT 5
        ) t),
        (SELECT jsonb_agg(t) FROM (
            SELECT COALESCE(tier, 'free') as tier, COUNT(*) as count 
            FROM user_subscriptions 
            WHERE status = 'active'
            GROUP BY tier
        ) t);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE tier_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_usage ENABLE ROW LEVEL SECURITY;

-- Tier quotas: Public read (configuration is not sensitive)
CREATE POLICY "Anyone can view tier quotas" ON tier_quotas
    FOR SELECT USING (true);

-- Usage events: Users can only see their own
CREATE POLICY "Users can view own usage events" ON usage_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert usage events" ON usage_events
    FOR INSERT WITH CHECK (true);

-- Platform telemetry: Admin only
CREATE POLICY "Admin can view telemetry" ON platform_telemetry
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Service can insert telemetry" ON platform_telemetry
    FOR INSERT WITH CHECK (true);

-- Daily usage: Users can only see their own
CREATE POLICY "Users can view own daily usage" ON user_daily_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can manage daily usage" ON user_daily_usage
    FOR ALL USING (true);

-- ============================================================================
-- ADMIN-ONLY MATERIALIZED VIEWS (Diagnostics)
-- ============================================================================

-- Create a view for tool health monitoring
CREATE OR REPLACE VIEW tool_health_status AS
SELECT 
    tool_id,
    COUNT(*) FILTER (WHERE event_type = 'success') as success_count,
    COUNT(*) FILTER (WHERE event_type = 'failure') as failure_count,
    ROUND(
        COUNT(*) FILTER (WHERE event_type = 'success')::DECIMAL / 
        NULLIF(COUNT(*), 0) * 100, 2
    ) as success_rate,
    ROUND(AVG(latency_ms) FILTER (WHERE event_type = 'success'), 0) as avg_latency_ms,
    MAX(created_at) as last_used
FROM usage_events
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY tool_id;

-- Create a view for user usage summary
CREATE OR REPLACE VIEW user_usage_summary AS
SELECT 
    u.id as user_id,
    u.email,
    COALESCE(us.tier, 'free') as tier,
    (SELECT SUM(request_count) FROM user_daily_usage WHERE user_id = u.id AND usage_date = CURRENT_DATE) as requests_today,
    (SELECT SUM(total_cost) FROM user_daily_usage WHERE user_id = u.id AND usage_date >= DATE_TRUNC('month', CURRENT_DATE)) as cost_this_month,
    (SELECT MAX(last_request_at) FROM user_daily_usage WHERE user_id = u.id) as last_activity
FROM auth.users u
LEFT JOIN user_subscriptions us ON us.user_id = u.id AND us.status = 'active';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tier_quotas_updated_at
    BEFORE UPDATE ON tier_quotas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_usage_updated_at
    BEFORE UPDATE ON user_daily_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIALIZE FREE SUBSCRIPTION FOR ALL USERS
-- ============================================================================

-- Ensure all users have at least a free subscription
INSERT INTO user_subscriptions (user_id, tier, status)
SELECT id, 'free', 'active'
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM user_subscriptions WHERE user_subscriptions.user_id = auth.users.id
)
ON CONFLICT (user_id) DO NOTHING;
