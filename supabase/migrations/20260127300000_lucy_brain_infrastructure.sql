-- =====================================================
-- THE LUCY LOUNGE - Lucy Brain Infrastructure
-- Migration: 20260127300000_lucy_brain_infrastructure.sql
-- 
-- This migration adds infrastructure for the provider-agnostic
-- Lucy Brain Router system:
-- - Chat sessions with brain metadata
-- - Enhanced memory with vector embeddings
-- - Brain routing analytics
-- =====================================================

-- =====================================================
-- 1. CHAT SESSIONS (Lucy Brain session tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  
  -- Session metadata
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Brain routing info (NEVER exposed to frontend)
  brain_mode TEXT DEFAULT 'auto' CHECK (brain_mode IN ('auto', 'chat', 'reasoning', 'tool_use', 'code', 'creative')),
  model_slot_used TEXT, -- e.g., 'primary_reasoning', 'fast_chat'
  total_tokens_used INTEGER DEFAULT 0,
  avg_latency_ms INTEGER,
  
  -- Context tracking
  messages_count INTEGER DEFAULT 0,
  memory_loaded BOOLEAN DEFAULT false,
  tools_used TEXT[] DEFAULT '{}',
  
  -- Quality metrics
  user_satisfaction INTEGER CHECK (user_satisfaction BETWEEN 1 AND 5),
  response_quality_score NUMERIC(3,2),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_conversation_id ON public.chat_sessions(conversation_id);
CREATE INDEX idx_chat_sessions_active ON public.chat_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_chat_sessions_created_at ON public.chat_sessions(created_at DESC);

-- RLS Policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions"
  ON public.chat_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions"
  ON public.chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
  ON public.chat_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can manage all sessions (for edge functions)
CREATE POLICY "Service role can manage all chat sessions"
  ON public.chat_sessions FOR ALL
  TO service_role
  USING (true);

-- =====================================================
-- 2. ENHANCED MESSAGES WITH BRAIN METADATA
-- =====================================================

-- Add brain metadata column to messages (for internal tracking only)
ALTER TABLE public.messages 
  ADD COLUMN IF NOT EXISTS brain_metadata JSONB DEFAULT '{}';

-- Add tokens tracking
ALTER TABLE public.messages 
  ADD COLUMN IF NOT EXISTS tokens_used INTEGER;

-- Add latency tracking  
ALTER TABLE public.messages 
  ADD COLUMN IF NOT EXISTS response_latency_ms INTEGER;

-- Create index for brain metadata queries (admin analytics only)
CREATE INDEX IF NOT EXISTS idx_messages_brain_metadata 
  ON public.messages USING gin(brain_metadata);

-- =====================================================
-- 3. USER MEMORY VECTORS (Semantic memory with embeddings)
-- =====================================================

-- Enable vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Add embedding column to user_memories (skip if vector type not available)
DO $$
BEGIN
  -- Try to add embedding column
  BEGIN
    ALTER TABLE public.user_memories 
      ADD COLUMN IF NOT EXISTS embedding vector(384); -- 384 dimensions for MiniLM
  EXCEPTION WHEN undefined_object THEN
    -- vector type doesn't exist, skip
    RAISE NOTICE 'vector type not available, skipping embedding column';
  END;
END $$;

-- Add importance column if not exists (normalize naming)
ALTER TABLE public.user_memories 
  ADD COLUMN IF NOT EXISTS importance NUMERIC(3,2) DEFAULT 0.5;

-- Update importance from importance_score if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_memories' AND column_name = 'importance_score'
  ) THEN
    UPDATE public.user_memories SET importance = importance_score WHERE importance IS NULL;
  END IF;
END $$;

-- Add source tracking
ALTER TABLE public.user_memories 
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'conversation';

-- Add decay tracking (memories fade if not accessed)
ALTER TABLE public.user_memories 
  ADD COLUMN IF NOT EXISTS decay_factor NUMERIC(3,2) DEFAULT 1.0;

-- Create vector similarity search index (skip if embedding column doesn't exist)
DO $$
BEGIN
  -- Only create index if embedding column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_memories' AND column_name = 'embedding'
  ) THEN
    BEGIN
      CREATE INDEX IF NOT EXISTS idx_user_memories_embedding 
        ON public.user_memories USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);
    EXCEPTION WHEN undefined_object THEN
      RAISE NOTICE 'vector type not available, skipping embedding index';
    END;
  ELSE
    RAISE NOTICE 'embedding column does not exist, skipping vector index';
  END IF;
END $$;

-- Note: Vector-based semantic memory search requires pgvector extension.
-- This will be set up properly when the extension is available.
-- For now, we skip the vector function and create a fallback.

