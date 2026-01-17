// Hook for managing cinematic jobs with Supabase
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CinematicJob, CinematicShot } from '../types/cinematic.types';
import { useCinematicStore } from '../stores/cinematicStore';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

/* ------------------------------------------------------------------
   SAFE JSON ↔ CINEMATIC SHOT NORMALIZATION
------------------------------------------------------------------- */

function shotsToJson(shots: CinematicShot[]): Json[] {
  return shots.map((s) => ({
    id: s.id,
    name: s.name,
    prompt: s.prompt,
    duration: s.duration,
    camera: s.camera ?? null,
    movement: s.movement ?? null,
    transition: s.transition ?? null,
    notes: s.notes ?? null,
  }));
}

function jsonToShots(value: Json | null | undefined): CinematicShot[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((v): v is Record<string, Json> => typeof v === 'object' && v !== null)
    .map((v) => ({
      id: String(v.id ?? crypto.randomUUID()),
      name: String(v.name ?? 'Shot'),
      prompt: String(v.prompt ?? ''),
      duration: Number(v.duration ?? 3),
      camera: typeof v.camera === 'string' ? v.camera : undefined,
      movement: typeof v.movement === 'string' ? v.movement : undefined,
      transition: typeof v.transition === 'string' ? v.transition : undefined,
      notes: typeof v.notes === 'string' ? v.notes : undefined,
    }));
}

/* ------------------------------------------------------------------
   HOOK
------------------------------------------------------------------- */

export function useCinematicJobs() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    jobQueue,
    setJobQueue,
    activeJobs,
    setActiveJobs,
    addToQueue,
    removeFromQueue,
  } = useCinematicStore();

  /* ---------------- FETCH JOBS ---------------- */

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      const { data, error } = await supabase
        .from('lucy_cinematic_jobs')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const jobs: CinematicJob[] = (data ?? []).map((job: any) => ({
        ...job,
        shots: jsonToShots(job.shots),
        mcp_payload:
          typeof job.mcp_payload === 'object' && job.mcp_payload !== null
            ? (job.mcp_payload as Record<string, unknown>)
            : undefined,
        export_urls:
          typeof job.export_urls === 'object' && job.export_urls !== null
            ? (job.export_urls as Record<string, unknown>)
            : undefined,
      }));

      setJobQueue(jobs.filter((j) => j.status === 'queued'));
      setActiveJobs(jobs.filter((j) => j.status === 'running'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setJobQueue, setActiveJobs]);

  /* ---------------- REALTIME ---------------- */

  useEffect(() => {
    fetchJobs();

    const channel = supabase
      .channel('cinematic-jobs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lucy_cinematic_jobs' },
        fetchJobs
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchJobs]);

  /* ---------------- CREATE JOB ---------------- */

  const createJob = useCallback(
    async (params: {
      title: string;
      promptRaw: string;
      promptEnhanced: string;
      stylePreset: string;
      shots: CinematicShot[];
      duration: number;
      aspectRatio: string;
      jobType?: CinematicJob['job_type'];
      parentJobId?: string;
    }): Promise<CinematicJob | null> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        toast({ title: 'Authentication required', variant: 'destructive' });
        return null;
      }

      const { data, error } = await supabase
        .from('lucy_cinematic_jobs')
        .insert({
          user_id: auth.user.id,
          title: params.title,
          prompt_raw: params.promptRaw,
          prompt_enhanced: params.promptEnhanced,
          style_preset: params.stylePreset,
          shots: shotsToJson(params.shots),
          duration_seconds: params.duration,
          aspect_ratio: params.aspectRatio,
          job_type: params.jobType ?? 'video',
          parent_job_id: params.parentJobId ?? null,
          status: 'queued',
        })
        .select()
        .single();

      if (error || !data) {
        toast({ title: 'Failed to create job', variant: 'destructive' });
        return null;
      }

      const job: CinematicJob = {
        ...data,
        shots: jsonToShots(data.shots),
      };

      addToQueue(job);
      toast({ title: 'Video queued successfully' });
      return job;
    },
    [addToQueue, toast]
  );

  /* ---------------- CANCEL ---------------- */

  const cancelJob = useCallback(
    async (jobId: string) => {
      await supabase
        .from('lucy_cinematic_jobs')
        .update({ status: 'canceled' })
        .eq('id', jobId);

      removeFromQueue(jobId);
    },
    [removeFromQueue]
  );

  /* ---------------- RETRY ---------------- */

  const retryJob = useCallback(
    async (jobId: string) => {
      await supabase
        .from('lucy_cinematic_jobs')
        .update({ status: 'queued', error_message: null, attempt_count: 0 })
        .eq('id', jobId);

      fetchJobs();
    },
    [fetchJobs]
  );

  return {
    loading,
    jobQueue,
    activeJobs,
    fetchJobs,
    createJob,
    cancelJob,
    retryJob,
  };
}
