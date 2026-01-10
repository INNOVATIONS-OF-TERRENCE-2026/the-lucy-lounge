// Hook for managing user plan and credits

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CinematicPlan, UserPlan } from '../types/cinematic.types';
import { useCinematicStore } from '../stores/cinematicStore';
import { useToast } from '@/hooks/use-toast';

export function useUserPlan() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { 
    userPlan, 
    setUserPlan, 
    availablePlans, 
    setAvailablePlans 
  } = useCinematicStore();

  // Fetch available plans
  const fetchPlans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('lucy_plans')
        .select('*')
        .order('monthly_price', { ascending: true });

      if (error) throw error;

      const plans = (data || []).map(plan => ({
        ...plan,
        features: (plan.features as CinematicPlan['features']) || {},
      })) as CinematicPlan[];

      setAvailablePlans(plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  }, [setAvailablePlans]);

  // Fetch user's current plan
  const fetchUserPlan = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserPlan(null);
        return;
      }

      const { data, error } = await supabase
        .from('lucy_user_plan')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUserPlan(data as UserPlan);
      } else {
        // Create default free plan for user
        const { data: newPlan, error: insertError } = await supabase
          .from('lucy_user_plan')
          .insert({
            user_id: user.id,
            plan_key: 'free',
            credits_balance: 100,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setUserPlan(newPlan as UserPlan);
      }
    } catch (error) {
      console.error('Error fetching user plan:', error);
    } finally {
      setLoading(false);
    }
  }, [setUserPlan]);

  // Get current plan details
  const getCurrentPlanDetails = useCallback((): CinematicPlan | null => {
    if (!userPlan) return null;
    return availablePlans.find(p => p.plan_key === userPlan.plan_key) || null;
  }, [userPlan, availablePlans]);

  // Check if user has enough credits
  const hasCredits = useCallback((amount: number): boolean => {
    return (userPlan?.credits_balance || 0) >= amount;
  }, [userPlan]);

  // Check plan limits
  const checkPlanLimits = useCallback((duration: number, parallelJobs: number): {
    allowed: boolean;
    reason?: string;
  } => {
    const plan = getCurrentPlanDetails();
    if (!plan) {
      return { allowed: false, reason: 'No plan found' };
    }

    if (duration > plan.max_duration_seconds) {
      return { 
        allowed: false, 
        reason: `Duration exceeds plan limit (max ${plan.max_duration_seconds}s)` 
      };
    }

    if (parallelJobs >= plan.max_parallel_jobs) {
      return { 
        allowed: false, 
        reason: `Max parallel jobs reached (${plan.max_parallel_jobs})` 
      };
    }

    return { allowed: true };
  }, [getCurrentPlanDetails]);

  // Deduct credits (called after job completion)
  const deductCredits = useCallback(async (amount: number, action: string, jobId?: string) => {
    if (!userPlan) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Update balance
      const newBalance = Math.max(0, userPlan.credits_balance - amount);
      
      const { error: updateError } = await supabase
        .from('lucy_user_plan')
        .update({ credits_balance: newBalance })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Log usage
      const { error: ledgerError } = await supabase
        .from('lucy_usage_ledger')
        .insert({
          user_id: user.id,
          action,
          credits_delta: -amount,
          job_id: jobId,
        });

      if (ledgerError) throw ledgerError;

      setUserPlan({ ...userPlan, credits_balance: newBalance });
      return true;
    } catch (error) {
      console.error('Error deducting credits:', error);
      return false;
    }
  }, [userPlan, setUserPlan]);

  // Get credit cost for action
  const getCreditCost = useCallback((action: string, duration: number): number => {
    const baseCosts: Record<string, number> = {
      'generate_video': 10,
      'generate_voice': 5,
      'generate_music': 3,
      'export_pack': 2,
    };

    const base = baseCosts[action] || 10;
    // Scale by duration (per 5 seconds)
    const durationMultiplier = Math.ceil(duration / 5);
    
    return base * durationMultiplier;
  }, []);

  // Initialize
  useEffect(() => {
    fetchPlans();
    fetchUserPlan();
  }, [fetchPlans, fetchUserPlan]);

  return {
    loading,
    userPlan,
    availablePlans,
    getCurrentPlanDetails,
    hasCredits,
    checkPlanLimits,
    deductCredits,
    getCreditCost,
    refresh: fetchUserPlan,
  };
}
