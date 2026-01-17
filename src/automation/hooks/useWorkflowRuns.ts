// Hook for managing workflow runs and execution

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { WorkflowRun, WorkflowStatus } from '../types/automation.types';
import { useAutomationStore } from '../stores/automationStore';
import { useToast } from '@/hooks/use-toast';

export function useWorkflowRuns() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { 
    activeRuns, 
    setActiveRuns, 
    addRun, 
    updateRun,
    runHistory,
    setRunHistory,
  } = useAutomationStore();

  // Fetch runs for a workflow
  const fetchRuns = useCallback(async (workflowId?: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('lucy_workflow_runs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (workflowId) {
        query = query.eq('workflow_id', workflowId);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      const runs = (data || []) as WorkflowRun[];
      
      const active = runs.filter(r => r.status === 'running');
      const history = runs.filter(r => r.status !== 'running');

      setActiveRuns(active);
      setRunHistory(history);
    } catch (error) {
      console.error('Error fetching runs:', error);
    } finally {
      setLoading(false);
    }
  }, [setActiveRuns, setRunHistory]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('workflow-runs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lucy_workflow_runs',
        },
        (payload) => {
          console.log('Run update:', payload);
          fetchRuns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRuns]);

  // Start a workflow run
  const startRun = useCallback(async (params: {
    workflowId: string;
    triggerSource?: string;
    triggerPayload?: Record<string, unknown>;
  }): Promise<WorkflowRun | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to run workflows',
          variant: 'destructive',
        });
        return null;
      }

      const { data, error } = await supabase
        .from('lucy_workflow_runs')
        .insert([{
          workflow_id: params.workflowId,
          user_id: user.id,
          status: 'running' as const,
          trigger_source: params.triggerSource || 'manual',
          trigger_payload: params.triggerPayload ? JSON.parse(JSON.stringify(params.triggerPayload)) : null,
          started_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      const run = data as WorkflowRun;
      addRun(run);

      // Update workflow last_run_at
      await supabase
        .from('lucy_workflow_registry')
        .update({ last_run_at: new Date().toISOString() })
        .eq('id', params.workflowId);

      toast({
        title: 'Workflow started',
        description: 'Execution is in progress',
      });

      return run;
    } catch (error) {
      console.error('Error starting run:', error);
      toast({
        title: 'Error',
        description: 'Failed to start workflow',
        variant: 'destructive',
      });
      return null;
    }
  }, [addRun, toast]);

  // Update run status
  const updateRunStatus = useCallback(async (
    runId: string, 
    status: WorkflowStatus,
    extras?: {
      errorMessage?: string;
      errorNode?: string;
      resultData?: Record<string, unknown>;
    }
  ) => {
    try {
      const completedAt = ['complete', 'failed', 'canceled', 'healed'].includes(status)
        ? new Date().toISOString()
        : undefined;

      const { error } = await supabase
        .from('lucy_workflow_runs')
        .update({
          status,
          completed_at: completedAt,
          error_message: extras?.errorMessage,
          error_node: extras?.errorNode,
          result_data: extras?.resultData ? JSON.parse(JSON.stringify(extras.resultData)) : null,
        })
        .eq('id', runId);

      if (error) throw error;

      updateRun(runId, { 
        status, 
        completed_at: completedAt,
        ...extras,
      });

    } catch (error) {
      console.error('Error updating run:', error);
    }
  }, [updateRun]);

  // Cancel a run
  const cancelRun = useCallback(async (runId: string) => {
    await updateRunStatus(runId, 'canceled');
    toast({
      title: 'Run canceled',
      description: 'Workflow execution has been stopped',
    });
  }, [updateRunStatus, toast]);

  // Retry a failed run
  const retryRun = useCallback(async (runId: string) => {
    try {
      const { data } = await supabase
        .from('lucy_workflow_runs')
        .select('workflow_id, trigger_payload, retry_count')
        .eq('id', runId)
        .single();

      if (data) {
        // Update retry count
        await supabase
          .from('lucy_workflow_runs')
          .update({ retry_count: (data.retry_count || 0) + 1 })
          .eq('id', runId);

        // Start new run
        return startRun({
          workflowId: data.workflow_id,
          triggerSource: 'retry',
          triggerPayload: data.trigger_payload as Record<string, unknown>,
        });
      }
    } catch (error) {
      console.error('Error retrying run:', error);
      toast({
        title: 'Error',
        description: 'Failed to retry workflow',
        variant: 'destructive',
      });
    }
    return null;
  }, [startRun, toast]);

  // Get run stats
  const getRunStats = useCallback(() => {
    const all = [...activeRuns, ...runHistory];
    return {
      total: all.length,
      running: activeRuns.length,
      completed: all.filter(r => r.status === 'complete').length,
      failed: all.filter(r => r.status === 'failed').length,
      healed: all.filter(r => r.status === 'healed').length,
    };
  }, [activeRuns, runHistory]);

  return {
    loading,
    activeRuns,
    runHistory,
    fetchRuns,
    startRun,
    updateRunStatus,
    cancelRun,
    retryRun,
    getRunStats,
  };
}
