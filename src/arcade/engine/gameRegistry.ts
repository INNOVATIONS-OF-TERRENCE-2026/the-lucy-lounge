import { lazy } from "react";
import type { ComponentType } from "react";

/**
 * Lucy Arcade — Game Registry
 * The single source of truth for mapping gameId → executable component
 * Every entry MUST resolve to a default export React component
 */

type GameModule = ComponentType<any>;

const registry: Record<string, () => Promise<{ default: GameModule }>> = {
  chess: () => import("../games/chess/ChessGame"),
  checkers: () => import("../games/checkers/CheckersGame"),
  "memory-match": () => import("../games/memory/MemoryGame"),
};

export function resolveGameComponent(gameId: string): GameModule | null {
  const loader = registry[gameId];
  if (!loader) return null;

  return lazy(loader);
}
