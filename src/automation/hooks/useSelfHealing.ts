// Self-Healing Layer Hook
// Detects failures, attempts retries, and logs healing events

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { HealingEvent, WorkflowRun } from '../types/automation.types';
import { useAutomationStore } from '../stores/automationStore';
import { useToast } from '@/hooks/use-toast';

// Healing strategies
const HEALING_STRATEGIES = {
  RETRY: 'retry',
  FALLBACK_MODEL: 'fallback_model',
  SKIP_NODE: 'skip_node',
  NOTIFY_USER: 'notify_user',
  ESCALATE: 'escalate',
} as const;

// Error diagnosis patterns
const ERROR_PATTERNS = [
  { pattern: /rate limit/i, diagnosis: 'API rate limit exceeded', remedy: HEALING_STRATEGIES.RETRY },
  { pattern: /timeout/i, diagnosis: 'Request timeout', remedy: HEALING_STRATEGIES.RETRY },
  { pattern: /api key/i, diagnosis: 'Invalid or missing API key', remedy: HEALING_STRATEGIES.NOTIFY_USER },
  { pattern: /model.*not found/i, diagnosis: 'Model unavailable', remedy: HEALING_STRATEGIES.FALLBACK_MODEL },
  { pattern: /connection/i, diagnosis: 'Connection error', remedy: HEALING_STRATEGIES.RETRY },
  { pattern: /permission/i, diagnosis: 'Permission denied', remedy: HEALING_STRATEGIES.ESCALATE },
];

export function useSelfHealing() {
  const { toast } = useToast();
  const { addHealingEvent, setHealingEvents, healingEvents } = useAutomationStore();

  // Diagnose error and suggest remedy
  const diagnoseError = useCallback((error: string): { diagnosis: string; remedy: string } => {
    for (const pattern of ERROR_PATTERNS) {
      if (pattern.pattern.test(error)) {
        return { diagnosis: pattern.diagnosis, remedy: pattern.remedy };
      }
    }
    return { diagnosis: 'Unknown error', remedy: HEALING_STRATEGIES.NOTIFY_USER };
  }, []);

  // Log a healing event
  const logHealingEvent = useCallback(async (params: {
    runId: string;
    healingType: string;
    originalError: string;
    diagnosis?: string;
    remedyApplied?: string;
    success: boolean;
    retryAttempt?: number;
  }): Promise<HealingEvent | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('lucy_healing_events')
        .insert([{
          run_id: params.runId,
          user_id: user.id,
          healing_type: params.healingType,
          original_error: params.originalError,
          diagnosis: params.diagnosis,
          remedy_applied: params.remedyApplied,
          success: params.success,
          retry_attempt: params.retryAttempt || 1,
          healed_at: params.success ? new Date().toISOString() : null,
        }])
        .select()
        .single();

      if (error) throw error;

      const event = data as HealingEvent;
      addHealingEvent(event);

      return event;
    } catch (error) {
      console.error('Error logging healing event:', error);
      return null;
    }
  }, [addHealingEvent]);

  // Attempt to heal a failed run
  const attemptHealing = useCallback(async (
    run: WorkflowRun,
    maxRetries: number = 3
  ): Promise<{ healed: boolean; action: string }> => {
    if (!run.error_message) {
      return { healed: false, action: 'No error to heal' };
    }

    const { diagnosis, remedy } = diagnoseError(run.error_message);
    
    // Check retry count
    if (run.retry_count >= maxRetries && remedy === HEALING_STRATEGIES.RETRY) {
      await logHealingEvent({
        runId: run.id,
        healingType: 'max_retries_exceeded',
        originalError: run.error_message,
        diagnosis,
        remedyApplied: 'Escalated to user',
        success: false,
        retryAttempt: run.retry_count,
      });

      toast({
        title: 'Healing failed',
        description: `Max retries exceeded for workflow. ${diagnosis}`,
        variant: 'destructive',
      });

      return { healed: false, action: 'Max retries exceeded, escalated to user' };
    }

    // Apply remedy based on diagnosis
    switch (remedy) {
      case HEALING_STRATEGIES.RETRY:
        await logHealingEvent({
          runId: run.id,
          healingType: 'auto_retry',
          originalError: run.error_message,
          diagnosis,
          remedyApplied: 'Automatic retry scheduled',
          success: true,
          retryAttempt: run.retry_count + 1,
        });

        toast({
          title: 'Self-healing activated',
          description: `${diagnosis}. Retrying automatically...`,
        });

        return { healed: true, action: 'Automatic retry' };

      case HEALING_STRATEGIES.FALLBACK_MODEL:
        await logHealingEvent({
          runId: run.id,
          healingType: 'fallback_model',
          originalError: run.error_message,
          diagnosis,
          remedyApplied: 'Switched to fallback model',
          success: true,
        });

        toast({
          title: 'Model fallback',
          description: 'Switched to backup model',
        });

        return { healed: true, action: 'Fallback model activated' };

      case HEALING_STRATEGIES.NOTIFY_USER:
        await logHealingEvent({
          runId: run.id,
          healingType: 'user_notification',
          originalError: run.error_message,
          diagnosis,
          remedyApplied: 'User notified for manual intervention',
          success: false,
        });

        toast({
          title: 'Action required',
          description: diagnosis,
          variant: 'destructive',
        });

        return { healed: false, action: 'User notification sent' };

      case HEALING_STRATEGIES.ESCALATE:
        await logHealingEvent({
          runId: run.id,
          healingType: 'escalation',
          originalError: run.error_message,
          diagnosis,
          remedyApplied: 'Escalated to diagnostic agent',
          success: false,
        });

        toast({
          title: 'Escalated',
          description: 'Issue requires manual review',
          variant: 'destructive',
        });

        return { healed: false, action: 'Escalated to diagnostics' };

      default:
        return { healed: false, action: 'No remedy available' };
    }
  }, [diagnoseError, logHealingEvent, toast]);

  // Fetch healing history
  const fetchHealingHistory = useCallback(async (runId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('lucy_healing_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (runId) {
        query = query.eq('run_id', runId);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      setHealingEvents((data || []) as HealingEvent[]);
    } catch (error) {
      console.error('Error fetching healing history:', error);
    }
  }, [setHealingEvents]);

  // Get healing stats
  const getHealingStats = useCallback(() => {
    return {
      total: healingEvents.length,
      successful: healingEvents.filter(e => e.success).length,
      failed: healingEvents.filter(e => !e.success).length,
      byType: healingEvents.reduce((acc, e) => {
        acc[e.healing_type] = (acc[e.healing_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }, [healingEvents]);

  return {
    diagnoseError,
    attemptHealing,
    logHealingEvent,
    fetchHealingHistory,
    getHealingStats,
    healingEvents,
  };
}
