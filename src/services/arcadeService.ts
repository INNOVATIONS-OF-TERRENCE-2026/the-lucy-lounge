/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — ARCADE SERVICE                                           │
 * │                                                                             │
 * │ Service for game catalog, lobbies, matches, and multiplayer                │
 * │                                                                             │
 * │ Lucy's arcade: where fun meets intelligence.                               │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { supabase } from '@/integrations/supabase/client';

// =============================================================================
// TYPES
// =============================================================================

export type GameCategory = 'strategy' | 'action' | 'puzzle' | 'sports' | 'racing' | 'shooter' | 'arcade' | 'card';

export interface ArcadeGame {
  id: string;
  name: string;
  description: string;
  category: GameCategory;
  minPlayers: number;
  maxPlayers: number;
  supportsAi: boolean;
  supportsPvp: boolean;
  supportsController: boolean;
  difficultyLevels: string[];
  defaultDifficulty: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
  iconUrl?: string;
  isEnabled: boolean;
  isFeatured: boolean;
  isNew: boolean;
  controlsInfo: Record<string, unknown>;
  instructions?: string;
  tips: string[];
  sortOrder: number;
}

export interface ArcadeLobby {
  id: string;
  gameId: string;
  hostUserId: string;
  name: string;
  isPublic: boolean;
  maxPlayers: number;
  difficulty: string;
  status: 'waiting' | 'starting' | 'in_progress' | 'completed' | 'cancelled';
  inviteCode: string;
  createdAt: Date;
  startedAt?: Date;
  participants: LobbyParticipant[];
}

export interface LobbyParticipant {
  id: string;
  lobbyId: string;
  userId: string;
  isReady: boolean;
  isHost: boolean;
  slotNumber: number;
  joinedAt: Date;
  profile?: {
    fullName?: string;
    avatarUrl?: string;
  };
}

export interface ArcadeMatch {
  id: string;
  gameId: string;
  lobbyId?: string;
  player1Id?: string;
  player2Id?: string;
  isVsAi: boolean;
  aiDifficulty?: string;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  winnerId?: string;
  isDraw: boolean;
  player1Score?: number;
  player2Score?: number;
  gameState: Record<string, unknown>;
  startedAt: Date;
  endedAt?: Date;
  durationSeconds?: number;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  eventType: string;
  eventData: Record<string, unknown>;
  playerId?: string;
  sequence: number;
  createdAt: Date;
}

// =============================================================================
// GAME CATALOG
// =============================================================================

