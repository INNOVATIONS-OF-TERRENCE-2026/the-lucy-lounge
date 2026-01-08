// Lucy Arcade - Game Stats Hook
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useArcadeStore } from '../stores/arcadeStore';
import type { GameStats } from '../types/game.types';

export function useGameStats(gameId: string) {
  const { gameStatsCache, updateGameStats } = useArcadeStore();
  const cachedStats = gameStatsCache[gameId];

  const fetchStats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('arcade_game_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_id', gameId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching game stats:', error);
        return null;
      }

      if (data) {
        const stats: GameStats = {
          id: data.id,
          userId: data.user_id,
          gameId: data.game_id,
          plays: data.plays,
          wins: data.wins,
          losses: data.losses,
          highScore: Number(data.high_score),
          totalPlaytimeSeconds: data.total_playtime_seconds,
          lastPlayedAt: data.last_played_at,
        };
        updateGameStats(gameId, stats);
        return stats;
      }

      return null;
    } catch (err) {
      console.error('Error in fetchStats:', err);
      return null;
    }
  }, [gameId, updateGameStats]);

  const recordGame = useCallback(async (result: {
    won: boolean;
    score: number;
    playtimeSeconds: number;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if stats exist
      const { data: existing } = await supabase
        .from('arcade_game_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_id', gameId)
        .single();

      if (existing) {
        // Update existing stats
        const newHighScore = Math.max(Number(existing.high_score), result.score);
        
        await supabase
          .from('arcade_game_stats')
          .update({
            plays: existing.plays + 1,
            wins: result.won ? existing.wins + 1 : existing.wins,
            losses: result.won ? existing.losses : existing.losses + 1,
            high_score: newHighScore,
            total_playtime_seconds: existing.total_playtime_seconds + result.playtimeSeconds,
            last_played_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // Create new stats record
        await supabase
          .from('arcade_game_stats')
          .insert({
            user_id: user.id,
            game_id: gameId,
            plays: 1,
            wins: result.won ? 1 : 0,
            losses: result.won ? 0 : 1,
            high_score: result.score,
            total_playtime_seconds: result.playtimeSeconds,
            last_played_at: new Date().toISOString(),
          });
      }

      // Submit to leaderboard if high score
      if (result.score > 0) {
        await supabase
          .from('arcade_leaderboards')
          .insert({
            game_id: gameId,
            user_id: user.id,
            score: result.score,
          });
      }

      // Refresh stats
      fetchStats();
    } catch (err) {
      console.error('Error recording game:', err);
    }
  }, [gameId, fetchStats]);

  return {
    stats: cachedStats,
    fetchStats,
    recordGame,
  };
}
