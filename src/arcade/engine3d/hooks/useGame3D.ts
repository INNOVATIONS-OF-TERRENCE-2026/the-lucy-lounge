/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — REACT HOOK FOR 3D GAMES                                      │
 * │                                                                             │
 * │ Manages game lifecycle within React components                             │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Game3DBase, type GameState, type GameScore, type Game3DConfig } from '../core/Game3DBase';
import type { EngineStats } from '../core/Engine3D';

export interface UseGame3DOptions<T extends Game3DBase> {
  GameClass: new (container: HTMLElement, config?: Game3DConfig) => T;
  config?: Game3DConfig;
  onStateChange?: (state: GameState) => void;
  onScoreChange?: (score: GameScore) => void;
  autoLoad?: boolean;
}

export interface UseGame3DReturn<T extends Game3DBase> {
  containerRef: React.RefObject<HTMLDivElement>;
  game: T | null;
  state: GameState;
  score: GameScore;
  stats: EngineStats | null;
  isLoading: boolean;
  error: Error | null;
  start: () => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  setDifficulty: (difficulty: 'easy' | 'medium' | 'hard' | 'expert') => void;
}

export function useGame3D<T extends Game3DBase>(
  options: UseGame3DOptions<T>
): UseGame3DReturn<T> {
  const { GameClass, config, onStateChange, onScoreChange, autoLoad = true } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<T | null>(null);
  
  const [state, setState] = useState<GameState>('loading');
  const [score, setScore] = useState<GameScore>({ score: 0, time: 0 });
  const [stats, setStats] = useState<EngineStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize game
  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Create game instance
      const game = new GameClass(containerRef.current, {
        ...config,
        autoStart: false, // We'll handle loading manually
      });

      gameRef.current = game;

      // Register state change callback
      const unsubState = game.onStateChangeCallback((newState) => {
        setState(newState);
        onStateChange?.(newState);
        
        if (newState !== 'loading') {
          setIsLoading(false);
        }
      });

      // Register score change callback
      const unsubScore = game.onScoreChange((newScore) => {
        setScore(newScore);
        onScoreChange?.(newScore);
      });

      // Stats update interval
      const statsInterval = setInterval(() => {
        if (game.getState() === 'playing') {
          setStats(game.getStats());
        }
      }, 500);

      // Load game if autoLoad is enabled
      if (autoLoad) {
        game.load().catch((err) => {
          console.error('[useGame3D] Failed to load game:', err);
          setError(err);
          setIsLoading(false);
        });
      }

      // Cleanup
      return () => {
        clearInterval(statsInterval);
        unsubState();
        unsubScore();
        game.dispose();
        gameRef.current = null;
      };
    } catch (err) {
      console.error('[useGame3D] Failed to create game:', err);
      setError(err as Error);
      setIsLoading(false);
    }
  }, [GameClass]); // Only recreate when GameClass changes

  // Control functions
  const start = useCallback(() => {
    gameRef.current?.start();
  }, []);

  const pause = useCallback(() => {
    gameRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    gameRef.current?.resume();
  }, []);

  const restart = useCallback(() => {
    gameRef.current?.restart();
  }, []);

  const setDifficulty = useCallback((difficulty: 'easy' | 'medium' | 'hard' | 'expert') => {
    gameRef.current?.setDifficulty(difficulty);
  }, []);

  return {
    containerRef,
    game: gameRef.current,
    state,
    score,
    stats,
    isLoading,
    error,
    start,
    pause,
    resume,
    restart,
    setDifficulty,
  };
}

export default useGame3D;
