/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — ESPORTS INFRASTRUCTURE                                        │
 * │                                                                             │
 * │ Tournament-ready competitive gaming platform                                │
 * │                                                                             │
 * │ FEATURES:                                                                  │
 * │ • Tournament brackets (Single/Double Elim, Swiss, Round Robin)             │
 * │ • Match verification and replay system                                     │
 * │ • Spectator mode with multiple camera angles                               │
 * │ • Anti-cheat validation                                                    │
 * │ • Live streaming integration                                               │
 * │ • Prize pool distribution                                                  │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type TournamentFormat = 
  | 'single_elimination'
  | 'double_elimination'
  | 'round_robin'
  | 'swiss';

export type TournamentStatus = 
  | 'draft'
  | 'registration'
  | 'check_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type MatchStatus = 
  | 'pending'
  | 'ready'
  | 'in_progress'
  | 'disputed'
  | 'completed'
  | 'forfeited';

export interface Tournament {
  id: string;
  name: string;
  description: string;
  gameId: string;
  format: TournamentFormat;
  status: TournamentStatus;
  
  // Schedule
  registrationStart: Date;
  registrationEnd: Date;
  checkInStart: Date;
  checkInEnd: Date;
  startTime: Date;
  endTime?: Date;
  
  // Settings
  maxParticipants: number;
  minParticipants: number;
  teamSize: number; // 1 for solo
  bestOf: number; // Best of 3, 5, etc.
  
  // Prizes
  prizePool: number;
  entryFee: number;
  prizeDistribution: PrizeDistribution[];
  
  // Data
  participants: TournamentParticipant[];
  bracket: TournamentBracket;
  matches: TournamentMatch[];
  
  // Meta
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Streaming
  streamUrl?: string;
  spectatorCount: number;
}

export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  playerId: string;
  teamId?: string;
  displayName: string;
  seed: number;
  checkedIn: boolean;
  placement?: number;
  wins: number;
  losses: number;
  pointDifferential: number;
  registeredAt: Date;
  eliminatedAt?: Date;
}

export interface TournamentBracket {
  rounds: BracketRound[];
  losersRounds?: BracketRound[]; // For double elimination
  grandFinal?: TournamentMatch;
}

export interface BracketRound {
  roundNumber: number;
  name: string;
  matches: TournamentMatch[];
}

export interface TournamentMatch {
  id: string;
  tournamentId: string;
  roundNumber: number;
  matchNumber: number;
  
  // Participants
  participant1Id?: string;
  participant2Id?: string;
  participant1Name?: string;
  participant2Name?: string;
  participant1Seed?: number;
  participant2Seed?: number;
  
  // Results
  participant1Score: number;
  participant2Score: number;
  winnerId?: string;
  loserId?: string;
  
  // Status
  status: MatchStatus;
  scheduledTime?: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // Bracket flow
  winnerAdvancesTo?: string;
  loserDropsTo?: string; // For double elimination
  
  // Replay & Verification
  replayIds: string[];
  isVerified: boolean;
  disputeReason?: string;
}

export interface PrizeDistribution {
  placement: number;
  percentage: number;
  amount?: number;
}

// ============================================================================
// SPECTATOR SYSTEM
// ============================================================================

export interface SpectatorSession {
  id: string;
  matchId: string;
  viewerId: string;
  viewMode: SpectatorViewMode;
  currentTarget?: string; // Player ID being followed
  delay: number; // Seconds of delay
  quality: 'low' | 'medium' | 'high' | 'source';
  startedAt: Date;
  lastPing: Date;
}

export type SpectatorViewMode = 
  | 'free_cam'
  | 'first_person'
  | 'third_person'
  | 'overhead'
  | 'director'; // Auto-switching

export interface SpectatorDirectorState {
  currentView: SpectatorViewMode;
  currentTarget?: string;
  highlightedPlayers: string[];
  replayBuffer: ReplaySnapshot[];
  isAutoSwitching: boolean;
  switchInterval: number;
}

