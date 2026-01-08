// Lucy Arcade - Game Type Definitions

export type GameCategory = 'sports' | 'action' | 'strategy' | 'social' | 'puzzle';

export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface GameConfig {
  id: string;
  title: string;
  description: string;
  category: GameCategory;
  icon: string;
  thumbnail: string;
  minPlayers: number;
  maxPlayers: number;
  hasAI: boolean;
  hasLeaderboard: boolean;
  tags: string[];
  difficulty: GameDifficulty[];
  controls: ('keyboard' | 'mouse' | 'touch' | 'gamepad')[];
}

export interface PlayerProfile {
  id: string;
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  totalXp: number;
  level: number;
  coins: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameStats {
  id: string;
  userId: string;
  gameId: string;
  plays: number;
  wins: number;
  losses: number;
  highScore: number;
  totalPlaytimeSeconds: number;
  lastPlayedAt: string | null;
}

export interface Achievement {
  id: string;
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  id: string;
  gameId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  score: number;
  achievedAt: string;
  rank?: number;
}

export interface GameState {
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'ended';
  score: number;
  timeElapsed: number;
  difficulty: GameDifficulty;
}

// Game Engine interfaces
export interface GameEngine {
  init: () => Promise<void>;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  destroy: () => void;
  getState: () => GameState;
}

export interface InputState {
  keys: Set<string>;
  mouse: { x: number; y: number; buttons: number };
  touch: { x: number; y: number; active: boolean }[];
  gamepad: GamepadState | null;
}

export interface GamepadState {
  axes: number[];
  buttons: boolean[];
}

// Lucy AI Game Guide
export interface LucyGameMessage {
  type: 'tip' | 'encouragement' | 'challenge' | 'achievement';
  message: string;
  timestamp: number;
}
