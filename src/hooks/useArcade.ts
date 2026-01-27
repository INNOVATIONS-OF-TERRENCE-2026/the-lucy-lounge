/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — ARCADE HOOK                                              │
 * │                                                                             │
 * │ React hook for arcade game management, lobbies, and multiplayer            │
 * │                                                                             │
 * │ Lucy's arcade - where fun meets competition.                               │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import arcadeService, {
  ArcadeGame,
  ArcadeLobby,
  ArcadeMatch,
  GameCategory,
} from '@/services/arcadeService';

// =============================================================================
// TYPES
// =============================================================================

export interface UseArcadeOptions {
  gameId?: string;
  autoLoadGames?: boolean;
}

export interface UseArcadeReturn {
  // Games
  games: ArcadeGame[];
  currentGame: ArcadeGame | null;
  loadGames: (category?: GameCategory) => Promise<void>;
  selectGame: (gameId: string) => void;
  
  // Lobbies
  lobby: ArcadeLobby | null;
  createLobby: (isPublic?: boolean, maxPlayers?: number) => Promise<string | null>;
  joinLobby: (lobbyId: string) => Promise<boolean>;
  joinByCode: (code: string) => Promise<boolean>;
  leaveLobby: () => Promise<void>;
  setReady: (ready: boolean) => Promise<void>;
  startGame: () => Promise<string | null>;
  
  // Match
  match: ArcadeMatch | null;
  startSinglePlayer: (vsAI?: boolean) => Promise<string | null>;
  updateGameState: (state: Record<string, unknown>) => Promise<void>;
  endMatch: (winnerId?: string) => Promise<void>;
  
  // Controller
  gamepadConnected: boolean;
  gamepadState: GamepadState | null;
  
  // State
  loading: boolean;
  error: string | null;
}

export interface GamepadState {
  buttons: boolean[];
  axes: number[];
  connected: boolean;
}

// =============================================================================
// HOOK
// =============================================================================

