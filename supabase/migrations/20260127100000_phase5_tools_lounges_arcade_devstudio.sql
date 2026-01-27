-- ============================================================================
-- THE LUCY LOUNGE — PHASE V: TOOLS, LOUNGES, ARCADE, DEV STUDIO
-- ============================================================================
-- This migration adds:
-- 1. Tool runs and outputs for AI tools
-- 2. Lounge sessions and artifacts
-- 3. Arcade expansion (33 games, lobbies, matches)
-- 4. Dev Studio projects and files
-- 5. Recommendations seeding
-- ============================================================================

-- ============================================================================
-- 1. TOOL RUNS & OUTPUTS
-- ============================================================================

-- Tool runs table (tracks all tool executions)
CREATE TABLE IF NOT EXISTS tool_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Tool identification
    tool_id TEXT NOT NULL,  -- 'summarizer', 'captioning', 'calculator', 'code-executor', 'web-fetcher'
    tool_version TEXT DEFAULT '1.0',
    
    -- Input
    input_type TEXT NOT NULL,  -- 'url', 'image', 'expression', 'code', 'text'
    input_data JSONB NOT NULL,  -- Stores the actual input (URL, code, expression, etc.)
    input_hash TEXT,  -- For deduplication/caching
    
    -- Execution
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    
    -- Cost tracking
    tokens_used INTEGER DEFAULT 0,
    estimated_cost DECIMAL(10,6) DEFAULT 0,
    
    -- Error handling
    error_code TEXT,
    error_message TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tool run outputs (stores results)
CREATE TABLE IF NOT EXISTS tool_run_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES tool_runs(id) ON DELETE CASCADE,
    
    -- Output type
    output_type TEXT NOT NULL,  -- 'summary', 'caption', 'result', 'console', 'html', 'metadata'
    
    -- Content
    content TEXT,  -- Main text content
    content_json JSONB,  -- Structured content
    
    -- For file outputs
    file_url TEXT,
    file_type TEXT,
    file_size INTEGER,
    
    -- Ordering (for multiple outputs)
    sequence INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for tool runs
CREATE INDEX IF NOT EXISTS idx_tool_runs_user ON tool_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_runs_tool ON tool_runs(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_runs_status ON tool_runs(status);
CREATE INDEX IF NOT EXISTS idx_tool_runs_created ON tool_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_run_outputs_run ON tool_run_outputs(run_id);

-- RLS for tool runs
ALTER TABLE tool_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_run_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tool_runs_user_access" ON tool_runs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "tool_run_outputs_user_access" ON tool_run_outputs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tool_runs
            WHERE tool_runs.id = tool_run_outputs.run_id
            AND tool_runs.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 2. LOUNGE SESSIONS & ARTIFACTS
-- ============================================================================

-- Lounge sessions (tracks user sessions in each lounge)
CREATE TABLE IF NOT EXISTS lounge_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Lounge identification
    lounge_type TEXT NOT NULL CHECK (lounge_type IN (
        'neural', 'dream', 'vision', 'silent', 'memory', 
        'quantum', 'presence', 'events', 'command'
    )),
    
    -- Session timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Session state
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
    
    -- AI model used
    ai_model TEXT,
    ai_mode TEXT,  -- 'focus', 'creative', 'analytical', etc.
    
    -- Session data
    session_data JSONB DEFAULT '{}',  -- Lounge-specific state
    preferences JSONB DEFAULT '{}',  -- User preferences for this session
    
    -- Metrics
    interactions_count INTEGER DEFAULT 0,
    artifacts_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lounge artifacts (stores outputs/results from lounge sessions)
CREATE TABLE IF NOT EXISTS lounge_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES lounge_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Artifact type
    artifact_type TEXT NOT NULL,  -- 'thought', 'vision', 'plan', 'dream', 'memory', 'insight', etc.
    
    -- Content
    title TEXT,
    content TEXT,
    content_json JSONB,
    
    -- AI attribution
    ai_generated BOOLEAN DEFAULT false,
    ai_model TEXT,
    
    -- Tags and categorization
    tags TEXT[] DEFAULT '{}',
    category TEXT,
    
    -- Visibility
    is_private BOOLEAN DEFAULT true,
    is_starred BOOLEAN DEFAULT false,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lounge presence (for real-time features like Silent Room)
CREATE TABLE IF NOT EXISTS lounge_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lounge_type TEXT NOT NULL,
    
    -- Presence state
    is_active BOOLEAN DEFAULT true,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Anonymous display
    display_name TEXT,  -- Optional anonymous name
    avatar_seed TEXT,  -- For generating anonymous avatars
    
    -- Activity
    activity_type TEXT,  -- 'meditating', 'thinking', 'creating', etc.
    
    UNIQUE(user_id, lounge_type)
);