// ============================================================================
// REPLAY SYSTEM
// ============================================================================

export interface Replay {
  id: string;
  matchId: string;
  tournamentId?: string;
  gameId: string;
  
  // Metadata
  title: string;
  description?: string;
  duration: number; // seconds
  fileSize: number; // bytes
  
  // Players
  players: ReplayPlayer[];
  winningTeam: number;
  finalScore: { team1: number; team2: number };
  
  // Highlights
  highlights: ReplayHighlight[];
  keyMoments: ReplayKeyMoment[];
  
  // Data
  tickRate: number;
  totalTicks: number;
  snapshotInterval: number;
  snapshots: ReplaySnapshot[];
  
  // Visibility
  visibility: 'public' | 'private' | 'unlisted';
  viewCount: number;
  likeCount: number;
  
  // Meta
  createdAt: Date;
  expiresAt?: Date;
}

export interface ReplayPlayer {
  playerId: string;
  displayName: string;
  team: number;
  character?: string;
  finalStats: PlayerReplayStats;
}

export interface PlayerReplayStats {
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  headshots: number;
  accuracy: number;
  score: number;
}

export interface ReplaySnapshot {
  tick: number;
  timestamp: number;
  entities: EntityState[];
  events: GameEvent[];
  worldState: WorldState;
}

export interface EntityState {
  entityId: string;
  type: 'player' | 'projectile' | 'item' | 'vehicle';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
  velocity: { x: number; y: number; z: number };
  health?: number;
  state?: Record<string, any>;
}

export interface WorldState {
  roundNumber: number;
  roundTime: number;
  score: { team1: number; team2: number };
  objectives: ObjectiveState[];
}

export interface ObjectiveState {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
  progress: number;
  owningTeam?: number;
}

export interface GameEvent {
  type: string;
  tick: number;
  timestamp: number;
  data: Record<string, any>;
}

export interface ReplayHighlight {
  type: 'kill' | 'multi_kill' | 'clutch' | 'ace' | 'objective';
  tick: number;
  duration: number;
  playerId: string;
  description: string;
  rating: number; // 1-10
}

export interface ReplayKeyMoment {
  tick: number;
  timestamp: number;
  type: string;
  title: string;
  description: string;
}

// ============================================================================
// ANTI-CHEAT SYSTEM
// ============================================================================

export interface AntiCheatReport {
  id: string;
  matchId: string;
  playerId: string;
  reportedBy: string;
  reportType: AntiCheatReportType;
  evidence: AntiCheatEvidence[];
  status: 'pending' | 'investigating' | 'confirmed' | 'dismissed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  adminNotes?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export type AntiCheatReportType = 
  | 'aimbot'
  | 'wallhack'
  | 'speedhack'
  | 'damage_modification'
  | 'packet_manipulation'
  | 'macro_usage'
  | 'teaming'
  | 'griefing'
  | 'other';

export interface AntiCheatEvidence {
  type: 'replay_clip' | 'stat_anomaly' | 'input_log' | 'screenshot';
  data: string;
  timestamp: Date;
}

export interface PlayerSanction {
  id: string;
  playerId: string;
  type: 'warning' | 'mute' | 'ranked_ban' | 'game_ban' | 'permanent_ban';
  reason: string;
  duration?: number; // hours, null for permanent
  startedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  appealable: boolean;
  appealStatus?: 'none' | 'pending' | 'denied' | 'approved';
}

export interface InputValidation {
  playerId: string;
  matchId: string;
  tick: number;
  inputHash: string;
  serverHash: string;
  isValid: boolean;
  anomalyScore: number;
  details?: Record<string, any>;
}

// ============================================================================
// ESPORTS SERVICE
// ============================================================================

export class EsportsService {
  private static instance: EsportsService;
  
  private constructor() {}
  