export async function getGames(category?: GameCategory): Promise<ArcadeGame[]> {
  let query = supabase
    .from('arcade_games_catalog')
    .select('*')
    .eq('is_enabled', true)
    .order('sort_order', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(mapGameFromDb);
}

export async function getGame(gameId: string): Promise<ArcadeGame | null> {
  const { data, error } = await supabase
    .from('arcade_games_catalog')
    .select('*')
    .eq('id', gameId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapGameFromDb(data);
}

export async function getFeaturedGames(): Promise<ArcadeGame[]> {
  const { data, error } = await supabase
    .from('arcade_games_catalog')
    .select('*')
    .eq('is_enabled', true)
    .eq('is_featured', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapGameFromDb);
}

export async function getGamesByCategory(): Promise<Record<GameCategory, ArcadeGame[]>> {
  const games = await getGames();
  const byCategory: Record<string, ArcadeGame[]> = {};

  for (const game of games) {
    if (!byCategory[game.category]) {
      byCategory[game.category] = [];
    }
    byCategory[game.category].push(game);
  }

  return byCategory as Record<GameCategory, ArcadeGame[]>;
}

function mapGameFromDb(data: Record<string, unknown>): ArcadeGame {
  return {
    id: data.id as string,
    name: data.name as string,
    description: data.description as string,
    category: data.category as GameCategory,
    minPlayers: data.min_players as number,
    maxPlayers: data.max_players as number,
    supportsAi: data.supports_ai as boolean,
    supportsPvp: data.supports_pvp as boolean,
    supportsController: data.supports_controller as boolean,
    difficultyLevels: data.difficulty_levels as string[],
    defaultDifficulty: data.default_difficulty as string,
    thumbnailUrl: data.thumbnail_url as string | undefined,
    bannerUrl: data.banner_url as string | undefined,
    iconUrl: data.icon_url as string | undefined,
    isEnabled: data.is_enabled as boolean,
    isFeatured: data.is_featured as boolean,
    isNew: data.is_new as boolean,
    controlsInfo: (data.controls_info as Record<string, unknown>) || {},
    instructions: data.instructions as string | undefined,
    tips: (data.tips as string[]) || [],
    sortOrder: data.sort_order as number
  };
}

// =============================================================================
// LOBBIES
// =============================================================================

export async function createLobby(
  gameId: string,
  name?: string,
  isPublic = true,
  maxPlayers = 2
): Promise<string> {
  const { data, error } = await supabase
    .rpc('create_arcade_lobby', {
      p_game_id: gameId,
      p_name: name || null,
      p_is_public: isPublic,
      p_max_players: maxPlayers
    });

  if (error) throw new Error(`Failed to create lobby: ${error.message}`);
  return data as string;
}

export async function joinLobby(lobbyId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('join_arcade_lobby', {
      p_lobby_id: lobbyId
    });

  if (error) throw new Error(`Failed to join lobby: ${error.message}`);
  return data as boolean;
}

export async function joinLobbyByCode(inviteCode: string): Promise<string | null> {
  // Find lobby by invite code
  const { data: lobby, error } = await supabase
    .from('arcade_lobbies')
    .select('id')
    .eq('invite_code', inviteCode.toLowerCase())
    .eq('status', 'waiting')
    .maybeSingle();

  if (error || !lobby) return null;

  const joined = await joinLobby(lobby.id);
  return joined ? lobby.id : null;
}

export async function leaveLobby(lobbyId: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { error } = await supabase
    .from('arcade_lobby_participants')
    .delete()
    .eq('lobby_id', lobbyId)
    .eq('user_id', userData.user.id);

  if (error) throw error;
}

export async function setReady(lobbyId: string, ready: boolean): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { error } = await supabase
    .from('arcade_lobby_participants')
    .update({ is_ready: ready })
    .eq('lobby_id', lobbyId)
    .eq('user_id', userData.user.id);

  if (error) throw error;
}

export async function startLobbyGame(lobbyId: string): Promise<string> {
  // Update lobby status
  const { error: lobbyError } = await supabase
    .from('arcade_lobbies')
    .update({ status: 'in_progress', started_at: new Date().toISOString() })
    .eq('id', lobbyId);

  if (lobbyError) throw lobbyError;

  // Get lobby details
  const { data: lobby, error: fetchError } = await supabase
    .from('arcade_lobbies')
    .select(`
      *,
      arcade_lobby_participants (*)
    `)
    .eq('id', lobbyId)
    .single();

  if (fetchError || !lobby) throw new Error('Lobby not found');

  // Create match
  const participants = lobby.arcade_lobby_participants as { user_id: string; slot_number: number }[];
  const player1 = participants.find(p => p.slot_number === 1);
  const player2 = participants.find(p => p.slot_number === 2);

  const { data: match, error: matchError } = await supabase
    .from('arcade_matches')
    .insert({
      game_id: lobby.game_id,
      lobby_id: lobbyId,
      player1_id: player1?.user_id,
      player2_id: player2?.user_id,
      is_vs_ai: false,
      status: 'active'
    })
    .select('id')
    .single();

  if (matchError) throw matchError;
  return match.id;
}

export async function getLobby(lobbyId: string): Promise<ArcadeLobby | null> {
  const { data, error } = await supabase
    .from('arcade_lobbies')
    .select(`
      *,
      arcade_lobby_participants (
        *,
        profiles (full_name, avatar_url)
      )
    `)
    .eq('id', lobbyId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapLobbyFromDb(data);
}

export async function getPublicLobbies(gameId?: string): Promise<ArcadeLobby[]> {
  let query = supabase
    .from('arcade_lobbies')
    .select(`
      *,
      arcade_lobby_participants (
        *,
        profiles (full_name, avatar_url)
      )
    `)
    .eq('is_public', true)
    .eq('status', 'waiting')
    .order('created_at', { ascending: false });

  if (gameId) {
    query = query.eq('game_id', gameId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(mapLobbyFromDb);
}

function mapLobbyFromDb(data: Record<string, unknown>): ArcadeLobby {
  const participants = (data.arcade_lobby_participants as Record<string, unknown>[]) || [];
  
  return {
    id: data.id as string,
    gameId: data.game_id as string,
    hostUserId: data.host_user_id as string,
    name: data.name as string,
    isPublic: data.is_public as boolean,
    maxPlayers: data.max_players as number,
    difficulty: data.difficulty as string,
    status: data.status as ArcadeLobby['status'],
    inviteCode: data.invite_code as string,
    createdAt: new Date(data.created_at as string),
    startedAt: data.started_at ? new Date(data.started_at as string) : undefined,
    participants: participants.map(p => ({
      id: p.id as string,
      lobbyId: p.lobby_id as string,
      userId: p.user_id as string,
      isReady: p.is_ready as boolean,
      isHost: p.is_host as boolean,
      slotNumber: p.slot_number as number,
      joinedAt: new Date(p.joined_at as string),
      profile: p.profiles as { fullName?: string; avatarUrl?: string } | undefined
    }))
  };
}

// =============================================================================
// MATCHES
// =============================================================================

export async function createSinglePlayerMatch(
  gameId: string,
  aiDifficulty = 'medium'
): Promise<string> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('arcade_matches')
    .insert({
      game_id: gameId,
      player1_id: userData.user.id,
      is_vs_ai: true,
      ai_difficulty: aiDifficulty,
      status: 'active'
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function getMatch(matchId: string): Promise<ArcadeMatch | null> {
  const { data, error } = await supabase
    .from('arcade_matches')
    .select('*')
    .eq('id', matchId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapMatchFromDb(data);
}

export async function updateMatchState(matchId: string, gameState: Record<string, unknown>): Promise<void> {
  const { error } = await supabase
    .from('arcade_matches')
    .update({ game_state: gameState })
    .eq('id', matchId);

  if (error) throw error;
}

export async function endMatch(
  matchId: string,
  winnerId?: string,
  isDraw = false,
  player1Score?: number,
  player2Score?: number
): Promise<void> {
  const { error } = await supabase
    .from('arcade_matches')
    .update({
      status: 'completed',
      winner_id: winnerId,
      is_draw: isDraw,
      player1_score: player1Score,
      player2_score: player2Score,
      ended_at: new Date().toISOString()
    })
    .eq('id', matchId);

  if (error) throw error;
}

export async function getMatchHistory(gameId?: string, limit = 20): Promise<ArcadeMatch[]> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  let query = supabase
    .from('arcade_matches')
    .select('*')
    .or(`player1_id.eq.${userData.user.id},player2_id.eq.${userData.user.id}`)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (gameId) {
    query = query.eq('game_id', gameId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(mapMatchFromDb);
}

function mapMatchFromDb(data: Record<string, unknown>): ArcadeMatch {
  return {
    id: data.id as string,
    gameId: data.game_id as string,
    lobbyId: data.lobby_id as string | undefined,
    player1Id: data.player1_id as string | undefined,
    player2Id: data.player2_id as string | undefined,
    isVsAi: data.is_vs_ai as boolean,
    aiDifficulty: data.ai_difficulty as string | undefined,
    status: data.status as ArcadeMatch['status'],
    winnerId: data.winner_id as string | undefined,
    isDraw: data.is_draw as boolean,
    player1Score: data.player1_score as number | undefined,
    player2Score: data.player2_score as number | undefined,
    gameState: (data.game_state as Record<string, unknown>) || {},
    startedAt: new Date(data.started_at as string),
    endedAt: data.ended_at ? new Date(data.ended_at as string) : undefined,
    durationSeconds: data.duration_seconds as number | undefined
  };
}

// =============================================================================
// MATCH EVENTS (REALTIME)
// =============================================================================

export async function sendMatchEvent(
  matchId: string,
  eventType: string,
  eventData: Record<string, unknown>
): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  
  // Get current sequence
  const { count } = await supabase
    .from('arcade_match_events')
    .select('*', { count: 'exact', head: true })
    .eq('match_id', matchId);

  const { error } = await supabase
    .from('arcade_match_events')
    .insert({
      match_id: matchId,
      event_type: eventType,
      event_data: eventData,
      player_id: userData.user?.id,
      sequence: (count || 0) + 1
    });

  if (error) throw error;
}

export function subscribeToMatchEvents(
  matchId: string,
  callback: (event: MatchEvent) => void
): () => void {
  const channel = supabase
    .channel(`match-${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'arcade_match_events',
        filter: `match_id=eq.${matchId}`
      },
      (payload) => {
        const data = payload.new as Record<string, unknown>;
        callback({
          id: data.id as string,
          matchId: data.match_id as string,
          eventType: data.event_type as string,
          eventData: data.event_data as Record<string, unknown>,
          playerId: data.player_id as string | undefined,
          sequence: data.sequence as number,
          createdAt: new Date(data.created_at as string)
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// =============================================================================
// LOBBY REALTIME
// =============================================================================

export function subscribeToLobby(
  lobbyId: string,
  onParticipantChange: (participants: LobbyParticipant[]) => void,
  onStatusChange: (status: ArcadeLobby['status']) => void
): () => void {
  const channel = supabase
    .channel(`lobby-${lobbyId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'arcade_lobby_participants',
        filter: `lobby_id=eq.${lobbyId}`
      },
      async () => {
        // Refetch participants
        const lobby = await getLobby(lobbyId);
        if (lobby) {
          onParticipantChange(lobby.participants);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'arcade_lobbies',
        filter: `id=eq.${lobbyId}`
      },
      (payload) => {
        const data = payload.new as Record<string, unknown>;
        onStatusChange(data.status as ArcadeLobby['status']);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export default {
  getGames,
  getGame,
  getFeaturedGames,
  getGamesByCategory,
  createLobby,
  joinLobby,
  joinLobbyByCode,
  leaveLobby,
  setReady,
  startLobbyGame,
  getLobby,
  getPublicLobbies,
  createSinglePlayerMatch,
  getMatch,
  updateMatchState,
  endMatch,
  getMatchHistory,
  sendMatchEvent,
  subscribeToMatchEvents,
  subscribeToLobby
};
