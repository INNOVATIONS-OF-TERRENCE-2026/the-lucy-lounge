-- ============================================================================
-- LUCY ARCADE — COMPLETE DATABASE SCHEMA
-- ============================================================================
-- 
-- PRODUCTION-SCALE GAMING BACKEND
-- 
-- This migration consolidates and completes the Lucy Arcade database schema:
-- • Global player identity and progression
-- • FPS gameplay with AI opponents
-- • PvP/PvE multiplayer matches
-- • Ranked matchmaking with MMR
-- • Esports tournaments and brackets
-- • Replay and spectator systems
-- • Anti-cheat infrastructure
-- • Creator tools and marketplace
--
-- Designed for:
-- • PlayStation Network / Xbox Live scale
-- • FACEIT / ESL tournament operations
-- • Realtime multiplayer (Supabase Realtime)
-- • Web-native + AI-first architecture
--
-- ============================================================================

-- ============================================================================
-- 1. PLAYERS — GLOBAL IDENTITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS players (
  -- Primary key matches auth.users for seamless integration
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identity
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  bio TEXT,
  
  -- Global progression
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 1000),
  xp BIGINT DEFAULT 0 CHECK (xp >= 0),
  prestige INTEGER DEFAULT 0 CHECK (prestige >= 0 AND prestige <= 10),
  
  -- Currency
  coins BIGINT DEFAULT 0 CHECK (coins >= 0),
  premium_currency BIGINT DEFAULT 0 CHECK (premium_currency >= 0),
  
  -- Competitive
  rank TEXT DEFAULT 'Unranked',
  mmr INTEGER DEFAULT 1000 CHECK (mmr >= 0),
  peak_mmr INTEGER DEFAULT 1000,
  
  -- Social
  friend_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away', 'dnd', 'in_game')),
  last_online_at TIMESTAMPTZ DEFAULT now(),
  current_game_id TEXT,
  current_match_id UUID,
  
  -- Settings
  privacy_settings JSONB DEFAULT '{"profile": "public", "stats": "public", "activity": "friends"}',
  notification_settings JSONB DEFAULT '{"matches": true, "tournaments": true, "friends": true}',
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  is_creator BOOLEAN DEFAULT false,
  is_pro BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Username search index
CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);
CREATE INDEX IF NOT EXISTS idx_players_username_search ON players USING gin(username gin_trgm_ops);

-- Leaderboard indexes
CREATE INDEX IF NOT EXISTS idx_players_level ON players(level DESC, xp DESC);
CREATE INDEX IF NOT EXISTS idx_players_mmr ON players(mmr DESC);
CREATE INDEX IF NOT EXISTS idx_players_prestige ON players(prestige DESC, level DESC);

-- Status index for online players
CREATE INDEX IF NOT EXISTS idx_players_status ON players(status) WHERE status != 'offline';

-- ============================================================================
-- 2. GAMES — REGISTRY
-- ============================================================================

CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  
  -- Info
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  
  -- Classification
  genre TEXT NOT NULL CHECK (genre IN (
    'fps', 'shooter', 'action', 'racing', 'sports', 'fighting',
    'strategy', 'puzzle', 'card', 'board', 'arcade', 'rpg', 'simulation'
  )),
  engine TEXT DEFAULT 'web' CHECK (engine IN ('web', 'three', 'webgpu', 'canvas', 'pixi')),
  
  -- Flagship
  is_flagship BOOLEAN DEFAULT false,
  
  -- Capabilities
  supports_multiplayer BOOLEAN DEFAULT false,
  supports_ranked BOOLEAN DEFAULT false,
  supports_ai BOOLEAN DEFAULT true,
  supports_spectator BOOLEAN DEFAULT false,
  supports_replay BOOLEAN DEFAULT false,
  supports_crossplay BOOLEAN DEFAULT true,
  supports_controller BOOLEAN DEFAULT true,
  supports_touch BOOLEAN DEFAULT true,
  
  -- Player limits
  min_players INTEGER DEFAULT 1 CHECK (min_players >= 1),
  max_players INTEGER DEFAULT 16 CHECK (max_players >= min_players),
  team_sizes INTEGER[] DEFAULT ARRAY[1],
  
  -- Assets
  thumbnail_url TEXT,
  banner_url TEXT,
  icon_url TEXT,
  screenshots TEXT[] DEFAULT ARRAY[]::TEXT[],
  trailer_url TEXT,
  
  -- Stats
  total_plays BIGINT DEFAULT 0,
  total_matches BIGINT DEFAULT 0,
  active_players INTEGER DEFAULT 0,
  peak_players INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('development', 'beta', 'active', 'maintenance', 'retired')),
  version TEXT DEFAULT '1.0.0',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  released_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_games_slug ON games(slug);