-- Indexes for lounges
CREATE INDEX IF NOT EXISTS idx_lounge_sessions_user ON lounge_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_lounge_sessions_type ON lounge_sessions(lounge_type);
CREATE INDEX IF NOT EXISTS idx_lounge_sessions_status ON lounge_sessions(status);
CREATE INDEX IF NOT EXISTS idx_lounge_artifacts_session ON lounge_artifacts(session_id);
CREATE INDEX IF NOT EXISTS idx_lounge_artifacts_user ON lounge_artifacts(user_id);
CREATE INDEX IF NOT EXISTS idx_lounge_presence_type ON lounge_presence(lounge_type);

-- RLS for lounges
ALTER TABLE lounge_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lounge_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lounge_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lounge_sessions_user_access" ON lounge_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "lounge_artifacts_user_access" ON lounge_artifacts
    FOR ALL USING (auth.uid() = user_id OR is_private = false);

CREATE POLICY "lounge_presence_read" ON lounge_presence
    FOR SELECT USING (true);

CREATE POLICY "lounge_presence_write" ON lounge_presence
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 3. ARCADE EXPANSION (33 GAMES + MULTIPLAYER)
-- ============================================================================

-- Arcade games catalog (expanded)
CREATE TABLE IF NOT EXISTS arcade_games_catalog (
    id TEXT PRIMARY KEY,
    
    -- Basic info
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,  -- 'strategy', 'action', 'puzzle', 'sports', 'racing', 'shooter', 'arcade', 'card'
    
    -- Game config
    min_players INTEGER DEFAULT 1,
    max_players INTEGER DEFAULT 2,
    supports_ai BOOLEAN DEFAULT true,
    supports_pvp BOOLEAN DEFAULT false,
    supports_controller BOOLEAN DEFAULT false,
    
    -- Difficulty
    difficulty_levels TEXT[] DEFAULT ARRAY['easy', 'medium', 'hard'],
    default_difficulty TEXT DEFAULT 'medium',
    
    -- Assets
    thumbnail_url TEXT,
    banner_url TEXT,
    icon_url TEXT,
    
    -- Status
    is_enabled BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    
    -- Metadata
    controls_info JSONB DEFAULT '{}',  -- Keyboard/controller mappings
    instructions TEXT,
    tips TEXT[],
    
    -- Sorting
    sort_order INTEGER DEFAULT 100,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Arcade lobbies (for PvP matchmaking)
CREATE TABLE IF NOT EXISTS arcade_lobbies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Game
    game_id TEXT NOT NULL REFERENCES arcade_games_catalog(id),
    
    -- Host
    host_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Lobby settings
    name TEXT,
    is_public BOOLEAN DEFAULT true,
    max_players INTEGER DEFAULT 2,
    difficulty TEXT DEFAULT 'medium',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'starting', 'in_progress', 'completed', 'cancelled')),
    
    -- Invite code for private lobbies
    invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(4), 'hex'),
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Lobby participants
CREATE TABLE IF NOT EXISTS arcade_lobby_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lobby_id UUID NOT NULL REFERENCES arcade_lobbies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Status
    is_ready BOOLEAN DEFAULT false,
    is_host BOOLEAN DEFAULT false,
    
    -- Player slot
    slot_number INTEGER,
    
    -- Joined
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(lobby_id, user_id)
);

-- Arcade matches (game instances)
CREATE TABLE IF NOT EXISTS arcade_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Game
    game_id TEXT NOT NULL REFERENCES arcade_games_catalog(id),
    lobby_id UUID REFERENCES arcade_lobbies(id),
    
    -- Players
    player1_id UUID REFERENCES auth.users(id),
    player2_id UUID REFERENCES auth.users(id),  -- NULL for single player
    is_vs_ai BOOLEAN DEFAULT false,
    ai_difficulty TEXT,
    
    -- Match state
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
    
    -- Results
    winner_id UUID REFERENCES auth.users(id),
    is_draw BOOLEAN DEFAULT false,
    player1_score INTEGER,
    player2_score INTEGER,
    
    -- Game state (for resume/replay)
    game_state JSONB DEFAULT '{}',
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Match events (for real-time sync)
CREATE TABLE IF NOT EXISTS arcade_match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES arcade_matches(id) ON DELETE CASCADE,
    
    -- Event
    event_type TEXT NOT NULL,  -- 'move', 'action', 'score', 'pause', 'resume', 'end'
    event_data JSONB NOT NULL,
    
    -- Player
    player_id UUID REFERENCES auth.users(id),
    
    -- Sequence for ordering
    sequence INTEGER NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for arcade