export function useArcade({
  gameId,
  autoLoadGames = true,
}: UseArcadeOptions = {}): UseArcadeReturn {
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [games, setGames] = useState<ArcadeGame[]>([]);
  const [currentGame, setCurrentGame] = useState<ArcadeGame | null>(null);
  const [lobby, setLobby] = useState<ArcadeLobby | null>(null);
  const [match, setMatch] = useState<ArcadeMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Gamepad state
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [gamepadState, setGamepadState] = useState<GamepadState | null>(null);
  const gamepadLoopRef = useRef<number | null>(null);
  
  // Subscriptions
  const lobbyUnsubRef = useRef<(() => void) | null>(null);
  const matchUnsubRef = useRef<(() => void) | null>(null);

  // Load games
  const loadGames = useCallback(async (category?: GameCategory) => {
    setLoading(true);
    setError(null);
    try {
      const gamesData = await arcadeService.getGames(category);
      setGames(gamesData);
      
      // If gameId is provided, select that game
      if (gameId) {
        const game = gamesData.find(g => g.id === gameId);
        if (game) setCurrentGame(game);
      }
    } catch (err) {
      console.error('[useArcade] Load games error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load games');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // Select game
  const selectGame = useCallback((id: string) => {
    const game = games.find(g => g.id === id);
    if (game) setCurrentGame(game);
  }, [games]);

  // Create lobby
  const createLobby = useCallback(async (isPublic = true, maxPlayers = 2): Promise<string | null> => {
    if (!currentGame || !isAuthenticated) {
      setError('Please select a game and sign in');
      return null;
    }

    try {
      const lobbyId = await arcadeService.createLobby(currentGame.id, isPublic, maxPlayers);
      
      // Subscribe to lobby updates
      if (lobbyUnsubRef.current) lobbyUnsubRef.current();
      lobbyUnsubRef.current = arcadeService.subscribeToLobby(lobbyId, (updatedLobby) => {
        setLobby(updatedLobby);
      });
      
      return lobbyId;
    } catch (err) {
      console.error('[useArcade] Create lobby error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create lobby');
      return null;
    }
  }, [currentGame, isAuthenticated]);

  // Join lobby
  const joinLobby = useCallback(async (lobbyId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      setError('Please sign in to join lobbies');
      return false;
    }

    try {
      const success = await arcadeService.joinLobby(lobbyId);
      
      if (success) {
        // Subscribe to lobby updates
        if (lobbyUnsubRef.current) lobbyUnsubRef.current();
        lobbyUnsubRef.current = arcadeService.subscribeToLobby(lobbyId, (updatedLobby) => {
          setLobby(updatedLobby);
        });
      }
      
      return success;
    } catch (err) {
      console.error('[useArcade] Join lobby error:', err);
      setError(err instanceof Error ? err.message : 'Failed to join lobby');
      return false;
    }
  }, [isAuthenticated]);

  // Join by code
  const joinByCode = useCallback(async (code: string): Promise<boolean> => {
    if (!isAuthenticated) {
      setError('Please sign in to join lobbies');
      return false;
    }

    try {
      const lobbyId = await arcadeService.joinLobbyByCode(code);
      
      if (lobbyId) {
        // Subscribe to lobby updates
        if (lobbyUnsubRef.current) lobbyUnsubRef.current();
        lobbyUnsubRef.current = arcadeService.subscribeToLobby(lobbyId, (updatedLobby) => {
          setLobby(updatedLobby);
        });
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('[useArcade] Join by code error:', err);
      setError(err instanceof Error ? err.message : 'Failed to join lobby');
      return false;
    }
  }, [isAuthenticated]);

  // Leave lobby
  const leaveLobby = useCallback(async () => {
    if (!lobby) return;

    try {
      await arcadeService.leaveLobby(lobby.id);
      if (lobbyUnsubRef.current) {
        lobbyUnsubRef.current();
        lobbyUnsubRef.current = null;
      }
      setLobby(null);
    } catch (err) {
      console.error('[useArcade] Leave lobby error:', err);
    }
  }, [lobby]);

  // Set ready
  const setReady = useCallback(async (ready: boolean) => {
    if (!lobby) return;

    try {
      await arcadeService.setReady(lobby.id, ready);
    } catch (err) {
      console.error('[useArcade] Set ready error:', err);
    }
  }, [lobby]);

  // Start game from lobby
  const startGame = useCallback(async (): Promise<string | null> => {
    if (!lobby) {
      setError('No lobby to start');
      return null;
    }

    try {
      const matchId = await arcadeService.startLobbyGame(lobby.id);
      
      if (matchId) {
        // Subscribe to match updates
        if (matchUnsubRef.current) matchUnsubRef.current();
        matchUnsubRef.current = arcadeService.subscribeToMatchEvents(matchId, (events) => {
          // Handle match events
          console.log('[useArcade] Match events:', events);
        });
      }
      
      return matchId;
    } catch (err) {
      console.error('[useArcade] Start game error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start game');
      return null;
    }
  }, [lobby]);

  // Start single player
  const startSinglePlayer = useCallback(async (vsAI = true): Promise<string | null> => {
    if (!currentGame) {
      setError('Please select a game');
      return null;
    }

    try {
      const matchId = await arcadeService.createSinglePlayerMatch(currentGame.id, vsAI);
      
      // Load match data
      // Note: In a real implementation, we'd fetch the match details
      setMatch({
        id: matchId,
        gameId: currentGame.id,
        player1Id: user?.id || 'guest',
        isVsAI: vsAI,
        status: 'in_progress',
        gameState: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      return matchId;
    } catch (err) {
      console.error('[useArcade] Start single player error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start game');
      return null;
    }
  }, [currentGame, user?.id]);

  // Update game state
  const updateGameState = useCallback(async (state: Record<string, unknown>) => {
    if (!match) return;

    try {
      await arcadeService.updateMatchState(match.id, state);
      setMatch(prev => prev ? { ...prev, gameState: state } : null);
    } catch (err) {
      console.error('[useArcade] Update game state error:', err);
    }
  }, [match]);

  // End match
  const endMatch = useCallback(async (winnerId?: string) => {
    if (!match) return;

    try {
      await arcadeService.endMatch(match.id, winnerId);
      setMatch(null);
      
      if (matchUnsubRef.current) {
        matchUnsubRef.current();
        matchUnsubRef.current = null;
      }
    } catch (err) {
      console.error('[useArcade] End match error:', err);
    }
  }, [match]);

  // Gamepad handling
  useEffect(() => {
    const handleGamepadConnected = (e: GamepadEvent) => {
      console.log('[useArcade] Gamepad connected:', e.gamepad.id);
      setGamepadConnected(true);
    };

    const handleGamepadDisconnected = () => {
      console.log('[useArcade] Gamepad disconnected');
      setGamepadConnected(false);
      setGamepadState(null);
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    // Check for already connected gamepads
    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
      if (gamepad) {
        setGamepadConnected(true);
        break;
      }
    }

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, []);

  // Gamepad polling loop
  useEffect(() => {
    if (!gamepadConnected) return;

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads();
      for (const gamepad of gamepads) {
        if (gamepad) {
          setGamepadState({
            buttons: gamepad.buttons.map(b => b.pressed),
            axes: [...gamepad.axes],
            connected: true,
          });
          break;
        }
      }
      gamepadLoopRef.current = requestAnimationFrame(pollGamepad);
    };

    gamepadLoopRef.current = requestAnimationFrame(pollGamepad);

    return () => {
      if (gamepadLoopRef.current) {
        cancelAnimationFrame(gamepadLoopRef.current);
      }
    };
  }, [gamepadConnected]);

  // Auto-load games on mount
  useEffect(() => {
    if (autoLoadGames) {
      loadGames();
    }
  }, [autoLoadGames, loadGames]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (lobbyUnsubRef.current) lobbyUnsubRef.current();
      if (matchUnsubRef.current) matchUnsubRef.current();
      if (gamepadLoopRef.current) cancelAnimationFrame(gamepadLoopRef.current);
    };
  }, []);

  return {
    games,
    currentGame,
    loadGames,
    selectGame,
    lobby,
    createLobby,
    joinLobby,
    joinByCode,
    leaveLobby,
    setReady,
    startGame,
    match,
    startSinglePlayer,
    updateGameState,
    endMatch,
    gamepadConnected,
    gamepadState,
    loading,
    error,
  };
}

export default useArcade;