  public static getInstance(): EsportsService {
    if (!EsportsService.instance) {
      EsportsService.instance = new EsportsService();
    }
    return EsportsService.instance;
  }
  
  // ============================================================================
  // TOURNAMENT MANAGEMENT
  // ============================================================================
  
  public async createTournament(config: Partial<Tournament>): Promise<Tournament> {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const tournament: Tournament = {
      id,
      name: config.name || 'New Tournament',
      description: config.description || '',
      gameId: config.gameId!,
      format: config.format || 'single_elimination',
      status: 'draft',
      
      registrationStart: config.registrationStart || new Date(now.getTime() + 86400000),
      registrationEnd: config.registrationEnd || new Date(now.getTime() + 604800000),
      checkInStart: config.checkInStart || new Date(now.getTime() + 601200000),
      checkInEnd: config.checkInEnd || new Date(now.getTime() + 604800000),
      startTime: config.startTime || new Date(now.getTime() + 608400000),
      
      maxParticipants: config.maxParticipants || 64,
      minParticipants: config.minParticipants || 8,
      teamSize: config.teamSize || 1,
      bestOf: config.bestOf || 3,
      
      prizePool: config.prizePool || 0,
      entryFee: config.entryFee || 0,
      prizeDistribution: config.prizeDistribution || this.getDefaultPrizeDistribution(),
      
      participants: [],
      bracket: { rounds: [] },
      matches: [],
      
      createdBy: config.createdBy || '',
      createdAt: now,
      updatedAt: now,
      
      spectatorCount: 0,
    };
    
    await supabase.from('arcade_tournaments').insert({
      ...tournament,
      registration_start: tournament.registrationStart.toISOString(),
      registration_end: tournament.registrationEnd.toISOString(),
      check_in_start: tournament.checkInStart.toISOString(),
      check_in_end: tournament.checkInEnd.toISOString(),
      start_time: tournament.startTime.toISOString(),
      prize_distribution: tournament.prizeDistribution,
      bracket: tournament.bracket,
      created_by: tournament.createdBy,
    });
    
    return tournament;
  }
  