CREATE INDEX IF NOT EXISTS idx_arcade_lobbies_game ON arcade_lobbies(game_id);
CREATE INDEX IF NOT EXISTS idx_arcade_lobbies_status ON arcade_lobbies(status);
CREATE INDEX IF NOT EXISTS idx_arcade_lobbies_host ON arcade_lobbies(host_user_id);
CREATE INDEX IF NOT EXISTS idx_arcade_lobby_participants_lobby ON arcade_lobby_participants(lobby_id);
CREATE INDEX IF NOT EXISTS idx_arcade_matches_game ON arcade_matches(game_id);
CREATE INDEX IF NOT EXISTS idx_arcade_matches_players ON arcade_matches(player1_id, player2_id);
CREATE INDEX IF NOT EXISTS idx_arcade_match_events_match ON arcade_match_events(match_id);

-- RLS for arcade
ALTER TABLE arcade_games_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE arcade_lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE arcade_lobby_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE arcade_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE arcade_match_events ENABLE ROW LEVEL SECURITY;

-- Games catalog is public read
CREATE POLICY "arcade_games_public_read" ON arcade_games_catalog
    FOR SELECT USING (true);

-- Lobbies are public read, host can manage
CREATE POLICY "arcade_lobbies_read" ON arcade_lobbies
    FOR SELECT USING (true);

CREATE POLICY "arcade_lobbies_manage" ON arcade_lobbies
    FOR ALL USING (auth.uid() = host_user_id);

-- Participants can join/leave
CREATE POLICY "arcade_participants_read" ON arcade_lobby_participants
    FOR SELECT USING (true);

CREATE POLICY "arcade_participants_manage" ON arcade_lobby_participants
    FOR ALL USING (auth.uid() = user_id);

-- Matches accessible to players
CREATE POLICY "arcade_matches_access" ON arcade_matches
    FOR ALL USING (
        auth.uid() = player1_id OR 
        auth.uid() = player2_id OR
        player2_id IS NULL  -- Single player games
    );

-- Match events accessible to match players
CREATE POLICY "arcade_match_events_access" ON arcade_match_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM arcade_matches
            WHERE arcade_matches.id = arcade_match_events.match_id
            AND (arcade_matches.player1_id = auth.uid() OR arcade_matches.player2_id = auth.uid())
        )
    );

-- ============================================================================
-- 4. DEV STUDIO PROJECTS & FILES
-- ============================================================================

-- Dev Studio projects
CREATE TABLE IF NOT EXISTS devstudio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Project info
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    
    -- Type
    project_type TEXT NOT NULL DEFAULT 'website' CHECK (project_type IN (
        'website', 'webapp', 'api', 'component', 'template'
    )),
    
    -- Template used
    template_id TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'building', 'deployed', 'archived')),
    
    -- Build config
    framework TEXT DEFAULT 'react',
    build_config JSONB DEFAULT '{}',
    
    -- Deployment
    deployed_url TEXT,
    custom_domain TEXT,
    
    -- Metadata
    thumbnail_url TEXT,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    
    -- Stats
    views_count INTEGER DEFAULT 0,
    forks_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, slug)
);

-- Dev Studio files (virtual file system)
CREATE TABLE IF NOT EXISTS devstudio_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES devstudio_projects(id) ON DELETE CASCADE,
    
    -- File path
    path TEXT NOT NULL,  -- e.g., '/src/App.tsx', '/public/index.html'
    name TEXT NOT NULL,
    
    -- Type
    file_type TEXT NOT NULL DEFAULT 'file' CHECK (file_type IN ('file', 'directory')),
    mime_type TEXT,
    
    -- Content (for files)
    content TEXT,
    content_binary BYTEA,  -- For binary files
    
    -- Metadata
    size_bytes INTEGER,
    is_generated BOOLEAN DEFAULT false,  -- AI-generated
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id, path)
);

-- Dev Studio versions (basic version history)
CREATE TABLE IF NOT EXISTS devstudio_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES devstudio_projects(id) ON DELETE CASCADE,
    
    -- Version info
    version_number INTEGER NOT NULL,
    version_name TEXT,
    description TEXT,
    
    -- Snapshot
    files_snapshot JSONB,  -- Snapshot of file paths and hashes
    
    -- Type
    version_type TEXT DEFAULT 'manual' CHECK (version_type IN ('manual', 'auto', 'deploy')),
    
    -- Author
    created_by UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project domains (for custom domain connection)
