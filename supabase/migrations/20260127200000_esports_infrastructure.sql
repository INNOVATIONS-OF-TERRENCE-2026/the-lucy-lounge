-- ============================================================================
-- LUCY ARCADE — ESPORTS INFRASTRUCTURE
-- ============================================================================
-- 
-- Comprehensive esports backend for competitive gaming:
-- • Skill-based matchmaking
-- • Tournament management
-- • Replay & spectator systems
-- • Anti-cheat infrastructure
-- • Game studio creator tools
--
-- ============================================================================

-- ============================================================================
-- PLAYER RANKINGS & MMR
-- ============================================================================

CREATE TABLE IF NOT EXISTS arcade_player_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  
  -- MMR System
  mmr INTEGER DEFAULT 1000,
  peak_mmr INTEGER DEFAULT 1000,
  
  -- Rank
  rank_tier TEXT DEFAULT 'bronze',
  rank_division INTEGER DEFAULT 1,
  
  -- Season stats
  season_id TEXT,
  season_wins INTEGER DEFAULT 0,
  season_losses INTEGER DEFAULT 0,
  season_draws INTEGER DEFAULT 0,
  placement_matches_played INTEGER DEFAULT 0,
  placement_matches_required INTEGER DEFAULT 10,
  
  -- Streaks
  current_win_streak INTEGER DEFAULT 0,
  current_loss_streak INTEGER DEFAULT 0,
  longest_win_streak INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_match_at TIMESTAMPTZ,
  
  UNIQUE(player_id, game_id)
);

-- Rank tiers configuration
CREATE TABLE IF NOT EXISTS arcade_rank_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  min_mmr INTEGER NOT NULL,
  max_mmr INTEGER NOT NULL,
  icon_url TEXT,
  color TEXT,
  division_count INTEGER DEFAULT 4
);

-- Insert default rank tiers
INSERT INTO arcade_rank_tiers (id, name, min_mmr, max_mmr, icon_url, color) VALUES
  ('iron', 'Iron', 0, 399, '/ranks/iron.png', '#5C5C5C'),
  ('bronze', 'Bronze', 400, 799, '/ranks/bronze.png', '#CD7F32'),
  ('silver', 'Silver', 800, 1199, '/ranks/silver.png', '#C0C0C0'),
  ('gold', 'Gold', 1200, 1599, '/ranks/gold.png', '#FFD700'),
  ('platinum', 'Platinum', 1600, 1999, '/ranks/platinum.png', '#00CED1'),
  ('diamond', 'Diamond', 2000, 2399, '/ranks/diamond.png', '#B9F2FF'),
  ('master', 'Master', 2400, 2799, '/ranks/master.png', '#9370DB'),
  ('grandmaster', 'Grandmaster', 2800, 3199, '/ranks/grandmaster.png', '#FF4500'),
  ('champion', 'Champion', 3200, 9999, '/ranks/champion.png', '#FFD700')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- MATCHMAKING SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS arcade_matchmaking_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'casual',
  region TEXT NOT NULL DEFAULT 'auto',
  
  -- Skill matching
  mmr INTEGER NOT NULL DEFAULT 1000,
  mmr_range INTEGER NOT NULL DEFAULT 100,
  
  -- Party
  party_members UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Status
  status TEXT NOT NULL DEFAULT 'searching',
  match_id UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  CONSTRAINT valid_status CHECK (status IN ('searching', 'expanding', 'found', 'ready', 'cancelled', 'expired'))
);

-- ============================================================================
-- TOURNAMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS arcade_tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES auth.users(id),
  game_id TEXT NOT NULL,
  
  -- Info
  name TEXT NOT NULL,
  description TEXT,
  rules TEXT,
  banner_url TEXT,
  
  -- Format
  format TEXT NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 32,
  team_size INTEGER DEFAULT 1,
  best_of INTEGER DEFAULT 3,
  
  -- Config
  config JSONB NOT NULL DEFAULT '{}',
  
  -- Schedule
  registration_start TIMESTAMPTZ NOT NULL,
  registration_end TIMESTAMPTZ NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  
  -- Prize
  prize_pool DECIMAL(10, 2) DEFAULT 0,
  entry_fee DECIMAL(10, 2) DEFAULT 0,
  
  -- Data
  participants JSONB DEFAULT '[]',
  bracket JSONB DEFAULT '[]',
  current_round INTEGER DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'registration',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  CONSTRAINT valid_format CHECK (format IN ('single_elimination', 'double_elimination', 'round_robin', 'swiss'))
);

