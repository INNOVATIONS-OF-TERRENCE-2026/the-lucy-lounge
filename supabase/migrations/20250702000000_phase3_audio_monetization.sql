-- ============================================================================
-- THE LUCY LOUNGE — PHASE 3: AUDIO INTELLIGENCE & MONETIZATION SCHEMA
-- ============================================================================
-- This migration adds:
-- 1. User subscriptions and billing
-- 2. Cross-device playback state
-- 3. Affiliate attribution tracking
-- 4. Creator economy tables
-- ============================================================================

-- ============================================================================
-- SUBSCRIPTIONS
-- ============================================================================

-- User subscription records
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Subscription details
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'plus', 'pro', 'family', 'creator')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'expired', 'trialing')),
    
    -- Billing
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    
    -- Dates
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Subscription history for analytics
CREATE TABLE IF NOT EXISTS subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    event_type TEXT NOT NULL CHECK (event_type IN ('created', 'upgraded', 'downgraded', 'canceled', 'renewed', 'expired')),
    from_tier TEXT,
    to_tier TEXT,
    
    -- Revenue tracking
    mrr_change DECIMAL(10, 2) DEFAULT 0,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON user_subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_history_user ON subscription_history(user_id);

-- ============================================================================
-- CROSS-DEVICE PLAYBACK
-- ============================================================================

-- Stores current playback state for cross-device sync
CREATE TABLE IF NOT EXISTS user_playback_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Playback snapshot
    track_data JSONB,                    -- AudioTrack JSON
    position_seconds DECIMAL(10, 2) DEFAULT 0,
    is_playing BOOLEAN DEFAULT false,
    volume DECIMAL(3, 2) DEFAULT 1.0,
    
    -- Queue state
    queue_data JSONB,                    -- QueueState JSON
    
    -- Device info
    last_device_id TEXT,
    last_device_name TEXT,
    last_device_type TEXT,
    
    -- Timestamps
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Device presence tracking
CREATE TABLE IF NOT EXISTS user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    device_id TEXT NOT NULL,
    device_name TEXT,
    device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'tv', 'speaker', 'unknown')),
    
    -- Connection
    is_online BOOLEAN DEFAULT false,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Capabilities
    can_play BOOLEAN DEFAULT true,
    supports_hq BOOLEAN DEFAULT true,
    supports_lossless BOOLEAN DEFAULT false,
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, device_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_playback_state_user ON user_playback_state(user_id);
CREATE INDEX IF NOT EXISTS idx_playback_state_synced ON user_playback_state(last_synced_at);
CREATE INDEX IF NOT EXISTS idx_user_devices_user ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_online ON user_devices(user_id, is_online) WHERE is_online = true;

-- ============================================================================
-- AFFILIATE ATTRIBUTION
-- ============================================================================

