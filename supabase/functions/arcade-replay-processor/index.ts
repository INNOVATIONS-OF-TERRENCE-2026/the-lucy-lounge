/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — REPLAY PROCESSOR                                              │
 * │                                                                             │
 * │ Match recording, compression, and playback API                              │
 * │                                                                             │
 * │ FEATURES:                                                                   │
 * │ • Tick-based match recording                                                │
 * │ • Snapshot generation for seeking                                           │
 * │ • Delta compression                                                         │
 * │ • Highlight detection                                                       │
 * │ • Key moment extraction                                                     │
 * │ • Public replay sharing                                                     │
 * │ • Replay analytics                                                          │
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

interface ReplayRequest {
  action: 
    | 'start_recording'
    | 'add_tick'
    | 'finalize_recording'
    | 'get_replay'
    | 'get_tick_range'
    | 'detect_highlights'
    | 'publish_replay'
    | 'search_replays';
  match_id?: string;
  replay_id?: string;
  data?: any;
}

interface ReplayTick {
  tick: number;
  timestamp: number;
  entities: EntitySnapshot[];
  events: GameEvent[];
}

interface EntitySnapshot {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  velocity?: { x: number; y: number; z: number };
  state?: any;
}

interface GameEvent {
  type: string;
  tick: number;
  data: any;
}

interface Highlight {
  type: 'multi_kill' | 'clutch' | 'ace' | 'comeback' | 'headshot_streak' | 'first_blood';
  start_tick: number;
  end_tick: number;
  player_id: string;
  score: number;
  description: string;
}

interface RecordingSession {
  match_id: string;
  game_id: string;
  tick_rate: number;
  started_at: number;
  ticks: ReplayTick[];
  players: { player_id: string; team: number; name: string }[];
  metadata: any;
}

// ============================================================================
// IN-MEMORY RECORDING BUFFER
// ============================================================================

const activeRecordings = new Map<string, RecordingSession>();
const SNAPSHOT_INTERVAL = 60; // Create snapshot every 60 ticks (1 second at 60fps)
const MAX_TICKS_IN_MEMORY = 7200; // 2 minutes at 60fps

// ============================================================================
// COMPRESSION UTILITIES
// ============================================================================

function compressReplay(ticks: ReplayTick[]): Uint8Array {
  // Simple delta compression
  const compressed: any[] = [];
  let prevTick: ReplayTick | null = null;
  
  for (const tick of ticks) {
    if (!prevTick) {
      // Store first tick fully
      compressed.push({ type: 'full', data: tick });
    } else {
      // Store delta
      const delta: any = {
        type: 'delta',
        tick: tick.tick,
        timestamp: tick.timestamp,
        entities: [],
        events: tick.events,
      };
      
      for (const entity of tick.entities) {
        const prevEntity = prevTick.entities.find(e => e.id === entity.id);
        if (!prevEntity) {
          // New entity
          delta.entities.push({ op: 'add', entity });
        } else {
          // Check for changes
          const changes: any = { id: entity.id };
          let hasChanges = false;
          
          if (entity.position.x !== prevEntity.position.x ||
              entity.position.y !== prevEntity.position.y ||
              entity.position.z !== prevEntity.position.z) {
            changes.position = entity.position;
            hasChanges = true;
          }
          
          if (entity.rotation.x !== prevEntity.rotation.x ||
              entity.rotation.y !== prevEntity.rotation.y ||
              entity.rotation.z !== prevEntity.rotation.z) {
            changes.rotation = entity.rotation;
            hasChanges = true;
          }
          
          if (JSON.stringify(entity.state) !== JSON.stringify(prevEntity.state)) {
            changes.state = entity.state;
            hasChanges = true;
          }
          
          if (hasChanges) {
            delta.entities.push({ op: 'update', ...changes });
          }
        }
      }
      
      // Check for removed entities
      for (const prevEntity of prevTick.entities) {
        if (!tick.entities.find(e => e.id === prevEntity.id)) {
          delta.entities.push({ op: 'remove', id: prevEntity.id });
        }
      }
      
      compressed.push(delta);
    }
    prevTick = tick;
  }
  
  // Convert to binary (in production, use proper binary format like MessagePack)
  const json = JSON.stringify(compressed);
  return new TextEncoder().encode(json);
}