-- Tournament registrations
CREATE TABLE IF NOT EXISTS arcade_tournament_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES arcade_tournaments(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES auth.users(id),
  team_id UUID,
  
  -- Status
  seed INTEGER,
  checked_in BOOLEAN DEFAULT false,
  eliminated BOOLEAN DEFAULT false,
  final_placement INTEGER,
  
  -- Entry
  entry_paid BOOLEAN DEFAULT false,
  entry_transaction_id TEXT,
  
  -- Timestamps
  registered_at TIMESTAMPTZ DEFAULT now(),
  checked_in_at TIMESTAMPTZ,
  
  UNIQUE(tournament_id, player_id)
);

-- Tournament matches (separate from bracket for detailed tracking)
CREATE TABLE IF NOT EXISTS arcade_tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES arcade_tournaments(id) ON DELETE CASCADE,
  bracket_match_id TEXT NOT NULL,
  
  -- Participants
  participant1_id UUID,
  participant2_id UUID,
  
  -- Result
  winner_id UUID,
  loser_id UUID,
  score_team1 INTEGER DEFAULT 0,
  score_team2 INTEGER DEFAULT 0,
  
  -- Game reference
  game_match_id UUID,
  replay_id UUID,
  
  -- Status
  status TEXT DEFAULT 'pending',
  scheduled_time TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Dispute
  disputed BOOLEAN DEFAULT false,
  dispute_reason TEXT,
  dispute_resolved_by UUID,
  
  CONSTRAINT valid_match_status CHECK (status IN ('pending', 'scheduled', 'live', 'completed', 'disputed', 'forfeited'))
);

-- ============================================================================
-- REPLAY & SPECTATOR SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS arcade_replays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL,
  game_id TEXT NOT NULL,
  
  -- Metadata
  title TEXT,
  description TEXT,
  duration_seconds INTEGER,
  version TEXT NOT NULL,
  
  -- Players
  players JSONB NOT NULL DEFAULT '[]',
  winner_id UUID,
  
  -- Data
  tick_rate INTEGER DEFAULT 60,
  total_ticks INTEGER,
  file_url TEXT,
  file_size_bytes BIGINT,
  compressed BOOLEAN DEFAULT true,
  
  -- Visibility
  is_public BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  
  -- Timestamps
  recorded_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  
  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) STORED
);

-- Replay snapshots (for seeking)
CREATE TABLE IF NOT EXISTS arcade_replay_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  replay_id UUID NOT NULL REFERENCES arcade_replays(id) ON DELETE CASCADE,
  
  tick INTEGER NOT NULL,
  timestamp_ms BIGINT NOT NULL,
  
  -- State
  snapshot_data JSONB NOT NULL,
  
  -- Index for fast seeking
  UNIQUE(replay_id, tick)
);

-- Spectator sessions
CREATE TABLE IF NOT EXISTS arcade_spectator_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL,
  spectator_id UUID REFERENCES auth.users(id),
  
  -- Session
  session_token TEXT NOT NULL UNIQUE,
  
  -- State
  view_mode TEXT DEFAULT 'free_cam',
  following_player_id UUID,
  delay_seconds INTEGER DEFAULT 30,
  quality TEXT DEFAULT 'high',
  
  -- Stats
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_heartbeat TIMESTAMPTZ DEFAULT now(),
  total_watch_time_seconds INTEGER DEFAULT 0,
  
  CONSTRAINT valid_view_mode CHECK (view_mode IN ('free_cam', 'first_person', 'third_person', 'overhead', 'director'))
);

-- ============================================================================
-- ANTI-CHEAT & VALIDATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS arcade_player_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  reported_id UUID NOT NULL REFERENCES auth.users(id),
  match_id UUID,
  
  -- Report
  reason TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  evidence_urls TEXT[],
  
  -- Status
  status TEXT DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  resolution TEXT,
  action_taken TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_category CHECK (category IN ('cheating', 'harassment', 'griefing', 'smurfing', 'other'))
);

CREATE TABLE IF NOT EXISTS arcade_player_sanctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Sanction
  type TEXT NOT NULL,
  reason TEXT NOT NULL,
  report_id UUID REFERENCES arcade_player_reports(id),
  
  -- Duration
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  permanent BOOLEAN DEFAULT false,
  
  -- Admin
  issued_by UUID,
  
  CONSTRAINT valid_sanction_type CHECK (type IN ('warning', 'mute', 'ranked_ban', 'game_ban', 'permanent_ban'))
);