CREATE TABLE IF NOT EXISTS project_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES devstudio_projects(id) ON DELETE CASCADE,
    
    -- Domain
    domain TEXT NOT NULL UNIQUE,
    subdomain TEXT,  -- For *.lucylounge.dev subdomains
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verification_token TEXT DEFAULT encode(gen_random_bytes(16), 'hex'),
    verification_method TEXT DEFAULT 'cname' CHECK (verification_method IN ('cname', 'txt', 'file')),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- DNS records
    dns_records JSONB DEFAULT '[]',  -- Required DNS records
    
    -- SSL
    ssl_status TEXT DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'provisioning', 'active', 'failed')),
    ssl_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'removed')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for dev studio
CREATE INDEX IF NOT EXISTS idx_devstudio_projects_user ON devstudio_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_devstudio_projects_status ON devstudio_projects(status);
CREATE INDEX IF NOT EXISTS idx_devstudio_files_project ON devstudio_files(project_id);
CREATE INDEX IF NOT EXISTS idx_devstudio_versions_project ON devstudio_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_domains_project ON project_domains(project_id);

-- RLS for dev studio
ALTER TABLE devstudio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE devstudio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE devstudio_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "devstudio_projects_access" ON devstudio_projects
    FOR ALL USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "devstudio_files_access" ON devstudio_files
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM devstudio_projects
            WHERE devstudio_projects.id = devstudio_files.project_id
            AND (devstudio_projects.user_id = auth.uid() OR devstudio_projects.is_public = true)
        )
    );

CREATE POLICY "devstudio_versions_access" ON devstudio_versions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM devstudio_projects
            WHERE devstudio_projects.id = devstudio_versions.project_id
            AND devstudio_projects.user_id = auth.uid()
        )
    );

CREATE POLICY "project_domains_access" ON project_domains
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM devstudio_projects
            WHERE devstudio_projects.id = project_domains.project_id
            AND devstudio_projects.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 5. SEED ARCADE GAMES (33 GAMES)
-- ============================================================================

INSERT INTO arcade_games_catalog (id, name, description, category, min_players, max_players, supports_ai, supports_pvp, supports_controller, is_enabled, is_featured, sort_order, instructions, tips) VALUES
-- STRATEGY (6 games)
('chess', 'Chess Evolved', 'Classic chess with AI opponent', 'strategy', 1, 2, true, true, true, true, true, 1, 'Move pieces to checkmate your opponent''s king.', ARRAY['Control the center', 'Develop your pieces early', 'Castle to protect your king']),
('checkers', 'Checkers Pro', 'Classic checkers with multiple difficulty levels', 'strategy', 1, 2, true, true, true, true, false, 2, 'Jump over opponent pieces to capture them. Reach the opposite end to become a king.', ARRAY['Control the center', 'Keep pieces together', 'Sacrifice for position']),
('connect-four', 'Connect Four', 'Drop discs to connect four in a row', 'strategy', 1, 2, true, true, true, true, false, 3, 'Drop colored discs into the grid. First to connect four wins!', ARRAY['Control the center column', 'Block opponent threats', 'Create multiple threats']),
('reversi', 'Reversi', 'Flip opponent pieces to dominate the board', 'strategy', 1, 2, true, true, true, true, false, 4, 'Place pieces to flip opponent colors. Most pieces wins!', ARRAY['Corner positions are key', 'Avoid edges early', 'Think several moves ahead']),
('tic-tac-toe', 'Tic-Tac-Toe', 'Classic X and O game', 'strategy', 1, 2, true, true, true, true, false, 5, 'Get three in a row to win!', ARRAY['Take the center', 'Block opponent wins', 'Create forks']),
('battleship', 'Battleship', 'Naval warfare strategy game', 'strategy', 1, 2, true, true, false, true, false, 6, 'Place your ships and hunt down the enemy fleet!', ARRAY['Spread your ships', 'Use systematic search patterns', 'Remember hit locations']),