-- Fallback function that doesn't use vectors (basic text matching)
CREATE OR REPLACE FUNCTION public.search_user_memories(
  p_user_id UUID,
  p_match_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  memory_type TEXT,
  importance NUMERIC,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    um.id,
    um.content,
    um.memory_type,
    um.importance,
    um.created_at
  FROM public.user_memories um
  WHERE um.user_id = p_user_id
  ORDER BY um.importance DESC, um.created_at DESC
  LIMIT p_match_count;
END;
$$;

-- =====================================================
-- 4. BRAIN ROUTING ANALYTICS (Admin only)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.brain_routing_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Routing decision
  task_type TEXT NOT NULL,
  model_slot TEXT NOT NULL,
  models_tried TEXT[] DEFAULT '{}',
  final_model TEXT,
  
  -- Performance
  latency_ms INTEGER,
  tokens_input INTEGER,
  tokens_output INTEGER,
  
  -- Outcome
  success BOOLEAN DEFAULT true,
  fallback_used BOOLEAN DEFAULT false,
  error_type TEXT,
  
  -- Context
  prompt_length INTEGER,
  response_length INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Only service role can insert analytics
ALTER TABLE public.brain_routing_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage brain analytics"
  ON public.brain_routing_analytics FOR ALL
  TO service_role
  USING (true);

-- Admins can view analytics
CREATE POLICY "Admins can view brain analytics"
  ON public.brain_routing_analytics FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create analytics index
CREATE INDEX idx_brain_analytics_created_at 
  ON public.brain_routing_analytics(created_at DESC);

CREATE INDEX idx_brain_analytics_model_slot 
  ON public.brain_routing_analytics(model_slot);

-- =====================================================
-- 5. MEMORY DECAY FUNCTION
-- =====================================================

-- Function to decay old memories (run periodically)
CREATE OR REPLACE FUNCTION public.decay_user_memories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Decay memories that haven't been accessed in 30+ days
  UPDATE public.user_memories
  SET decay_factor = decay_factor * 0.95
  WHERE last_accessed < now() - interval '30 days'
    AND decay_factor > 0.1;
  
  -- Delete memories with very low decay (older than 90 days, low importance)
  DELETE FROM public.user_memories
  WHERE decay_factor < 0.2
    AND importance < 0.3
    AND last_accessed < now() - interval '90 days';
END;
$$;

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Get or create active chat session
CREATE OR REPLACE FUNCTION public.get_or_create_chat_session(
  p_user_id UUID,
  p_conversation_id UUID DEFAULT NULL,
  p_brain_mode TEXT DEFAULT 'auto'
)
RETURNS public.chat_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session public.chat_sessions;
BEGIN
  -- Try to find active session for this conversation
  IF p_conversation_id IS NOT NULL THEN
    SELECT * INTO session 
    FROM public.chat_sessions 
    WHERE user_id = p_user_id 
      AND conversation_id = p_conversation_id 
      AND is_active = true
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  -- Create new session if none found
  IF session.id IS NULL THEN
    INSERT INTO public.chat_sessions (user_id, conversation_id, brain_mode)
    VALUES (p_user_id, p_conversation_id, p_brain_mode)
    RETURNING * INTO session;
  END IF;
  
  RETURN session;
END;
$$;

-- Update chat session metrics
CREATE OR REPLACE FUNCTION public.update_chat_session_metrics(
  p_session_id UUID,
  p_tokens INTEGER DEFAULT 0,
  p_latency_ms INTEGER DEFAULT 0,
  p_model_slot TEXT DEFAULT NULL,
  p_tools TEXT[] DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.chat_sessions
  SET 
    total_tokens_used = total_tokens_used + p_tokens,
    messages_count = messages_count + 1,
    avg_latency_ms = CASE 
      WHEN avg_latency_ms IS NULL THEN p_latency_ms
      ELSE (avg_latency_ms + p_latency_ms) / 2
    END,
    model_slot_used = COALESCE(p_model_slot, model_slot_used),
    tools_used = CASE 
      WHEN p_tools IS NOT NULL THEN array_cat(tools_used, p_tools)
      ELSE tools_used
    END,
    updated_at = now()
  WHERE id = p_session_id;
END;
$$;

-- =====================================================
-- 7. UPDATED_AT TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON public.chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 8. REALTIME SUBSCRIPTIONS
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'chat_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

COMMENT ON TABLE public.chat_sessions IS 'Tracks Lucy Brain chat sessions with routing analytics';
COMMENT ON TABLE public.brain_routing_analytics IS 'Internal analytics for Lucy Brain model routing - admin only';
COMMENT ON COLUMN public.messages.brain_metadata IS 'Internal metadata about model routing - never exposed to users';
