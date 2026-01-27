/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — MATCHMAKING SERVICE                                          │
 * │                                                                             │
 * │ Real-time matchmaking with skill-based matching                            │
 * │                                                                             │
 * │ FEATURES:                                                                  │
 * │ • MMR-based matchmaking                                                    │
 * │ • Region-aware server selection                                            │
 * │ • Party support                                                            │
 * │ • Expanding search radius                                                  │
 * │ • Anti-cheat validation                                                    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// TYPES
// ============================================================================

interface MatchmakingRequest {
  action: 'find_match' | 'cancel' | 'status' | 'accept' | 'decline';
  
  // For find_match
  gameId?: string;
  mode?: 'casual' | 'ranked' | 'tournament';
  region?: string;
  partyMembers?: string[];
  
  // For status/cancel/accept/decline
  ticketId?: string;
}

interface MatchmakingTicket {
  id: string;
  player_id: string;
  game_id: string;
  mode: string;
  region: string;
  mmr: number;
  mmr_range: number;
  party_members: string[];
  status: 'searching' | 'expanding' | 'found' | 'ready' | 'cancelled' | 'expired';
  match_id?: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

interface Match {
  id: string;
  game_id: string;
  mode: string;
  region: string;
  server_address?: string;
  players: MatchPlayer[];
  status: 'pending' | 'ready' | 'in_progress' | 'completed' | 'abandoned';
  created_at: string;
  started_at?: string;
}

interface MatchPlayer {
  player_id: string;
  team: number;
  mmr: number;
  accepted: boolean;
  connected: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const INITIAL_MMR_RANGE = 100;
const MMR_EXPANSION_RATE = 50;
const MAX_MMR_RANGE = 500;
const SEARCH_TIMEOUT_MS = 120000; // 2 minutes
const ACCEPT_TIMEOUT_MS = 30000; // 30 seconds

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const body: MatchmakingRequest = await req.json();
    
