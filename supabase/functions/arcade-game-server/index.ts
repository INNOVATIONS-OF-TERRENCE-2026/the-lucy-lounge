/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — AUTHORITATIVE GAME SERVER                                     │
 * │                                                                             │
 * │ Server-authoritative multiplayer coordination                               │
 * │                                                                             │
 * │ FEATURES:                                                                   │
 * │ • Authoritative state simulation                                            │
 * │ • Input validation and anti-cheat                                           │
 * │ • Player connection management                                              │
 * │ • Match state synchronization                                               │
 * │ • Lag compensation with server-side rewind                                  │
 * │ • Deterministic physics coordination                                        │
 * │ • Real-time event broadcasting                                              │
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

interface GameServerRequest {
  action: 
    | 'start_match'
    | 'join_match'
    | 'leave_match'
    | 'submit_input'
    | 'sync_state'
    | 'validate_action'
    | 'heartbeat'
    | 'get_state'
    | 'report_disconnect'
    | 'request_reconciliation';
  match_id?: string;
  player_id?: string;
  data?: any;
}

interface PlayerInput {
  tick: number;
  timestamp: number;
  sequence: number;
  inputs: {
    movement: { x: number; y: number; z: number };
    rotation: { x: number; y: number };
    actions: string[];
    weapon_slot?: number;
  };
  hash: string;
}

interface GameState {
  tick: number;
  timestamp: number;
  entities: EntityState[];
  events: GameEvent[];
  checksum: string;
}

interface EntityState {
  id: string;
  type: 'player' | 'projectile' | 'pickup' | 'objective';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  health?: number;
  ammo?: number;
  state?: string;
  owner_id?: string;
}

interface GameEvent {
  type: string;
  tick: number;
  data: any;
}

interface MatchSession {
  match_id: string;
  game_id: string;
  mode: string;
  tick: number;
  tick_rate: number;
  state: GameState;
  players: Map<string, PlayerSession>;
  input_buffer: Map<string, PlayerInput[]>;
  state_history: GameState[];
  started_at: number;
  paused: boolean;
}

interface PlayerSession {
  player_id: string;
  team: number;
  slot: number;
  connected: boolean;
  last_heartbeat: number;
  last_input_tick: number;
  latency_ms: number;
  jitter_ms: number;
  packet_loss: number;
  input_sequence: number;
  acknowledged_tick: number;
}

// ============================================================================
// IN-MEMORY STATE (Would be Redis/KV in production)
// ============================================================================

const activeSessions = new Map<string, MatchSession>();
const TICK_RATE = 60; // 60 ticks per second
const TICK_INTERVAL_MS = 1000 / TICK_RATE;
const STATE_HISTORY_LENGTH = 120; // 2 seconds of history
const INPUT_BUFFER_SIZE = 30; // Half second of inputs
const DISCONNECT_TIMEOUT_MS = 10000; // 10 seconds
const MAX_CLIENT_AHEAD_TICKS = 5;
const MAX_CLIENT_BEHIND_TICKS = 10;

// ============================================================================
// CRYPTOGRAPHIC UTILITIES
// ============================================================================

function computeChecksum(state: any): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(state));
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data[i];
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

function validateInputHash(input: PlayerInput, serverSalt: string): boolean {
  const expectedData = `${input.tick}:${input.sequence}:${JSON.stringify(input.inputs)}:${serverSalt}`;
  const expectedHash = computeChecksum(expectedData);
  return input.hash === expectedHash;
}

// ============================================================================
// PHYSICS SIMULATION (Server-authoritative)
// ============================================================================

function simulateTick(session: MatchSession): void {
  const dt = 1 / session.tick_rate;
  
  // Process all buffered inputs for this tick
  for (const [playerId, inputs] of session.input_buffer) {
    const input = inputs.find(i => i.tick === session.tick);
    if (input) {
      applyPlayerInput(session, playerId, input, dt);
    }
  }
  
  // Update all entities
  for (const entity of session.state.entities) {
    updateEntity(entity, dt);
  }
  
  // Check collisions
  resolveCollisions(session);
  
  // Process game logic (objectives, pickups, etc.)
  processGameLogic(session);
  
  // Update tick
  session.tick++;
  session.state.tick = session.tick;
  session.state.timestamp = Date.now();
  session.state.checksum = computeChecksum(session.state.entities);
  
  // Store state history for lag compensation
  session.state_history.push(JSON.parse(JSON.stringify(session.state)));
  if (session.state_history.length > STATE_HISTORY_LENGTH) {
    session.state_history.shift();
  }
}

