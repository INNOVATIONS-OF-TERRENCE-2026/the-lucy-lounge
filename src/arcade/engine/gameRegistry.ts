import { lazy } from "react";
import type { ComponentType } from "react";

/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — GAME REGISTRY                                                │
 * │                                                                             │
 * │ The single source of truth for mapping gameId → executable component       │
 * │ Includes both legacy 2D games and new AAA 3D games                         │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

type GameModule = ComponentType<any>;

const registry: Record<string, () => Promise<{ default: GameModule }>> = {
  // ==========================================================================
  // AAA 3D GAMES (Three.js + Rapier Physics)
  // ==========================================================================
  
  // FPS Shooter - Wave-based survival with real ballistics
  "fps-shooter": () => import("../games3d/fps-shooter"),
  "tactical-assault": () => import("../games3d/fps-shooter"),
  
  // Racing - Neon arcade racing with AI opponents
  "neon-racer": () => import("../games3d/racing"),
  "racing": () => import("../games3d/racing"),
  
  // Track & Field - Olympic athletics events
  "track-field": () => import("../games3d/track-field"),
  "olympics": () => import("../games3d/track-field"),
  
  // Basketball - Street basketball with physics
  "basketball-3d": () => import("../games3d/basketball"),
  "street-basketball": () => import("../games3d/basketball"),
  
  // Tank Battle - Destructible environments, AI opponents
  "tank-battle": () => import("../games3d/tank-battle"),
  "armored-warfare": () => import("../games3d/tank-battle"),
  
  // Space Combat - 6DOF flight, energy weapons, shields
  "space-combat": () => import("../games3d/space-combat"),
  "starfighter": () => import("../games3d/space-combat"),
  
  // Bowling - Realistic physics, lane oil patterns
  "bowling": () => import("../games3d/bowling"),
  "bowling-3d": () => import("../games3d/bowling"),
  
  // Golf - Wind effects, multiple clubs, terrain physics
  "golf": () => import("../games3d/golf"),
  "golf-3d": () => import("../games3d/golf"),
  
  // Soccer - Fast-paced arcade soccer with AI
  "soccer": () => import("../games3d/soccer"),
  "soccer-3d": () => import("../games3d/soccer"),
  
  // Boxing - Stamina management, combos, AI opponents
  "boxing": () => import("../games3d/boxing"),
  "boxing-3d": () => import("../games3d/boxing"),
  
  // Skateboard - Trick system, combo multipliers
  "skateboard": () => import("../games3d/skateboard"),
  "skate-park": () => import("../games3d/skateboard"),
  
  // Archery - Precision shooting, wind effects
  "archery": () => import("../games3d/archery"),
  "archery-3d": () => import("../games3d/archery"),
  
  // Tennis - Realistic ball physics, spin mechanics
  "tennis": () => import("../games3d/tennis"),
  "tennis-3d": () => import("../games3d/tennis"),
  
  // Snowboard - Procedural mountains, trick system
  "snowboard": () => import("../games3d/snowboard"),
  "alpine-rush": () => import("../games3d/snowboard"),
  
  // Parkour - Wall running, momentum-based movement
  "parkour": () => import("../games3d/parkour"),
  "free-runner": () => import("../games3d/parkour"),
  
  // Surfing - Dynamic waves, tube riding
  "surfing": () => import("../games3d/surfing"),
  "wave-rider": () => import("../games3d/surfing"),
  
  // Darts - Precision throwing, multiple game modes
  "darts": () => import("../games3d/darts"),
  "darts-501": () => import("../games3d/darts"),
  
  // Table Tennis - Fast-paced ping pong
  "table-tennis": () => import("../games3d/table-tennis"),
  "ping-pong": () => import("../games3d/table-tennis"),
  
  // Volleyball - Beach volleyball with AI
  "volleyball": () => import("../games3d/volleyball"),
  "beach-volleyball": () => import("../games3d/volleyball"),
  
  // Baseball - Home run derby
  "baseball": () => import("../games3d/baseball"),
  "home-run-derby": () => import("../games3d/baseball"),
  
  // Air Hockey - Fast-paced arcade hockey
  "hockey": () => import("../games3d/hockey"),
  "air-hockey": () => import("../games3d/hockey"),
  
  // Fencing - Olympic fencing with precise combat
  "fencing": () => import("../games3d/fencing"),
  "olympic-fencing": () => import("../games3d/fencing"),
  
  // Robot Battle - Mech combat arena
  "robot-battle": () => import("../games3d/robot-battle"),
  "mech-arena": () => import("../games3d/robot-battle"),
  
  // Jet Ski - Water racing with tricks
  "jet-ski": () => import("../games3d/jet-ski"),
  "wave-race": () => import("../games3d/jet-ski"),
  
  // Flight Sim - Arcade flight combat
  "flight-sim": () => import("../games3d/flight-sim"),
  "ace-combat": () => import("../games3d/flight-sim"),
  
  // ==========================================================================
  // LEGACY 2D GAMES (React + DOM)
  // ==========================================================================
  
  // Strategy Games
  chess: () => import("../games/chess/ChessGame"),
  checkers: () => import("../games/checkers/CheckersGame"),
  "tic-tac-toe": () => import("../games/tictactoe/TicTacToeGame"),
  "connect-four": () => import("../games/connect4/ConnectFourGame"),
  minesweeper: () => import("../games/minesweeper/MinesweeperGame"),
  
  // Puzzle Games
  "memory-match": () => import("../games/memory/MemoryGame"),
  "2048": () => import("../games/2048/Game2048"),
  simon: () => import("../games/simon/SimonGame"),
  
  // Action Games
  snake: () => import("../games/snake/SnakeGame"),
  pong: () => import("../games/pong/PongGame"),
  breakout: () => import("../games/breakout/BreakoutGame"),
  "whack-a-mole": () => import("../games/whackamole/WhackAMoleGame"),
};

export function resolveGameComponent(gameId: string): GameModule | null {
  const loader = registry[gameId];
  if (!loader) return null;

  return lazy(loader);
}

// Export list of available games for validation
export const AVAILABLE_GAMES = Object.keys(registry);

// Export 3D game IDs for filtering
export const AAA_3D_GAMES = [
  "fps-shooter", "tactical-assault",
  "neon-racer", "racing",
  "track-field", "olympics",
  "basketball-3d", "street-basketball",
  "tank-battle", "armored-warfare",
  "space-combat", "starfighter",
  "bowling", "bowling-3d",
  "golf", "golf-3d",
  "soccer", "soccer-3d",
  "boxing", "boxing-3d",
  "skateboard", "skate-park",
  "archery", "archery-3d",
  "tennis", "tennis-3d",
  "snowboard", "alpine-rush",
  "parkour", "free-runner",
  "surfing", "wave-rider",
  "darts", "darts-501",
  "table-tennis", "ping-pong",
  "volleyball", "beach-volleyball",
  "baseball", "home-run-derby",
  "hockey", "air-hockey",
  "fencing", "olympic-fencing",
  "robot-battle", "mech-arena",
  "jet-ski", "wave-race",
  "flight-sim", "ace-combat",
];