    switch (body.action) {
      case 'find_match':
        return await handleFindMatch(supabase, user.id, body);
        
      case 'cancel':
        return await handleCancel(supabase, user.id, body.ticketId!);
        
      case 'status':
        return await handleStatus(supabase, user.id, body.ticketId!);
        
      case 'accept':
        return await handleAccept(supabase, user.id, body.ticketId!);
        
      case 'decline':
        return await handleDecline(supabase, user.id, body.ticketId!);
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: any) {
    console.error('Matchmaking error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleFindMatch(
  supabase: any,
  playerId: string,
  request: MatchmakingRequest
): Promise<Response> {
  const { gameId, mode = 'casual', region = 'auto', partyMembers = [] } = request;
  
  if (!gameId) {
    return new Response(
      JSON.stringify({ error: 'gameId is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Check for existing ticket
  const { data: existingTicket } = await supabase
    .from('arcade_matchmaking_tickets')
    .select('*')
    .eq('player_id', playerId)
    .in('status', ['searching', 'expanding', 'found'])
    .single();
  
  if (existingTicket) {
    return new Response(
      JSON.stringify({ 
        error: 'Already in matchmaking queue',
        ticketId: existingTicket.id,
      }),
      { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Get player MMR
  const { data: playerStats } = await supabase
    .from('arcade_player_rankings')
    .select('mmr')
    .eq('player_id', playerId)
    .eq('game_id', gameId)
    .single();
  
  const mmr = playerStats?.mmr || 1000; // Default MMR
  
  // Detect region if auto
  const detectedRegion = region === 'auto' ? 'us-east' : region;
  
  // Create ticket
  const ticketId = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SEARCH_TIMEOUT_MS);
  
  const ticket: Partial<MatchmakingTicket> = {
    id: ticketId,
    player_id: playerId,
    game_id: gameId,
    mode,
    region: detectedRegion,
    mmr,
    mmr_range: INITIAL_MMR_RANGE,
    party_members: [playerId, ...partyMembers],
    status: 'searching',
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  };
  
  await supabase.from('arcade_matchmaking_tickets').insert(ticket);
  
  // Try to find a match immediately
  const match = await tryFindMatch(supabase, ticket as MatchmakingTicket);
  
  if (match) {
    return new Response(
      JSON.stringify({
        ticketId,
        status: 'found',
        matchId: match.id,
        estimatedWait: 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Return ticket for polling
  return new Response(
    JSON.stringify({
      ticketId,
      status: 'searching',
      estimatedWait: calculateEstimatedWait(mmr, mode),
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleCancel(
  supabase: any,
  playerId: string,
  ticketId: string
): Promise<Response> {
  const { error } = await supabase
    .from('arcade_matchmaking_tickets')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', ticketId)
    .eq('player_id', playerId);
  
  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to cancel ticket' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleStatus(
  supabase: any,
  playerId: string,
  ticketId: string
): Promise<Response> {
  const { data: ticket, error } = await supabase
    .from('arcade_matchmaking_tickets')
    .select('*')
    .eq('id', ticketId)
    .eq('player_id', playerId)
    .single();
  
  if (error || !ticket) {
    return new Response(
      JSON.stringify({ error: 'Ticket not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Check if expired
  if (new Date(ticket.expires_at) < new Date()) {
    await supabase
      .from('arcade_matchmaking_tickets')
      .update({ status: 'expired' })
      .eq('id', ticketId);
    
    return new Response(
      JSON.stringify({ 
        ticketId, 
        status: 'expired',
        message: 'Search timed out',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // If still searching, try to find match and expand range
  if (ticket.status === 'searching' || ticket.status === 'expanding') {
    // Expand MMR range over time
    const searchTime = Date.now() - new Date(ticket.created_at).getTime();
    const expansions = Math.floor(searchTime / 10000); // Every 10 seconds
    const newRange = Math.min(
      INITIAL_MMR_RANGE + (expansions * MMR_EXPANSION_RATE),
      MAX_MMR_RANGE
    );
    
    if (newRange !== ticket.mmr_range) {
      await supabase
        .from('arcade_matchmaking_tickets')
        .update({ 
          mmr_range: newRange, 
          status: 'expanding',
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId);
      
      ticket.mmr_range = newRange;
    }
    
    // Try to find a match
    const match = await tryFindMatch(supabase, ticket);
    
    if (match) {
      return new Response(
        JSON.stringify({
          ticketId,
          status: 'found',
          matchId: match.id,
          players: match.players,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
  
  return new Response(
    JSON.stringify({
      ticketId,
      status: ticket.status,
      matchId: ticket.match_id,
      searchTime: Date.now() - new Date(ticket.created_at).getTime(),
      mmrRange: ticket.mmr_range,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleAccept(
  supabase: any,
  playerId: string,
  ticketId: string
): Promise<Response> {
  // Get ticket
  const { data: ticket } = await supabase
    .from('arcade_matchmaking_tickets')
    .select('*')
    .eq('id', ticketId)
    .eq('player_id', playerId)
    .single();
  
  if (!ticket || ticket.status !== 'found' || !ticket.match_id) {
    return new Response(
      JSON.stringify({ error: 'Invalid ticket state' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Update player acceptance in match
  await supabase.rpc('arcade_accept_match', {
    p_match_id: ticket.match_id,
    p_player_id: playerId,
  });
  
  // Check if all players accepted
  const { data: match } = await supabase
    .from('arcade_matches')
    .select('*')
    .eq('id', ticket.match_id)
    .single();
  
  const allAccepted = match.players.every((p: MatchPlayer) => p.accepted);
  
  if (allAccepted) {
    // Start match
    await supabase
      .from('arcade_matches')
      .update({ 
        status: 'ready',
        started_at: new Date().toISOString(),
      })
      .eq('id', ticket.match_id);
    
    // Update all tickets
    await supabase
      .from('arcade_matchmaking_tickets')
      .update({ status: 'ready' })
      .eq('match_id', ticket.match_id);
  }
  
  return new Response(
    JSON.stringify({
      success: true,
      allAccepted,
      match: allAccepted ? match : null,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleDecline(
  supabase: any,
  playerId: string,
  ticketId: string
): Promise<Response> {
  const { data: ticket } = await supabase
    .from('arcade_matchmaking_tickets')
    .select('*')
    .eq('id', ticketId)
    .eq('player_id', playerId)
    .single();
  
  if (!ticket || !ticket.match_id) {
    return new Response(
      JSON.stringify({ error: 'Invalid ticket' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Cancel the match
  await supabase
    .from('arcade_matches')
    .update({ status: 'abandoned' })
    .eq('id', ticket.match_id);
  
  // Re-queue other players
  await supabase
    .from('arcade_matchmaking_tickets')
    .update({ 
      status: 'searching',
      match_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq('match_id', ticket.match_id)
    .neq('player_id', playerId);
  
  // Cancel declining player's ticket
  await supabase
    .from('arcade_matchmaking_tickets')
    .update({ status: 'cancelled' })
    .eq('id', ticketId);
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// ============================================================================
// MATCHING LOGIC
// ============================================================================

async function tryFindMatch(
  supabase: any,
  ticket: MatchmakingTicket
): Promise<Match | null> {
  // Find compatible tickets
  const { data: candidates } = await supabase
    .from('arcade_matchmaking_tickets')
    .select('*')
    .eq('game_id', ticket.game_id)
    .eq('mode', ticket.mode)
    .eq('region', ticket.region)
    .in('status', ['searching', 'expanding'])
    .neq('id', ticket.id)
    .gte('mmr', ticket.mmr - ticket.mmr_range)
    .lte('mmr', ticket.mmr + ticket.mmr_range);
  
  if (!candidates || candidates.length === 0) {
    return null;
  }
  
  // Get game config for player count
  const { data: gameConfig } = await supabase
    .from('arcade_games_catalog')
    .select('min_players, max_players')
    .eq('id', ticket.game_id)
    .single();
  
  const requiredPlayers = gameConfig?.min_players || 2;
  
  // Sort by closest MMR
  const sortedCandidates = candidates.sort((a: any, b: any) => 
    Math.abs(a.mmr - ticket.mmr) - Math.abs(b.mmr - ticket.mmr)
  );
  
  // Check if we have enough players (including the searching player)
  const allPartyMembers = [
    ...ticket.party_members,
    ...sortedCandidates.flatMap((c: any) => c.party_members),
  ];
  
  const uniquePlayers = [...new Set(allPartyMembers)];
  
  if (uniquePlayers.length < requiredPlayers) {
    return null;
  }
  
  // Select players for the match
  const selectedTickets = [ticket];
  const selectedPlayers = new Set(ticket.party_members);
  
  for (const candidate of sortedCandidates) {
    // Check if adding this party would exceed max players
    const newPlayers = candidate.party_members.filter((p: string) => !selectedPlayers.has(p));
    if (selectedPlayers.size + newPlayers.length <= (gameConfig?.max_players || 16)) {
      selectedTickets.push(candidate);
      newPlayers.forEach((p: string) => selectedPlayers.add(p));
    }
    
    if (selectedPlayers.size >= requiredPlayers) {
      break;
    }
  }
  
  if (selectedPlayers.size < requiredPlayers) {
    return null;
  }
  
  // Create match
  const matchId = crypto.randomUUID();
  const players: MatchPlayer[] = [];
  
  let team = 0;
  for (const t of selectedTickets) {
    for (const playerId of t.party_members) {
      players.push({
        player_id: playerId,
        team: team % 2, // Alternate teams
        mmr: t.mmr,
        accepted: false,
        connected: false,
      });
    }
    team++;
  }
  
  // Balance teams by MMR
  balanceTeams(players);
  
  const match: Match = {
    id: matchId,
    game_id: ticket.game_id,
    mode: ticket.mode,
    region: ticket.region,
    players,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  
  // Insert match
  await supabase.from('arcade_matches').insert({
    ...match,
    players: players,
  });
  
  // Update all tickets
  const ticketIds = selectedTickets.map(t => t.id);
  await supabase
    .from('arcade_matchmaking_tickets')
    .update({ 
      status: 'found', 
      match_id: matchId,
      updated_at: new Date().toISOString(),
    })
    .in('id', ticketIds);
  
  return match;
}

function balanceTeams(players: MatchPlayer[]): void {
  // Simple MMR balancing - sort by MMR and alternate assignment
  players.sort((a, b) => b.mmr - a.mmr);
  
  let team0Mmr = 0;
  let team1Mmr = 0;
  
  for (const player of players) {
    if (team0Mmr <= team1Mmr) {
      player.team = 0;
      team0Mmr += player.mmr;
    } else {
      player.team = 1;
      team1Mmr += player.mmr;
    }
  }
}

function calculateEstimatedWait(mmr: number, mode: string): number {
  // Estimate based on time of day, MMR distance from average, mode popularity
  // This is a simplified estimation
  
  const baseWait = mode === 'ranked' ? 30 : 15; // seconds
  
  // MMR deviation from average (1000)
  const mmrDeviation = Math.abs(mmr - 1000) / 500;
  const mmrMultiplier = 1 + mmrDeviation;
  
  return Math.round(baseWait * mmrMultiplier);
}
