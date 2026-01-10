// Hook for managing prompt memory and learning

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { PromptMemory, CinematicShot } from '../types/cinematic.types';
import { useCinematicStore } from '../stores/cinematicStore';

export function usePromptMemory() {
  const [loading, setLoading] = useState(false);
  const { promptHistory, setPromptHistory, addPromptToHistory } = useCinematicStore();

  // Fetch user's prompt history
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lucy_prompt_memory')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const memories = (data || []).map(m => ({
        ...m,
        shots: (m.shots as unknown as CinematicShot[]) || [],
      })) as PromptMemory[];

      setPromptHistory(memories);
    } catch (error) {
      console.error('Error fetching prompt history:', error);
    } finally {
      setLoading(false);
    }
  }, [setPromptHistory]);

  // Save a new memory
  const saveMemory = useCallback(async (params: {
    promptRaw: string;
    promptEnhanced?: string;
    stylePreset?: string;
    shots?: CinematicShot[];
    success: boolean;
    score?: number;
    tags?: string[];
  }): Promise<PromptMemory | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('lucy_prompt_memory')
        .insert([{
          user_id: user.id,
          prompt_raw: params.promptRaw,
          prompt_enhanced: params.promptEnhanced,
          style_preset: params.stylePreset,
          shots: params.shots as unknown as Record<string, unknown>[],
          success: params.success,
          final_score: params.score,
          tags: params.tags,
        }])
        .select()
        .single();

      if (error) throw error;

      const memory = {
        ...data,
        shots: (data.shots as unknown as CinematicShot[]) || [],
      } as PromptMemory;

      addPromptToHistory(memory);
      return memory;
    } catch (error) {
      console.error('Error saving memory:', error);
      return null;
    }
  }, [addPromptToHistory]);

  // Update memory with rating
  const rateMemory = useCallback(async (memoryId: string, score: number) => {
    try {
      const { error } = await supabase
        .from('lucy_prompt_memory')
        .update({ final_score: score })
        .eq('id', memoryId);

      if (error) throw error;

      // Update local state
      setPromptHistory(
        promptHistory.map(m => 
          m.id === memoryId ? { ...m, final_score: score } : m
        )
      );
    } catch (error) {
      console.error('Error rating memory:', error);
    }
  }, [promptHistory, setPromptHistory]);

  // Get suggestions based on history
  const getSuggestions = useCallback((currentPrompt: string): {
    suggestedPreset?: string;
    suggestedDuration?: number;
    relatedPrompts: PromptMemory[];
  } => {
    const keywords = currentPrompt.toLowerCase().split(/\s+/);
    
    // Find related successful memories
    const related = promptHistory
      .filter(m => m.success && (m.final_score || 0) >= 3)
      .filter(m => {
        const memoryKeywords = m.prompt_raw.toLowerCase().split(/\s+/);
        return keywords.some(k => memoryKeywords.includes(k));
      })
      .slice(0, 5);

    // Calculate most used successful preset
    const presetCounts: Record<string, number> = {};
    related.forEach(m => {
      if (m.style_preset) {
        presetCounts[m.style_preset] = (presetCounts[m.style_preset] || 0) + 1;
      }
    });

    const suggestedPreset = Object.entries(presetCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    // Calculate average duration from related
    const durations = related
      .flatMap(m => m.shots || [])
      .map(s => s.duration)
      .filter(d => d > 0);
    
    const suggestedDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : undefined;

    return {
      suggestedPreset,
      suggestedDuration,
      relatedPrompts: related,
    };
  }, [promptHistory]);

  // Get most used tags
  const getPopularTags = useCallback((): string[] => {
    const tagCounts: Record<string, number> = {};
    
    promptHistory.forEach(m => {
      (m.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }, [promptHistory]);

  // Initialize
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    loading,
    promptHistory,
    fetchHistory,
    saveMemory,
    rateMemory,
    getSuggestions,
    getPopularTags,
  };
}
