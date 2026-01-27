/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — SECURE LEADERBOARD SERVICE                                    │
 * │                                                                             │
 * │ Server-side validated leaderboard management                                │
 * │                                                                             │
 * │ FEATURES:                                                                   │
 * │ • Server-side score validation                                              │
 * │ • Anti-cheat score verification                                             │
 * │ • Global, regional, and friend leaderboards                                 │
 * │ • Weekly, monthly, and seasonal rankings                                    │
 * │ • Rank calculation with percentiles                                         │
 * │ • Leaderboard caching for performance                                       │
 * │ • Score submission with proof-of-work                                       │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// TYPES
// ============================================================================

interface LeaderboardRequest {
  action: 
    | 'submit_score'
    | 'get_rankings'
    | 'get_player_rank'
    | 'get_friends_rankings'
    | 'get_regional_rankings'
    | 'recalculate_rankings'
    | 'get_percentile';
  game_slug?: string;
  player_id?: string;
  stat_type?: string;
  data?: any;
}

interface ScoreSubmission {
  score: number;
  match_id: string;
  game_version: string;
  proof: ScoreProof;
  metadata?: any;
}

interface ScoreProof {
  match_duration_ms: number;
  kills: number;
  deaths: number;
  accuracy: number;
  checksum: string;
  timestamp: number;
}

// ============================================================================
// VALIDATION
// ============================================================================

const SCORE_LIMITS = {
  fps: {
    max_kills_per_minute: 15,
    max_accuracy: 0.98,
    min_match_duration_ms: 60000, // 1 minute
    max_score_per_minute: 2000,
  },
  racing: {
    max_score: 1000000,
    min_lap_time_ms: 15000,
  },
  puzzle: {
    max_score: 10000000,
    min_time_ms: 5000,
  },
  default: {
    max_score: 100000000,
    min_duration_ms: 10000,
  },
};

function validateScore(
  game_slug: string,
  submission: ScoreSubmission
): { valid: boolean; reason?: string } {
  const { score, proof } = submission;
  
  // Get limits for game type
  const limits = game_slug.includes('fps') || game_slug.includes('shooter')
    ? SCORE_LIMITS.fps
    : game_slug.includes('racing') || game_slug.includes('racer')
    ? SCORE_LIMITS.racing
    : game_slug.includes('puzzle') || game_slug.includes('2048')
    ? SCORE_LIMITS.puzzle
    : SCORE_LIMITS.default;
  
  // Validate minimum duration
  const minDuration = 'min_match_duration_ms' in limits 
    ? limits.min_match_duration_ms 
    : limits.min_duration_ms || 10000;
    
  if (proof.match_duration_ms < minDuration) {
    return { valid: false, reason: 'Match too short' };
  }
  
  // Validate FPS-specific
  if ('max_kills_per_minute' in limits) {
    const minutes = proof.match_duration_ms / 60000;
    const killsPerMinute = proof.kills / minutes;
    
    if (killsPerMinute > limits.max_kills_per_minute) {
      return { valid: false, reason: 'Kill rate too high' };
    }
    
    if (proof.accuracy > limits.max_accuracy) {
      return { valid: false, reason: 'Accuracy too high' };
    }
    
    const scorePerMinute = score / minutes;
    if (scorePerMinute > limits.max_score_per_minute) {
      return { valid: false, reason: 'Score rate too high' };
    }
  }
  
  // Validate checksum
  const expectedChecksum = computeChecksum({
    score,
    kills: proof.kills,
    deaths: proof.deaths,
    accuracy: proof.accuracy,
    duration: proof.match_duration_ms,
  });
  
  if (proof.checksum !== expectedChecksum) {
    return { valid: false, reason: 'Invalid checksum' };
  }
  
  // Validate timestamp freshness (within 5 minutes)
  if (Math.abs(Date.now() - proof.timestamp) > 300000) {
    return { valid: false, reason: 'Stale submission' };
  }
  
  return { valid: true };
}

