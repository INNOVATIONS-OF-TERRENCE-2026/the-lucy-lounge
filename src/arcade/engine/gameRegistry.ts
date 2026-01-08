// Lucy Arcade — Game Registry
// Authoritative execution map for ALL games
// This file is the reason "Play Now" actually works

import { lazy, type ComponentType } from "react";

export type ArcadeGameId =
  | "chess"
  | "checkers"
  | "memory-match";

export type ArcadeGameComponent = ComponentType<Record<string, never>>;

export const GAME_REGISTRY: Record<ArcadeGameId, ArcadeGameComponent> = {
  chess: lazy(() => import("../games/chess/ChessGame")),
  checkers: lazy(() => import("../games/checkers/CheckersGame")),
  "memory-match": lazy(() => import("../games/memory/MemoryGame")),
};

/**
 * Safe resolver — NEVER throws
 * Returns null instead of crashing UI
 */
export function resolveGameComponent(
  gameId: string,
): ArcadeGameComponent | null {
  return (GAME_REGISTRY as Record<string, ArcadeGameComponent>)[gameId] ?? null;
}

/**
 * Runtime guard (optional analytics / logging hook)
 */
export function isValidGameId(gameId: string): gameId is ArcadeGameId {
  return gameId in GAME_REGISTRY;
}