CREATE INDEX IF NOT EXISTS idx_games_genre ON games(genre);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_flagship ON games(is_flagship) WHERE is_flagship = true;

-- ============================================================================
-- 3. GAME MODES
-- ============================================================================

CREATE TABLE IF NOT EXISTS game_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  
  -- Info
  slug TEXT NOT NULL,
  mode_name TEXT NOT NULL,
  description TEXT,
  
  -- Configuration
  min_players INTEGER DEFAULT 1,
  max_players INTEGER DEFAULT 16,
  team_count INTEGER DEFAULT 2,
  players_per_team INTEGER DEFAULT 1,
  
  -- Type
  is_ranked BOOLEAN DEFAULT false,
  is_casual BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false,
  is_tournament BOOLEAN DEFAULT false,
  
  -- Rules
  time_limit_seconds INTEGER,
  score_limit INTEGER,
  round_count INTEGER DEFAULT 1,
  respawn_enabled BOOLEAN DEFAULT true,
  respawn_time_seconds INTEGER DEFAULT 5,
  friendly_fire BOOLEAN DEFAULT false,
  
  -- Settings
  settings JSONB DEFAULT '{}',
  
  -- Status
  is_enabled BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(game_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_game_modes_game ON game_modes(game_id);
CREATE INDEX IF NOT EXISTS idx_game_modes_ranked ON game_modes(game_id, is_ranked) WHERE is_ranked = true;

-- ============================================================================
-- 4. MATCHES — EXTENDED
-- ============================================================================

-- Drop and recreate matches table with extended fields
-- (Only if it doesn't have all required columns)
ALTER TABLE arcade_matches 
  ADD COLUMN IF NOT EXISTS game_mode_id UUID REFERENCES game_modes(id),
  ADD COLUMN IF NOT EXISTS server_region TEXT DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS server_id TEXT,
  ADD COLUMN IF NOT EXISTS is_ranked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_tournament BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tournament_id UUID,
  ADD COLUMN IF NOT EXISTS players JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS teams JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS final_scores JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS match_stats JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS replay_id UUID,
  ADD COLUMN IF NOT EXISTS anti_cheat_validated BOOLEAN DEFAULT false;

-- ============================================================================
-- 5. MATCH PLAYERS — DETAILED PARTICIPATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS match_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES arcade_matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Team
  team INTEGER DEFAULT 0,
  slot INTEGER DEFAULT 0,
  
  -- AI
  is_ai BOOLEAN DEFAULT false,
  ai_opponent_id UUID,
  ai_difficulty TEXT DEFAULT 'medium',
  
  -- Combat stats
  kills INTEGER DEFAULT 0,
  deaths INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  headshots INTEGER DEFAULT 0,
  damage_dealt BIGINT DEFAULT 0,
  damage_taken BIGINT DEFAULT 0,
  healing_done BIGINT DEFAULT 0,
  
  -- Game stats
  score INTEGER DEFAULT 0,
  objectives_completed INTEGER DEFAULT 0,
  time_played_seconds INTEGER DEFAULT 0,
  
  -- Performance
  accuracy DECIMAL(5,2) DEFAULT 0,
  kda_ratio DECIMAL(5,2) DEFAULT 0,
  
  -- Result
  result TEXT CHECK (result IN ('win', 'loss', 'draw', 'abandon', 'pending')),
  
  -- Rewards
  xp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  mmr_change INTEGER DEFAULT 0,
  
  -- Detailed stats
  weapon_stats JSONB DEFAULT '{}',
  ability_stats JSONB DEFAULT '{}',
  movement_stats JSONB DEFAULT '{}',
  
  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT now(),
  left_at TIMESTAMPTZ,
  
  -- Ensure unique player per match
  UNIQUE(match_id, player_id) WHERE player_id IS NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_match_players_match ON match_players(match_id);
CREATE INDEX IF NOT EXISTS idx_match_players_player ON match_players(player_id);
CREATE INDEX IF NOT EXISTS idx_match_players_result ON match_players(player_id, result);

-- ============================================================================
-- 6. AI OPPONENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_opponents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  name TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  
  -- Type
  game_id UUID REFERENCES games(id),
  game_slug TEXT,
  
  -- Personality
  personality TEXT NOT NULL CHECK (personality IN (
    'aggressive', 'defensive', 'tactical', 'adaptive', 'balanced',
    'sniper', 'rusher', 'flanker', 'support', 'strategist'
  )),
  
  -- Difficulty
  difficulty TEXT NOT NULL CHECK (difficulty IN (
    'tutorial', 'easy', 'medium', 'hard', 'expert', 'master', 'legendary'
  )),
  difficulty_multiplier DECIMAL(3,2) DEFAULT 1.0,
  
  -- Behavior profile (detailed AI config)
  behavior_profile JSONB NOT NULL DEFAULT '{
    "aggression": 0.5,
    "accuracy": 0.5,
    "reaction_time_ms": 250,
    "prediction_enabled": false,
    "learning_rate": 0.1,
    "risk_tolerance": 0.5,
    "team_coordination": 0.5,
    "objective_focus": 0.5,
    "retreat_threshold": 0.3
  }',
  
  -- Learning
  learning_enabled BOOLEAN DEFAULT true,
  adaptation_rate DECIMAL(3,2) DEFAULT 0.1,
  
  -- Stats (for balancing)
  total_matches INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  average_kills DECIMAL(5,2) DEFAULT 0,
  average_deaths DECIMAL(5,2) DEFAULT 0,
  
  -- Status
  is_enabled BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_opponents_game ON ai_opponents(game_slug);
CREATE INDEX IF NOT EXISTS idx_ai_opponents_difficulty ON ai_opponents(difficulty);
CREATE INDEX IF NOT EXISTS idx_ai_opponents_personality ON ai_opponents(personality);

-- Insert default FPS AI opponents
INSERT INTO ai_opponents (name, display_name, personality, difficulty, difficulty_multiplier, behavior_profile) VALUES
  ('recruit_bot', 'Recruit', 'balanced', 'easy', 0.6, '{"aggression": 0.3, "accuracy": 0.3, "reaction_time_ms": 400, "prediction_enabled": false, "learning_rate": 0, "risk_tolerance": 0.3, "team_coordination": 0.2, "objective_focus": 0.3, "retreat_threshold": 0.5}'),
  ('soldier_bot', 'Soldier', 'balanced', 'medium', 1.0, '{"aggression": 0.5, "accuracy": 0.5, "reaction_time_ms": 250, "prediction_enabled": false, "learning_rate": 0.05, "risk_tolerance": 0.5, "team_coordination": 0.5, "objective_focus": 0.5, "retreat_threshold": 0.3}'),
  ('veteran_bot', 'Veteran', 'tactical', 'hard', 1.3, '{"aggression": 0.6, "accuracy": 0.7, "reaction_time_ms": 180, "prediction_enabled": true, "learning_rate": 0.1, "risk_tolerance": 0.4, "team_coordination": 0.7, "objective_focus": 0.6, "retreat_threshold": 0.25}'),
  ('elite_bot', 'Elite', 'adaptive', 'expert', 1.6, '{"aggression": 0.7, "accuracy": 0.85, "reaction_time_ms": 120, "prediction_enabled": true, "learning_rate": 0.15, "risk_tolerance": 0.35, "team_coordination": 0.85, "objective_focus": 0.7, "retreat_threshold": 0.2}'),
  ('commander_bot', 'Commander', 'strategist', 'master', 1.8, '{"aggression": 0.75, "accuracy": 0.92, "reaction_time_ms": 80, "prediction_enabled": true, "learning_rate": 0.2, "risk_tolerance": 0.3, "team_coordination": 0.95, "objective_focus": 0.85, "retreat_threshold": 0.15}'),
  ('apex_bot', 'Apex Predator', 'adaptive', 'legendary', 2.0, '{"aggression": 0.85, "accuracy": 0.98, "reaction_time_ms": 50, "prediction_enabled": true, "learning_rate": 0.25, "risk_tolerance": 0.25, "team_coordination": 1.0, "objective_focus": 0.9, "retreat_threshold": 0.1}'),
  -- Personality variants
  ('sniper_bot', 'Marksman', 'sniper', 'hard', 1.4, '{"aggression": 0.2, "accuracy": 0.92, "reaction_time_ms": 150, "prediction_enabled": true, "learning_rate": 0.1, "risk_tolerance": 0.2, "team_coordination": 0.4, "objective_focus": 0.3, "retreat_threshold": 0.4}'),
  ('rusher_bot', 'Blitz', 'rusher', 'hard', 1.3, '{"aggression": 0.95, "accuracy": 0.6, "reaction_time_ms": 100, "prediction_enabled": false, "learning_rate": 0.1, "risk_tolerance": 0.8, "team_coordination": 0.3, "objective_focus": 0.2, "retreat_threshold": 0.15}'),
  ('flanker_bot', 'Shadow', 'flanker', 'hard', 1.35, '{"aggression": 0.6, "accuracy": 0.75, "reaction_time_ms": 130, "prediction_enabled": true, "learning_rate": 0.12, "risk_tolerance": 0.6, "team_coordination": 0.5, "objective_focus": 0.4, "retreat_threshold": 0.3}'),
  ('support_bot', 'Guardian', 'support', 'medium', 1.1, '{"aggression": 0.3, "accuracy": 0.6, "reaction_time_ms": 200, "prediction_enabled": false, "learning_rate": 0.08, "risk_tolerance": 0.3, "team_coordination": 0.9, "objective_focus": 0.8, "retreat_threshold": 0.4}')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. PLAYER PROGRESS — PER-GAME PROGRESSION
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id),
  game_slug TEXT NOT NULL,
  
  -- Progression
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  xp BIGINT DEFAULT 0 CHECK (xp >= 0),
  xp_to_next_level BIGINT DEFAULT 1000,
  
  -- Stats
  total_matches INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  total_draws INTEGER DEFAULT 0,
  total_abandons INTEGER DEFAULT 0,
  total_playtime_seconds BIGINT DEFAULT 0,
  
  -- Combat stats (for FPS)
  total_kills INTEGER DEFAULT 0,
  total_deaths INTEGER DEFAULT 0,
  total_assists INTEGER DEFAULT 0,
  total_headshots INTEGER DEFAULT 0,
  total_damage_dealt BIGINT DEFAULT 0,
  highest_killstreak INTEGER DEFAULT 0,
  
  -- Records
  highest_score INTEGER DEFAULT 0,
  fastest_win_seconds INTEGER,
  longest_match_seconds INTEGER,
  
  -- Unlockables
  unlocked_items JSONB DEFAULT '[]',
  equipped_items JSONB DEFAULT '{}',
  
  -- Achievements
  achievements JSONB DEFAULT '[]',
  achievement_points INTEGER DEFAULT 0,
  
  -- Skill tree (if applicable)
  skill_points INTEGER DEFAULT 0,
  skill_tree JSONB DEFAULT '{}',
  
  -- Seasonal
  season_id TEXT,
  season_xp BIGINT DEFAULT 0,
  season_level INTEGER DEFAULT 1,
  
  -- Battle pass
  battle_pass_tier INTEGER DEFAULT 0,
  battle_pass_xp BIGINT DEFAULT 0,
  battle_pass_premium BOOLEAN DEFAULT false,
  
  -- Timestamps
  first_played_at TIMESTAMPTZ DEFAULT now(),
  last_played_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(player_id, game_slug)
);