-- PUZZLE (6 games)
('memory-match', 'Memory Master', 'Test your memory with card matching', 'puzzle', 1, 1, false, false, true, true, true, 10, 'Match pairs of cards by remembering their positions.', ARRAY['Start from corners', 'Create mental patterns', 'Focus on one area at a time']),
('2048', '2048', 'Slide and merge tiles to reach 2048', 'puzzle', 1, 1, false, false, true, true, true, 11, 'Slide tiles to merge matching numbers. Reach 2048 to win!', ARRAY['Keep highest tile in corner', 'Build in one direction', 'Don''t chase small merges']),
('sudoku', 'Sudoku', 'Fill the grid with numbers 1-9', 'puzzle', 1, 1, false, false, false, true, false, 12, 'Fill each row, column, and 3x3 box with numbers 1-9.', ARRAY['Start with easy cells', 'Use elimination', 'Look for naked pairs']),
('sliding-puzzle', 'Sliding Puzzle', 'Slide tiles to complete the picture', 'puzzle', 1, 1, false, false, true, true, false, 13, 'Slide tiles to arrange them in order.', ARRAY['Work from top-left', 'Move in patterns', 'Plan several moves ahead']),
('word-search', 'Word Search', 'Find hidden words in the grid', 'puzzle', 1, 1, false, false, false, true, false, 14, 'Find all hidden words in any direction.', ARRAY['Scan systematically', 'Look for rare letters first', 'Check diagonals']),
('minesweeper', 'Minesweeper', 'Clear the minefield without detonating', 'puzzle', 1, 1, false, false, true, true, false, 15, 'Reveal cells and flag mines. Numbers show adjacent mines.', ARRAY['Start in corners', 'Use logic not luck', 'Flag certain mines']),

-- ACTION (6 games)
('snake', 'Snake Classic', 'Grow your snake by eating food', 'action', 1, 1, false, false, true, true, true, 20, 'Eat food to grow. Don''t hit walls or yourself!', ARRAY['Plan your path', 'Use edges wisely', 'Don''t trap yourself']),
('breakout', 'Breakout', 'Break all bricks with the ball', 'action', 1, 1, false, false, true, true, false, 21, 'Bounce the ball to break all bricks.', ARRAY['Aim for corners', 'Keep the ball controlled', 'Use paddle angles']),
('asteroids', 'Asteroids', 'Destroy asteroids and survive', 'action', 1, 1, false, false, true, true, false, 22, 'Shoot asteroids and avoid collisions.', ARRAY['Keep moving', 'Shoot large rocks first', 'Use thrust sparingly']),
('pong', 'Pong', 'Classic paddle ball game', 'action', 1, 2, true, true, true, true, false, 23, 'Hit the ball past your opponent''s paddle.', ARRAY['Anticipate ball trajectory', 'Use paddle edges for angles', 'Stay centered']),
('flappy-bird', 'Flappy Lucy', 'Navigate through pipes', 'action', 1, 1, false, false, true, true, false, 24, 'Tap to flap and avoid pipes!', ARRAY['Tap rhythmically', 'Stay in the middle', 'Don''t panic']),
('space-invaders', 'Space Invaders', 'Defend Earth from alien invasion', 'action', 1, 1, false, false, true, true, false, 25, 'Shoot the descending aliens before they reach you.', ARRAY['Prioritize edges', 'Use cover wisely', 'Time your shots']),

-- SHOOTER (5 games)
('cosmic-defender', 'Cosmic Defender', 'Defend the galaxy from waves of enemies', 'shooter', 1, 1, false, false, true, true, true, 30, 'Shoot enemies and collect power-ups to survive.', ARRAY['Keep moving', 'Prioritize power-ups', 'Learn enemy patterns']),
('tank-battle', 'Tank Battle', 'Strategic tank warfare', 'shooter', 1, 2, true, true, true, true, false, 31, 'Destroy enemy tanks while protecting your base.', ARRAY['Use terrain for cover', 'Protect your base', 'Flank enemies']),
('duck-hunt', 'Duck Hunt', 'Shoot ducks before they escape', 'shooter', 1, 1, false, false, true, true, false, 32, 'Aim and shoot ducks as they fly across the screen.', ARRAY['Lead your shots', 'Prioritize closer ducks', 'Watch for patterns']),
('zombie-survival', 'Zombie Survival', 'Survive waves of zombies', 'shooter', 1, 1, false, false, true, true, false, 33, 'Shoot zombies and survive as long as possible.', ARRAY['Headshots are key', 'Manage ammo', 'Keep moving']),
('target-practice', 'Target Practice', 'Test your accuracy', 'shooter', 1, 1, false, false, true, true, false, 34, 'Hit targets as accurately and quickly as possible.', ARRAY['Aim for center', 'Control your breathing', 'Speed comes with practice']),

