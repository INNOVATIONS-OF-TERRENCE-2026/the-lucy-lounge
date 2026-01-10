// Hook for managing cinematic jobs with Supabase

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CinematicJob, CinematicShot } from '../types/cinematic.types';
import { useCinematicStore } from '../stores/cinematicStore';
import { useToast } from '@/hooks/use-toast';

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

  // Fetch user's jobs
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lucy_cinematic_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type cast the data
      const jobs = (data || []).map(job => ({
        ...job,
        shots: (job.shots as unknown as CinematicShot[]) || [],
        mcp_payload: job.mcp_payload as Record<string, unknown> | undefined,
        export_urls: job.export_urls as Record<string, string> | undefined,
      })) as CinematicJob[];

      // Separate by status
      const queued = jobs.filter(j => j.status === 'queued');
      const running = jobs.filter(j => j.status === 'running');

      setJobQueue(queued);
      setActiveJobs(running);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [setJobQueue, setActiveJobs]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('cinematic-jobs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lucy_cinematic_jobs',
        },
        (payload) => {
          console.log('Job update:', payload);
          fetchJobs(); // Refresh on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchJobs]);

  // Create a new job
  const createJob = useCallback(async (params: {
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to create videos',
          variant: 'destructive',
        });
        return null;
      }

      // Generate idempotency key
      const idempotencyKey = `${user.id}_${params.promptRaw.slice(0, 50)}_${Date.now()}`;

      const { data, error } = await supabase
        .from('lucy_cinematic_jobs')
        .insert([{
          user_id: user.id,
          title: params.title,
          prompt_raw: params.promptRaw,
          prompt_enhanced: params.promptEnhanced,
          style_preset: params.stylePreset,
          shots: params.shots as unknown as Record<string, unknown>[],
          duration_seconds: params.duration,
          aspect_ratio: params.aspectRatio,
          job_type: params.jobType || 'video',
          parent_job_id: params.parentJobId,
          status: 'queued' as const,
          idempotency_key: idempotencyKey,
        }])
        .select()
        .single();

      if (error) throw error;

      const job = {
        ...data,
        shots: (data.shots as unknown as CinematicShot[]) || [],
        mcp_payload: data.mcp_payload as Record<string, unknown> | undefined,
        export_urls: data.export_urls as Record<string, string> | undefined,
      } as CinematicJob;

      addToQueue(job);
      
      toast({
        title: 'Video queued',
        description: 'Your video is being generated',
      });

      return job;
    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: 'Error',
        description: 'Failed to create video job',
        variant: 'destructive',
      });
      return null;
    }
  }, [addToQueue, toast]);

  // Cancel a job
  const cancelJob = useCallback(async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('lucy_cinematic_jobs')
        .update({ status: 'canceled' })
        .eq('id', jobId);

      if (error) throw error;

      removeFromQueue(jobId);
      toast({
        title: 'Job canceled',
        description: 'Video generation has been canceled',
      });
    } catch (error) {
      console.error('Error canceling job:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel job',
        variant: 'destructive',
      });
    }
  }, [removeFromQueue, toast]);

  // Get job by ID
  const getJob = useCallback(async (jobId: string): Promise<CinematicJob | null> => {
    try {
      const { data, error } = await supabase
        .from('lucy_cinematic_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;

      return {
        ...data,
        shots: (data.shots as unknown as CinematicShot[]) || [],
        mcp_payload: data.mcp_payload as Record<string, unknown> | undefined,
        export_urls: data.export_urls as Record<string, string> | undefined,
      } as CinematicJob;
    } catch (error) {
      console.error('Error fetching job:', error);
      return null;
    }
  }, []);

  // Retry a failed job
  const retryJob = useCallback(async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('lucy_cinematic_jobs')
        .update({ 
          status: 'queued',
          error_message: null,
          attempt_count: 0,
        })
        .eq('id', jobId);

      if (error) throw error;

      fetchJobs();
      toast({
        title: 'Retrying',
        description: 'Video generation will restart',
      });
    } catch (error) {
      console.error('Error retrying job:', error);
      toast({
        title: 'Error',
        description: 'Failed to retry job',
        variant: 'destructive',
      });
    }
  }, [fetchJobs, toast]);

  return {
    loading,
    jobQueue,
    activeJobs,
    fetchJobs,
    createJob,
    cancelJob,
    getJob,
    retryJob,
  };
}