function applyPlayerInput(
  session: MatchSession, 
  playerId: string, 
  input: PlayerInput,
  dt: number
): void {
  const entity = session.state.entities.find(
    e => e.type === 'player' && e.id === playerId
  );
  
  if (!entity) return;
  
  // Validate input reasonableness (anti-cheat)
  const maxSpeed = 10; // units per second
  const inputMagnitude = Math.sqrt(
    input.inputs.movement.x ** 2 + 
    input.inputs.movement.y ** 2 + 
    input.inputs.movement.z ** 2
  );
  
  if (inputMagnitude > 1.5) {
    // Suspicious input - normalize
    const factor = 1 / inputMagnitude;
    input.inputs.movement.x *= factor;
    input.inputs.movement.y *= factor;
    input.inputs.movement.z *= factor;
    
    // Flag for anti-cheat
    session.state.events.push({
      type: 'anti_cheat_flag',
      tick: session.tick,
      data: { player_id: playerId, reason: 'excessive_input_magnitude', value: inputMagnitude }
    });
  }
  
  // Apply movement
  entity.velocity.x = input.inputs.movement.x * maxSpeed;
  entity.velocity.z = input.inputs.movement.z * maxSpeed;
  
  // Apply rotation
  entity.rotation.x = input.inputs.rotation.x;
  entity.rotation.y = input.inputs.rotation.y;
  
  // Process actions
  for (const action of input.inputs.actions) {
    processPlayerAction(session, playerId, entity, action);
  }
}

function processPlayerAction(
  session: MatchSession,
  playerId: string,
  entity: EntityState,
  action: string
): void {
  switch (action) {
    case 'fire':
      // Create projectile
      const projectile: EntityState = {
        id: `proj_${session.tick}_${playerId}`,
        type: 'projectile',
        position: { ...entity.position },
        rotation: { ...entity.rotation },
        velocity: {
          x: Math.sin(entity.rotation.y) * 100,
          y: 0,
          z: Math.cos(entity.rotation.y) * 100,
        },
        owner_id: playerId,
      };
      session.state.entities.push(projectile);
      
      session.state.events.push({
        type: 'fire',
        tick: session.tick,
        data: { player_id: playerId, projectile_id: projectile.id }
      });
      break;
      
    case 'reload':
      session.state.events.push({
        type: 'reload',
        tick: session.tick,
        data: { player_id: playerId }
      });
      break;
      
    case 'jump':
      if (entity.position.y <= 0.1) { // On ground
        entity.velocity.y = 8; // Jump velocity
      }
      break;
      
    case 'crouch':
      entity.state = entity.state === 'crouching' ? 'standing' : 'crouching';
      break;
  }
}

function updateEntity(entity: EntityState, dt: number): void {
  // Apply velocity
  entity.position.x += entity.velocity.x * dt;
  entity.position.y += entity.velocity.y * dt;
  entity.position.z += entity.velocity.z * dt;
  
  // Apply gravity
  if (entity.type === 'player' || entity.type === 'projectile') {
    entity.velocity.y -= 20 * dt; // Gravity
  }
  
  // Ground collision
  if (entity.position.y < 0) {
    entity.position.y = 0;
    entity.velocity.y = 0;
  }
  
  // Friction for players
  if (entity.type === 'player' && entity.position.y === 0) {
    entity.velocity.x *= 0.9;
    entity.velocity.z *= 0.9;
  }
}