-- SPORTS (5 games)
('basketball', 'Street Basketball', 'Shoot hoops and score points', 'sports', 1, 2, true, true, true, true, true, 40, 'Aim and shoot to score baskets.', ARRAY['Perfect your timing', 'Adjust for distance', 'Watch the arc']),
('soccer-penalty', 'Penalty Kicks', 'Score goals in penalty shootout', 'sports', 1, 2, true, true, true, true, false, 41, 'Aim and kick to score past the goalkeeper.', ARRAY['Vary your shots', 'Watch keeper movement', 'Power vs placement']),
('bowling', 'Bowling', 'Knock down all the pins', 'sports', 1, 2, true, true, true, true, false, 42, 'Roll the ball to knock down pins.', ARRAY['Aim for the pocket', 'Adjust for spin', 'Pick up spares']),
('golf', 'Mini Golf', 'Complete the course in fewest strokes', 'sports', 1, 2, true, true, true, true, false, 43, 'Putt the ball into the hole.', ARRAY['Read the green', 'Control power', 'Use walls wisely']),
('track-field', 'Track & Field', 'Olympic-style athletics', 'sports', 1, 2, true, true, true, true, true, 44, 'Compete in running, jumping, and throwing events.', ARRAY['Timing is everything', 'Mash buttons for speed', 'Perfect your angles']),

-- CARD (3 games)
('blackjack', 'Blackjack', 'Beat the dealer to 21', 'card', 1, 1, true, false, false, true, false, 50, 'Get closer to 21 than the dealer without going over.', ARRAY['Stand on 17+', 'Double on 11', 'Split aces and 8s']),
('solitaire', 'Solitaire', 'Classic card solitaire', 'card', 1, 1, false, false, false, true, false, 51, 'Stack cards in descending order, alternating colors.', ARRAY['Expose hidden cards', 'Use aces quickly', 'Plan moves ahead']),
('poker', 'Video Poker', 'Five-card draw poker', 'card', 1, 1, true, false, false, true, false, 52, 'Make the best five-card hand.', ARRAY['Keep high pairs', 'Draw to flushes', 'Know hand rankings']),

-- RACING (2 games)
('neon-racer', 'Neon Racer', 'High-speed neon racing', 'racing', 1, 2, true, true, true, true, true, 60, 'Race through neon tracks at high speed.', ARRAY['Master drifting', 'Use boost wisely', 'Learn track layouts']),
('endless-runner', 'Endless Runner', 'Run as far as you can', 'racing', 1, 1, false, false, true, true, false, 61, 'Dodge obstacles and run forever.', ARRAY['Stay focused', 'Learn patterns', 'Use power-ups'])

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    supports_ai = EXCLUDED.supports_ai,
    supports_pvp = EXCLUDED.supports_pvp,
    supports_controller = EXCLUDED.supports_controller,
    instructions = EXCLUDED.instructions,
    tips = EXCLUDED.tips,
    updated_at = NOW();

-- ============================================================================
-- 6. SEED FALLBACK RECOMMENDATIONS
-- ============================================================================

-- Insert fallback media nodes for "For You" if table exists and is empty
DO $$
BEGIN
    -- Check if media_nodes table exists and has few entries
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'media_nodes') THEN
        -- Insert some fallback content if needed
        INSERT INTO media_nodes (id, title, media_type, category, popularity_score, metadata)
        SELECT 
            gen_random_uuid(),
            title,
            media_type,
            category,
            popularity_score,
            metadata::jsonb
        FROM (VALUES
            ('Chill Vibes Mix', 'audio', 'music', 100, '{"genre": "lo-fi", "mood": "relaxing"}'),
            ('Focus Flow', 'audio', 'music', 95, '{"genre": "ambient", "mood": "focused"}'),
            ('Upbeat Energy', 'audio', 'music', 90, '{"genre": "electronic", "mood": "energetic"}'),
            ('Jazz Essentials', 'audio', 'music', 85, '{"genre": "jazz", "mood": "smooth"}'),
            ('Classical Focus', 'audio', 'music', 80, '{"genre": "classical", "mood": "focused"}'),
            ('Trending Now', 'video', 'entertainment', 100, '{"genre": "trending", "mood": "exciting"}'),
            ('Documentary Picks', 'video', 'documentary', 95, '{"genre": "documentary", "mood": "informative"}'),
            ('Comedy Highlights', 'video', 'comedy', 90, '{"genre": "comedy", "mood": "fun"}'),
            ('Action Essentials', 'video', 'action', 85, '{"genre": "action", "mood": "thrilling"}'),
            ('Drama Collection', 'video', 'drama', 80, '{"genre": "drama", "mood": "emotional"}')
        ) AS t(title, media_type, category, popularity_score, metadata)
        WHERE NOT EXISTS (
            SELECT 1 FROM media_nodes WHERE popularity_score > 0 LIMIT 1
        );
    END IF;
END $$;

-- ============================================================================
-- 7. RPC FUNCTIONS
-- ============================================================================

-- Create tool run
CREATE OR REPLACE FUNCTION create_tool_run(
    p_tool_id TEXT,
    p_input_type TEXT,
    p_input_data JSONB
)
RETURNS UUID AS $$
DECLARE
    v_run_id UUID;
