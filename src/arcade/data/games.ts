// Lucy Arcade - Game Registry
import type { GameConfig } from '../types/game.types';

export const ARCADE_GAMES: GameConfig[] = [
  // Strategy Games
  {
    id: 'chess',
    title: 'Chess Evolved',
    description: '3D animated chess with AI opponents and global rankings',
    category: 'strategy',
    icon: '♟️',
    thumbnail: '/arcade/chess-thumb.webp',
    minPlayers: 1,
    maxPlayers: 2,
    hasAI: true,
    hasLeaderboard: true,
    tags: ['classic', 'strategy', 'ai'],
    difficulty: ['easy', 'medium', 'hard', 'expert'],
    controls: ['mouse', 'touch'],
  },
  {
    id: 'checkers',
    title: 'Checkers Pro',
    description: 'Classic checkers with kinged pieces and smart AI',
    category: 'strategy',
    icon: '🔴',
    thumbnail: '/arcade/checkers-thumb.webp',
    minPlayers: 1,
    maxPlayers: 2,
    hasAI: true,
    hasLeaderboard: true,
    tags: ['classic', 'strategy', 'ai'],
    difficulty: ['easy', 'medium', 'hard'],
    controls: ['mouse', 'touch'],
  },
  
  // Sports Games
  {
    id: 'basketball',
    title: 'Street Basketball',
    description: 'Physics-based arcade basketball with trick shots',
    category: 'sports',
    icon: '🏀',
    thumbnail: '/arcade/basketball-thumb.webp',
    minPlayers: 1,
    maxPlayers: 1,
    hasAI: false,
    hasLeaderboard: true,
    tags: ['sports', 'physics', 'arcade'],
    difficulty: ['easy', 'medium', 'hard'],
    controls: ['mouse', 'touch'],
  },
  {
    id: 'racing',
    title: 'Neon Racer',
    description: 'High-speed neon racing through futuristic tracks',
    category: 'action',
    icon: '🏎️',
    thumbnail: '/arcade/racing-thumb.webp',
    minPlayers: 1,
    maxPlayers: 1,
    hasAI: true,
    hasLeaderboard: true,
    tags: ['racing', 'action', 'speed'],
    difficulty: ['easy', 'medium', 'hard'],
    controls: ['keyboard', 'touch', 'gamepad'],
  },
  
  // Puzzle Games
  {
    id: 'puzzle-physics',
    title: 'Physics Puzzle',
    description: 'Mind-bending physics puzzles with realistic simulation',
    category: 'puzzle',
    icon: '🧩',
    thumbnail: '/arcade/puzzle-thumb.webp',
    minPlayers: 1,
    maxPlayers: 1,
    hasAI: false,
    hasLeaderboard: true,
    tags: ['puzzle', 'physics', 'brain'],
    difficulty: ['easy', 'medium', 'hard', 'expert'],
    controls: ['mouse', 'touch'],
  },
  
  // Action Games
  {
    id: 'space-shooter',
    title: 'Cosmic Defender',
    description: 'Intense space shooter with waves of enemies',
    category: 'action',
    icon: '🚀',
    thumbnail: '/arcade/space-thumb.webp',
    minPlayers: 1,
    maxPlayers: 1,
    hasAI: false,
    hasLeaderboard: true,
    tags: ['shooter', 'action', 'space'],
    difficulty: ['easy', 'medium', 'hard'],
    controls: ['keyboard', 'mouse', 'touch'],
  },
  
  // Social Games
  {
    id: 'memory-match',
    title: 'Memory Master',
    description: 'Test your memory with beautiful card matching',
    category: 'puzzle',
    icon: '🃏',
    thumbnail: '/arcade/memory-thumb.webp',
    minPlayers: 1,
    maxPlayers: 1,
    hasAI: false,
    hasLeaderboard: true,
    tags: ['memory', 'casual', 'brain'],
    difficulty: ['easy', 'medium', 'hard'],
    controls: ['mouse', 'touch'],
  },
];

export const getGameById = (id: string): GameConfig | undefined => {
  return ARCADE_GAMES.find(game => game.id === id);
};

export const getGamesByCategory = (category: string): GameConfig[] => {
  return ARCADE_GAMES.filter(game => game.category === category);
};
