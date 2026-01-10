-- Lucy Cinematic Studio Tables

-- Job status enum
DO $$ BEGIN
  CREATE TYPE public.cinematic_job_status AS ENUM ('queued', 'running', 'complete', 'failed', 'canceled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Job type enum
DO $$ BEGIN
  CREATE TYPE public.cinematic_job_type AS ENUM ('video', 'voice', 'music', 'composite', 'export_pack', 'cutscene');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Main jobs table
CREATE TABLE IF NOT EXISTS public.lucy_cinematic_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status cinematic_job_status NOT NULL DEFAULT 'queued',
  job_type cinematic_job_type NOT NULL DEFAULT 'video',
  parent_job_id UUID REFERENCES public.lucy_cinematic_jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Project',
  prompt_raw TEXT NOT NULL,
  prompt_enhanced TEXT,
  style_preset TEXT DEFAULT 'cinematic',
  shots JSONB DEFAULT '[]'::jsonb,
  duration_seconds INTEGER DEFAULT 5,
  aspect_ratio TEXT DEFAULT '16:9',
  seed INTEGER,
  mcp_payload JSONB,
  result_video_url TEXT,
  result_audio_url TEXT,
  result_music_url TEXT,
  result_composite_url TEXT,
  export_urls JSONB,
  error_message TEXT,
  attempt_count INTEGER DEFAULT 0,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Prompt memory for learning
CREATE TABLE IF NOT EXISTS public.lucy_prompt_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prompt_raw TEXT NOT NULL,
  prompt_enhanced TEXT,
  style_preset TEXT,
  shots JSONB,
  success BOOLEAN DEFAULT true,
  final_score INTEGER,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Usage ledger for credits
CREATE TABLE IF NOT EXISTS public.lucy_usage_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  credits_delta INTEGER NOT NULL,
  job_id UUID REFERENCES public.lucy_cinematic_jobs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Plans table
CREATE TABLE IF NOT EXISTS public.lucy_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  monthly_price NUMERIC DEFAULT 0,
  credits_per_month INTEGER DEFAULT 100,
  max_parallel_jobs INTEGER DEFAULT 1,
  max_duration_seconds INTEGER DEFAULT 10,
  max_exports_per_job INTEGER DEFAULT 1,
  features JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User plan association
CREATE TABLE IF NOT EXISTS public.lucy_user_plan (
  user_id UUID PRIMARY KEY,
  plan_key TEXT NOT NULL DEFAULT 'free',
  credits_balance INTEGER DEFAULT 100,
  renewal_date DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.lucy_cinematic_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lucy_prompt_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lucy_usage_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lucy_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lucy_user_plan ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lucy_cinematic_jobs
CREATE POLICY "Users can view their own jobs"
  ON public.lucy_cinematic_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jobs"
  ON public.lucy_cinematic_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs"
  ON public.lucy_cinematic_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs"
  ON public.lucy_cinematic_jobs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all jobs"
  ON public.lucy_cinematic_jobs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for lucy_prompt_memory
CREATE POLICY "Users can view their own memories"
  ON public.lucy_prompt_memory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own memories"
  ON public.lucy_prompt_memory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories"
  ON public.lucy_prompt_memory FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories"
  ON public.lucy_prompt_memory FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for lucy_usage_ledger
CREATE POLICY "Users can view their own usage"
  ON public.lucy_usage_ledger FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON public.lucy_usage_ledger FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage"
  ON public.lucy_usage_ledger FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for lucy_plans (public read)
CREATE POLICY "Anyone can view plans"
  ON public.lucy_plans FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage plans"
  ON public.lucy_plans FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for lucy_user_plan
CREATE POLICY "Users can view their own plan"
  ON public.lucy_user_plan FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plan"
  ON public.lucy_user_plan FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan"
  ON public.lucy_user_plan FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert default plans
INSERT INTO public.lucy_plans (plan_key, name, monthly_price, credits_per_month, max_parallel_jobs, max_duration_seconds, max_exports_per_job, features)
VALUES 
  ('free', 'Free', 0, 100, 1, 10, 1, '{"watermark": true, "voice": false, "music": false}'::jsonb),
  ('creator', 'Creator', 9.99, 500, 2, 30, 3, '{"watermark": false, "voice": true, "music": true}'::jsonb),
  ('pro', 'Pro', 29.99, 2000, 5, 60, 10, '{"watermark": false, "voice": true, "music": true, "4k": true}'::jsonb),
  ('studio', 'Studio', 99.99, 10000, 10, 120, 50, '{"watermark": false, "voice": true, "music": true, "4k": true, "api": true}'::jsonb)
ON CONFLICT (plan_key) DO NOTHING;

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_cinematic_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_lucy_cinematic_jobs_updated_at ON public.lucy_cinematic_jobs;
CREATE TRIGGER update_lucy_cinematic_jobs_updated_at
  BEFORE UPDATE ON public.lucy_cinematic_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_cinematic_updated_at();

DROP TRIGGER IF EXISTS update_lucy_user_plan_updated_at ON public.lucy_user_plan;
CREATE TRIGGER update_lucy_user_plan_updated_at
  BEFORE UPDATE ON public.lucy_user_plan
  FOR EACH ROW EXECUTE FUNCTION public.update_cinematic_updated_at();

-- Enable realtime for jobs table
ALTER PUBLICATION supabase_realtime ADD TABLE public.lucy_cinematic_jobs;

-- Create index for faster job queries
CREATE INDEX IF NOT EXISTS idx_cinematic_jobs_user_status ON public.lucy_cinematic_jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_cinematic_jobs_parent ON public.lucy_cinematic_jobs(parent_job_id);
CREATE INDEX IF NOT EXISTS idx_prompt_memory_user ON public.lucy_prompt_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_ledger_user ON public.lucy_usage_ledger(user_id);