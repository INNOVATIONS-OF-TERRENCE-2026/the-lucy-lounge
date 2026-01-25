-- =====================================================
-- THE LUCY LOUNGE - Final Stabilization Migration
-- Migration: 20260124120000_final_stabilization.sql
-- 
-- This migration completes all remaining schema needs:
-- - Legacy import tracking
-- - Memory items table
-- - Missing indexes
-- - RLS policy hardening
-- - Admin bypass functions
-- =====================================================

-- =====================================================
-- 1. LEGACY IMPORT LOG (Track migrated data)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.legacy_import_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('lovable_cloud', 'localstorage', 'manual', 'system')),
  entity_type TEXT NOT NULL, -- 'profile', 'preferences', 'conversation', 'message', etc.
  entity_id UUID,
  source_data JSONB,
  import_status TEXT NOT NULL DEFAULT 'pending' CHECK (import_status IN ('pending', 'success', 'failed', 'skipped')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.legacy_import_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_legacy_import_user ON public.legacy_import_log(user_id);
CREATE INDEX IF NOT EXISTS idx_legacy_import_status ON public.legacy_import_log(import_status);
CREATE INDEX IF NOT EXISTS idx_legacy_import_source ON public.legacy_import_log(source);

-- RLS: Users can view their own import logs, admins can view all
CREATE POLICY "Users can view their own import logs"
  ON public.legacy_import_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Service role can insert (for Edge Functions)
CREATE POLICY "Service can insert import logs"
  ON public.legacy_import_log FOR INSERT
  TO service_role
  WITH CHECK (true);

-- =====================================================
-- 2. MEMORY ITEMS (AI Memory - if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.memory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  memory_type TEXT NOT NULL DEFAULT 'general' CHECK (memory_type IN ('fact', 'preference', 'emotional', 'context', 'general')),
  content TEXT NOT NULL,
  importance NUMERIC(3,2) DEFAULT 0.5 CHECK (importance >= 0 AND importance <= 1),
  metadata JSONB DEFAULT '{}',
  -- Note: embedding column omitted - add pgvector extension first if semantic search needed
  source TEXT DEFAULT 'conversation',
  created_at TIMESTAMPTZ DEFAULT now(),
  last_accessed TIMESTAMPTZ DEFAULT now(),
  access_count INTEGER DEFAULT 0
);

ALTER TABLE public.memory_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_memory_items_user ON public.memory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_items_type ON public.memory_items(user_id, memory_type);
CREATE INDEX IF NOT EXISTS idx_memory_items_importance ON public.memory_items(user_id, importance DESC);

-- RLS for memory_items
CREATE POLICY "Users can view their own memories"
  ON public.memory_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own memories"
  ON public.memory_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories"
  ON public.memory_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories"
  ON public.memory_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. CHAT CONVERSATIONS (Alias for conversations)
-- =====================================================

-- Create view for backwards compatibility if needed
CREATE OR REPLACE VIEW public.chat_conversations AS
SELECT * FROM public.conversations;

CREATE OR REPLACE VIEW public.chat_messages AS
SELECT * FROM public.messages;

-- =====================================================
-- 4. MISSING INDEXES FOR PERFORMANCE
-- =====================================================

-- Conversations
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON public.conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_pinned ON public.conversations(user_id, pinned) WHERE pinned = true;
CREATE INDEX IF NOT EXISTS idx_conversations_archived ON public.conversations(user_id, archived) WHERE archived = false;

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_role ON public.messages(conversation_id, role);

-- User preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_updated ON public.user_preferences(updated_at DESC);

-- User sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active ON public.user_sessions(last_active_at DESC) WHERE is_active = true;

-- Spotify connections
CREATE INDEX IF NOT EXISTS idx_spotify_active ON public.spotify_connections(user_id) WHERE is_active = true;

-- Recently played
CREATE INDEX IF NOT EXISTS idx_recently_played_type ON public.recently_played(user_id, content_type);

-- =====================================================
-- 5. RLS HARDENING - Ensure all tables have policies
-- =====================================================

-- Verify conversations RLS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Admins can delete any conversation'
  ) THEN
    CREATE POLICY "Admins can delete any conversation"
      ON public.conversations FOR DELETE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Verify messages RLS for admin
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Admins can delete any message'
  ) THEN
    CREATE POLICY "Admins can delete any message"
      ON public.messages FOR DELETE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- =====================================================
-- 6. ADMIN BYPASS HELPER FUNCTIONS
-- =====================================================