BEGIN
    INSERT INTO tool_runs (user_id, tool_id, input_type, input_data, status, started_at)
    VALUES (auth.uid(), p_tool_id, p_input_type, p_input_data, 'running', NOW())
    RETURNING id INTO v_run_id;
    
    RETURN v_run_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complete tool run
CREATE OR REPLACE FUNCTION complete_tool_run(
    p_run_id UUID,
    p_status TEXT,
    p_output_type TEXT,
    p_content TEXT,
    p_content_json JSONB DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update run status
    UPDATE tool_runs
    SET 
        status = p_status,
        completed_at = NOW(),
        duration_ms = EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000,
        error_message = p_error_message,
        updated_at = NOW()
    WHERE id = p_run_id AND user_id = auth.uid();
    
    -- Insert output if successful
    IF p_status = 'completed' THEN
        INSERT INTO tool_run_outputs (run_id, output_type, content, content_json)
        VALUES (p_run_id, p_output_type, p_content, p_content_json);
    END IF;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user tool history
CREATE OR REPLACE FUNCTION get_tool_history(
    p_tool_id TEXT,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    tool_id TEXT,
    input_data JSONB,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    outputs JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tr.id,
        tr.tool_id,
        tr.input_data,
        tr.status,
        tr.created_at,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'type', tro.output_type,
                    'content', tro.content,
                    'content_json', tro.content_json
                )
            ) FILTER (WHERE tro.id IS NOT NULL),
            '[]'::jsonb
        ) as outputs
    FROM tool_runs tr
    LEFT JOIN tool_run_outputs tro ON tro.run_id = tr.id
    WHERE tr.user_id = auth.uid()
    AND (p_tool_id IS NULL OR tr.tool_id = p_tool_id)
    GROUP BY tr.id
    ORDER BY tr.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Start lounge session
CREATE OR REPLACE FUNCTION start_lounge_session(
    p_lounge_type TEXT,
    p_ai_mode TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
BEGIN
    -- End any active sessions for this lounge
    UPDATE lounge_sessions
    SET status = 'completed', ended_at = NOW(), duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))
    WHERE user_id = auth.uid() AND lounge_type = p_lounge_type AND status = 'active';
    
    -- Create new session
    INSERT INTO lounge_sessions (user_id, lounge_type, ai_mode, status)
    VALUES (auth.uid(), p_lounge_type, p_ai_mode, 'active')
    RETURNING id INTO v_session_id;
    
    -- Update presence
    INSERT INTO lounge_presence (user_id, lounge_type, is_active, last_seen)
    VALUES (auth.uid(), p_lounge_type, true, NOW())
    ON CONFLICT (user_id, lounge_type) DO UPDATE SET
        is_active = true,
        last_seen = NOW();
    
    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- End lounge session
CREATE OR REPLACE FUNCTION end_lounge_session(p_session_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_lounge_type TEXT;
BEGIN
    -- Get lounge type
    SELECT lounge_type INTO v_lounge_type
    FROM lounge_sessions
    WHERE id = p_session_id AND user_id = auth.uid();
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Update session
    UPDATE lounge_sessions
    SET 
        status = 'completed',
        ended_at = NOW(),
        duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at)),
        updated_at = NOW()
    WHERE id = p_session_id;
    
    -- Update presence
    UPDATE lounge_presence
    SET is_active = false, last_seen = NOW()
    WHERE user_id = auth.uid() AND lounge_type = v_lounge_type;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Save lounge artifact
CREATE OR REPLACE FUNCTION save_lounge_artifact(
    p_session_id UUID,
    p_artifact_type TEXT,
    p_title TEXT,
    p_content TEXT,
    p_content_json JSONB DEFAULT NULL,
    p_tags TEXT[] DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_artifact_id UUID;
BEGIN
    INSERT INTO lounge_artifacts (session_id, user_id, artifact_type, title, content, content_json, tags)
    VALUES (p_session_id, auth.uid(), p_artifact_type, p_title, p_content, p_content_json, p_tags)
    RETURNING id INTO v_artifact_id;
    
    -- Update session artifact count
    UPDATE lounge_sessions
    SET artifacts_count = artifacts_count + 1, updated_at = NOW()
    WHERE id = p_session_id;
    
    RETURN v_artifact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get lounge presence count
CREATE OR REPLACE FUNCTION get_lounge_presence(p_lounge_type TEXT)
RETURNS TABLE (
    active_count BIGINT,
    recent_activity JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE is_active AND last_seen > NOW() - INTERVAL '5 minutes') as active_count,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'display_name', COALESCE(display_name, 'Anonymous'),
                    'activity_type', activity_type,
                    'last_seen', last_seen
                )
            ) FILTER (WHERE is_active AND last_seen > NOW() - INTERVAL '5 minutes'),
            '[]'::jsonb
        ) as recent_activity
    FROM lounge_presence
    WHERE lounge_type = p_lounge_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create arcade lobby
