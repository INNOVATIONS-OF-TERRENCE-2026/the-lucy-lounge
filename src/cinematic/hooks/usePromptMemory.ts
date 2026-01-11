// Hook for managing prompt memory and learning
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { PromptMemory, CinematicShot } from '../types/cinematic.types';
import { useCinematicStore } from '../stores/cinematicStore';
import type { Json } from '@/integrations/supabase/types';

const shotsToJson = (shots?: CinematicShot[]): Json[] | null =>
  shots ? shots.map((s) => ({ ...s })) : null;

const jsonToShots = (value: Json | null | undefined): CinematicShot[] =>
  Array.isArray(value) ? (value as unknown as CinematicShot[]) : [];

export function usePromptMemory() {
  const [loading, setLoading] = useState(false);
  const { promptHistory, setPromptHistory, addPromptToHistory } =
    useCinematicStore();

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      const { data } = await supabase
        .from('lucy_prompt_memory')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setPromptHistory(
        (data ?? []).map((m: any) => ({
          ...m,
          shots: jsonToShots(m.shots),
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [setPromptHistory]);

  const saveMemory = useCallback(
    async (params: {
      promptRaw: string;
      promptEnhanced?: string;
      stylePreset?: string;
      shots?: CinematicShot[];
      success: boolean;
      score?: number;
      tags?: string[];
    }): Promise<PromptMemory | null> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return null;

      const { data } = await supabase
        .from('lucy_prompt_memory')
        .insert({
          user_id: auth.user.id,
          prompt_raw: params.promptRaw,
          prompt_enhanced: params.promptEnhanced,
          style_preset: params.stylePreset,
          shots: shotsToJson(params.shots),
          success: params.success,
          final_score: params.score ?? null,
          tags: params.tags ?? null,
        })
        .select()
        .single();

      if (!data) return null;

      const memory: PromptMemory = {
        ...data,
        shots: jsonToShots(data.shots),
      };

      addPromptToHistory(memory);
      return memory;
    },
    [addPromptToHistory]
  );

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    loading,
    promptHistory,
    fetchHistory,
    saveMemory,
  };
}
