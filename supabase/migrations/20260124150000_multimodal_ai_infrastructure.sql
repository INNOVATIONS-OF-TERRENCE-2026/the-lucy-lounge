-- THE LUCY LOUNGE - Multimodal AI Infrastructure
-- Tables for AI outputs, audio projects, and model usage tracking
-- AIRTIGHT RLS - No data leaks

-- =====================================================
-- USER AI OUTPUTS - Stores all generated content
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_ai_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  output_type TEXT NOT NULL CHECK (output_type IN ('image', 'video', 'music', 'voice', 'document', 'code')),
  model_used TEXT NOT NULL,
  prompt TEXT,
  storage_path TEXT,
  public_url TEXT,
  metadata JSONB DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_ai_outputs_user_id ON public.user_ai_outputs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ai_outputs_type ON public.user_ai_outputs(output_type);
CREATE INDEX IF NOT EXISTS idx_user_ai_outputs_created ON public.user_ai_outputs(created_at DESC);

-- RLS Policies
ALTER TABLE public.user_ai_outputs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own outputs" ON public.user_ai_outputs;
CREATE POLICY "Users can view own outputs" ON public.user_ai_outputs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public outputs" ON public.user_ai_outputs;
CREATE POLICY "Users can view public outputs" ON public.user_ai_outputs
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can insert own outputs" ON public.user_ai_outputs;
CREATE POLICY "Users can insert own outputs" ON public.user_ai_outputs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own outputs" ON public.user_ai_outputs;
CREATE POLICY "Users can update own outputs" ON public.user_ai_outputs
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own outputs" ON public.user_ai_outputs;
CREATE POLICY "Users can delete own outputs" ON public.user_ai_outputs
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- AUDIO PROJECTS - Studio audio project management
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL CHECK (project_type IN ('music', 'voice', 'sfx', 'podcast', 'mix')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
  
  -- Audio settings
  bpm INTEGER,
  key TEXT,
  time_signature TEXT,
  duration_seconds INTEGER,
  
  -- Tracks and assets
  tracks JSONB DEFAULT '[]',
  assets JSONB DEFAULT '[]',
  
  -- Export info
  export_format TEXT,
  export_quality TEXT,
  export_path TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audio_projects_user_id ON public.audio_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_projects_type ON public.audio_projects(project_type);
CREATE INDEX IF NOT EXISTS idx_audio_projects_status ON public.audio_projects(status);

-- RLS Policies
ALTER TABLE public.audio_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own projects" ON public.audio_projects;
CREATE POLICY "Users can view own projects" ON public.audio_projects
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public projects" ON public.audio_projects;
CREATE POLICY "Users can view public projects" ON public.audio_projects
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can insert own projects" ON public.audio_projects;
CREATE POLICY "Users can insert own projects" ON public.audio_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON public.audio_projects;
CREATE POLICY "Users can update own projects" ON public.audio_projects
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON public.audio_projects;
CREATE POLICY "Users can delete own projects" ON public.audio_projects
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- MODEL USAGE LOGS - Analytics and routing decisions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.model_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  
  -- Routing info
  intent TEXT NOT NULL,
  model TEXT NOT NULL,
  service TEXT NOT NULL,
  confidence DECIMAL(3,2),
  
  -- Request info
  prompt_length INTEGER,
  response_length INTEGER,
  latency_ms INTEGER,
  
  -- Cost tracking
  tokens_used INTEGER,
  estimated_cost DECIMAL(10,6),
  
  -- Status
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_model_usage_user ON public.model_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_model_usage_model ON public.model_usage_logs(model);
CREATE INDEX IF NOT EXISTS idx_model_usage_intent ON public.model_usage_logs(intent);
CREATE INDEX IF NOT EXISTS idx_model_usage_created ON public.model_usage_logs(created_at DESC);

-- RLS - Users can only see their own usage
ALTER TABLE public.model_usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own usage" ON public.model_usage_logs;
CREATE POLICY "Users can view own usage" ON public.model_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can insert logs" ON public.model_usage_logs;
CREATE POLICY "Service can insert logs" ON public.model_usage_logs
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- STORAGE BUCKET for AI outputs
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ai-outputs',
  'ai-outputs',
  false,
  52428800, -- 50MB limit
  ARRAY[
    'image/png', 'image/jpeg', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'image/png', 'image/jpeg', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3',
    'application/pdf'
  ];

-- Storage RLS
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
CREATE POLICY "Users can upload to own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'ai-outputs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'ai-outputs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'ai-outputs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- Updated timestamp trigger
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_ai_outputs_updated ON public.user_ai_outputs;
CREATE TRIGGER user_ai_outputs_updated
  BEFORE UPDATE ON public.user_ai_outputs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS audio_projects_updated ON public.audio_projects;
CREATE TRIGGER audio_projects_updated
  BEFORE UPDATE ON public.audio_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
