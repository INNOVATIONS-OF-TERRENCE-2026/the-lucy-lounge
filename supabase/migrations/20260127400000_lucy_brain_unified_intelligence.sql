-- =====================================================
-- THE LUCY LOUNGE - Lucy Brain Unified Intelligence
-- Migration: 20260127400000_lucy_brain_unified_intelligence.sql
-- 
-- CROSS-STUDIO INTELLIGENCE SYSTEM
-- Lucy behaves as ONE unified intelligence across:
-- - Chat conversations
-- - Audio Studio generations
-- - Lounges (ambient experiences)
-- - Tools and utilities
-- 
-- This migration creates the core memory layer that enables:
-- - Persistent memory across sessions
-- - Context sharing between studios
-- - Personality continuity
-- - Evolving preferences
-- =====================================================

-- =====================================================
-- 1. LUCY BRAIN SESSIONS
-- Tracks active user context across studios
-- =====================================================

CREATE TABLE IF NOT EXISTS public.lucy_brain_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Active context tracking
  active_context TEXT NOT NULL DEFAULT 'chat' 
    CHECK (active_context IN ('chat', 'audio', 'lounge', 'tool', 'studio', 'arcade')),
  
  -- Session state
  session_start TIMESTAMPTZ DEFAULT now(),
  last_active_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  
  -- Cross-studio context
  emotional_state TEXT, -- calm, energetic, focused, creative, reflective
  current_topic TEXT,
  current_intent TEXT,
  
  -- Metadata
  device_type TEXT DEFAULT 'desktop',
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lucy_brain_sessions ENABLE ROW LEVEL SECURITY;

-- Create indexes if not exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lucy_brain_sessions_user_active') THEN
    CREATE INDEX idx_lucy_brain_sessions_user_active ON public.lucy_brain_sessions(user_id, is_active) WHERE is_active = true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lucy_brain_sessions_last_active') THEN
    CREATE INDEX idx_lucy_brain_sessions_last_active ON public.lucy_brain_sessions(last_active_at DESC);
  END IF;
END $$;

-- RLS: Users can only access their own sessions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own brain sessions' AND tablename = 'lucy_brain_sessions') THEN
    CREATE POLICY "Users can view own brain sessions" ON public.lucy_brain_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create own brain sessions' AND tablename = 'lucy_brain_sessions') THEN
    CREATE POLICY "Users can create own brain sessions" ON public.lucy_brain_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own brain sessions' AND tablename = 'lucy_brain_sessions') THEN
    CREATE POLICY "Users can update own brain sessions" ON public.lucy_brain_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role manages all brain sessions' AND tablename = 'lucy_brain_sessions') THEN
    CREATE POLICY "Service role manages all brain sessions" ON public.lucy_brain_sessions FOR ALL TO service_role USING (true);
  END IF;
END $$;

-- =====================================================
-- 2. LUCY BRAIN MEMORY
-- Persistent memory across all studios
-- =====================================================

CREATE TABLE IF NOT EXISTS public.lucy_brain_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Source tracking
  source TEXT NOT NULL DEFAULT 'chat'
    CHECK (source IN ('chat', 'audio', 'lounge', 'tool', 'studio', 'arcade', 'system')),
  source_id UUID, -- ID of the source item (conversation_id, generation_id, etc.)
  
  -- Memory content
  memory_type TEXT NOT NULL DEFAULT 'fact'
    CHECK (memory_type IN ('fact', 'preference', 'creation', 'insight', 'emotion', 'context', 'topic')),
  content TEXT NOT NULL,
  summary TEXT, -- Compressed version for context injection
  
  -- Semantic embedding for similarity search (optional - requires pgvector)
  -- embedding vector(384), -- Uncomment when pgvector is enabled
  
  -- Scoring and decay
  importance_score NUMERIC(3,2) DEFAULT 0.5 CHECK (importance_score >= 0 AND importance_score <= 1),
  decay_factor NUMERIC(3,2) DEFAULT 1.0 CHECK (decay_factor >= 0 AND decay_factor <= 1),
  access_count INTEGER DEFAULT 0,
  
  -- Timestamps
  last_accessed TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ, -- NULL = never expires
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lucy_brain_memory ENABLE ROW LEVEL SECURITY;