-- Input validation logs
CREATE TABLE IF NOT EXISTS arcade_input_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL,
  player_id UUID NOT NULL,
  
  -- Validation
  tick INTEGER NOT NULL,
  input_hash TEXT NOT NULL,
  server_hash TEXT NOT NULL,
  is_valid BOOLEAN NOT NULL,
  
  -- Anomaly detection
  anomaly_score FLOAT DEFAULT 0,
  anomaly_flags TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- GAME STUDIO (CREATOR TOOLS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS game_studio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Info
  name TEXT NOT NULL,
  description TEXT,
  template TEXT NOT NULL,
  
  -- Config
  config JSONB NOT NULL DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{}',
  
  -- Version
  version TEXT DEFAULT '0.1.0',
  
  -- Scenes
  main_scene UUID,
  
  -- Status
  status TEXT DEFAULT 'draft',
  
  -- Publishing
  is_published BOOLEAN DEFAULT false,
  published_version TEXT,
  published_at TIMESTAMPTZ,
  arcade_listing_id UUID,
  
  -- Stats
  play_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_project_status CHECK (status IN ('draft', 'building', 'testing', 'review', 'published', 'suspended', 'archived'))
);

CREATE TABLE IF NOT EXISTS game_studio_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES game_studio_projects(id) ON DELETE CASCADE,
  
  -- File
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  path TEXT NOT NULL,
  url TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Processing
  is_processed BOOLEAN DEFAULT false,
  processing_status TEXT DEFAULT 'pending',
  processing_error TEXT,
  
  -- Variants
  variants JSONB DEFAULT '[]',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_studio_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES game_studio_projects(id) ON DELETE CASCADE,
  
  -- Script
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  code TEXT NOT NULL DEFAULT '',
  
  -- Compilation
  compiled_code TEXT,
  is_compiled BOOLEAN DEFAULT false,
  compile_errors JSONB DEFAULT '[]',
  compile_warnings JSONB DEFAULT '[]',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_studio_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES game_studio_projects(id) ON DELETE CASCADE,
  
  -- Info
  name TEXT NOT NULL,
  description TEXT,
  
  -- Data
  root_objects JSONB DEFAULT '[]',
  environment JSONB DEFAULT '{}',
  lighting JSONB DEFAULT '{}',
  physics JSONB DEFAULT '{}',
  spawn_points JSONB DEFAULT '[]',
  scripts UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_studio_ai_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES game_studio_projects(id) ON DELETE CASCADE,
  
  -- Config
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Published game listings
CREATE TABLE IF NOT EXISTS arcade_game_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES game_studio_projects(id),
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Info
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  
  -- Media
  thumbnail TEXT,
  banner TEXT,
  screenshots TEXT[] DEFAULT ARRAY[]::TEXT[],
  trailer_url TEXT,
  
  -- Categorization
  category TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Pricing
  pricing_model TEXT DEFAULT 'free',
  price DECIMAL(10, 2) DEFAULT 0,
  
  -- Version
  version TEXT NOT NULL,
  
  -- Stats
  play_count INTEGER DEFAULT 0,
  unique_players INTEGER DEFAULT 0,
  avg_rating DECIMAL(3, 2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'pending_review',
  
  -- Timestamps
  published_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_listing_status CHECK (status IN ('pending_review', 'active', 'suspended', 'delisted'))
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Rankings
CREATE INDEX IF NOT EXISTS idx_rankings_player_game ON arcade_player_rankings(player_id, game_id);
CREATE INDEX IF NOT EXISTS idx_rankings_mmr ON arcade_player_rankings(game_id, mmr DESC);
CREATE INDEX IF NOT EXISTS idx_rankings_rank ON arcade_player_rankings(game_id, rank_tier, rank_division);

-- Matchmaking
CREATE INDEX IF NOT EXISTS idx_matchmaking_search ON arcade_matchmaking_tickets(game_id, mode, region, status, mmr);
CREATE INDEX IF NOT EXISTS idx_matchmaking_player ON arcade_matchmaking_tickets(player_id, status);

-- Tournaments
CREATE INDEX IF NOT EXISTS idx_tournaments_game ON arcade_tournaments(game_id, status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start ON arcade_tournaments(start_time) WHERE status = 'registration';
CREATE INDEX IF NOT EXISTS idx_tournament_reg ON arcade_tournament_registrations(tournament_id, player_id);

-- Replays
CREATE INDEX IF NOT EXISTS idx_replays_match ON arcade_replays(match_id);
CREATE INDEX IF NOT EXISTS idx_replays_game ON arcade_replays(game_id, is_public, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_replays_search ON arcade_replays USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_replay_snapshots ON arcade_replay_snapshots(replay_id, tick);

-- Anti-cheat
CREATE INDEX IF NOT EXISTS idx_reports_reported ON arcade_player_reports(reported_id, status);
CREATE INDEX IF NOT EXISTS idx_sanctions_player ON arcade_player_sanctions(player_id, expires_at);

-- Game Studio
CREATE INDEX IF NOT EXISTS idx_studio_projects_creator ON game_studio_projects(creator_id, status);
CREATE INDEX IF NOT EXISTS idx_studio_assets_project ON game_studio_assets(project_id, type);
CREATE INDEX IF NOT EXISTS idx_listings_creator ON arcade_game_listings(creator_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON arcade_game_listings(category, status);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE arcade_player_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE arcade_matchmaking_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE arcade_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE arcade_tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE arcade_replays ENABLE ROW LEVEL SECURITY;
ALTER TABLE arcade_spectator_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_studio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_studio_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_studio_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_studio_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE arcade_game_listings ENABLE ROW LEVEL SECURITY;

-- Rankings: Public read, own write
CREATE POLICY "Rankings readable by all" ON arcade_player_rankings FOR SELECT USING (true);
CREATE POLICY "Players manage own rankings" ON arcade_player_rankings FOR ALL USING (auth.uid() = player_id);

-- Matchmaking: Own tickets
CREATE POLICY "Players manage own tickets" ON arcade_matchmaking_tickets FOR ALL USING (auth.uid() = player_id);

-- Tournaments: Public read
CREATE POLICY "Tournaments readable by all" ON arcade_tournaments FOR SELECT USING (true);
CREATE POLICY "Organizers manage tournaments" ON arcade_tournaments FOR ALL USING (auth.uid() = organizer_id);

-- Tournament registrations
CREATE POLICY "Registrations readable" ON arcade_tournament_registrations FOR SELECT USING (true);
CREATE POLICY "Players manage own registration" ON arcade_tournament_registrations FOR ALL USING (auth.uid() = player_id);

-- Replays: Public or own
CREATE POLICY "Public replays readable" ON arcade_replays FOR SELECT USING (is_public = true OR auth.uid() = ANY(SELECT (players->>'player_id')::uuid FROM jsonb_array_elements(players) AS p));

-- Spectator sessions
CREATE POLICY "Spectators manage own sessions" ON arcade_spectator_sessions FOR ALL USING (spectator_id IS NULL OR auth.uid() = spectator_id);

-- Game Studio: Own projects
CREATE POLICY "Creators manage own projects" ON game_studio_projects FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "Published projects readable" ON game_studio_projects FOR SELECT USING (is_published = true);

CREATE POLICY "Creators manage own assets" ON game_studio_assets FOR ALL USING (
  EXISTS (SELECT 1 FROM game_studio_projects WHERE id = project_id AND creator_id = auth.uid())
);

CREATE POLICY "Creators manage own scripts" ON game_studio_scripts FOR ALL USING (
  EXISTS (SELECT 1 FROM game_studio_projects WHERE id = project_id AND creator_id = auth.uid())
);

CREATE POLICY "Creators manage own scenes" ON game_studio_scenes FOR ALL USING (
  EXISTS (SELECT 1 FROM game_studio_projects WHERE id = project_id AND creator_id = auth.uid())
);

-- Game listings: Public read
CREATE POLICY "Active listings readable" ON arcade_game_listings FOR SELECT USING (status = 'active');
CREATE POLICY "Creators manage own listings" ON arcade_game_listings FOR ALL USING (auth.uid() = creator_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Update MMR after match
CREATE OR REPLACE FUNCTION arcade_update_mmr(
  p_player_id UUID,
  p_game_id TEXT,
  p_won BOOLEAN,
  p_opponent_mmr INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_current_mmr INTEGER;
  v_k_factor INTEGER := 32;
  v_expected FLOAT;
  v_change INTEGER;
  v_new_mmr INTEGER;
BEGIN
  -- Get current MMR
  SELECT COALESCE(mmr, 1000) INTO v_current_mmr
  FROM arcade_player_rankings
  WHERE player_id = p_player_id AND game_id = p_game_id;
  
  IF v_current_mmr IS NULL THEN
    v_current_mmr := 1000;
  END IF;
  
  -- Calculate expected score
  v_expected := 1.0 / (1.0 + POWER(10.0, (p_opponent_mmr - v_current_mmr) / 400.0));
  
  -- Calculate MMR change
  IF p_won THEN
    v_change := ROUND(v_k_factor * (1.0 - v_expected));
  ELSE
    v_change := ROUND(v_k_factor * (0.0 - v_expected));
  END IF;
  
  v_new_mmr := GREATEST(0, v_current_mmr + v_change);
  
  -- Update or insert ranking
  INSERT INTO arcade_player_rankings (player_id, game_id, mmr, peak_mmr, updated_at, last_match_at)
  VALUES (p_player_id, p_game_id, v_new_mmr, v_new_mmr, now(), now())
  ON CONFLICT (player_id, game_id) DO UPDATE SET
    mmr = v_new_mmr,
    peak_mmr = GREATEST(arcade_player_rankings.peak_mmr, v_new_mmr),
    season_wins = CASE WHEN p_won THEN arcade_player_rankings.season_wins + 1 ELSE arcade_player_rankings.season_wins END,
    season_losses = CASE WHEN NOT p_won THEN arcade_player_rankings.season_losses + 1 ELSE arcade_player_rankings.season_losses END,
    current_win_streak = CASE WHEN p_won THEN arcade_player_rankings.current_win_streak + 1 ELSE 0 END,
    current_loss_streak = CASE WHEN NOT p_won THEN arcade_player_rankings.current_loss_streak + 1 ELSE 0 END,
    longest_win_streak = CASE WHEN p_won THEN GREATEST(arcade_player_rankings.longest_win_streak, arcade_player_rankings.current_win_streak + 1) ELSE arcade_player_rankings.longest_win_streak END,
    updated_at = now(),
    last_match_at = now();
  
  -- Update rank tier
  PERFORM arcade_update_rank_tier(p_player_id, p_game_id);
  
  RETURN v_new_mmr;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update rank tier based on MMR
CREATE OR REPLACE FUNCTION arcade_update_rank_tier(
  p_player_id UUID,
  p_game_id TEXT
) RETURNS VOID AS $$
DECLARE
  v_mmr INTEGER;
  v_tier RECORD;
  v_division INTEGER;
BEGIN
  -- Get current MMR
  SELECT mmr INTO v_mmr
  FROM arcade_player_rankings
  WHERE player_id = p_player_id AND game_id = p_game_id;
  
  -- Find tier
  SELECT * INTO v_tier
  FROM arcade_rank_tiers
  WHERE v_mmr >= min_mmr AND v_mmr <= max_mmr
  LIMIT 1;
  
  IF v_tier IS NOT NULL THEN
    -- Calculate division within tier
    v_division := LEAST(v_tier.division_count, 
      1 + ((v_mmr - v_tier.min_mmr) * v_tier.division_count / (v_tier.max_mmr - v_tier.min_mmr + 1))
    );
    
    UPDATE arcade_player_rankings
    SET rank_tier = v_tier.id,
        rank_division = v_division
    WHERE player_id = p_player_id AND game_id = p_game_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accept match in matchmaking
CREATE OR REPLACE FUNCTION arcade_accept_match(
  p_match_id UUID,
  p_player_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE arcade_matches
  SET players = (
    SELECT jsonb_agg(
      CASE 
        WHEN (p->>'player_id')::UUID = p_player_id 
        THEN p || '{"accepted": true}'::jsonb
        ELSE p
      END
    )
    FROM jsonb_array_elements(players) AS p
  )
  WHERE id = p_match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- REALTIME
-- ============================================================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE arcade_matchmaking_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE arcade_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE arcade_tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE arcade_spectator_sessions;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE arcade_player_rankings IS 'Player skill ratings and rankings per game';
COMMENT ON TABLE arcade_matchmaking_tickets IS 'Active matchmaking queue entries';
COMMENT ON TABLE arcade_tournaments IS 'Tournament definitions and state';
COMMENT ON TABLE arcade_replays IS 'Match replay recordings';
COMMENT ON TABLE game_studio_projects IS 'Creator game projects';
COMMENT ON TABLE arcade_game_listings IS 'Published games on Lucy Arcade';
