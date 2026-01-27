-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║  THE LUCY LOUNGE - MISSING TABLES FIX                                        ║
-- ║  Migration: 20260128200000_missing_tables_health_scene.sql                    ║
-- ║  Purpose: Add health_check and scene_activity_log tables referenced in code  ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE: health_check
-- Purpose: Simple connectivity check table for EnvironmentGuard
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.health_check (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text DEFAULT 'ok',
  checked_at timestamptz DEFAULT now()
);

-- Insert a single row for health checks
INSERT INTO public.health_check (status) VALUES ('healthy') ON CONFLICT DO NOTHING;

-- Enable RLS but allow public reads (for connectivity checks)
ALTER TABLE public.health_check ENABLE ROW LEVEL SECURITY;

-- Create policy if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read health_check' AND tablename = 'health_check') THEN
    CREATE POLICY "Anyone can read health_check" ON public.health_check FOR SELECT TO public USING (true);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE: scene_activity_log
-- Purpose: Log scene suggestions and user interactions
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.scene_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scene_type text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  chat_context jsonb,
  duration_seconds integer,
  interaction_quality text
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scene_activity_log_user_id 
  ON public.scene_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_scene_activity_log_timestamp 
  ON public.scene_activity_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_scene_activity_log_scene_type 
  ON public.scene_activity_log(scene_type);

-- Enable RLS
ALTER TABLE public.scene_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own scene activity
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own scene activity' AND tablename = 'scene_activity_log') THEN
    CREATE POLICY "Users can read own scene activity" ON public.scene_activity_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own scene activity' AND tablename = 'scene_activity_log') THEN
    CREATE POLICY "Users can insert own scene activity" ON public.scene_activity_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own scene activity' AND tablename = 'scene_activity_log') THEN
    CREATE POLICY "Users can update own scene activity" ON public.scene_activity_log FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own scene activity' AND tablename = 'scene_activity_log') THEN
    CREATE POLICY "Users can delete own scene activity" ON public.scene_activity_log FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access to scene_activity_log' AND tablename = 'scene_activity_log') THEN
    CREATE POLICY "Service role full access to scene_activity_log" ON public.scene_activity_log FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE: scene_playlists (if not exists)
-- Purpose: Store user scene playlists
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.scene_playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  mood text NOT NULL,
  scenes jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_default boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scene_playlists_user_id 
  ON public.scene_playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_scene_playlists_mood 
  ON public.scene_playlists(mood);

-- Enable RLS
ALTER TABLE public.scene_playlists ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own scene playlists' AND tablename = 'scene_playlists') THEN
    CREATE POLICY "Users can read own scene playlists" ON public.scene_playlists FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own scene playlists' AND tablename = 'scene_playlists') THEN
    CREATE POLICY "Users can insert own scene playlists" ON public.scene_playlists FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own scene playlists' AND tablename = 'scene_playlists') THEN
    CREATE POLICY "Users can update own scene playlists" ON public.scene_playlists FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own scene playlists' AND tablename = 'scene_playlists') THEN
    CREATE POLICY "Users can delete own scene playlists" ON public.scene_playlists FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE: scene_preferences (if not exists)
-- Purpose: Store user scene preferences
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.scene_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  active_playlist_id uuid REFERENCES public.scene_playlists(id) ON DELETE SET NULL,
  favorite_scenes jsonb DEFAULT '[]'::jsonb,
  auto_theme_enabled boolean DEFAULT true,
  time_based_themes jsonb DEFAULT '{}'::jsonb,
  geolocation_enabled boolean DEFAULT false,
  location_data jsonb,
  transition_duration integer DEFAULT 1000,
  parallax_intensity real DEFAULT 0.5,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scene_preferences_user_id 
  ON public.scene_preferences(user_id);

-- Enable RLS
ALTER TABLE public.scene_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own scene preferences' AND tablename = 'scene_preferences') THEN
    CREATE POLICY "Users can read own scene preferences" ON public.scene_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own scene preferences' AND tablename = 'scene_preferences') THEN
    CREATE POLICY "Users can insert own scene preferences" ON public.scene_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own scene preferences' AND tablename = 'scene_preferences') THEN
    CREATE POLICY "Users can update own scene preferences" ON public.scene_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_scene_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS scene_preferences_updated_at ON public.scene_preferences;
CREATE TRIGGER scene_preferences_updated_at
  BEFORE UPDATE ON public.scene_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_scene_preferences_updated_at();

DROP TRIGGER IF EXISTS scene_playlists_updated_at ON public.scene_playlists;
CREATE TRIGGER scene_playlists_updated_at
  BEFORE UPDATE ON public.scene_playlists
  FOR EACH ROW
  EXECUTE FUNCTION update_scene_preferences_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- GRANT PERMISSIONS
-- ═══════════════════════════════════════════════════════════════════════════════

GRANT SELECT ON public.health_check TO anon;
GRANT SELECT ON public.health_check TO authenticated;
GRANT ALL ON public.scene_activity_log TO authenticated;
GRANT ALL ON public.scene_playlists TO authenticated;
GRANT ALL ON public.scene_preferences TO authenticated;