-- Check if current user is admin (for RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Safe user profile creation (for first-run bootstrap)
CREATE OR REPLACE FUNCTION public.ensure_user_profile(
  p_user_id UUID,
  p_email TEXT,
  p_name TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.profiles;
BEGIN
  -- Try to get existing profile
  SELECT * INTO result FROM public.profiles WHERE id = p_user_id;
  
  IF FOUND THEN
    RETURN result;
  END IF;
  
  -- Create new profile
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (p_user_id, p_email, COALESCE(p_name, split_part(p_email, '@', 1)), p_avatar_url)
  ON CONFLICT (id) DO UPDATE SET
    updated_at = now()
  RETURNING * INTO result;
  
  -- Log the import
  INSERT INTO public.legacy_import_log (user_id, source, entity_type, entity_id, import_status)
  VALUES (p_user_id, 'system', 'profile', p_user_id, 'success');
  
  RETURN result;
END;
$$;

-- Safe preferences creation
CREATE OR REPLACE FUNCTION public.ensure_user_preferences(
  p_user_id UUID,
  p_defaults JSONB DEFAULT '{}'
)
RETURNS public.user_preferences
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.user_preferences;
BEGIN
  -- Try to get existing preferences
  SELECT * INTO result FROM public.user_preferences WHERE user_id = p_user_id;
  
  IF FOUND THEN
    RETURN result;
  END IF;
  
  -- Create with defaults
  INSERT INTO public.user_preferences (
    user_id,
    theme,
    music_enabled,
    music_volume,
    sound_enabled,
    shuffle_enabled,
    active_world,
    spotify_content_id,
    spotify_genre
  )
  VALUES (
    p_user_id,
    COALESCE(p_defaults->>'theme', 'midnight-purple'),
    COALESCE((p_defaults->>'music_enabled')::boolean, false),
    COALESCE((p_defaults->>'music_volume')::numeric, 0.5),
    COALESCE((p_defaults->>'sound_enabled')::boolean, true),
    COALESCE((p_defaults->>'shuffle_enabled')::boolean, true),
    COALESCE(p_defaults->>'active_world', 'none'),
    p_defaults->>'spotify_content_id',
    p_defaults->>'spotify_genre'
  )
  ON CONFLICT (user_id) DO NOTHING
  RETURNING * INTO result;
  
  -- Fallback select if conflict
  IF result IS NULL THEN
    SELECT * INTO result FROM public.user_preferences WHERE user_id = p_user_id;
  END IF;
  
  RETURN result;
END;
$$;

-- =====================================================
-- 7. SPOTIFY TOKEN MANAGEMENT FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION public.upsert_spotify_connection(
  p_user_id UUID,
  p_spotify_user_id TEXT,
  p_display_name TEXT,
  p_email TEXT,
  p_access_token TEXT,
  p_refresh_token TEXT,
  p_expires_at TIMESTAMPTZ,
  p_scopes TEXT[]
)
RETURNS public.spotify_connections
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.spotify_connections;
BEGIN
  INSERT INTO public.spotify_connections (
    user_id, spotify_user_id, display_name, email,
    access_token, refresh_token, token_expires_at, scopes,
    is_active, last_sync_at
  )
  VALUES (
    p_user_id, p_spotify_user_id, p_display_name, p_email,
    p_access_token, p_refresh_token, p_expires_at, p_scopes,
    true, now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    spotify_user_id = EXCLUDED.spotify_user_id,
    display_name = EXCLUDED.display_name,
    email = EXCLUDED.email,
    access_token = EXCLUDED.access_token,
    refresh_token = EXCLUDED.refresh_token,
    token_expires_at = EXCLUDED.token_expires_at,
    scopes = EXCLUDED.scopes,
    is_active = true,
    last_sync_at = now()
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- Disconnect Spotify gracefully
CREATE OR REPLACE FUNCTION public.disconnect_spotify(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.spotify_connections
  SET 
    is_active = false,
    access_token = NULL,
    refresh_token = NULL
  WHERE user_id = p_user_id;
END;
$$;

-- =====================================================
-- 8. DATA CLEANUP HELPERS (NON-DESTRUCTIVE)
-- =====================================================

-- Find orphaned records (for diagnostics)
CREATE OR REPLACE FUNCTION public.find_orphaned_records()
RETURNS TABLE (
  table_name TEXT,
  orphan_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 'conversations'::TEXT, COUNT(*)
  FROM public.conversations c
  WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = c.user_id)
  UNION ALL
  SELECT 'messages'::TEXT, COUNT(*)
  FROM public.messages m
  WHERE NOT EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = m.conversation_id)
  UNION ALL
  SELECT 'user_preferences'::TEXT, COUNT(*)
  FROM public.user_preferences up
  WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = up.user_id)
  UNION ALL
  SELECT 'recently_played'::TEXT, COUNT(*)
  FROM public.recently_played rp
  WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = rp.user_id);
END;
$$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