CREATE INDEX IF NOT EXISTS idx_player_progress_player ON player_progress(player_id);
CREATE INDEX IF NOT EXISTS idx_player_progress_game ON player_progress(game_slug);
CREATE INDEX IF NOT EXISTS idx_player_progress_level ON player_progress(game_slug, level DESC);
CREATE INDEX IF NOT EXISTS idx_player_progress_wins ON player_progress(game_slug, total_wins DESC);

-- ============================================================================
-- 8. MATCHMAKING QUEUE — ENHANCED
-- ============================================================================

ALTER TABLE arcade_matchmaking_tickets
  ADD COLUMN IF NOT EXISTS game_mode_id UUID REFERENCES game_modes(id),
  ADD COLUMN IF NOT EXISTS preferred_server TEXT,
  ADD COLUMN IF NOT EXISTS max_ping_ms INTEGER DEFAULT 150,
  ADD COLUMN IF NOT EXISTS search_start_time TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS search_duration_seconds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- ============================================================================
-- 9. FRIENDS & SOCIAL
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  
  -- Interaction
  favorite BOOLEAN DEFAULT false,
  nickname TEXT,
  
  -- Stats
  games_played_together INTEGER DEFAULT 0,
  last_played_together TIMESTAMPTZ,
  
  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(player_id, friend_id),
  CHECK (player_id != friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friends_player ON player_friends(player_id, status);
CREATE INDEX IF NOT EXISTS idx_friends_friend ON player_friends(friend_id, status);

-- ============================================================================
-- 10. PARTIES & LOBBIES — ENHANCED
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Leader
  leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Members (array of player IDs)
  members UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Settings
  max_size INTEGER DEFAULT 5,
  is_public BOOLEAN DEFAULT false,
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(4), 'hex'),
  
  -- Game
  game_id TEXT,
  game_mode_id UUID,
  
  -- Status
  status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'searching', 'in_match')),
  match_id UUID,
  
  -- Voice
  voice_channel_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parties_leader ON player_parties(leader_id);
