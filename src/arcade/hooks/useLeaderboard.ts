// Lucy Arcade - Leaderboard Hook
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { LeaderboardEntry } from '../types/game.types';

export function useLeaderboard(gameId: string) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLeaderboard = useCallback(async (limit = 100) => {
    try {
      setIsLoading(true);

      // Get top scores with distinct users (best score per user)
      const { data, error } = await supabase
        .from('arcade_leaderboards')
        .select(`
          id,
          game_id,
          user_id,
          score,
          achieved_at
        `)
        .eq('game_id', gameId)
        .order('score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return;
      }

      // Get unique users' best scores
      const userBestScores = new Map<string, typeof data[0]>();
      data?.forEach(entry => {
        const existing = userBestScores.get(entry.user_id);
        if (!existing || entry.score > existing.score) {
          userBestScores.set(entry.user_id, entry);
        }
      });

      // Fetch profiles for display names
      const userIds = Array.from(userBestScores.keys());
      const { data: profiles } = await supabase
        .from('arcade_player_profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Build ranked entries
      const rankedEntries: LeaderboardEntry[] = Array.from(userBestScores.values())
        .sort((a, b) => Number(b.score) - Number(a.score))
        .slice(0, limit)
        .map((entry, index) => {
          const profile = profileMap.get(entry.user_id);
          return {
            id: entry.id,
            gameId: entry.game_id,
            userId: entry.user_id,
            displayName: profile?.display_name || 'Anonymous',
            avatarUrl: profile?.avatar_url || null,
            score: Number(entry.score),
            achievedAt: entry.achieved_at,
            rank: index + 1,
          };
        });

      setEntries(rankedEntries);
    } catch (err) {
      console.error('Error in fetchLeaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  const getUserRank = useCallback(async (userId: string): Promise<number | null> => {
    const { data, error } = await supabase
      .from('arcade_leaderboards')
      .select('user_id, score')
      .eq('game_id', gameId)
      .order('score', { ascending: false });

    if (error || !data) return null;

    // Find user's best score rank
    const userBestScores = new Map<string, number>();
    data.forEach(entry => {
      const existing = userBestScores.get(entry.user_id);
      if (!existing || Number(entry.score) > existing) {
        userBestScores.set(entry.user_id, Number(entry.score));
      }
    });

    const sortedUsers = Array.from(userBestScores.entries())
      .sort((a, b) => b[1] - a[1]);

    const userIndex = sortedUsers.findIndex(([id]) => id === userId);
    return userIndex >= 0 ? userIndex + 1 : null;
  }, [gameId]);

  return {
    entries,
    isLoading,
    fetchLeaderboard,
    getUserRank,
  };
}
