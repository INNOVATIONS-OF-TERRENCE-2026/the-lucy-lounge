// Hook for managing prompt memory and learning
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { PromptMemory, CinematicShot } from '../types/cinematic.types';
import { useCinematicStore } from '../stores/cinematicStore';
import type { Json } from '@/integrations/supabase/types';

/* ------------------------------------------------------------------
   SAFE JSON ↔ SHOT NORMALIZATION
------------------------------------------------------------------- */

function shotsToJson(shots?: CinematicShot[]): Json[] | null {
  if (!shots) return null;

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

export function usePromptMemory() {
  const [loading, setLoading] = useState(false);
  const { promptHistory, setPromptHistory, addPromptToHistory } =
    useCinematicStore();

  /* ---------------- FETCH ---------------- */

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

  /* ---------------- SAVE ---------------- */

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
