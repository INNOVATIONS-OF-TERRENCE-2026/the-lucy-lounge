-- =====================================================
-- THE LUCY LOUNGE - Clean Production Migration
-- Migration: 20260124_production_schema_completion.sql
-- 
-- This migration completes the Supabase schema to fully
-- replace Lovable Cloud persistence with:
-- - User preferences (localStorage → database)
-- - Session management
-- - Spotify state persistence
-- - Recently played tracking
-- - Enhanced AI memory system
-- =====================================================

-- =====================================================
-- 1. USER PREFERENCES (Consolidates all localStorage)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Theme & Display
  theme TEXT DEFAULT 'midnight-purple',
  reading_mode TEXT DEFAULT 'normal' CHECK (reading_mode IN ('normal', 'sepia', 'dark', 'high-contrast')),
  focus_mode BOOLEAN DEFAULT false,
  
  -- Audio Settings
  music_enabled BOOLEAN DEFAULT false,
  music_volume NUMERIC(3,2) DEFAULT 0.5 CHECK (music_volume >= 0 AND music_volume <= 1),
  sound_enabled BOOLEAN DEFAULT true,
  shuffle_enabled BOOLEAN DEFAULT true,
  
  -- AI Settings
  streaming_speed TEXT DEFAULT 'normal' CHECK (streaming_speed IN ('slow', 'normal', 'fast')),
  voice_enabled BOOLEAN DEFAULT true,
  
  -- Lucy Worlds
  active_world TEXT DEFAULT 'none',
  world_enabled BOOLEAN DEFAULT false,
  
  -- Spotify State
  spotify_content_id TEXT,
  spotify_content_type TEXT DEFAULT 'playlist' CHECK (spotify_content_type IN ('playlist', 'album', 'track')),
  spotify_genre TEXT,
  
  -- Weather/Ambient
  weather_season TEXT,
  weather_enabled BOOLEAN DEFAULT false,
  
  -- Arcade
  arcade_difficulty TEXT DEFAULT 'medium' CHECK (arcade_difficulty IN ('easy', 'medium', 'hard')),
  arcade_muted BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Auto-create preferences on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger after profile creation
DROP TRIGGER IF EXISTS on_profile_created_preferences ON public.profiles;
CREATE TRIGGER on_profile_created_preferences
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_preferences();

-- =====================================================
-- 2. USER SESSIONS (Track active sessions)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  device_info JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  last_active_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON public.user_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_user_sessions_token ON public.user_sessions(session_token);

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.user_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.user_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON public.user_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. RECENTLY PLAYED (Track listening history)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.recently_played (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('spotify', 'ambient', 'audio_generation', 'youtube')),
  content_id TEXT NOT NULL,
  title TEXT,
  artist TEXT,
  genre TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  played_at TIMESTAMPTZ DEFAULT now(),
  play_count INTEGER DEFAULT 1,
  UNIQUE(user_id, content_type, content_id)
);

ALTER TABLE public.recently_played ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_recently_played_user ON public.recently_played(user_id, played_at DESC);

-- RLS Policies for recently_played
CREATE POLICY "Users can view their own recently played"
  ON public.recently_played FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recently played"
  ON public.recently_played FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recently played"
  ON public.recently_played FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recently played"
  ON public.recently_played FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Upsert function for recently played
CREATE OR REPLACE FUNCTION public.upsert_recently_played(
  p_user_id UUID,
  p_content_type TEXT,
  p_content_id TEXT,
  p_title TEXT DEFAULT NULL,
  p_artist TEXT DEFAULT NULL,
  p_genre TEXT DEFAULT NULL,
  p_thumbnail_url TEXT DEFAULT NULL,
  p_duration_seconds INTEGER DEFAULT NULL
)
RETURNS public.recently_played
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.recently_played;
BEGIN
  INSERT INTO public.recently_played (
    user_id, content_type, content_id, title, artist, genre, thumbnail_url, duration_seconds
  ) VALUES (
    p_user_id, p_content_type, p_content_id, p_title, p_artist, p_genre, p_thumbnail_url, p_duration_seconds
  )
  ON CONFLICT (user_id, content_type, content_id) DO UPDATE SET
    played_at = now(),
    play_count = recently_played.play_count + 1,
    title = COALESCE(EXCLUDED.title, recently_played.title),
    artist = COALESCE(EXCLUDED.artist, recently_played.artist),
    genre = COALESCE(EXCLUDED.genre, recently_played.genre),
    thumbnail_url = COALESCE(EXCLUDED.thumbnail_url, recently_played.thumbnail_url)
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- =====================================================
-- 4. SPOTIFY CONNECTIONS (For future OAuth)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.spotify_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  spotify_user_id TEXT,
  display_name TEXT,
  email TEXT,
  access_token TEXT,  -- Encrypted in production
  refresh_token TEXT, -- Encrypted in production
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  connected_at TIMESTAMPTZ DEFAULT now(),
  last_sync_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.spotify_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for spotify_connections
CREATE POLICY "Users can view their own spotify connection"
  ON public.spotify_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own spotify connection"
  ON public.spotify_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spotify connection"
  ON public.spotify_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spotify connection"
  ON public.spotify_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- 5. ENHANCED USER MEMORIES (AI Long-term Memory)
