/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — TOURNAMENT ENGINE                                            │
 * │                                                                             │
 * │ Full tournament management system                                          │
 * │                                                                             │
 * │ FEATURES:                                                                  │
 * │ • Multiple formats (single/double elim, round robin, swiss)                │
 * │ • Bracket generation and management                                        │
 * │ • Match scheduling                                                         │
 * │ • Result verification                                                      │
 * │ • Prize distribution                                                       │
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

interface TournamentRequest {
  action: 
    | 'create'
    | 'register'
    | 'unregister'
    | 'start'
    | 'report_result'
    | 'get_bracket'
    | 'get_standings'
    | 'finalize';
  
  tournamentId?: string;
  
  // For create
  config?: TournamentConfig;
  
  // For report_result
  matchId?: string;
  winnerId?: string;
  scores?: { team1: number; team2: number };
}

interface TournamentConfig {
  name: string;
  gameId: string;
  format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  maxParticipants: number;
  teamSize: number;
  bestOf: number;
  
  registrationStart: string;
  registrationEnd: string;
  startTime: string;
  
  entryFee: number;
  prizePool: number;
  prizeDistribution: number[]; // Percentages: [50, 30, 20] = 1st: 50%, 2nd: 30%, 3rd: 20%
  
  rules?: string;
  allowedMaps?: string[];
  minRank?: string;
}

interface Tournament {
  id: string;
  config: TournamentConfig;
  status: 'registration' | 'check_in' | 'in_progress' | 'completed' | 'cancelled';
  participants: Participant[];
  bracket: BracketMatch[];
  currentRound: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface Participant {
  id: string;
  playerId: string;
  teamId?: string;
  teamName?: string;
  members: string[];
  seed: number;
  checkedIn: boolean;
  eliminated: boolean;
  finalPlacement?: number;
}

interface BracketMatch {
  id: string;
  round: number;
  matchNumber: number;
  participant1Id?: string;
  participant2Id?: string;
  winnerId?: string;
  loserId?: string;
  scores: { team1: number; team2: number };
  status: 'pending' | 'scheduled' | 'live' | 'completed' | 'disputed';
  scheduledTime?: string;
  gameMatchId?: string;
  nextMatchId?: string;
  loserNextMatchId?: string; // For double elimination
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
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
    
    const body: TournamentRequest = await req.json();
    
