-- Lucy Automation Studio Tables

-- Workflow status enum
DO $$ BEGIN
  CREATE TYPE public.automation_workflow_status AS ENUM ('idle', 'running', 'failed', 'healed', 'complete', 'canceled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Workflow trigger type enum
DO $$ BEGIN
  CREATE TYPE public.automation_trigger_type AS ENUM ('manual', 'chat', 'schedule', 'webhook', 'event');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Workflow Registry - stores imported workflow blueprints
CREATE TABLE IF NOT EXISTS public.lucy_workflow_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  external_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type automation_trigger_type NOT NULL DEFAULT 'manual',
  required_secrets TEXT[] DEFAULT '{}',
  node_count INTEGER DEFAULT 0,
  workflow_json JSONB NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow Runs - execution history
CREATE TABLE IF NOT EXISTS public.lucy_workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.lucy_workflow_registry(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  status automation_workflow_status NOT NULL DEFAULT 'running',
  trigger_source TEXT DEFAULT 'manual',
  trigger_payload JSONB,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  result_data JSONB,
  error_message TEXT,
  error_node TEXT,
  retry_count INTEGER DEFAULT 0,
  parent_run_id UUID REFERENCES public.lucy_workflow_runs(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Agent Decisions - AI decision logging
CREATE TABLE IF NOT EXISTS public.lucy_agent_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES public.lucy_workflow_runs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  decision_type TEXT NOT NULL,
  model_used TEXT,
  input_context JSONB,
  decision_output JSONB,
  confidence_score NUMERIC(5,4),
  reasoning TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Healing Events - self-healing attempts
CREATE TABLE IF NOT EXISTS public.lucy_healing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES public.lucy_workflow_runs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  healing_type TEXT NOT NULL,
  original_error TEXT,
  diagnosis TEXT,
  remedy_applied TEXT,
  success BOOLEAN DEFAULT false,
  retry_attempt INTEGER DEFAULT 1,
  healed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lucy_workflow_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lucy_workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lucy_agent_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lucy_healing_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lucy_workflow_registry
CREATE POLICY "Users can view their own workflows"
  ON public.lucy_workflow_registry FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflows"
  ON public.lucy_workflow_registry FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflows"
  ON public.lucy_workflow_registry FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflows"
  ON public.lucy_workflow_registry FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for lucy_workflow_runs
CREATE POLICY "Users can view their own runs"
  ON public.lucy_workflow_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own runs"
  ON public.lucy_workflow_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own runs"
  ON public.lucy_workflow_runs FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for lucy_agent_decisions
CREATE POLICY "Users can view their own decisions"
  ON public.lucy_agent_decisions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own decisions"
  ON public.lucy_agent_decisions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for lucy_healing_events
CREATE POLICY "Users can view their own healing events"
  ON public.lucy_healing_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own healing events"
  ON public.lucy_healing_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all workflows"
  ON public.lucy_workflow_registry FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all runs"
  ON public.lucy_workflow_runs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_registry_user ON public.lucy_workflow_registry(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow ON public.lucy_workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status ON public.lucy_workflow_runs(status);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_run ON public.lucy_agent_decisions(run_id);
CREATE INDEX IF NOT EXISTS idx_healing_events_run ON public.lucy_healing_events(run_id);

-- Updated at trigger
DROP TRIGGER IF EXISTS update_lucy_workflow_registry_updated_at ON public.lucy_workflow_registry;
CREATE TRIGGER update_lucy_workflow_registry_updated_at
  BEFORE UPDATE ON public.lucy_workflow_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_cinematic_updated_at();

-- Enable realtime for runs
ALTER PUBLICATION supabase_realtime ADD TABLE public.lucy_workflow_runs;