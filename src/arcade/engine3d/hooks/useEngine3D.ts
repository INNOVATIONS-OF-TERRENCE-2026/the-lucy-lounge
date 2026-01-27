/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — REACT HOOK FOR 3D ENGINE                                     │
 * │                                                                             │
 * │ Provides React integration for the 3D game engine                          │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Engine3D, type Engine3DConfig, type EngineStats } from '../core/Engine3D';
import type { InputState } from '../core/InputManager';

export interface UseEngine3DOptions extends Partial<Engine3DConfig> {
  onUpdate?: (deltaTime: number, elapsedTime: number, input: InputState) => void;
  onFixedUpdate?: (fixedDeltaTime: number) => void;
  onResize?: (width: number, height: number) => void;
  autoStart?: boolean;
}

export interface UseEngine3DReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  engine: Engine3D | null;
  isRunning: boolean;
  isPaused: boolean;
  stats: EngineStats | null;
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
}

export function useEngine3D(options: UseEngine3DOptions = {}): UseEngine3DReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine3D | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState<EngineStats | null>(null);

  // Initialize engine
  useEffect(() => {
    if (!containerRef.current) return;

    const {
      onUpdate,
      onFixedUpdate,
      onResize,
      autoStart = false,
      ...engineConfig
    } = options;

    // Create engine
    const engine = new Engine3D({
      container: containerRef.current,
      ...engineConfig,
    });

    engineRef.current = engine;

    // Register callbacks
    if (onUpdate) {
      engine.onUpdate(onUpdate);
    }

    if (onFixedUpdate) {
      engine.onFixedUpdate(onFixedUpdate);
    }

    if (onResize) {
      engine.onResize(onResize);
    }

    // Stats update interval
    const statsInterval = setInterval(() => {
      if (engine.isPlaying()) {
        setStats(engine.getStats());
      }
    }, 500);

    // Auto-start if requested
    if (autoStart) {
      engine.start();
      setIsRunning(true);
    }

    // Cleanup
    return () => {
      clearInterval(statsInterval);
      engine.dispose();
      engineRef.current = null;
    };
  }, []); // Only run once on mount

  // Control functions
  const start = useCallback(() => {
    if (engineRef.current && !isRunning) {
      engineRef.current.start();
      setIsRunning(true);
      setIsPaused(false);
    }
  }, [isRunning]);

  const stop = useCallback(() => {
    if (engineRef.current && isRunning) {
      engineRef.current.stop();
      setIsRunning(false);
      setIsPaused(false);
    }
  }, [isRunning]);

  const pause = useCallback(() => {
    if (engineRef.current && isRunning && !isPaused) {
      engineRef.current.pause();
      setIsPaused(true);
    }
  }, [isRunning, isPaused]);

  const resume = useCallback(() => {
    if (engineRef.current && isRunning && isPaused) {
      engineRef.current.resume();
      setIsPaused(false);
    }
  }, [isRunning, isPaused]);

  return {
    containerRef,
    engine: engineRef.current,
    isRunning,
    isPaused,
    stats,
    start,
    stop,
    pause,
    resume,
  };
}

export default useEngine3D;
