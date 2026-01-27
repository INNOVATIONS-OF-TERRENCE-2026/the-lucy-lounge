import { lazy } from "react";
import type { ComponentType } from "react";

/**
 * Lucy Arcade — Game Registry
 * The single source of truth for mapping gameId → executable component
 * Every entry MUST resolve to a default export React component
 * 
 * Phase 1: 12 working games with AI opponents and tutorials
 */

type GameModule = ComponentType<any>;

const registry: Record<string, () => Promise<{ default: GameModule }>> = {
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
