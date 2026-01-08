// Lucy Arcade - Zustand Store (Isolated State)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameDifficulty, PlayerProfile, GameStats, LucyGameMessage } from '../types/game.types';

interface ArcadeState {
  // Player
  playerProfile: PlayerProfile | null;
  isLoadingProfile: boolean;
  
  // Active game
  activeGameId: string | null;
  gameDifficulty: GameDifficulty;
  isMuted: boolean;
  
  // Lucy AI messages
  lucyMessages: LucyGameMessage[];
  
  // Stats cache
  gameStatsCache: Record<string, GameStats>;
  
  // Actions
  setPlayerProfile: (profile: PlayerProfile | null) => void;
  setLoadingProfile: (loading: boolean) => void;
  setActiveGame: (gameId: string | null) => void;
  setDifficulty: (difficulty: GameDifficulty) => void;
  toggleMute: () => void;
  addLucyMessage: (message: LucyGameMessage) => void;
  clearLucyMessages: () => void;
  updateGameStats: (gameId: string, stats: GameStats) => void;
}

export const useArcadeStore = create<ArcadeState>()(
  persist(
    (set, get) => ({
      // Initial state
      playerProfile: null,
      isLoadingProfile: false,
      activeGameId: null,
      gameDifficulty: 'medium',
      isMuted: false,
      lucyMessages: [],
      gameStatsCache: {},
      
      // Actions
      setPlayerProfile: (profile) => set({ playerProfile: profile }),
      setLoadingProfile: (loading) => set({ isLoadingProfile: loading }),
      setActiveGame: (gameId) => set({ activeGameId: gameId }),
      setDifficulty: (difficulty) => set({ gameDifficulty: difficulty }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      
      addLucyMessage: (message) => set((state) => ({
        lucyMessages: [...state.lucyMessages.slice(-4), message] // Keep last 5 messages
      })),
      
      clearLucyMessages: () => set({ lucyMessages: [] }),
      
      updateGameStats: (gameId, stats) => set((state) => ({
        gameStatsCache: { ...state.gameStatsCache, [gameId]: stats }
      })),
    }),
    {
      name: 'lucy-arcade-storage',
      partialize: (state) => ({
        gameDifficulty: state.gameDifficulty,
        isMuted: state.isMuted,
      }),
    }
  )
);