    switch (body.action) {
      case 'create':
        return await handleCreate(supabase, user.id, body.config!);
        
      case 'register':
        return await handleRegister(supabase, user.id, body.tournamentId!);
        
      case 'unregister':
        return await handleUnregister(supabase, user.id, body.tournamentId!);
        
      case 'start':
        return await handleStart(supabase, user.id, body.tournamentId!);
        
      case 'report_result':
        return await handleReportResult(supabase, user.id, body);
        
      case 'get_bracket':
        return await handleGetBracket(supabase, body.tournamentId!);
        
      case 'get_standings':
        return await handleGetStandings(supabase, body.tournamentId!);
        
      case 'finalize':
        return await handleFinalize(supabase, user.id, body.tournamentId!);
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: any) {
    console.error('Tournament error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleCreate(
  supabase: any,
  organizerId: string,
  config: TournamentConfig
): Promise<Response> {
  // Validate config
  if (!config.name || !config.gameId || !config.format) {
    return new Response(
      JSON.stringify({ error: 'Invalid tournament configuration' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  const tournamentId = crypto.randomUUID();
  
  const tournament: Partial<Tournament> = {
    id: tournamentId,
    config,
    status: 'registration',
    participants: [],
    bracket: [],
    currentRound: 0,
    createdAt: new Date().toISOString(),
  };
  
  await supabase.from('arcade_tournaments').insert({
    id: tournamentId,
    organizer_id: organizerId,
    game_id: config.gameId,
    name: config.name,
    format: config.format,
    config: config,
    status: 'registration',
    participants: [],
    bracket: [],
    current_round: 0,
    prize_pool: config.prizePool,
    entry_fee: config.entryFee,
    max_participants: config.maxParticipants,
    registration_start: config.registrationStart,
    registration_end: config.registrationEnd,
    start_time: config.startTime,
    created_at: new Date().toISOString(),
  });
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      tournamentId,
      tournament,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleRegister(
  supabase: any,
  playerId: string,
  tournamentId: string
): Promise<Response> {
  // Get tournament
  const { data: tournament, error } = await supabase
    .from('arcade_tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();
  
  if (error || !tournament) {
    return new Response(
      JSON.stringify({ error: 'Tournament not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Check registration period
  const now = new Date();
  if (now < new Date(tournament.registration_start)) {
    return new Response(
      JSON.stringify({ error: 'Registration has not started yet' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  if (now > new Date(tournament.registration_end)) {
    return new Response(
      JSON.stringify({ error: 'Registration has ended' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Check if already registered
  const participants = tournament.participants || [];
  if (participants.some((p: Participant) => p.playerId === playerId)) {
    return new Response(
      JSON.stringify({ error: 'Already registered' }),
      { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Check capacity
  if (participants.length >= tournament.max_participants) {
    return new Response(
      JSON.stringify({ error: 'Tournament is full' }),
      { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Handle entry fee
  if (tournament.entry_fee > 0) {
    // Would deduct from player's balance
    // For now, just register
  }
  
  // Create participant
  const participant: Participant = {
    id: crypto.randomUUID(),
    playerId,
    members: [playerId],
    seed: participants.length + 1,
    checkedIn: false,
    eliminated: false,
  };
  
  participants.push(participant);
  
  await supabase
    .from('arcade_tournaments')
    .update({ participants })
    .eq('id', tournamentId);
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      participantId: participant.id,
      seed: participant.seed,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleUnregister(
  supabase: any,
  playerId: string,
  tournamentId: string
): Promise<Response> {
  const { data: tournament } = await supabase
    .from('arcade_tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();
  
  if (!tournament || tournament.status !== 'registration') {
    return new Response(
      JSON.stringify({ error: 'Cannot unregister at this time' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  const participants = tournament.participants.filter(
    (p: Participant) => p.playerId !== playerId
  );
  
  // Refund entry fee
  if (tournament.entry_fee > 0) {
    // Would refund to player's balance
  }
  
  await supabase
    .from('arcade_tournaments')
    .update({ participants })
    .eq('id', tournamentId);
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleStart(
  supabase: any,
  organizerId: string,
  tournamentId: string
): Promise<Response> {
  const { data: tournament } = await supabase
    .from('arcade_tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();
  
  if (!tournament) {
    return new Response(
      JSON.stringify({ error: 'Tournament not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  if (tournament.organizer_id !== organizerId) {
    return new Response(
      JSON.stringify({ error: 'Not authorized' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  if (tournament.status !== 'registration' && tournament.status !== 'check_in') {
    return new Response(
      JSON.stringify({ error: 'Tournament cannot be started' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Seed participants
  const participants = seedParticipants(tournament.participants);
  
  // Generate bracket
  const bracket = generateBracket(
    tournament.format,
    participants
  );
  
  await supabase
    .from('arcade_tournaments')
    .update({
      status: 'in_progress',
      participants,
      bracket,
      current_round: 1,
      started_at: new Date().toISOString(),
    })
    .eq('id', tournamentId);
  
  return new Response(
    JSON.stringify({ 
      success: true,
      bracket,
      currentRound: 1,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleReportResult(
  supabase: any,
  reporterId: string,
  request: TournamentRequest
): Promise<Response> {
  const { tournamentId, matchId, winnerId, scores } = request;
  
  if (!tournamentId || !matchId || !winnerId) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  const { data: tournament } = await supabase
    .from('arcade_tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();
  
  if (!tournament || tournament.status !== 'in_progress') {
    return new Response(
      JSON.stringify({ error: 'Tournament not in progress' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Find the match
  const matchIndex = tournament.bracket.findIndex((m: BracketMatch) => m.id === matchId);
  if (matchIndex === -1) {
    return new Response(
      JSON.stringify({ error: 'Match not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  const match = tournament.bracket[matchIndex];
  
  // Validate reporter is participant in match
  const isParticipant = [match.participant1Id, match.participant2Id].includes(
    tournament.participants.find((p: Participant) => p.playerId === reporterId)?.id
  );
  const isOrganizer = tournament.organizer_id === reporterId;
  
  if (!isParticipant && !isOrganizer) {
    return new Response(
      JSON.stringify({ error: 'Not authorized to report result' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Determine loser
  const loserId = match.participant1Id === winnerId 
    ? match.participant2Id 
    : match.participant1Id;
  
  // Update match
  match.winnerId = winnerId;
  match.loserId = loserId;
  match.scores = scores || { team1: 0, team2: 0 };
  match.status = 'completed';
  
  tournament.bracket[matchIndex] = match;
  
  // Advance winner to next match
  if (match.nextMatchId) {
    const nextMatch = tournament.bracket.find((m: BracketMatch) => m.id === match.nextMatchId);
    if (nextMatch) {
      if (!nextMatch.participant1Id) {
        nextMatch.participant1Id = winnerId;
      } else {
        nextMatch.participant2Id = winnerId;
      }
    }
  }
  
  // For double elimination, send loser to losers bracket
  if (tournament.format === 'double_elimination' && match.loserNextMatchId) {
    const loserMatch = tournament.bracket.find((m: BracketMatch) => m.id === match.loserNextMatchId);
    if (loserMatch) {
      if (!loserMatch.participant1Id) {
        loserMatch.participant1Id = loserId;
      } else {
        loserMatch.participant2Id = loserId;
      }
    }
  } else if (tournament.format === 'single_elimination') {
    // Mark loser as eliminated
    const loserParticipant = tournament.participants.find((p: Participant) => p.id === loserId);
    if (loserParticipant) {
      loserParticipant.eliminated = true;
    }
  }
  
  // Check if round is complete
  const currentRoundMatches = tournament.bracket.filter(
    (m: BracketMatch) => m.round === tournament.current_round
  );
  const roundComplete = currentRoundMatches.every((m: BracketMatch) => m.status === 'completed');
  
  if (roundComplete) {
    tournament.current_round++;
  }
  
  // Check if tournament is complete
  const remainingMatches = tournament.bracket.filter(
    (m: BracketMatch) => m.status !== 'completed'
  );
  
  if (remainingMatches.length === 0) {
    tournament.status = 'completed';
    tournament.completed_at = new Date().toISOString();
    
    // Determine placements
    assignPlacements(tournament);
  }
  
  await supabase
    .from('arcade_tournaments')
    .update({
      bracket: tournament.bracket,
      participants: tournament.participants,
      current_round: tournament.current_round,
      status: tournament.status,
      completed_at: tournament.completed_at,
    })
    .eq('id', tournamentId);
  
  return new Response(
    JSON.stringify({ 
      success: true,
      matchComplete: true,
      roundComplete,
      tournamentComplete: tournament.status === 'completed',
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleGetBracket(
  supabase: any,
  tournamentId: string
): Promise<Response> {
  const { data: tournament } = await supabase
    .from('arcade_tournaments')
    .select('bracket, participants, format, current_round')
    .eq('id', tournamentId)
    .single();
  
  if (!tournament) {
    return new Response(
      JSON.stringify({ error: 'Tournament not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Enrich bracket with participant names
  const enrichedBracket = tournament.bracket.map((match: BracketMatch) => ({
    ...match,
    participant1: tournament.participants.find((p: Participant) => p.id === match.participant1Id),
    participant2: tournament.participants.find((p: Participant) => p.id === match.participant2Id),
    winner: tournament.participants.find((p: Participant) => p.id === match.winnerId),
  }));
  
  return new Response(
    JSON.stringify({
      bracket: enrichedBracket,
      format: tournament.format,
      currentRound: tournament.current_round,
      totalRounds: Math.ceil(Math.log2(tournament.participants.length)),
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleGetStandings(
  supabase: any,
  tournamentId: string
): Promise<Response> {
  const { data: tournament } = await supabase
    .from('arcade_tournaments')
    .select('participants, bracket, format, status')
    .eq('id', tournamentId)
    .single();
  
  if (!tournament) {
    return new Response(
      JSON.stringify({ error: 'Tournament not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Calculate standings
  const standings = tournament.participants
    .map((p: Participant) => {
      const wins = tournament.bracket.filter(
        (m: BracketMatch) => m.winnerId === p.id
      ).length;
      const losses = tournament.bracket.filter(
        (m: BracketMatch) => m.loserId === p.id
      ).length;
      
      return {
        ...p,
        wins,
        losses,
        matchesPlayed: wins + losses,
      };
    })
    .sort((a: any, b: any) => {
      if (a.finalPlacement && b.finalPlacement) {
        return a.finalPlacement - b.finalPlacement;
      }
      if (a.finalPlacement) return -1;
      if (b.finalPlacement) return 1;
      return b.wins - a.wins;
    });
  
  return new Response(
    JSON.stringify({ standings }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleFinalize(
  supabase: any,
  organizerId: string,
  tournamentId: string
): Promise<Response> {
  const { data: tournament } = await supabase
    .from('arcade_tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();
  
  if (!tournament || tournament.organizer_id !== organizerId) {
    return new Response(
      JSON.stringify({ error: 'Not authorized' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  if (tournament.status !== 'completed') {
    return new Response(
      JSON.stringify({ error: 'Tournament not completed' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Distribute prizes
  const prizeResults = await distributePrizes(supabase, tournament);
  
  return new Response(
    JSON.stringify({ 
      success: true,
      prizes: prizeResults,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// ============================================================================
// BRACKET GENERATION
// ============================================================================

function seedParticipants(participants: Participant[]): Participant[] {
  // Sort by some criteria (could be MMR, previous performance, etc.)
  // For now, use registration order with randomization
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  
  return shuffled.map((p, i) => ({
    ...p,
    seed: i + 1,
  }));
}

function generateBracket(
  format: string,
  participants: Participant[]
): BracketMatch[] {
  switch (format) {
    case 'single_elimination':
      return generateSingleEliminationBracket(participants);
    case 'double_elimination':
      return generateDoubleEliminationBracket(participants);
    case 'round_robin':
      return generateRoundRobinBracket(participants);
    case 'swiss':
      return generateSwissBracket(participants);
    default:
      return generateSingleEliminationBracket(participants);
  }
}

function generateSingleEliminationBracket(participants: Participant[]): BracketMatch[] {
  const matches: BracketMatch[] = [];
  const numParticipants = participants.length;
  
  // Calculate bracket size (next power of 2)
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(numParticipants)));
  const numRounds = Math.log2(bracketSize);
  const numByes = bracketSize - numParticipants;
  
  let matchNumber = 0;
  
  // Generate all rounds
  for (let round = 1; round <= numRounds; round++) {
    const matchesInRound = bracketSize / Math.pow(2, round);
    
    for (let i = 0; i < matchesInRound; i++) {
      const matchId = crypto.randomUUID();
      
      const match: BracketMatch = {
        id: matchId,
        round,
        matchNumber: matchNumber++,
        scores: { team1: 0, team2: 0 },
        status: 'pending',
      };
      
      // First round: assign participants with seeding
      if (round === 1) {
        const seed1 = i * 2;
        const seed2 = i * 2 + 1;
        
        if (seed1 < participants.length) {
          match.participant1Id = participants[seed1].id;
        }
        if (seed2 < participants.length) {
          match.participant2Id = participants[seed2].id;
        }
        
        // Handle byes
        if (!match.participant2Id && match.participant1Id) {
          match.winnerId = match.participant1Id;
          match.status = 'completed';
        }
      }
      
      matches.push(match);
    }
  }
  
  // Link matches (winner advances)
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const nextRoundStart = matches.findIndex(m => m.round === match.round + 1);
    
    if (nextRoundStart !== -1) {
      const matchIndexInRound = matches
        .filter(m => m.round === match.round)
        .indexOf(match);
      
      const nextMatchIndex = nextRoundStart + Math.floor(matchIndexInRound / 2);
      if (nextMatchIndex < matches.length) {
        match.nextMatchId = matches[nextMatchIndex].id;
      }
    }
  }
  
  return matches;
}

function generateDoubleEliminationBracket(participants: Participant[]): BracketMatch[] {
  // Similar to single elimination but with losers bracket
  const winnersBracket = generateSingleEliminationBracket(participants);
  const losersBracket: BracketMatch[] = [];
  
  // Generate losers bracket rounds
  const numWinnerRounds = Math.ceil(Math.log2(participants.length));
  
  for (let round = 1; round < numWinnerRounds * 2 - 1; round++) {
    const matchesInRound = Math.max(1, Math.floor(participants.length / Math.pow(2, Math.ceil(round / 2) + 1)));
    
    for (let i = 0; i < matchesInRound; i++) {
      losersBracket.push({
        id: crypto.randomUUID(),
        round: -round, // Negative to indicate losers bracket
        matchNumber: losersBracket.length,
        scores: { team1: 0, team2: 0 },
        status: 'pending',
      });
    }
  }
  
  // Link winners bracket losers to losers bracket
  // This is simplified - full implementation would properly link all matches
  
  // Grand finals
  const grandFinals: BracketMatch = {
    id: crypto.randomUUID(),
    round: numWinnerRounds + 1,
    matchNumber: winnersBracket.length + losersBracket.length,
    scores: { team1: 0, team2: 0 },
    status: 'pending',
  };
  
  return [...winnersBracket, ...losersBracket, grandFinals];
}

function generateRoundRobinBracket(participants: Participant[]): BracketMatch[] {
  const matches: BracketMatch[] = [];
  const n = participants.length;
  
  // Each participant plays every other participant once
  let matchNumber = 0;
  
  for (let round = 1; round < n; round++) {
    for (let i = 0; i < n / 2; i++) {
      const p1Index = (round + i) % (n - 1);
      const p2Index = (n - 1 - i + round) % (n - 1);
      
      // Last participant stays fixed
      if (i === 0) {
        matches.push({
          id: crypto.randomUUID(),
          round,
          matchNumber: matchNumber++,
          participant1Id: participants[p1Index].id,
          participant2Id: participants[n - 1].id,
          scores: { team1: 0, team2: 0 },
          status: 'pending',
        });
      } else {
        matches.push({
          id: crypto.randomUUID(),
          round,
          matchNumber: matchNumber++,
          participant1Id: participants[p1Index].id,
          participant2Id: participants[p2Index].id,
          scores: { team1: 0, team2: 0 },
          status: 'pending',
        });
      }
    }
  }
  
  return matches;
}

function generateSwissBracket(participants: Participant[]): BracketMatch[] {
  // Swiss system generates rounds dynamically based on standings
  // Initial round pairs randomly
  const matches: BracketMatch[] = [];
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
      matches.push({
        id: crypto.randomUUID(),
        round: 1,
        matchNumber: i / 2,
        participant1Id: shuffled[i].id,
        participant2Id: shuffled[i + 1].id,
        scores: { team1: 0, team2: 0 },
        status: 'pending',
      });
    }
  }
  
  return matches;
}

// ============================================================================
// HELPERS
// ============================================================================

function assignPlacements(tournament: Tournament): void {
  // Find the final match winner
  const finalMatch = tournament.bracket
    .filter((m: BracketMatch) => m.status === 'completed')
    .sort((a: BracketMatch, b: BracketMatch) => b.round - a.round)[0];
  
  if (finalMatch?.winnerId) {
    const winner = tournament.participants.find((p: Participant) => p.id === finalMatch.winnerId);
    if (winner) winner.finalPlacement = 1;
    
    const runnerUp = tournament.participants.find((p: Participant) => p.id === finalMatch.loserId);
    if (runnerUp) runnerUp.finalPlacement = 2;
  }
  
  // Assign remaining placements based on elimination round
  const eliminatedPlayers = tournament.participants
    .filter((p: Participant) => p.eliminated && !p.finalPlacement)
    .sort((a: Participant, b: Participant) => {
      // Find when each was eliminated
      const aLoss = tournament.bracket.find((m: BracketMatch) => m.loserId === a.id);
      const bLoss = tournament.bracket.find((m: BracketMatch) => m.loserId === b.id);
      return (bLoss?.round || 0) - (aLoss?.round || 0);
    });
  
  let placement = 3;
  for (const player of eliminatedPlayers) {
    player.finalPlacement = placement++;
  }
}

async function distributePrizes(
  supabase: any,
  tournament: Tournament
): Promise<any[]> {
  const results: any[] = [];
  const { prizePool, prizeDistribution } = tournament.config;
  
  if (!prizePool || prizePool === 0) {
    return results;
  }
  
  for (let i = 0; i < prizeDistribution.length; i++) {
    const participant = tournament.participants.find(
      (p: Participant) => p.finalPlacement === i + 1
    );
    
    if (participant) {
      const prizeAmount = (prizePool * prizeDistribution[i]) / 100;
      
      // Would credit to player's balance
      results.push({
        placement: i + 1,
        playerId: participant.playerId,
        amount: prizeAmount,
      });
    }
  }
  
  return results;
}