-- =====================================================

-- Add index for faster memory retrieval if not exists
CREATE INDEX IF NOT EXISTS idx_user_memories_user_type 
  ON public.user_memories(user_id, memory_type);

CREATE INDEX IF NOT EXISTS idx_user_memories_content_search 
  ON public.user_memories USING gin(to_tsvector('english', content));

-- Memory importance scoring function
CREATE OR REPLACE FUNCTION public.score_memory_importance(
  p_memory_type TEXT,
  p_content TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  base_score NUMERIC := 0.5;
BEGIN
  -- Type-based scoring
  CASE p_memory_type
    WHEN 'fact' THEN base_score := 0.8;
    WHEN 'preference' THEN base_score := 0.7;
    WHEN 'emotional' THEN base_score := 0.9;
    WHEN 'general' THEN base_score := 0.4;
    ELSE base_score := 0.5;
  END CASE;
  
  -- Content length bonus (longer = more detailed = more important)
  IF length(p_content) > 100 THEN
    base_score := base_score + 0.1;
  END IF;
  
  -- Recency from metadata (if provided)
  IF p_metadata ? 'mentions_count' THEN
    base_score := base_score + (0.05 * LEAST((p_metadata->>'mentions_count')::int, 5));
  END IF;
  
  RETURN LEAST(base_score, 1.0);
END;
$$;

-- =====================================================
-- 6. CONVERSATION CONTEXT (Enhanced)
-- =====================================================

-- Ensure conversation_context has all needed fields
DO $$
BEGIN
  -- Add persona field if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversation_context' AND column_name = 'persona'
  ) THEN
    ALTER TABLE public.conversation_context ADD COLUMN persona TEXT DEFAULT 'default';
  END IF;
  
  -- Add mood field if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversation_context' AND column_name = 'mood'
  ) THEN
    ALTER TABLE public.conversation_context ADD COLUMN mood TEXT;
  END IF;
  
  -- Add message_count if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversation_context' AND column_name = 'message_count'
  ) THEN
    ALTER TABLE public.conversation_context ADD COLUMN message_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- =====================================================
-- 7. ANALYTICS ENHANCEMENT
-- =====================================================

-- Create analytics summary view for admins
CREATE OR REPLACE VIEW public.analytics_summary AS
SELECT 
  DATE_TRUNC('day', created_at) as day,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_events,
  event_type,
  COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
  COUNT(*) FILTER (WHERE event_type = 'chat_message') as chat_messages,
  COUNT(*) FILTER (WHERE event_type = 'audio_play') as audio_plays
FROM public.analytics_events
WHERE created_at > now() - interval '30 days'
GROUP BY DATE_TRUNC('day', created_at), event_type
ORDER BY day DESC;

-- =====================================================
-- 8. REALTIME SUBSCRIPTIONS
-- =====================================================

-- Enable realtime for key tables (ignore if already exists)
DO $$
BEGIN
  -- Check and add tables to realtime publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'user_preferences'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_preferences;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'recently_played'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.recently_played;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignore errors for already-added tables
  NULL;
END $$;

-- =====================================================
-- 9. HELPER FUNCTIONS
-- =====================================================

-- Get or create user preferences
CREATE OR REPLACE FUNCTION public.get_user_preferences(p_user_id UUID)
RETURNS public.user_preferences
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prefs public.user_preferences;
BEGIN
  SELECT * INTO prefs FROM public.user_preferences WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.user_preferences (user_id)
    VALUES (p_user_id)
    RETURNING * INTO prefs;
  END IF;
  
  RETURN prefs;
END;
$$;

-- Update user preference (single field)
CREATE OR REPLACE FUNCTION public.update_user_preference(
  p_user_id UUID,
  p_key TEXT,
  p_value TEXT
)
RETURNS public.user_preferences
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.user_preferences;
BEGIN
  EXECUTE format(
    'UPDATE public.user_preferences SET %I = $1, updated_at = now() WHERE user_id = $2 RETURNING *',
    p_key
  ) USING p_value, p_user_id INTO result;
  
  RETURN result;
END;
$$;

-- Get conversation with context
CREATE OR REPLACE FUNCTION public.get_conversation_with_context(p_conversation_id UUID)
RETURNS TABLE (
  conversation public.conversations,
  context public.conversation_context,
  message_count BIGINT,
  last_message_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.*,
    ctx.*,
    (SELECT COUNT(*) FROM public.messages m WHERE m.conversation_id = c.id),
    (SELECT MAX(created_at) FROM public.messages m WHERE m.conversation_id = c.id)
  FROM public.conversations c
  LEFT JOIN public.conversation_context ctx ON ctx.conversation_id = c.id
  WHERE c.id = p_conversation_id;
END;
$$;

-- =====================================================
-- 10. UPDATED_AT TRIGGERS
-- =====================================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply to user_preferences
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 11. CREATE INITIAL ADMIN USER (if needed)
-- =====================================================

-- Function to grant admin role
CREATE OR REPLACE FUNCTION public.grant_admin_role(p_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