-- Indexes for fast retrieval
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lucy_brain_memory_user_source') THEN
    CREATE INDEX idx_lucy_brain_memory_user_source ON public.lucy_brain_memory(user_id, source);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lucy_brain_memory_user_type') THEN
    CREATE INDEX idx_lucy_brain_memory_user_type ON public.lucy_brain_memory(user_id, memory_type);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lucy_brain_memory_importance') THEN
    CREATE INDEX idx_lucy_brain_memory_importance ON public.lucy_brain_memory(user_id, importance_score DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lucy_brain_memory_content_search') THEN
    CREATE INDEX idx_lucy_brain_memory_content_search ON public.lucy_brain_memory USING gin(to_tsvector('english', content));
  END IF;
END $$;

-- RLS Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own brain memory' AND tablename = 'lucy_brain_memory') THEN
    CREATE POLICY "Users can view own brain memory" ON public.lucy_brain_memory FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create own brain memory' AND tablename = 'lucy_brain_memory') THEN
    CREATE POLICY "Users can create own brain memory" ON public.lucy_brain_memory FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own brain memory' AND tablename = 'lucy_brain_memory') THEN
    CREATE POLICY "Users can update own brain memory" ON public.lucy_brain_memory FOR UPDATE TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own brain memory' AND tablename = 'lucy_brain_memory') THEN
    CREATE POLICY "Users can delete own brain memory" ON public.lucy_brain_memory FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role manages all brain memory' AND tablename = 'lucy_brain_memory') THEN
    CREATE POLICY "Service role manages all brain memory" ON public.lucy_brain_memory FOR ALL TO service_role USING (true);
  END IF;
END $$;

-- =====================================================
-- 3. LUCY BRAIN PREFERENCES
-- User preferences that influence all studios
-- =====================================================

CREATE TABLE IF NOT EXISTS public.lucy_brain_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Music & Audio preferences
  music_style TEXT[] DEFAULT '{}', -- ['lofi', 'ambient', 'electronic']
  audio_energy TEXT DEFAULT 'medium' CHECK (audio_energy IN ('low', 'medium', 'high')),
  preferred_genres TEXT[] DEFAULT '{}',
  tempo_preference TEXT DEFAULT 'moderate' CHECK (tempo_preference IN ('slow', 'moderate', 'fast', 'varied')),
  
  -- Communication preferences
  tone_preference TEXT DEFAULT 'friendly' 
    CHECK (tone_preference IN ('formal', 'friendly', 'casual', 'professional', 'playful', 'nurturing')),
  verbosity TEXT DEFAULT 'balanced'
    CHECK (verbosity IN ('concise', 'balanced', 'detailed', 'comprehensive')),
  humor_level TEXT DEFAULT 'moderate'
    CHECK (humor_level IN ('none', 'subtle', 'moderate', 'playful')),
  
  -- Creative preferences
  creativity_level NUMERIC(3,2) DEFAULT 0.7 CHECK (creativity_level >= 0 AND creativity_level <= 1),
  risk_tolerance TEXT DEFAULT 'moderate'
    CHECK (risk_tolerance IN ('conservative', 'moderate', 'adventurous')),
  
  -- Lounge preferences
  ambient_style TEXT DEFAULT 'calm'
    CHECK (ambient_style IN ('calm', 'energetic', 'focused', 'dreamy', 'minimal')),
  visual_intensity TEXT DEFAULT 'medium'
    CHECK (visual_intensity IN ('subtle', 'medium', 'immersive')),
  
  -- Learning & behavior
  topics_of_interest TEXT[] DEFAULT '{}',
  expertise_areas TEXT[] DEFAULT '{}',
  learning_style TEXT DEFAULT 'examples'
    CHECK (learning_style IN ('conceptual', 'examples', 'step-by-step', 'visual')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lucy_brain_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own preferences' AND tablename = 'lucy_brain_preferences') THEN
    CREATE POLICY "Users can view own preferences" ON public.lucy_brain_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upsert own preferences' AND tablename = 'lucy_brain_preferences') THEN
    CREATE POLICY "Users can upsert own preferences" ON public.lucy_brain_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own preferences' AND tablename = 'lucy_brain_preferences') THEN
    CREATE POLICY "Users can update own preferences" ON public.lucy_brain_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role manages all preferences' AND tablename = 'lucy_brain_preferences') THEN
    CREATE POLICY "Service role manages all preferences" ON public.lucy_brain_preferences FOR ALL TO service_role USING (true);
  END IF;
END $$;

-- =====================================================
-- 4. LUCY BRAIN CROSS-STUDIO EVENTS
-- Realtime event log for cross-studio sync
-- =====================================================

CREATE TABLE IF NOT EXISTS public.lucy_brain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Event details
  event_type TEXT NOT NULL
    CHECK (event_type IN (
      'chat_message', 'chat_response', 
      'audio_generated', 'audio_played',
      'lounge_entered', 'lounge_mood_changed',
      'tool_used', 'preference_changed',
      'memory_created', 'context_switched'
    )),
  
  source TEXT NOT NULL,
  target TEXT, -- Which studio should react
  
  -- Event payload
  payload JSONB NOT NULL DEFAULT '{}',
  
  -- Processing
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lucy_brain_events ENABLE ROW LEVEL SECURITY;

-- Index for fast event retrieval
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lucy_brain_events_user_unprocessed') THEN
    CREATE INDEX idx_lucy_brain_events_user_unprocessed ON public.lucy_brain_events(user_id, processed, created_at DESC) WHERE processed = false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lucy_brain_events_created') THEN
    CREATE INDEX idx_lucy_brain_events_created ON public.lucy_brain_events(created_at DESC);
  END IF;
END $$;

-- RLS Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own events' AND tablename = 'lucy_brain_events') THEN
    CREATE POLICY "Users can view own events" ON public.lucy_brain_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create own events' AND tablename = 'lucy_brain_events') THEN
    CREATE POLICY "Users can create own events" ON public.lucy_brain_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role manages all events' AND tablename = 'lucy_brain_events') THEN
    CREATE POLICY "Service role manages all events" ON public.lucy_brain_events FOR ALL TO service_role USING (true);
  END IF;
END $$;

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Get or create active brain session
CREATE OR REPLACE FUNCTION public.get_or_create_brain_session(
  p_user_id UUID,
  p_context TEXT DEFAULT 'chat'
)
RETURNS public.lucy_brain_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session public.lucy_brain_sessions;
BEGIN
  -- Try to find active session (within last 30 minutes)
  SELECT * INTO session 
  FROM public.lucy_brain_sessions 
  WHERE user_id = p_user_id 
    AND is_active = true
    AND last_active_at > now() - interval '30 minutes'
  ORDER BY last_active_at DESC
  LIMIT 1;
  
  -- Update existing session
  IF session.id IS NOT NULL THEN
    UPDATE public.lucy_brain_sessions
    SET active_context = p_context,
        last_active_at = now(),
        updated_at = now()
    WHERE id = session.id
    RETURNING * INTO session;
    RETURN session;
  END IF;
  
  -- Deactivate old sessions
  UPDATE public.lucy_brain_sessions
  SET is_active = false, updated_at = now()
  WHERE user_id = p_user_id AND is_active = true;
  
  -- Create new session
  INSERT INTO public.lucy_brain_sessions (user_id, active_context)
  VALUES (p_user_id, p_context)
  RETURNING * INTO session;
  
  RETURN session;
END;
$$;

-- Store brain memory with auto-summarization
CREATE OR REPLACE FUNCTION public.store_brain_memory(
  p_user_id UUID,
  p_source TEXT,
  p_content TEXT,
  p_memory_type TEXT DEFAULT 'fact',
  p_importance NUMERIC DEFAULT 0.5,
  p_source_id UUID DEFAULT NULL
)
RETURNS public.lucy_brain_memory
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  memory public.lucy_brain_memory;
  summary_text TEXT;
BEGIN
  -- Auto-generate summary (first 200 chars for now)
  summary_text := CASE 
    WHEN length(p_content) > 200 THEN substring(p_content for 200) || '...'
    ELSE p_content
  END;
  
  INSERT INTO public.lucy_brain_memory (
    user_id, source, source_id, memory_type, content, summary, importance_score
  ) VALUES (
    p_user_id, p_source, p_source_id, p_memory_type, p_content, summary_text, p_importance
  )
  RETURNING * INTO memory;
  
  -- Emit event for cross-studio sync
  INSERT INTO public.lucy_brain_events (user_id, event_type, source, payload)
  VALUES (p_user_id, 'memory_created', p_source, jsonb_build_object(
    'memory_id', memory.id,
    'memory_type', p_memory_type,
    'summary', summary_text
  ));
  
  RETURN memory;
END;
$$;

-- Get relevant memories for context injection
CREATE OR REPLACE FUNCTION public.get_relevant_brain_memories(
  p_user_id UUID,
  p_sources TEXT[] DEFAULT NULL,
  p_memory_types TEXT[] DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  source TEXT,
  memory_type TEXT,
  content TEXT,
  summary TEXT,
  importance_score NUMERIC,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id, m.source, m.memory_type, m.content, m.summary, 
    m.importance_score, m.created_at
  FROM public.lucy_brain_memory m
  WHERE m.user_id = p_user_id
    AND (p_sources IS NULL OR m.source = ANY(p_sources))
    AND (p_memory_types IS NULL OR m.memory_type = ANY(p_memory_types))
    AND (m.expires_at IS NULL OR m.expires_at > now())
    AND m.decay_factor > 0.1
  ORDER BY 
    m.importance_score DESC,
    m.last_accessed DESC,
    m.created_at DESC
  LIMIT p_limit;
  
  -- Update access timestamps
  UPDATE public.lucy_brain_memory
  SET last_accessed = now(), access_count = access_count + 1
  WHERE lucy_brain_memory.id IN (
    SELECT mem.id FROM public.lucy_brain_memory mem
    WHERE mem.user_id = p_user_id
      AND (p_sources IS NULL OR mem.source = ANY(p_sources))
      AND (p_memory_types IS NULL OR mem.memory_type = ANY(p_memory_types))
    ORDER BY mem.importance_score DESC
    LIMIT p_limit
  );
END;
$$;

-- Get or create user preferences
CREATE OR REPLACE FUNCTION public.get_or_create_brain_preferences(p_user_id UUID)
RETURNS public.lucy_brain_preferences
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prefs public.lucy_brain_preferences;
BEGIN
  SELECT * INTO prefs FROM public.lucy_brain_preferences WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.lucy_brain_preferences (user_id)
    VALUES (p_user_id)
    RETURNING * INTO prefs;
  END IF;
  
  RETURN prefs;
END;
$$;

-- Update preference with learning
CREATE OR REPLACE FUNCTION public.learn_brain_preference(
  p_user_id UUID,
  p_preference_key TEXT,
  p_preference_value TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure preferences exist
  PERFORM get_or_create_brain_preferences(p_user_id);
  
  -- Update the specific preference
  EXECUTE format(
    'UPDATE public.lucy_brain_preferences SET %I = $1, updated_at = now() WHERE user_id = $2',
    p_preference_key
  ) USING p_preference_value, p_user_id;
  
  -- Emit learning event
  INSERT INTO public.lucy_brain_events (user_id, event_type, source, payload)
  VALUES (p_user_id, 'preference_changed', 'system', jsonb_build_object(
    'key', p_preference_key,
    'value', p_preference_value
  ));
END;
$$;

-- Emit cross-studio event
CREATE OR REPLACE FUNCTION public.emit_brain_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_source TEXT,
  p_payload JSONB DEFAULT '{}',
  p_target TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.lucy_brain_events (user_id, event_type, source, target, payload)
  VALUES (p_user_id, p_event_type, p_source, p_target, p_payload)
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- =====================================================
-- 6. REALTIME SUBSCRIPTIONS
-- =====================================================

DO $$
BEGIN
  -- Enable realtime for brain events (critical for cross-studio sync)
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'lucy_brain_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.lucy_brain_events;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'lucy_brain_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.lucy_brain_sessions;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'lucy_brain_preferences'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.lucy_brain_preferences;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- =====================================================
-- 7. TRIGGERS FOR AUTO-SYNC
-- =====================================================

-- Auto-create preferences on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_brain_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.lucy_brain_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_brain_prefs ON auth.users;
CREATE TRIGGER on_auth_user_created_brain_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_brain_preferences();

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION public.update_brain_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_lucy_brain_sessions_updated_at ON public.lucy_brain_sessions;
CREATE TRIGGER update_lucy_brain_sessions_updated_at
  BEFORE UPDATE ON public.lucy_brain_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_brain_updated_at();

DROP TRIGGER IF EXISTS update_lucy_brain_preferences_updated_at ON public.lucy_brain_preferences;
CREATE TRIGGER update_lucy_brain_preferences_updated_at
  BEFORE UPDATE ON public.lucy_brain_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_brain_updated_at();

-- =====================================================
-- 8. MEMORY DECAY JOB (Run periodically)
-- =====================================================

CREATE OR REPLACE FUNCTION public.decay_brain_memories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Decay memories not accessed in 7+ days
  UPDATE public.lucy_brain_memory
  SET decay_factor = decay_factor * 0.9
  WHERE last_accessed < now() - interval '7 days'
    AND decay_factor > 0.1;
  
  -- Remove very old, low-importance, decayed memories
  DELETE FROM public.lucy_brain_memory
  WHERE decay_factor < 0.1
    AND importance_score < 0.3
    AND created_at < now() - interval '90 days';
  
  -- Remove expired memories
  DELETE FROM public.lucy_brain_memory
  WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

COMMENT ON TABLE public.lucy_brain_sessions IS 'Tracks active user context across all Lucy studios';
COMMENT ON TABLE public.lucy_brain_memory IS 'Persistent memory storage for cross-studio intelligence';
COMMENT ON TABLE public.lucy_brain_preferences IS 'User preferences that influence Lucy behavior across studios';
COMMENT ON TABLE public.lucy_brain_events IS 'Realtime event log for cross-studio synchronization';