function resolveCollisions(session: MatchSession): void {
  const projectiles = session.state.entities.filter(e => e.type === 'projectile');
  const players = session.state.entities.filter(e => e.type === 'player');
  
  for (const projectile of projectiles) {
    for (const player of players) {
      if (projectile.owner_id === player.id) continue; // Skip self
      
      const dx = projectile.position.x - player.position.x;
      const dy = projectile.position.y - player.position.y;
      const dz = projectile.position.z - player.position.z;
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
      
      if (dist < 1.0) { // Hit radius
        // Apply damage
        const damage = 25;
        player.health = Math.max(0, (player.health || 100) - damage);
        
        // Remove projectile
        const idx = session.state.entities.indexOf(projectile);
        if (idx > -1) session.state.entities.splice(idx, 1);
        
        // Create hit event
        session.state.events.push({
          type: 'hit',
          tick: session.tick,
          data: {
            attacker_id: projectile.owner_id,
            victim_id: player.id,
            damage,
            position: { ...projectile.position },
            headshot: dy > 1.5, // Simple headshot detection
          }
        });
        
        // Check for kill
        if (player.health === 0) {
          session.state.events.push({
            type: 'kill',
            tick: session.tick,
            data: {
              killer_id: projectile.owner_id,
              victim_id: player.id,
            }
          });
        }
        
        break;
      }
    }
    
    // Remove projectiles that have traveled too far
    const travelDist = Math.sqrt(
      projectile.velocity.x ** 2 + 
      projectile.velocity.y ** 2 + 
      projectile.velocity.z ** 2
    );
    if (projectile.position.y < -10 || travelDist > 200) {
      const idx = session.state.entities.indexOf(projectile);
      if (idx > -1) session.state.entities.splice(idx, 1);
    }
  }
}

function processGameLogic(session: MatchSession): void {
  // Check for match end conditions
  const alivePlayers = session.state.entities.filter(
    e => e.type === 'player' && (e.health || 0) > 0
  );
  
  if (alivePlayers.length <= 1 && session.players.size > 1) {
    session.state.events.push({
      type: 'match_end',
      tick: session.tick,
      data: {
        winner_id: alivePlayers[0]?.id,
        reason: 'last_standing'
      }
    });
    session.paused = true;
  }
}

// ============================================================================
// LAG COMPENSATION
// ============================================================================

function getStateAtTick(session: MatchSession, tick: number): GameState | null {
  const index = session.state_history.findIndex(s => s.tick === tick);
  if (index === -1) return null;
  return session.state_history[index];
}

function lagCompensatedHitScan(
  session: MatchSession,
  playerId: string,
  clientTick: number,
  origin: { x: number; y: number; z: number },
  direction: { x: number; y: number; z: number }
): { hit: boolean; victim_id?: string; position?: any } {
  // Get historical state at client's perceived tick
  const historicalState = getStateAtTick(session, clientTick);
  if (!historicalState) {
    return { hit: false };
  }
  
  // Perform raycast against historical positions
  const maxDist = 100;
  for (const entity of historicalState.entities) {
    if (entity.type !== 'player' || entity.id === playerId) continue;
    
    // Simple ray-sphere intersection
    const toEntity = {
      x: entity.position.x - origin.x,
      y: entity.position.y - origin.y,
      z: entity.position.z - origin.z,
    };
    
    const dot = toEntity.x * direction.x + toEntity.y * direction.y + toEntity.z * direction.z;
    if (dot < 0 || dot > maxDist) continue;
    
    const closestPoint = {
      x: origin.x + direction.x * dot,
      y: origin.y + direction.y * dot,
      z: origin.z + direction.z * dot,
    };
    
    const dist = Math.sqrt(
      (closestPoint.x - entity.position.x) ** 2 +
      (closestPoint.y - entity.position.y) ** 2 +
      (closestPoint.z - entity.position.z) ** 2
    );
    
    if (dist < 1.0) { // Hit radius
      return {
        hit: true,
        victim_id: entity.id,
        position: closestPoint,
      };
    }
  }
  
  return { hit: false };
}

// ============================================================================
// CONNECTION MANAGEMENT
// ============================================================================