function decompressReplay(data: Uint8Array): ReplayTick[] {
  const json = new TextDecoder().decode(data);
  const compressed = JSON.parse(json);
  
  const ticks: ReplayTick[] = [];
  let currentState: ReplayTick | null = null;
  
  for (const frame of compressed) {
    if (frame.type === 'full') {
      currentState = frame.data;
      ticks.push(currentState);
    } else if (frame.type === 'delta' && currentState) {
      const newTick: ReplayTick = {
        tick: frame.tick,
        timestamp: frame.timestamp,
        entities: [...currentState.entities],
        events: frame.events,
      };
      
      for (const entityOp of frame.entities) {
        if (entityOp.op === 'add') {
          newTick.entities.push(entityOp.entity);
        } else if (entityOp.op === 'remove') {
          const idx = newTick.entities.findIndex(e => e.id === entityOp.id);
          if (idx > -1) newTick.entities.splice(idx, 1);
        } else if (entityOp.op === 'update') {
          const entity = newTick.entities.find(e => e.id === entityOp.id);
          if (entity) {
            if (entityOp.position) entity.position = entityOp.position;
            if (entityOp.rotation) entity.rotation = entityOp.rotation;
            if (entityOp.state !== undefined) entity.state = entityOp.state;
          }
        }
      }
      
      currentState = newTick;
      ticks.push(newTick);
    }
  }
  
  return ticks;
}

// ============================================================================
// HIGHLIGHT DETECTION
// ============================================================================