CREATE INDEX IF NOT EXISTS idx_parties_status ON player_parties(status);

-- ============================================================================
-- 11. LEADERBOARDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identification
  game_slug TEXT NOT NULL,
  leaderboard_type TEXT NOT NULL CHECK (leaderboard_type IN (
    'global', 'ranked', 'weekly', 'monthly', 'seasonal', 'all_time', 'friends'
  )),
  stat_type TEXT NOT NULL, -- 'kills', 'wins', 'score', 'xp', etc.
  
  -- Time period
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  season_id TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(game_slug, leaderboard_type, stat_type, season_id)
);

CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_id UUID NOT NULL REFERENCES leaderboards(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Rank
  rank INTEGER NOT NULL,
  previous_rank INTEGER,
  
  -- Score
  score BIGINT NOT NULL,
  previous_score BIGINT,
  
  -- Extra stats
  stats JSONB DEFAULT '{}',
  
  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(leaderboard_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_board ON leaderboard_entries(leaderboard_id, rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_player ON leaderboard_entries(player_id);

-- ============================================================================
-- 12. ACHIEVEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  
  -- Info
  name TEXT NOT NULL,
  description TEXT,
  
  -- Type
  game_slug TEXT, -- NULL for global achievements
  category TEXT NOT NULL CHECK (category IN (
    'combat', 'progression', 'social', 'mastery', 'exploration', 'secret'
  )),
  
  -- Requirements
  requirement_type TEXT NOT NULL CHECK (requirement_type IN (
    'kills', 'wins', 'score', 'playtime', 'level', 'streak', 'custom'
  )),
  requirement_value BIGINT NOT NULL,
  requirement_config JSONB DEFAULT '{}',
  
  -- Rewards
  xp_reward INTEGER DEFAULT 0,
  coin_reward INTEGER DEFAULT 0,
  title_reward TEXT,
  cosmetic_reward TEXT,
  
  -- Rarity
  rarity TEXT DEFAULT 'common' CHECK (rarity IN (
    'common', 'uncommon', 'rare', 'epic', 'legendary', 'secret'
  )),
  
  -- Display
  icon_url TEXT,
  unlocked_icon_url TEXT,
  
  -- Status
  is_hidden BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  
  -- Stats
  total_unlocks INTEGER DEFAULT 0,
  unlock_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  
  -- Progress
  progress BIGINT DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  
  UNIQUE(player_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_player_achievements_player ON player_achievements(player_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_player_achievements_achievement ON player_achievements(achievement_id);

-- ============================================================================
-- 13. SEASONS & BATTLE PASS
-- ============================================================================

CREATE TABLE IF NOT EXISTS seasons (
  id TEXT PRIMARY KEY,
  
  -- Info
  name TEXT NOT NULL,
  description TEXT,
  theme TEXT,
  
  -- Timing
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  
  -- Battle Pass
  battle_pass_tiers INTEGER DEFAULT 100,
  battle_pass_price DECIMAL(10,2) DEFAULT 9.99,
  
  -- Rewards
  tier_rewards JSONB DEFAULT '[]',
  premium_rewards JSONB DEFAULT '[]',
  
  -- Status
  is_active BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 14. TRANSACTIONS & ECONOMY
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Type
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'purchase', 'reward', 'refund', 'gift', 'trade', 'season_reset'
  )),
  
  -- Currency
  currency_type TEXT NOT NULL CHECK (currency_type IN ('coins', 'premium', 'xp')),
  amount BIGINT NOT NULL,
  balance_before BIGINT NOT NULL,
  balance_after BIGINT NOT NULL,
  
  -- Reference
  reference_type TEXT,
  reference_id TEXT,
  
  -- Details
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_player ON player_transactions(player_id, created_at DESC);

-- ============================================================================
-- 15. RLS POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_opponents ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_transactions ENABLE ROW LEVEL SECURITY;

-- PLAYERS
CREATE POLICY "players_read_public" ON players
  FOR SELECT USING (
    privacy_settings->>'profile' = 'public' OR auth.uid() = id
  );

CREATE POLICY "players_update_own" ON players
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "players_insert_own" ON players
  FOR INSERT WITH CHECK (auth.uid() = id);

-- GAMES (public read)
CREATE POLICY "games_read_all" ON games
  FOR SELECT USING (true);

-- GAME MODES (public read)
CREATE POLICY "game_modes_read_all" ON game_modes
  FOR SELECT USING (true);

-- MATCH PLAYERS
CREATE POLICY "match_players_read_own" ON match_players
  FOR SELECT USING (
    player_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM arcade_matches m
      WHERE m.id = match_id
      AND (m.player1_id = auth.uid() OR m.player2_id = auth.uid())
    )
  );

CREATE POLICY "match_players_insert" ON match_players
  FOR INSERT WITH CHECK (
    player_id = auth.uid() OR
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- AI OPPONENTS (public read)
CREATE POLICY "ai_opponents_read_all" ON ai_opponents
  FOR SELECT USING (true);

-- PLAYER PROGRESS
CREATE POLICY "progress_read_own" ON player_progress
  FOR SELECT USING (player_id = auth.uid());

CREATE POLICY "progress_update_own" ON player_progress
  FOR UPDATE USING (player_id = auth.uid());

CREATE POLICY "progress_insert_own" ON player_progress
  FOR INSERT WITH CHECK (player_id = auth.uid());

-- FRIENDS
CREATE POLICY "friends_read_own" ON player_friends
  FOR SELECT USING (player_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "friends_manage_own" ON player_friends
  FOR ALL USING (player_id = auth.uid());

-- PARTIES
CREATE POLICY "parties_read_member" ON player_parties
  FOR SELECT USING (
    leader_id = auth.uid() OR auth.uid() = ANY(members)
  );

CREATE POLICY "parties_manage_leader" ON player_parties
  FOR ALL USING (leader_id = auth.uid());

-- LEADERBOARDS (public read)
CREATE POLICY "leaderboards_read_all" ON leaderboards
  FOR SELECT USING (true);

CREATE POLICY "leaderboard_entries_read_all" ON leaderboard_entries
  FOR SELECT USING (true);

-- ACHIEVEMENTS (public read)
CREATE POLICY "achievements_read_all" ON achievements
  FOR SELECT USING (is_enabled = true OR NOT is_hidden);

CREATE POLICY "player_achievements_read_own" ON player_achievements
  FOR SELECT USING (player_id = auth.uid());

CREATE POLICY "player_achievements_manage_own" ON player_achievements
  FOR ALL USING (player_id = auth.uid());

-- SEASONS (public read)
CREATE POLICY "seasons_read_all" ON seasons
  FOR SELECT USING (true);

-- TRANSACTIONS
CREATE POLICY "transactions_read_own" ON player_transactions
  FOR SELECT USING (player_id = auth.uid());

-- ============================================================================
-- 16. FUNCTIONS
-- ============================================================================

-- Create or update player profile on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO players (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Player_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', 'Player'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Calculate XP to next level
CREATE OR REPLACE FUNCTION calculate_xp_for_level(p_level INTEGER)
RETURNS BIGINT AS $$
BEGIN
  -- XP curve: 1000 base, 1.08x per level
  RETURN FLOOR(1000 * POWER(1.08, p_level - 1));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Award XP and handle level up
CREATE OR REPLACE FUNCTION award_player_xp(
  p_player_id UUID,
  p_xp_amount INTEGER,
  p_game_slug TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_current_xp BIGINT;
  v_current_level INTEGER;
  v_new_xp BIGINT;
  v_new_level INTEGER;
  v_xp_to_next BIGINT;
  v_levels_gained INTEGER := 0;
  v_result JSONB;
BEGIN
  -- Get current stats
  IF p_game_slug IS NOT NULL THEN
    SELECT xp, level INTO v_current_xp, v_current_level
    FROM player_progress
    WHERE player_id = p_player_id AND game_slug = p_game_slug;
    
    IF v_current_xp IS NULL THEN
      INSERT INTO player_progress (player_id, game_slug, xp, level)
      VALUES (p_player_id, p_game_slug, p_xp_amount, 1)
      RETURNING xp, level INTO v_new_xp, v_new_level;
    ELSE
      v_new_xp := v_current_xp + p_xp_amount;
      v_new_level := v_current_level;
      
      -- Check for level ups
      LOOP
        v_xp_to_next := calculate_xp_for_level(v_new_level);
        EXIT WHEN v_new_xp < v_xp_to_next;
        v_new_xp := v_new_xp - v_xp_to_next;
        v_new_level := v_new_level + 1;
        v_levels_gained := v_levels_gained + 1;
      END LOOP;
      
      UPDATE player_progress
      SET xp = v_new_xp,
          level = v_new_level,
          xp_to_next_level = calculate_xp_for_level(v_new_level),
          updated_at = now()
      WHERE player_id = p_player_id AND game_slug = p_game_slug;
    END IF;
  ELSE
    -- Global XP
    SELECT xp, level INTO v_current_xp, v_current_level
    FROM players WHERE id = p_player_id;
    
    v_new_xp := COALESCE(v_current_xp, 0) + p_xp_amount;
    v_new_level := COALESCE(v_current_level, 1);
    
    LOOP
      v_xp_to_next := calculate_xp_for_level(v_new_level);
      EXIT WHEN v_new_xp < v_xp_to_next;
      v_new_xp := v_new_xp - v_xp_to_next;
      v_new_level := v_new_level + 1;
      v_levels_gained := v_levels_gained + 1;
    END LOOP;
    
    UPDATE players
    SET xp = v_new_xp,
        level = v_new_level,
        updated_at = now()
    WHERE id = p_player_id;
  END IF;
  
  v_result := jsonb_build_object(
    'xp_awarded', p_xp_amount,
    'new_xp', v_new_xp,
    'new_level', v_new_level,
    'levels_gained', v_levels_gained
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record match result and update stats
CREATE OR REPLACE FUNCTION record_match_result(
  p_match_id UUID,
  p_winning_team INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_match RECORD;
  v_player RECORD;
  v_xp_award INTEGER;
  v_mmr_change INTEGER;
BEGIN
  -- Get match info
  SELECT * INTO v_match FROM arcade_matches WHERE id = p_match_id;
  
  -- Update each player
  FOR v_player IN 
    SELECT * FROM match_players WHERE match_id = p_match_id AND NOT is_ai
  LOOP
    -- Calculate result
    IF v_player.team = p_winning_team THEN
      UPDATE match_players SET result = 'win' WHERE id = v_player.id;
      v_xp_award := 100 + (v_player.kills * 10) + (v_player.assists * 5);
    ELSIF p_winning_team IS NULL THEN
      UPDATE match_players SET result = 'draw' WHERE id = v_player.id;
      v_xp_award := 50 + (v_player.kills * 5);
    ELSE
      UPDATE match_players SET result = 'loss' WHERE id = v_player.id;
      v_xp_award := 25 + (v_player.kills * 5);
    END IF;
    
    -- Award XP
    PERFORM award_player_xp(v_player.player_id, v_xp_award, v_match.game_id);
    
    -- Update player progress stats
    UPDATE player_progress
    SET 
      total_matches = total_matches + 1,
      total_wins = total_wins + CASE WHEN v_player.result = 'win' THEN 1 ELSE 0 END,
      total_losses = total_losses + CASE WHEN v_player.result = 'loss' THEN 1 ELSE 0 END,
      total_draws = total_draws + CASE WHEN v_player.result = 'draw' THEN 1 ELSE 0 END,
      total_kills = total_kills + v_player.kills,
      total_deaths = total_deaths + v_player.deaths,
      total_assists = total_assists + v_player.assists,
      last_played_at = now(),
      updated_at = now()
    WHERE player_id = v_player.player_id AND game_slug = v_match.game_id;
    
    -- Update MMR for ranked matches
    IF v_match.is_ranked THEN
      v_mmr_change := CASE 
        WHEN v_player.result = 'win' THEN 25
        WHEN v_player.result = 'loss' THEN -25
        ELSE 0
      END;
      
      UPDATE arcade_player_rankings
      SET 
        mmr = GREATEST(0, mmr + v_mmr_change),
        peak_mmr = GREATEST(peak_mmr, mmr + v_mmr_change),
        season_wins = season_wins + CASE WHEN v_player.result = 'win' THEN 1 ELSE 0 END,
        season_losses = season_losses + CASE WHEN v_player.result = 'loss' THEN 1 ELSE 0 END,
        updated_at = now(),
        last_match_at = now()
      WHERE player_id = v_player.player_id AND game_id = v_match.game_id;
      
      UPDATE match_players SET mmr_change = v_mmr_change WHERE id = v_player.id;
    END IF;
    
    -- Record XP earned
    UPDATE match_players SET xp_earned = v_xp_award WHERE id = v_player.id;
  END LOOP;
  
  -- Mark match as completed
  UPDATE arcade_matches
  SET status = 'completed', ended_at = now()
  WHERE id = p_match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get active online players count
CREATE OR REPLACE FUNCTION get_online_players_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM players WHERE status IN ('online', 'in_game'));
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 17. REALTIME SUBSCRIPTIONS
-- ============================================================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE player_friends;
ALTER PUBLICATION supabase_realtime ADD TABLE player_parties;
ALTER PUBLICATION supabase_realtime ADD TABLE match_players;

-- ============================================================================
-- 18. SEED FLAGSHIP GAME
-- ============================================================================

INSERT INTO games (
  slug, title, description, genre, engine,
  is_flagship, supports_multiplayer, supports_ranked, supports_ai,
  supports_spectator, supports_replay, min_players, max_players, team_sizes,
  status, version
) VALUES (
  'lucy-ascension',
  'Lucy: Ascension',
  'AAA tactical FPS with AI-driven combat. 5v5 competitive multiplayer, co-op survival, and story campaign.',
  'fps',
  'webgpu',
  true,
  true,
  true,
  true,
  true,
  true,
  1,
  16,
  ARRAY[1, 2, 4, 5, 8],
  'active',
  '1.0.0'
) ON CONFLICT (slug) DO UPDATE SET
  is_flagship = true,
  updated_at = now();

-- Insert game modes for flagship
INSERT INTO game_modes (game_id, slug, mode_name, description, min_players, max_players, team_count, players_per_team, is_ranked, is_casual, time_limit_seconds, score_limit, round_count) 
SELECT 
  g.id,
  m.slug,
  m.mode_name,
  m.description,
  m.min_players,
  m.max_players,
  m.team_count,
  m.players_per_team,
  m.is_ranked,
  m.is_casual,
  m.time_limit_seconds,
  m.score_limit,
  m.round_count
FROM games g
CROSS JOIN (VALUES
  ('arena-ranked', 'Ascension Arena (Ranked)', '5v5 competitive tactical combat with ranked matchmaking', 10, 10, 2, 5, true, false, 1800, NULL, 13),
  ('arena-casual', 'Ascension Arena (Casual)', '5v5 tactical combat with relaxed matchmaking', 2, 10, 2, 5, false, true, 1200, NULL, 7),
  ('campaign', 'Neural Campaign', 'Story-driven single-player or co-op missions', 1, 4, 1, 4, false, true, NULL, NULL, 1),
  ('survival', 'Quantum Ops', '4-player co-op survival against AI waves', 1, 4, 1, 4, false, true, NULL, 50, 1),
  ('training', 'Training Grounds', 'Practice aim, movement, and abilities', 1, 1, 1, 1, false, true, NULL, NULL, 1),
  ('custom', 'Custom Match', 'Create custom matches with your own rules', 2, 16, 2, 8, false, false, NULL, NULL, 1)
) AS m(slug, mode_name, description, min_players, max_players, team_count, players_per_team, is_ranked, is_casual, time_limit_seconds, score_limit, round_count)
WHERE g.slug = 'lucy-ascension'
ON CONFLICT (game_id, slug) DO NOTHING;

-- ============================================================================
-- 19. TABLE COMMENTS
-- ============================================================================

COMMENT ON TABLE players IS 'Global player identity across Lucy Arcade';
COMMENT ON TABLE games IS 'Registry of all Lucy Arcade games';
COMMENT ON TABLE game_modes IS 'Game modes like Arena, Campaign, Co-op, Ranked';
COMMENT ON TABLE match_players IS 'Detailed participation records for each match';
COMMENT ON TABLE ai_opponents IS 'AI personality profiles and difficulty configurations';
COMMENT ON TABLE player_progress IS 'Per-game progression, stats, and unlocks';
COMMENT ON TABLE player_friends IS 'Friend relationships between players';
COMMENT ON TABLE player_parties IS 'Party/squad system for group play';
COMMENT ON TABLE leaderboards IS 'Leaderboard definitions';
COMMENT ON TABLE leaderboard_entries IS 'Player rankings on leaderboards';
COMMENT ON TABLE achievements IS 'Achievement definitions';
COMMENT ON TABLE player_achievements IS 'Player achievement progress and unlocks';
COMMENT ON TABLE seasons IS 'Season definitions with battle pass';
COMMENT ON TABLE player_transactions IS 'Currency transactions for economy';

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