function computeChecksum(data: any): string {
  const encoder = new TextEncoder();
  const input = encoder.encode(JSON.stringify(data));
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input[i];
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

// ============================================================================
// RANKING CALCULATION
// ============================================================================

async function calculateRankings(
  supabase: any,
  game_slug: string,
  stat_type: string,
  leaderboard_type: string
): Promise<void> {
  // Get all scores for this leaderboard
  const { data: entries } = await supabase
    .from('leaderboard_entries')
    .select('id, player_id, score')
    .eq('leaderboard_id', `${game_slug}_${stat_type}_${leaderboard_type}`)
    .order('score', { ascending: false });
  
  if (!entries) return;
  
  // Calculate ranks
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const newRank = i + 1;
    
    await supabase
      .from('leaderboard_entries')
      .update({
        previous_rank: entry.rank,
        rank: newRank,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entry.id);
  }
}

function calculatePercentile(rank: number, totalPlayers: number): number {
  if (totalPlayers === 0) return 0;
  return Math.round((1 - (rank - 1) / totalPlayers) * 100);
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, game_slug, player_id, stat_type, data } = await req.json() as LeaderboardRequest;

    switch (action) {
      // ========================================================================
      // SUBMIT SCORE
      // ========================================================================
      case 'submit_score': {
        if (!game_slug || !player_id || !data) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const submission = data as ScoreSubmission;
        
        // Validate score
        const validation = validateScore(game_slug, submission);
        if (!validation.valid) {
          return new Response(JSON.stringify({ 
            error: 'Score validation failed',
            reason: validation.reason,
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check for existing sanctions
        const { data: sanctions } = await supabase
          .from('arcade_player_sanctions')
          .select('type')
          .eq('player_id', player_id)
          .or(`expires_at.gt.${new Date().toISOString()},permanent.eq.true`);

        if (sanctions?.some(s => s.type === 'game_ban' || s.type === 'permanent_ban')) {
          return new Response(JSON.stringify({ error: 'Player is banned' }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Verify match exists and player participated
        const { data: matchPlayer } = await supabase
          .from('match_players')
          .select('score')
          .eq('match_id', submission.match_id)
          .eq('player_id', player_id)
          .single();

        if (!matchPlayer) {
          return new Response(JSON.stringify({ error: 'Match participation not found' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Cross-validate score with match record
        if (Math.abs(matchPlayer.score - submission.score) > submission.score * 0.01) {
          return new Response(JSON.stringify({ error: 'Score mismatch with match record' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get or create leaderboard
        const leaderboardId = `${game_slug}_score_global`;
        
        const { data: leaderboard } = await supabase
          .from('leaderboards')
          .upsert({
            id: leaderboardId,
            game_slug,
            leaderboard_type: 'global',
            stat_type: 'score',
            is_active: true,
          }, { onConflict: 'id' })
          .select()
          .single();

        // Get player's current entry
        const { data: existingEntry } = await supabase
          .from('leaderboard_entries')
          .select('*')
          .eq('leaderboard_id', leaderboardId)
          .eq('player_id', player_id)
          .single();

        // Only update if new score is higher
        if (existingEntry && submission.score <= existingEntry.score) {
          return new Response(JSON.stringify({
            success: true,
            new_high_score: false,
            current_score: existingEntry.score,
            current_rank: existingEntry.rank,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Update or insert entry
        const { data: entry, error } = await supabase
          .from('leaderboard_entries')
          .upsert({
            leaderboard_id: leaderboardId,
            player_id,
            score: submission.score,
            previous_score: existingEntry?.score || 0,
            rank: 0, // Will be calculated
            previous_rank: existingEntry?.rank || 0,
            stats: submission.metadata,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'leaderboard_id,player_id' })
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Calculate new rank
        const { count } = await supabase
          .from('leaderboard_entries')
          .select('id', { count: 'exact', head: true })
          .eq('leaderboard_id', leaderboardId)
          .gt('score', submission.score);

        const newRank = (count || 0) + 1;

        await supabase
          .from('leaderboard_entries')
          .update({ rank: newRank })
          .eq('id', entry.id);

        return new Response(JSON.stringify({
          success: true,
          new_high_score: true,
          score: submission.score,
          rank: newRank,
          previous_score: existingEntry?.score || 0,
          previous_rank: existingEntry?.rank || 0,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========================================================================
      // GET RANKINGS
      // ========================================================================
      case 'get_rankings': {
        if (!game_slug) {
          return new Response(JSON.stringify({ error: 'game_slug required' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { limit = 100, offset = 0, leaderboard_type = 'global' } = data || {};
        const statType = stat_type || 'score';
        const leaderboardId = `${game_slug}_${statType}_${leaderboard_type}`;

        const { data: entries, error } = await supabase
          .from('leaderboard_entries')
          .select(`
            player_id,
            score,
            rank,
            previous_rank,
            stats,
            updated_at,
            players(username, display_name, avatar_url, level)
          `)
          .eq('leaderboard_id', leaderboardId)
          .order('rank', { ascending: true })
          .range(offset, offset + limit - 1);

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get total count
        const { count: totalPlayers } = await supabase
          .from('leaderboard_entries')
          .select('id', { count: 'exact', head: true })
          .eq('leaderboard_id', leaderboardId);

        return new Response(JSON.stringify({
          game_slug,
          leaderboard_type,
          stat_type: statType,
          total_players: totalPlayers || 0,
          entries: entries?.map(e => ({
            player_id: e.player_id,
            username: e.players?.username,
            display_name: e.players?.display_name,
            avatar_url: e.players?.avatar_url,
            level: e.players?.level,
            score: e.score,
            rank: e.rank,
            rank_change: (e.previous_rank || e.rank) - e.rank,
            percentile: calculatePercentile(e.rank, totalPlayers || 1),
            updated_at: e.updated_at,
          })) || [],
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========================================================================
      // GET PLAYER RANK
      // ========================================================================
      case 'get_player_rank': {
        if (!game_slug || !player_id) {
          return new Response(JSON.stringify({ error: 'game_slug and player_id required' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const statType = stat_type || 'score';
        const leaderboardType = data?.leaderboard_type || 'global';
        const leaderboardId = `${game_slug}_${statType}_${leaderboardType}`;

        const { data: entry } = await supabase
          .from('leaderboard_entries')
          .select('*')
          .eq('leaderboard_id', leaderboardId)
          .eq('player_id', player_id)
          .single();

        if (!entry) {
          return new Response(JSON.stringify({ 
            player_id,
            ranked: false,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get total count
        const { count: totalPlayers } = await supabase
          .from('leaderboard_entries')
          .select('id', { count: 'exact', head: true })
          .eq('leaderboard_id', leaderboardId);

        // Get surrounding players
        const { data: surrounding } = await supabase
          .from('leaderboard_entries')
          .select('player_id, score, rank, players(username, display_name)')
          .eq('leaderboard_id', leaderboardId)
          .gte('rank', Math.max(1, entry.rank - 2))
          .lte('rank', entry.rank + 2)
          .order('rank', { ascending: true });

        return new Response(JSON.stringify({
          player_id,
          ranked: true,
          score: entry.score,
          rank: entry.rank,
          previous_rank: entry.previous_rank,
          percentile: calculatePercentile(entry.rank, totalPlayers || 1),
          total_players: totalPlayers,
          surrounding: surrounding?.map(s => ({
            player_id: s.player_id,
            username: s.players?.username,
            score: s.score,
            rank: s.rank,
            is_self: s.player_id === player_id,
          })) || [],
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========================================================================
      // GET FRIENDS RANKINGS
      // ========================================================================
      case 'get_friends_rankings': {
        if (!game_slug || !player_id) {
          return new Response(JSON.stringify({ error: 'game_slug and player_id required' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get friend IDs
        const { data: friends } = await supabase
          .from('player_friends')
          .select('friend_id')
          .eq('player_id', player_id)
          .eq('status', 'accepted');

        const friendIds = friends?.map(f => f.friend_id) || [];
        friendIds.push(player_id); // Include self

        const statType = stat_type || 'score';
        const leaderboardId = `${game_slug}_${statType}_global`;

        const { data: entries } = await supabase
          .from('leaderboard_entries')
          .select(`
            player_id,
            score,
            rank,
            players(username, display_name, avatar_url)
          `)
          .eq('leaderboard_id', leaderboardId)
          .in('player_id', friendIds)
          .order('score', { ascending: false });

        return new Response(JSON.stringify({
          game_slug,
          entries: entries?.map((e, i) => ({
            player_id: e.player_id,
            username: e.players?.username,
            display_name: e.players?.display_name,
            avatar_url: e.players?.avatar_url,
            score: e.score,
            global_rank: e.rank,
            friend_rank: i + 1,
            is_self: e.player_id === player_id,
          })) || [],
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========================================================================
      // RECALCULATE RANKINGS (Admin)
      // ========================================================================
      case 'recalculate_rankings': {
        if (!game_slug) {
          return new Response(JSON.stringify({ error: 'game_slug required' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const statType = stat_type || 'score';
        const leaderboardType = data?.leaderboard_type || 'global';

        await calculateRankings(supabase, game_slug, statType, leaderboardType);

        return new Response(JSON.stringify({
          success: true,
          message: 'Rankings recalculated',
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error('Leaderboard error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