function detectHighlights(ticks: ReplayTick[], players: { player_id: string }[]): Highlight[] {
  const highlights: Highlight[] = [];
  const killsByPlayer = new Map<string, { tick: number; victim: string }[]>();
  
  // Initialize
  for (const player of players) {
    killsByPlayer.set(player.player_id, []);
  }
  
  // Analyze events
  for (const tick of ticks) {
    for (const event of tick.events) {
      if (event.type === 'kill') {
        const kills = killsByPlayer.get(event.data.killer_id) || [];
        kills.push({ tick: tick.tick, victim: event.data.victim_id });
        killsByPlayer.set(event.data.killer_id, kills);
      }
    }
  }
  
  // Detect multi-kills
  for (const [playerId, kills] of killsByPlayer) {
    // Sort kills by tick
    kills.sort((a, b) => a.tick - b.tick);
    
    // Look for kills within 5 seconds (300 ticks at 60fps)
    let streak = 0;
    let streakStart = 0;
    let lastKillTick = 0;
    
    for (let i = 0; i < kills.length; i++) {
      if (i === 0 || kills[i].tick - lastKillTick <= 300) {
        if (streak === 0) streakStart = kills[i].tick;
        streak++;
      } else {
        // Check if previous streak was notable
        if (streak >= 3) {
          highlights.push({
            type: streak >= 5 ? 'ace' : 'multi_kill',
            start_tick: streakStart - 60,
            end_tick: lastKillTick + 60,
            player_id: playerId,
            score: streak * 20,
            description: streak >= 5 ? 'ACE!' : `${streak}K Multi-Kill`,
          });
        }
        streak = 1;
        streakStart = kills[i].tick;
      }
      lastKillTick = kills[i].tick;
    }
    
    // Check final streak
    if (streak >= 3) {
      highlights.push({
        type: streak >= 5 ? 'ace' : 'multi_kill',
        start_tick: streakStart - 60,
        end_tick: lastKillTick + 60,
        player_id: playerId,
        score: streak * 20,
        description: streak >= 5 ? 'ACE!' : `${streak}K Multi-Kill`,
      });
    }
    
    // Check for first blood
    if (kills.length > 0 && kills[0].tick < 300) { // First 5 seconds
      highlights.push({
        type: 'first_blood',
        start_tick: 0,
        end_tick: kills[0].tick + 60,
        player_id: playerId,
        score: 15,
        description: 'First Blood!',
      });
    }
  }
  
  // Sort by score
  highlights.sort((a, b) => b.score - a.score);
  
  return highlights;
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

    const { action, match_id, replay_id, data } = await req.json() as ReplayRequest;

    switch (action) {
      // ========================================================================
      // START RECORDING
      // ========================================================================
      case 'start_recording': {
        if (!match_id) {
          return new Response(JSON.stringify({ error: 'match_id required' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get match info
        const { data: match } = await supabase
          .from('arcade_matches')
          .select('*, match_players(*)')
          .eq('id', match_id)
          .single();

        if (!match) {
          return new Response(JSON.stringify({ error: 'Match not found' }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const session: RecordingSession = {
          match_id,
          game_id: match.game_id,
          tick_rate: data?.tick_rate || 60,
          started_at: Date.now(),
          ticks: [],
          players: match.match_players?.map((p: any) => ({
            player_id: p.player_id,
            team: p.team,
            name: p.display_name || 'Player',
          })) || [],
          metadata: {
            game_mode: match.game_mode_id,
            is_ranked: match.is_ranked,
          },
        };

        activeRecordings.set(match_id, session);

        return new Response(JSON.stringify({
          success: true,
          recording_id: match_id,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========================================================================
      // ADD TICK
      // ========================================================================
      case 'add_tick': {
        if (!match_id || !data) {
          return new Response(JSON.stringify({ error: 'match_id and data required' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const session = activeRecordings.get(match_id);
        if (!session) {
          return new Response(JSON.stringify({ error: 'Recording not found' }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const tick: ReplayTick = {
          tick: data.tick,
          timestamp: data.timestamp,
          entities: data.entities,
          events: data.events || [],
        };

        session.ticks.push(tick);

        // Trim old ticks if too many
        if (session.ticks.length > MAX_TICKS_IN_MEMORY) {
          session.ticks = session.ticks.slice(-MAX_TICKS_IN_MEMORY);
        }

        // Create snapshot if needed
        if (tick.tick % SNAPSHOT_INTERVAL === 0) {
          await supabase
            .from('arcade_replay_snapshots')
            .upsert({
              replay_id: match_id,
              tick: tick.tick,
              timestamp_ms: tick.timestamp,
              snapshot_data: tick,
            }, { onConflict: 'replay_id,tick' });
        }

        return new Response(JSON.stringify({
          success: true,
          tick: tick.tick,
          buffered_ticks: session.ticks.length,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========================================================================
      // FINALIZE RECORDING
      // ========================================================================
      case 'finalize_recording': {
        if (!match_id) {
          return new Response(JSON.stringify({ error: 'match_id required' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const session = activeRecordings.get(match_id);
        if (!session) {
          return new Response(JSON.stringify({ error: 'Recording not found' }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get match result
        const { data: match } = await supabase
          .from('arcade_matches')
          .select('winner_id')
          .eq('id', match_id)
          .single();

        // Compress replay
        const compressed = compressReplay(session.ticks);
        
        // Detect highlights
        const highlights = detectHighlights(session.ticks, session.players);

        // Calculate duration
        const duration = session.ticks.length > 0 
          ? Math.round((session.ticks[session.ticks.length - 1].timestamp - session.ticks[0].timestamp) / 1000)
          : 0;

        // Store replay
        const { data: replay, error } = await supabase
          .from('arcade_replays')
          .insert({
            match_id,
            game_id: session.game_id,
            title: `Match ${match_id.slice(0, 8)}`,
            duration_seconds: duration,
            version: '1.0',
            players: session.players,
            winner_id: match?.winner_id,
            tick_rate: session.tick_rate,
            total_ticks: session.ticks.length,
            file_size_bytes: compressed.length,
            compressed: true,
            is_public: false,
            recorded_at: new Date(session.started_at).toISOString(),
          })
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Store highlights
        if (highlights.length > 0) {
          // Would store in a highlights table
          console.log(`[Replay] ${match_id} has ${highlights.length} highlights`);
        }

        // Update match with replay reference
        await supabase
          .from('arcade_matches')
          .update({ replay_id: replay.id })
          .eq('id', match_id);

        // Clean up
        activeRecordings.delete(match_id);

        return new Response(JSON.stringify({
          success: true,
          replay_id: replay.id,
          duration_seconds: duration,
          total_ticks: session.ticks.length,
          highlights: highlights.slice(0, 5), // Top 5 highlights
          file_size_bytes: compressed.length,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========================================================================
      // GET REPLAY
      // ========================================================================
      case 'get_replay': {
        if (!replay_id) {
          return new Response(JSON.stringify({ error: 'replay_id required' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: replay, error } = await supabase
          .from('arcade_replays')
          .select('*')
          .eq('id', replay_id)
          .single();

        if (error || !replay) {
          return new Response(JSON.stringify({ error: 'Replay not found' }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Increment view count
        await supabase
          .from('arcade_replays')
          .update({ view_count: (replay.view_count || 0) + 1 })
          .eq('id', replay_id);

        return new Response(JSON.stringify({
          replay: {
            id: replay.id,
            match_id: replay.match_id,
            game_id: replay.game_id,
            title: replay.title,
            description: replay.description,
            duration_seconds: replay.duration_seconds,
            players: replay.players,
            winner_id: replay.winner_id,
            tick_rate: replay.tick_rate,
            total_ticks: replay.total_ticks,
            is_public: replay.is_public,
            featured: replay.featured,
            view_count: replay.view_count,
            like_count: replay.like_count,
            recorded_at: replay.recorded_at,
          },
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========================================================================
      // GET TICK RANGE (for playback)
      // ========================================================================
      case 'get_tick_range': {
        if (!replay_id || !data?.start_tick || !data?.end_tick) {
          return new Response(JSON.stringify({ error: 'replay_id, start_tick, and end_tick required' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { start_tick, end_tick } = data;

        // Get snapshots for seeking
        const { data: snapshots } = await supabase
          .from('arcade_replay_snapshots')
          .select('*')
          .eq('replay_id', replay_id)
          .gte('tick', start_tick)
          .lte('tick', end_tick)
          .order('tick', { ascending: true });

        return new Response(JSON.stringify({
          replay_id,
          start_tick,
          end_tick,
          snapshots: snapshots || [],
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========================================================================
      // SEARCH REPLAYS
      // ========================================================================
      case 'search_replays': {
        const { game_id, player_id, featured, search_text, limit = 20, offset = 0 } = data || {};

        let query = supabase
          .from('arcade_replays')
          .select('*')
          .eq('is_public', true)
          .order('recorded_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (game_id) query = query.eq('game_id', game_id);
        if (featured) query = query.eq('featured', true);
        if (search_text) query = query.textSearch('search_vector', search_text);

        const { data: replays, error } = await query;

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({
          replays: replays || [],
          count: replays?.length || 0,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========================================================================
      // PUBLISH REPLAY
      // ========================================================================
      case 'publish_replay': {
        if (!replay_id) {
          return new Response(JSON.stringify({ error: 'replay_id required' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { title, description } = data || {};

        const { error } = await supabase
          .from('arcade_replays')
          .update({
            is_public: true,
            title: title || undefined,
            description: description || undefined,
          })
          .eq('id', replay_id);

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({
          success: true,
          replay_id,
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
    console.error('Replay processor error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