  public async registerForTournament(
    tournamentId: string,
    playerId: string,
    displayName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check tournament status
      const { data: tournament } = await supabase
        .from('arcade_tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();
      
      if (!tournament) {
        return { success: false, error: 'Tournament not found' };
      }
      
      if (tournament.status !== 'registration') {
        return { success: false, error: 'Registration is not open' };
      }
      
      // Check if already registered
      const { data: existing } = await supabase
        .from('arcade_tournament_registrations')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('player_id', playerId)
        .single();
      
      if (existing) {
        return { success: false, error: 'Already registered' };
      }
      
      // Check participant limit
      const { count } = await supabase
        .from('arcade_tournament_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('tournament_id', tournamentId);
      
      if ((count || 0) >= tournament.max_participants) {
        return { success: false, error: 'Tournament is full' };
      }
      
      // Register
      await supabase.from('arcade_tournament_registrations').insert({
        id: crypto.randomUUID(),
        tournament_id: tournamentId,
        player_id: playerId,
        display_name: displayName,
        seed: (count || 0) + 1,
        checked_in: false,
        wins: 0,
        losses: 0,
        point_differential: 0,
        registered_at: new Date().toISOString(),
      });
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  public async startTournament(tournamentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get tournament and participants
      const { data: tournament } = await supabase
        .from('arcade_tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();
      
      if (!tournament) {
        return { success: false, error: 'Tournament not found' };
      }
      
      const { data: participants } = await supabase
        .from('arcade_tournament_registrations')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('checked_in', true)
        .order('seed', { ascending: true });
      
      if (!participants || participants.length < tournament.min_participants) {
        return { success: false, error: 'Not enough checked-in participants' };
      }
      
      // Generate bracket
      const bracket = this.generateBracket(
        tournament.format as TournamentFormat,
        participants
      );
      
      // Update tournament
      await supabase
        .from('arcade_tournaments')
        .update({
          status: 'in_progress',
          bracket: bracket,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tournamentId);
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  public async reportMatchResult(
    matchId: string,
    winnerId: string,
    score: { participant1: number; participant2: number },
    replayId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: match } = await supabase
        .from('arcade_tournament_matches')
        .select('*')
        .eq('id', matchId)
        .single();
      
      if (!match) {
        return { success: false, error: 'Match not found' };
      }
      
      const loserId = winnerId === match.participant1_id 
        ? match.participant2_id 
        : match.participant1_id;
      
      // Update match
      await supabase
        .from('arcade_tournament_matches')
        .update({
          participant1_score: score.participant1,
          participant2_score: score.participant2,
          winner_id: winnerId,
          loser_id: loserId,
          status: 'completed',
          completed_at: new Date().toISOString(),
          replay_ids: replayId ? [replayId] : [],
          is_verified: false,
        })
        .eq('id', matchId);
      
      // Advance winner in bracket
      if (match.winner_advances_to) {
        await this.advanceWinner(match.winner_advances_to, winnerId, match);
      }
      
      // Handle loser (double elimination)
      if (match.loser_drops_to && loserId) {
        await this.advanceLoser(match.loser_drops_to, loserId, match);
      }
      
      // Check if tournament is complete
      await this.checkTournamentCompletion(match.tournament_id);
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  // ============================================================================
  // BRACKET GENERATION
  // ============================================================================
  
  private generateBracket(
    format: TournamentFormat,
    participants: any[]
  ): TournamentBracket {
    switch (format) {
      case 'single_elimination':
        return this.generateSingleElimBracket(participants);
      case 'double_elimination':
        return this.generateDoubleElimBracket(participants);
      case 'round_robin':
        return this.generateRoundRobinBracket(participants);
      case 'swiss':
        return this.generateSwissBracket(participants);
      default:
        return this.generateSingleElimBracket(participants);
    }
  }
  
  private generateSingleElimBracket(participants: any[]): TournamentBracket {
    // Pad to power of 2
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(participants.length)));
    const paddedParticipants = [...participants];
    
    while (paddedParticipants.length < bracketSize) {
      paddedParticipants.push(null); // Bye
    }
    
    // Seed participants
    const seeded = this.seedBracket(paddedParticipants);
    
    // Generate rounds
    const numRounds = Math.log2(bracketSize);
    const rounds: BracketRound[] = [];
    
    let currentParticipants = seeded;
    
    for (let round = 1; round <= numRounds; round++) {
      const roundMatches: TournamentMatch[] = [];
      const matchCount = currentParticipants.length / 2;
      
      for (let i = 0; i < matchCount; i++) {
        const p1 = currentParticipants[i * 2];
        const p2 = currentParticipants[i * 2 + 1];
        
        const match: TournamentMatch = {
          id: crypto.randomUUID(),
          tournamentId: '',
          roundNumber: round,
          matchNumber: i + 1,
          participant1Id: p1?.id,
          participant2Id: p2?.id,
          participant1Name: p1?.display_name,
          participant2Name: p2?.display_name,
          participant1Seed: p1?.seed,
          participant2Seed: p2?.seed,
          participant1Score: 0,
          participant2Score: 0,
          status: p1 && p2 ? 'pending' : 'completed',
          winnerId: !p1 ? p2?.id : (!p2 ? p1?.id : undefined),
          replayIds: [],
          isVerified: false,
        };
        
        roundMatches.push(match);
      }
      
      const roundNames = ['Round of 64', 'Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Finals'];
      const roundName = numRounds - round < roundNames.length 
        ? roundNames[roundNames.length - (numRounds - round + 1)]
        : `Round ${round}`;
      
      rounds.push({
        roundNumber: round,
        name: roundName,
        matches: roundMatches,
      });
      
      // Set up next round participants
      currentParticipants = roundMatches.map(m => ({ id: m.id })); // Placeholder for next round
    }
    
    // Set winner_advances_to
    for (let r = 0; r < rounds.length - 1; r++) {
      const nextRound = rounds[r + 1];
      for (let m = 0; m < rounds[r].matches.length; m++) {
        const nextMatchIndex = Math.floor(m / 2);
        rounds[r].matches[m].winnerAdvancesTo = nextRound.matches[nextMatchIndex].id;
      }
    }
    
    return { rounds };
  }
  
  private generateDoubleElimBracket(participants: any[]): TournamentBracket {
    // Generate winners bracket
    const winnersBracket = this.generateSingleElimBracket(participants);
    
    // Generate losers bracket (simplified)
    const losersRounds: BracketRound[] = [];
    
    const numLosersRounds = (winnersBracket.rounds.length - 1) * 2;
    
    for (let round = 1; round <= numLosersRounds; round++) {
      losersRounds.push({
        roundNumber: round,
        name: `Losers Round ${round}`,
        matches: [],
      });
    }
    
    // Grand final
    const grandFinal: TournamentMatch = {
      id: crypto.randomUUID(),
      tournamentId: '',
      roundNumber: winnersBracket.rounds.length + 1,
      matchNumber: 1,
      participant1Score: 0,
      participant2Score: 0,
      status: 'pending',
      replayIds: [],
      isVerified: false,
    };
    
    return {
      rounds: winnersBracket.rounds,
      losersRounds,
      grandFinal,
    };
  }
  
  private generateRoundRobinBracket(participants: any[]): TournamentBracket {
    const rounds: BracketRound[] = [];
    const n = participants.length;
    const numRounds = n % 2 === 0 ? n - 1 : n;
    
    // Circle method for round robin
    const rotation = [...participants];
    if (n % 2 !== 0) {
      rotation.push(null); // Bye
    }
    
    for (let round = 1; round <= numRounds; round++) {
      const matches: TournamentMatch[] = [];
      
      for (let i = 0; i < rotation.length / 2; i++) {
        const p1 = rotation[i];
        const p2 = rotation[rotation.length - 1 - i];
        
        if (p1 && p2) {
          matches.push({
            id: crypto.randomUUID(),
            tournamentId: '',
            roundNumber: round,
            matchNumber: i + 1,
            participant1Id: p1.id,
            participant2Id: p2.id,
            participant1Name: p1.display_name,
            participant2Name: p2.display_name,
            participant1Seed: p1.seed,
            participant2Seed: p2.seed,
            participant1Score: 0,
            participant2Score: 0,
            status: 'pending',
            replayIds: [],
            isVerified: false,
          });
        }
      }
      
      rounds.push({
        roundNumber: round,
        name: `Round ${round}`,
        matches,
      });
      
      // Rotate (keep first element fixed)
      const first = rotation[0];
      const last = rotation.pop()!;
      rotation.splice(1, 0, last);
      rotation[0] = first;
    }
    
    return { rounds };
  }
  
  private generateSwissBracket(participants: any[]): TournamentBracket {
    // Swiss has dynamic pairing, generate first round only
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const matches: TournamentMatch[] = [];
    
    for (let i = 0; i < shuffled.length / 2; i++) {
      const p1 = shuffled[i * 2];
      const p2 = shuffled[i * 2 + 1];
      
      matches.push({
        id: crypto.randomUUID(),
        tournamentId: '',
        roundNumber: 1,
        matchNumber: i + 1,
        participant1Id: p1?.id,
        participant2Id: p2?.id,
        participant1Name: p1?.display_name,
        participant2Name: p2?.display_name,
        participant1Score: 0,
        participant2Score: 0,
        status: 'pending',
        replayIds: [],
        isVerified: false,
      });
    }
    
    return {
      rounds: [{
        roundNumber: 1,
        name: 'Round 1',
        matches,
      }],
    };
  }
  
  private seedBracket(participants: any[]): any[] {
    // Standard seeding: 1v16, 8v9, 4v13, etc.
    const n = participants.length;
    const seeded = new Array(n);
    
    function seedPosition(seed: number, size: number): number {
      if (size === 1) return 0;
      const halfSize = size / 2;
      if (seed <= halfSize) {
        return seedPosition(seed, halfSize) * 2;
      } else {
        return seedPosition(size + 1 - seed, halfSize) * 2 + 1;
      }
    }
    
    for (let i = 0; i < n; i++) {
      seeded[seedPosition(i + 1, n)] = participants[i];
    }
    
    return seeded;
  }
  
  private async advanceWinner(
    nextMatchId: string,
    winnerId: string,
    previousMatch: any
  ): Promise<void> {
    const { data: nextMatch } = await supabase
      .from('arcade_tournament_matches')
      .select('*')
      .eq('id', nextMatchId)
      .single();
    
    if (!nextMatch) return;
    
    // Determine which slot to fill
    const isFirstSlot = !nextMatch.participant1_id;
    
    await supabase
      .from('arcade_tournament_matches')
      .update(isFirstSlot ? {
        participant1_id: winnerId,
      } : {
        participant2_id: winnerId,
      })
      .eq('id', nextMatchId);
  }
  
  private async advanceLoser(
    nextMatchId: string,
    loserId: string,
    previousMatch: any
  ): Promise<void> {
    // Similar to advanceWinner but for losers bracket
    await this.advanceWinner(nextMatchId, loserId, previousMatch);
  }
  
  private async checkTournamentCompletion(tournamentId: string): Promise<void> {
    const { data: tournament } = await supabase
      .from('arcade_tournaments')
      .select('bracket')
      .eq('id', tournamentId)
      .single();
    
    if (!tournament?.bracket?.rounds) return;
    
    // Check if final match is complete
    const finalRound = tournament.bracket.rounds[tournament.bracket.rounds.length - 1];
    const finalMatch = finalRound?.matches?.[0];
    
    if (finalMatch?.status === 'completed') {
      // Tournament complete
      await supabase
        .from('arcade_tournaments')
        .update({
          status: 'completed',
          end_time: new Date().toISOString(),
        })
        .eq('id', tournamentId);
      
      // Award prizes
      await this.distributePrizes(tournamentId);
    }
  }
  
  private async distributePrizes(tournamentId: string): Promise<void> {
    // Prize distribution logic
    const { data: tournament } = await supabase
      .from('arcade_tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();
    
    if (!tournament || tournament.prize_pool <= 0) return;
    
    const distribution = tournament.prize_distribution || this.getDefaultPrizeDistribution();
    
    for (const prize of distribution) {
      const { data: participant } = await supabase
        .from('arcade_tournament_registrations')
        .select('player_id')
        .eq('tournament_id', tournamentId)
        .eq('placement', prize.placement)
        .single();
      
      if (participant) {
        const amount = Math.floor(tournament.prize_pool * (prize.percentage / 100));
        
        // Credit prize to player
        await supabase.rpc('arcade_add_coins', {
          p_player_id: participant.player_id,
          p_amount: amount,
        });
      }
    }
  }
  
  private getDefaultPrizeDistribution(): PrizeDistribution[] {
    return [
      { placement: 1, percentage: 50 },
      { placement: 2, percentage: 25 },
      { placement: 3, percentage: 15 },
      { placement: 4, percentage: 10 },
    ];
  }
  
  // ============================================================================
  // SPECTATOR SYSTEM
  // ============================================================================
  
  public async joinAsSpectator(
    matchId: string,
    viewerId: string
  ): Promise<SpectatorSession> {
    const session: SpectatorSession = {
      id: crypto.randomUUID(),
      matchId,
      viewerId,
      viewMode: 'director',
      delay: 30, // 30 second delay
      quality: 'high',
      startedAt: new Date(),
      lastPing: new Date(),
    };
    
    await supabase.from('arcade_spectator_sessions').insert({
      ...session,
      started_at: session.startedAt.toISOString(),
      last_ping: session.lastPing.toISOString(),
    });
    
    // Increment spectator count
    await supabase.rpc('arcade_increment_spectators', {
      p_match_id: matchId,
    });
    
    return session;
  }
  
  public async updateSpectatorView(
    sessionId: string,
    viewMode: SpectatorViewMode,
    targetId?: string
  ): Promise<void> {
    await supabase
      .from('arcade_spectator_sessions')
      .update({
        view_mode: viewMode,
        current_target: targetId,
        last_ping: new Date().toISOString(),
      })
      .eq('id', sessionId);
  }
  
  public async leaveSpectatorSession(sessionId: string): Promise<void> {
    const { data: session } = await supabase
      .from('arcade_spectator_sessions')
      .select('match_id')
      .eq('id', sessionId)
      .single();
    
    await supabase.from('arcade_spectator_sessions').delete().eq('id', sessionId);
    
    if (session) {
      await supabase.rpc('arcade_decrement_spectators', {
        p_match_id: session.match_id,
      });
    }
  }
  
  // ============================================================================
  // REPLAY SYSTEM
  // ============================================================================
  
  public async saveReplay(replay: Omit<Replay, 'id' | 'createdAt'>): Promise<Replay> {
    const id = crypto.randomUUID();
    const fullReplay: Replay = {
      ...replay,
      id,
      createdAt: new Date(),
    };
    
    await supabase.from('arcade_replays').insert({
      id,
      match_id: fullReplay.matchId,
      tournament_id: fullReplay.tournamentId,
      game_id: fullReplay.gameId,
      title: fullReplay.title,
      description: fullReplay.description,
      duration: fullReplay.duration,
      file_size: fullReplay.fileSize,
      players: fullReplay.players,
      winning_team: fullReplay.winningTeam,
      final_score: fullReplay.finalScore,
      highlights: fullReplay.highlights,
      key_moments: fullReplay.keyMoments,
      tick_rate: fullReplay.tickRate,
      total_ticks: fullReplay.totalTicks,
      snapshot_interval: fullReplay.snapshotInterval,
      visibility: fullReplay.visibility,
      view_count: 0,
      like_count: 0,
      created_at: fullReplay.createdAt.toISOString(),
    });
    
    // Store snapshots separately (large data)
    for (let i = 0; i < fullReplay.snapshots.length; i += 100) {
      const batch = fullReplay.snapshots.slice(i, i + 100);
      await supabase.from('arcade_replay_snapshots').insert(
        batch.map(s => ({
          replay_id: id,
          tick: s.tick,
          timestamp: s.timestamp,
          entities: s.entities,
          events: s.events,
          world_state: s.worldState,
        }))
      );
    }
    
    return fullReplay;
  }
  
  public async getReplay(replayId: string): Promise<Replay | null> {
    const { data: replay, error } = await supabase
      .from('arcade_replays')
      .select('*')
      .eq('id', replayId)
      .single();
    
    if (error || !replay) return null;
    
    // Fetch snapshots
    const { data: snapshots } = await supabase
      .from('arcade_replay_snapshots')
      .select('*')
      .eq('replay_id', replayId)
      .order('tick', { ascending: true });
    
    return {
      id: replay.id,
      matchId: replay.match_id,
      tournamentId: replay.tournament_id,
      gameId: replay.game_id,
      title: replay.title,
      description: replay.description,
      duration: replay.duration,
      fileSize: replay.file_size,
      players: replay.players,
      winningTeam: replay.winning_team,
      finalScore: replay.final_score,
      highlights: replay.highlights,
      keyMoments: replay.key_moments,
      tickRate: replay.tick_rate,
      totalTicks: replay.total_ticks,
      snapshotInterval: replay.snapshot_interval,
      snapshots: (snapshots || []).map(s => ({
        tick: s.tick,
        timestamp: s.timestamp,
        entities: s.entities,
        events: s.events,
        worldState: s.world_state,
      })),
      visibility: replay.visibility,
      viewCount: replay.view_count,
      likeCount: replay.like_count,
      createdAt: new Date(replay.created_at),
    };
  }
  
  // ============================================================================
  // ANTI-CHEAT
  // ============================================================================
  
  public async reportPlayer(
    matchId: string,
    reportedPlayerId: string,
    reportedBy: string,
    reportType: AntiCheatReportType,
    evidence: AntiCheatEvidence[]
  ): Promise<AntiCheatReport> {
    const report: AntiCheatReport = {
      id: crypto.randomUUID(),
      matchId,
      playerId: reportedPlayerId,
      reportedBy,
      reportType,
      evidence,
      status: 'pending',
      severity: this.calculateSeverity(reportType),
      createdAt: new Date(),
    };
    
    await supabase.from('arcade_player_reports').insert({
      id: report.id,
      match_id: matchId,
      player_id: reportedPlayerId,
      reported_by: reportedBy,
      report_type: reportType,
      evidence,
      status: 'pending',
      severity: report.severity,
      created_at: report.createdAt.toISOString(),
    });
    
    // Auto-flag if multiple reports
    const { count } = await supabase
      .from('arcade_player_reports')
      .select('*', { count: 'exact', head: true })
      .eq('player_id', reportedPlayerId)
      .eq('status', 'pending');
    
    if ((count || 0) >= 3) {
      // Flag for review
      await this.flagPlayerForReview(reportedPlayerId);
    }
    
    return report;
  }
  
  public async validateInput(validation: InputValidation): Promise<void> {
    const isAnomaly = validation.anomalyScore > 0.8;
    
    await supabase.from('arcade_input_validations').insert({
      player_id: validation.playerId,
      match_id: validation.matchId,
      tick: validation.tick,
      input_hash: validation.inputHash,
      server_hash: validation.serverHash,
      is_valid: validation.isValid,
      anomaly_score: validation.anomalyScore,
      details: validation.details,
      created_at: new Date().toISOString(),
    });
    
    if (isAnomaly) {
      // Log anomaly for review
      console.warn(`[AntiCheat] Anomaly detected for player ${validation.playerId}`);
    }
  }
  
  public async sanctionPlayer(
    playerId: string,
    type: PlayerSanction['type'],
    reason: string,
    duration?: number
  ): Promise<PlayerSanction> {
    const now = new Date();
    
    const sanction: PlayerSanction = {
      id: crypto.randomUUID(),
      playerId,
      type,
      reason,
      duration,
      startedAt: now,
      expiresAt: duration ? new Date(now.getTime() + duration * 3600000) : undefined,
      isActive: true,
      appealable: type !== 'permanent_ban',
    };
    
    await supabase.from('arcade_player_sanctions').insert({
      id: sanction.id,
      player_id: playerId,
      type: sanction.type,
      reason: sanction.reason,
      duration: sanction.duration,
      started_at: sanction.startedAt.toISOString(),
      expires_at: sanction.expiresAt?.toISOString(),
      is_active: true,
      appealable: sanction.appealable,
    });
    
    return sanction;
  }
  
  private calculateSeverity(reportType: AntiCheatReportType): AntiCheatReport['severity'] {
    switch (reportType) {
      case 'aimbot':
      case 'wallhack':
      case 'damage_modification':
        return 'critical';
      case 'speedhack':
      case 'packet_manipulation':
        return 'high';
      case 'macro_usage':
      case 'teaming':
        return 'medium';
      default:
        return 'low';
    }
  }
  
  private async flagPlayerForReview(playerId: string): Promise<void> {
    // Update player profile with flag
    await supabase
      .from('arcade_player_profiles')
      .update({ flagged_for_review: true })
      .eq('user_id', playerId);
  }
}

export default EsportsService;