-- Track affiliate link clicks
CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    
    -- Attribution
    partner TEXT NOT NULL,               -- 'amazon_music', 'apple_music', etc.
    media_node_id TEXT,
    deep_link_url TEXT NOT NULL,
    
    -- Context
    source TEXT NOT NULL,                -- 'recommendation', 'search', 'journey', 'room', 'direct'
    component_path TEXT,
    
    -- Timestamps
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    converted_at TIMESTAMP WITH TIME ZONE,
    
    -- Revenue (if conversion)
    revenue_generated DECIMAL(10, 2) DEFAULT 0,
    commission_earned DECIMAL(10, 2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track conversions
CREATE TABLE IF NOT EXISTS affiliate_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    click_id UUID REFERENCES affiliate_clicks(id) ON DELETE CASCADE,
    
    partner TEXT NOT NULL,
    conversion_type TEXT NOT NULL CHECK (conversion_type IN ('signup', 'subscription', 'purchase', 'rental')),
    
    -- Revenue
    revenue DECIMAL(10, 2) NOT NULL,
    commission DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Lucy influence
    lucy_influence_score DECIMAL(3, 2) DEFAULT 0.5,
    
    converted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_user ON affiliate_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_partner ON affiliate_clicks(partner);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_session ON affiliate_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_click ON affiliate_conversions(click_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_partner ON affiliate_conversions(partner);

-- ============================================================================
-- CREATOR ECONOMY
-- ============================================================================

-- Creator profiles
CREATE TABLE IF NOT EXISTS creator_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Profile
    display_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Stats (denormalized for performance)
    total_plays BIGINT DEFAULT 0,
    total_followers BIGINT DEFAULT 0,
    total_tips_received DECIMAL(10, 2) DEFAULT 0,
    total_subscribers BIGINT DEFAULT 0,
    
    -- Settings
    accepts_tips BOOLEAN DEFAULT true,
    tip_minimum DECIMAL(10, 2) DEFAULT 1.00,
    
    -- Payout
    payout_method_id UUID,
    pending_balance DECIMAL(10, 2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Creator uploads
CREATE TABLE IF NOT EXISTS creator_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
    
    -- Content
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('track', 'album', 'podcast_episode', 'mix', 'other')),
    
    -- Files
    audio_url TEXT NOT NULL,
    artwork_url TEXT,
    waveform_data JSONB,
    
    -- Metadata
    duration_seconds INTEGER,
    genre TEXT,
    tags TEXT[],
    
    -- Stats
    play_count BIGINT DEFAULT 0,
    like_count BIGINT DEFAULT 0,
    share_count BIGINT DEFAULT 0,
    
    -- Visibility
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tips
CREATE TABLE IF NOT EXISTS creator_tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    to_creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
    
    -- Amount
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    message TEXT,
    
    -- Context
    media_node_id TEXT,
    room_id UUID,
    
    -- Processing
    platform_fee DECIMAL(10, 2) NOT NULL,
    creator_received DECIMAL(10, 2) NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creator subscriptions (fan subscriptions to creators)
CREATE TABLE IF NOT EXISTS creator_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    subscriber_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
    
    -- Tier
    tier TEXT NOT NULL CHECK (tier IN ('supporter', 'patron', 'superfan')),
    price DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'past_due')),
    
    -- Dates
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    renews_at TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    
    -- Stripe
    stripe_subscription_id TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(subscriber_id, creator_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_creator_profiles_user ON creator_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_verified ON creator_profiles(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_creator_uploads_creator ON creator_uploads(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_uploads_type ON creator_uploads(type);
CREATE INDEX IF NOT EXISTS idx_creator_tips_to ON creator_tips(to_creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_tips_from ON creator_tips(from_user_id);
CREATE INDEX IF NOT EXISTS idx_creator_subscriptions_creator ON creator_subscriptions(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_subscriptions_subscriber ON creator_subscriptions(subscriber_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_playback_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscriptions: Users can only see their own
CREATE POLICY "Users can view own subscription" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Playback state: Users can only access their own
CREATE POLICY "Users can view own playback" ON user_playback_state
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own playback" ON user_playback_state
    FOR ALL USING (auth.uid() = user_id);

-- Devices: Users can only access their own
CREATE POLICY "Users can manage own devices" ON user_devices
    FOR ALL USING (auth.uid() = user_id);

-- Affiliate clicks: Users can view their own, insert new
CREATE POLICY "Users can view own clicks" ON affiliate_clicks
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert clicks" ON affiliate_clicks
    FOR INSERT WITH CHECK (true);

-- Creator profiles: Public read, owner write
CREATE POLICY "Anyone can view creator profiles" ON creator_profiles
    FOR SELECT USING (true);

CREATE POLICY "Creators can update own profile" ON creator_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Creator uploads: Public read, owner write
CREATE POLICY "Anyone can view public uploads" ON creator_uploads
    FOR SELECT USING (is_public = true OR creator_id IN (
        SELECT id FROM creator_profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Creators can manage own uploads" ON creator_uploads
    FOR ALL USING (creator_id IN (
        SELECT id FROM creator_profiles WHERE user_id = auth.uid()
    ));

-- Tips: Sender and receiver can view
CREATE POLICY "Users can view tips they sent or received" ON creator_tips
    FOR SELECT USING (
        from_user_id = auth.uid() OR 
        to_creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can send tips" ON creator_tips
    FOR INSERT WITH CHECK (from_user_id = auth.uid());

-- Creator subscriptions: Subscriber and creator can view
CREATE POLICY "Users can view subscriptions" ON creator_subscriptions
    FOR SELECT USING (
        subscriber_id = auth.uid() OR
        creator_id IN (SELECT id FROM creator_profiles WHERE user_id = auth.uid())
    );

-- ============================================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================================

-- Enable realtime for playback state
ALTER PUBLICATION supabase_realtime ADD TABLE user_playback_state;
ALTER PUBLICATION supabase_realtime ADD TABLE user_devices;

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_playback_state_updated_at
    BEFORE UPDATE ON user_playback_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_devices_updated_at
    BEFORE UPDATE ON user_devices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_profiles_updated_at
    BEFORE UPDATE ON creator_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_uploads_updated_at
    BEFORE UPDATE ON creator_uploads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_subscriptions_updated_at
    BEFORE UPDATE ON creator_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