function checkDisconnects(session: MatchSession): void {
  const now = Date.now();
  
  for (const [playerId, playerSession] of session.players) {
    if (playerSession.connected && 
        now - playerSession.last_heartbeat > DISCONNECT_TIMEOUT_MS) {
      playerSession.connected = false;
      
      session.state.events.push({
        type: 'player_disconnected',
        tick: session.tick,
        data: { player_id: playerId, reason: 'timeout' }
      });
    }
  }
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

    const { action, match_id, player_id, data } = await req.json() as GameServerRequest;

    switch (action) {
      // ========================================================================
      // START MATCH
      // ========================================================================
      case 'start_match': {
        if (!match_id) {
          return new Response(JSON.stringify({ error: 'match_id required' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get match from database
        const { data: match, error: matchError } = await supabase
          .from('arcade_matches')
          .select('*')
          .eq('id', match_id)
          .single();

        if (matchError || !match) {
          return new Response(JSON.stringify({ error: 'Match not found' }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Initialize session
        const session: MatchSession = {
          match_id,
          game_id: match.game_id,
          mode: match.game_mode_id || 'default',
          tick: 0,
          tick_rate: TICK_RATE,
          state: {
            tick: 0,
            timestamp: Date.now(),
            entities: [],
            events: [],
            checksum: '',
          },
          players: new Map(),
          input_buffer: new Map(),
          state_history: [],
          started_at: Date.now(),
          paused: false,
        };

        // Initialize player entities
        const players = match.players || [];
        for (let i = 0; i < players.length; i++) {
          const p = players[i];
          const spawnPos = getSpawnPosition(i, players.length);
          
          session.state.entities.push({
            id: p.player_id,
            type: 'player',
            position: spawnPos,
            rotation: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            health: 100,
            ammo: 30,
            state: 'standing',
          });

          session.players.set(p.player_id, {
            player_id: p.player_id,
            team: p.team || 0,
            slot: i,
            connected: false,
            last_heartbeat: Date.now(),
            last_input_tick: 0,
            latency_ms: 0,
            jitter_ms: 0,
            packet_loss: 0,
            input_sequence: 0,
            acknowledged_tick: 0,
          });

          session.input_buffer.set(p.player_id, []);
        }

        activeSessions.set(match_id, session);

        // Update match status
        await supabase
          .from('arcade_matches')
          .update({ 
            status: 'active',
            started_at: new Date().toISOString(),
            server_id: 'edge-' + crypto.randomUUID().slice(0, 8),
          })
          .eq('id', match_id);

        return new Response(JSON.stringify({
          success: true,
          match_id,
          tick_rate: TICK_RATE,
          server_time: Date.now(),
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========================================================================
      // JOIN MATCH
      // ========================================================================
      case 'join_match': {
        if (!match_id || !player_id) {
          return new Response(JSON.stringify({ error: 'match_id and player_id required' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const session = activeSessions.get(match_id);
        if (!session) {
          return new Response(JSON.stringify({ error: 'Session not found' }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const playerSession = session.players.get(player_id);
        if (!playerSession) {
          return new Response(JSON.stringify({ error: 'Player not in match' }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        playerSession.connected = true;
        playerSession.last_heartbeat = Date.now();

        session.state.events.push({
          type: 'player_connected',
          tick: session.tick,
          data: { player_id }
        });

        return new Response(JSON.stringify({
          success: true,
          current_tick: session.tick,
          state: session.state,
          your_entity_id: player_id,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========================================================================
      // SUBMIT INPUT
      // ========================================================================
      case 'submit_input': {
        if (!match_id || !player_id || !data) {
          return new Response(JSON.stringify({ error: 'match_id, player_id, and data required' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const session = activeSessions.get(match_id);
        if (!session) {
          return new Response(JSON.stringify({ error: 'Session not found' }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const input = data as PlayerInput;
        const playerSession = session.players.get(player_id);
        
        if (!playerSession) {
          return new Response(JSON.stringify({ error: 'Player not in session' }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Validate input timing
        const tickDiff = input.tick - session.tick;
        if (tickDiff > MAX_CLIENT_AHEAD_TICKS) {
          return new Response(JSON.stringify({ 
            error: 'Input too far ahead',
            server_tick: session.tick,
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (tickDiff < -MAX_CLIENT_BEHIND_TICKS) {
          return new Response(JSON.stringify({ 
            error: 'Input too far behind',
            server_tick: session.tick,
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Validate input sequence
        if (input.sequence <= playerSession.input_sequence) {
          return new Response(JSON.stringify({ error: 'Duplicate input' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Store input
        const buffer = session.input_buffer.get(player_id) || [];
        buffer.push(input);
        
        // Trim old inputs
        while (buffer.length > INPUT_BUFFER_SIZE) {
          buffer.shift();
        }
        
        session.input_buffer.set(player_id, buffer);
        playerSession.input_sequence = input.sequence;
        playerSession.last_input_tick = input.tick;
        playerSession.last_heartbeat = Date.now();

        // Calculate latency
        playerSession.latency_ms = Date.now() - input.timestamp;

        return new Response(JSON.stringify({
          success: true,
          server_tick: session.tick,
          acknowledged_sequence: input.sequence,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========================================================================
      // SYNC STATE (Get current authoritative state)
      // ========================================================================
      case 'sync_state': {
        if (!match_id || !player_id) {
          return new Response(JSON.stringify({ error: 'match_id and player_id required' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const session = activeSessions.get(match_id);
        if (!session) {
          return new Response(JSON.stringify({ error: 'Session not found' }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const playerSession = session.players.get(player_id);
        if (playerSession) {
          playerSession.last_heartbeat = Date.now();
        }

        // Simulate ticks if not paused
        if (!session.paused) {
          const now = Date.now();
          const elapsed = now - session.started_at;
          const targetTick = Math.floor(elapsed / TICK_INTERVAL_MS);
          
          while (session.tick < targetTick) {
            simulateTick(session);
            checkDisconnects(session);
          }
        }

        // Get events since last acknowledged tick
        const clientTick = data?.acknowledged_tick || 0;
        const relevantEvents = session.state.events.filter(e => e.tick > clientTick);

        return new Response(JSON.stringify({
          tick: session.tick,
          timestamp: session.state.timestamp,
          entities: session.state.entities,
          events: relevantEvents,
          checksum: session.state.checksum,
          server_time: Date.now(),
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========================================================================
      // HEARTBEAT
      // ========================================================================
      case 'heartbeat': {
        if (!match_id || !player_id) {
          return new Response(JSON.stringify({ error: 'match_id and player_id required' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const session = activeSessions.get(match_id);
        if (!session) {
          return new Response(JSON.stringify({ error: 'Session not found' }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const playerSession = session.players.get(player_id);
        if (playerSession) {
          const now = Date.now();
          const rtt = now - (data?.client_time || now);
          playerSession.latency_ms = rtt / 2;
          playerSession.last_heartbeat = now;
        }

        return new Response(JSON.stringify({
          success: true,
          server_time: Date.now(),
          tick: session.tick,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========================================================================
      // VALIDATE ACTION (Lag-compensated hit detection)
      // ========================================================================
      case 'validate_action': {
        if (!match_id || !player_id || !data) {
          return new Response(JSON.stringify({ error: 'match_id, player_id, and data required' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const session = activeSessions.get(match_id);
        if (!session) {
          return new Response(JSON.stringify({ error: 'Session not found' }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { action_type, client_tick, origin, direction } = data;

        if (action_type === 'hitscan') {
          const result = lagCompensatedHitScan(
            session,
            player_id,
            client_tick,
            origin,
            direction
          );

          if (result.hit && result.victim_id) {
            // Apply damage on current state
            const victim = session.state.entities.find(e => e.id === result.victim_id);
            if (victim && victim.health) {
              const damage = 25; // Hitscan damage
              victim.health = Math.max(0, victim.health - damage);

              session.state.events.push({
                type: 'hit',
                tick: session.tick,
                data: {
                  attacker_id: player_id,
                  victim_id: result.victim_id,
                  damage,
                  position: result.position,
                  lag_compensated: true,
                  client_tick,
                  server_tick: session.tick,
                }
              });

              if (victim.health === 0) {
                session.state.events.push({
                  type: 'kill',
                  tick: session.tick,
                  data: {
                    killer_id: player_id,
                    victim_id: result.victim_id,
                  }
                });
              }
            }
          }

          return new Response(JSON.stringify({
            success: true,
            validated: result.hit,
            result,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ error: 'Unknown action type' }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========================================================================
      // REQUEST RECONCILIATION (For desync recovery)
      // ========================================================================
      case 'request_reconciliation': {
        if (!match_id || !player_id) {
          return new Response(JSON.stringify({ error: 'match_id and player_id required' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const session = activeSessions.get(match_id);
        if (!session) {
          return new Response(JSON.stringify({ error: 'Session not found' }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Return full state for reconciliation
        return new Response(JSON.stringify({
          success: true,
          tick: session.tick,
          full_state: session.state,
          recent_history: session.state_history.slice(-30), // Last 0.5 seconds
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
    console.error('Game server error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getSpawnPosition(index: number, totalPlayers: number): { x: number; y: number; z: number } {
  const radius = 20;
  const angle = (index / totalPlayers) * Math.PI * 2;
  return {
    x: Math.cos(angle) * radius,
    y: 0,
    z: Math.sin(angle) * radius,
  };
}