CREATE OR REPLACE FUNCTION create_arcade_lobby(
    p_game_id TEXT,
    p_name TEXT DEFAULT NULL,
    p_is_public BOOLEAN DEFAULT true,
    p_max_players INTEGER DEFAULT 2
)
RETURNS UUID AS $$
DECLARE
    v_lobby_id UUID;
BEGIN
    -- Create lobby
    INSERT INTO arcade_lobbies (game_id, host_user_id, name, is_public, max_players)
    VALUES (p_game_id, auth.uid(), COALESCE(p_name, 'Game Lobby'), p_is_public, p_max_players)
    RETURNING id INTO v_lobby_id;
    
    -- Add host as participant
    INSERT INTO arcade_lobby_participants (lobby_id, user_id, is_ready, is_host, slot_number)
    VALUES (v_lobby_id, auth.uid(), true, true, 1);
    
    RETURN v_lobby_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Join arcade lobby
CREATE OR REPLACE FUNCTION join_arcade_lobby(p_lobby_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_count INTEGER;
    v_max_players INTEGER;
BEGIN
    -- Get lobby info
    SELECT max_players INTO v_max_players
    FROM arcade_lobbies
    WHERE id = p_lobby_id AND status = 'waiting';
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Check current count
    SELECT COUNT(*) INTO v_current_count
    FROM arcade_lobby_participants
    WHERE lobby_id = p_lobby_id;
    
    IF v_current_count >= v_max_players THEN
        RETURN false;
    END IF;
    
    -- Join lobby
    INSERT INTO arcade_lobby_participants (lobby_id, user_id, slot_number)
    VALUES (p_lobby_id, auth.uid(), v_current_count + 1)
    ON CONFLICT (lobby_id, user_id) DO NOTHING;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create dev studio project
CREATE OR REPLACE FUNCTION create_devstudio_project(
    p_name TEXT,
    p_project_type TEXT DEFAULT 'website',
    p_template_id TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_project_id UUID;
    v_slug TEXT;
BEGIN
    -- Generate slug
    v_slug := lower(regexp_replace(p_name, '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := v_slug || '-' || substr(gen_random_uuid()::text, 1, 8);
    
    -- Create project
    INSERT INTO devstudio_projects (user_id, name, slug, project_type, template_id)
    VALUES (auth.uid(), p_name, v_slug, p_project_type, p_template_id)
    RETURNING id INTO v_project_id;
    
    -- Create initial file structure
    INSERT INTO devstudio_files (project_id, path, name, file_type, content)
    VALUES
        (v_project_id, '/', 'root', 'directory', NULL),
        (v_project_id, '/src', 'src', 'directory', NULL),
        (v_project_id, '/public', 'public', 'directory', NULL),
        (v_project_id, '/src/App.tsx', 'App.tsx', 'file', 'export default function App() {\n  return (\n    <div>\n      <h1>Hello, World!</h1>\n    </div>\n  );\n}'),
        (v_project_id, '/src/index.css', 'index.css', 'file', '* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}'),
        (v_project_id, '/public/index.html', 'index.html', 'file', '<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>');
    
    -- Create initial version
    INSERT INTO devstudio_versions (project_id, version_number, version_name, version_type, created_by)
    VALUES (v_project_id, 1, 'Initial', 'auto', auth.uid());
    
    RETURN v_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update triggers
CREATE OR REPLACE FUNCTION update_tool_runs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tool_runs_timestamp
    BEFORE UPDATE ON tool_runs
    FOR EACH ROW
    EXECUTE FUNCTION update_tool_runs_updated_at();

CREATE TRIGGER update_lounge_sessions_timestamp
    BEFORE UPDATE ON lounge_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_tool_runs_updated_at();

CREATE TRIGGER update_lounge_artifacts_timestamp
    BEFORE UPDATE ON lounge_artifacts
    FOR EACH ROW
    EXECUTE FUNCTION update_tool_runs_updated_at();

CREATE TRIGGER update_devstudio_projects_timestamp
    BEFORE UPDATE ON devstudio_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_tool_runs_updated_at();

CREATE TRIGGER update_devstudio_files_timestamp
    BEFORE UPDATE ON devstudio_files
    FOR EACH ROW
    EXECUTE FUNCTION update_tool_runs_updated_at();
