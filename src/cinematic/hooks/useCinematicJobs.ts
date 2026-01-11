// Hook for managing cinematic jobs with Supabase
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CinematicJob, CinematicShot } from '../types/cinematic.types';
import { useCinematicStore } from '../stores/cinematicStore';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

const shotsToJson = (shots: CinematicShot[]): Json[] =>
  shots.map((s) => ({
    id: s.id,
    name: s.name,
    prompt: s.prompt,
    duration: s.duration,
    camera: s.camera,
    movement: s.movement,
    transition: s.transition,
    notes: s.notes ?? null,
  })) as Json[];

const jsonToShots = (value: Json | null | undefined): CinematicShot[] => {
  if (!Array.isArray(value)) return [];
  return value.map((v) => v as unknown as CinematicShot);
};

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
        mcp_payload: job.mcp_payload ?? undefined,
        export_urls: job.export_urls ?? undefined,
      }));

      setJobQueue(jobs.filter((j) => j.status === 'queued'));
      setActiveJobs(jobs.filter((j) => j.status === 'running'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setJobQueue, setActiveJobs]);

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
        toast({
          title: 'Authentication required',
          variant: 'destructive',
        });
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
        mcp_payload: data.mcp_payload as Record<string, unknown> | undefined,
        export_urls: data.export_urls as Record<string, string> | undefined,
      };

      addToQueue(job);
      toast({ title: 'Video queued successfully' });
      return job;
    },
    [addToQueue, toast]
  );

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
