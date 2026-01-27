-- ============================================================================
-- THE LUCY LOUNGE — AUDIO GENERATIONS TABLE
-- ============================================================================
-- Dedicated table for Audio Studio generations with full history tracking.
-- Supports music generation, voice synthesis, and future audio modalities.
-- 
-- Provider Strategy:
-- - Music: HuggingFace MusicGen (server-side only)
-- - Voice: ElevenLabs TTS (server-side only)
-- - All provider details hidden from users (they see "Lucy AI")
-- ============================================================================

-- =====================================================
-- AUDIO GENERATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audio_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  style TEXT,
  duration_seconds INTEGER DEFAULT 10,
  generation_type TEXT NOT NULL DEFAULT 'music' CHECK (generation_type IN ('music', 'voice', 'sfx', 'ambient')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'success', 'error')),
  audio_path TEXT,
  public_url TEXT,
  provider_job_id TEXT,
  error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_audio_generations_user_created 
  ON public.audio_generations(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audio_generations_status 
  ON public.audio_generations(status);

CREATE INDEX IF NOT EXISTS idx_audio_generations_type 
  ON public.audio_generations(generation_type);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.audio_generations ENABLE ROW LEVEL SECURITY;

-- Users can only SELECT their own generations
DROP POLICY IF EXISTS "Users can view own audio generations" ON public.audio_generations;
CREATE POLICY "Users can view own audio generations" ON public.audio_generations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only INSERT their own generations
DROP POLICY IF EXISTS "Users can create own audio generations" ON public.audio_generations;
CREATE POLICY "Users can create own audio generations" ON public.audio_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only UPDATE their own generations
DROP POLICY IF EXISTS "Users can update own audio generations" ON public.audio_generations;
CREATE POLICY "Users can update own audio generations" ON public.audio_generations
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only DELETE their own generations
DROP POLICY IF EXISTS "Users can delete own audio generations" ON public.audio_generations;
CREATE POLICY "Users can delete own audio generations" ON public.audio_generations
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_audio_generations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audio_generations_updated_at ON public.audio_generations;
CREATE TRIGGER audio_generations_updated_at
  BEFORE UPDATE ON public.audio_generations
  FOR EACH ROW EXECUTE FUNCTION update_audio_generations_updated_at();

-- =====================================================
-- STORAGE BUCKET FOR AUDIO FILES
-- =====================================================
-- Create the 'audio' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio',
  'audio',
  false,
  52428800, -- 50MB limit
  ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp3']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- STORAGE POLICIES
-- =====================================================
-- Policy: Users can read their own audio files
DROP POLICY IF EXISTS "Users can read own audio files" ON storage.objects;
CREATE POLICY "Users can read own audio files" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'audio' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can upload to their own folder
DROP POLICY IF EXISTS "Users can upload own audio files" ON storage.objects;
CREATE POLICY "Users can upload own audio files" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can update their own audio files
DROP POLICY IF EXISTS "Users can update own audio files" ON storage.objects;
CREATE POLICY "Users can update own audio files" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can delete their own audio files
DROP POLICY IF EXISTS "Users can delete own audio files" ON storage.objects;
CREATE POLICY "Users can delete own audio files" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- SERVICE ROLE POLICIES (for Edge Functions)
-- =====================================================
-- Allow service role to manage all audio files (for Edge Functions)
DROP POLICY IF EXISTS "Service role can manage audio files" ON storage.objects;
CREATE POLICY "Service role can manage audio files" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'audio'
    AND auth.role() = 'service_role'
  )
  WITH CHECK (
    bucket_id = 'audio'
    AND auth.role() = 'service_role'
  );

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE public.audio_generations IS 'Audio Studio generation history - music, voice, SFX';
COMMENT ON COLUMN public.audio_generations.status IS 'Generation status: queued, running, success, error';
COMMENT ON COLUMN public.audio_generations.audio_path IS 'Storage path: {user_id}/{generation_id}.mp3';
COMMENT ON COLUMN public.audio_generations.provider_job_id IS 'Provider tracking ID (hidden from users)';
