/**
 * Parkour - React Component Wrapper
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParkourGame } from './ParkourGame';

export const Parkour: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<ParkourGame | null>(null);
  const [gameState, setGameState] = useState<'loading' | 'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('loading');
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [momentum, setMomentum] = useState(0);
  const [maxMomentum, setMaxMomentum] = useState(100);
  const [movementState, setMovementState] = useState<string>('running');
  const [courseTime, setCourseTime] = useState(0);
  const [checkpoint, setCheckpoint] = useState(0);
  const [totalCheckpoints, setTotalCheckpoints] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new ParkourGame(containerRef.current);
    gameRef.current = game;

    game.onStateChange((state) => setGameState(state as any));
    game.onScoreChange((s) => setScore(s.score));

    const updateLoop = setInterval(() => {
      if (game) {
        setSpeed(game.getSpeed());
        setMomentum(game.getMomentum());
        setMaxMomentum(game.getMaxMomentum());
        setMovementState(game.getMovementState());
        setCourseTime(game.getCourseTime());
        setCheckpoint(game.getCurrentCheckpoint());
        setTotalCheckpoints(game.getTotalCheckpoints());
      }
    }, 50);

    return () => {
      clearInterval(updateLoop);
      game.dispose();
    };
  }, []);

  const startGame = useCallback(() => {
    gameRef.current?.start();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'wallrunning': return 'text-purple-400';
      case 'sliding': return 'text-yellow-400';
      case 'jumping': return 'text-cyan-400';
      case 'climbing': return 'text-green-400';
      case 'vaulting': return 'text-orange-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={containerRef} className="w-full h-full" />

      {/* HUD */}
      <AnimatePresence>
        {gameState === 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Timer */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
              <div className="text-white text-sm">TIME</div>
              <div className="text-yellow-400 text-3xl font-bold font-mono">{formatTime(courseTime)}</div>
            </div>

            {/* Speed */}
            <div className="absolute top-4 left-4">
              <div className="text-white text-sm">SPEED</div>
              <div className="text-cyan-400 text-2xl font-bold">{Math.round(speed)} km/h</div>
            </div>

            {/* Momentum */}
            <div className="absolute top-4 right-4">
              <div className="text-white text-sm mb-1">MOMENTUM</div>
              <div className="w-32 h-3 bg-gray-800 rounded overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${(momentum / maxMomentum) * 100}%` }}
                />
              </div>
            </div>

            {/* Checkpoints */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2">
              <div className="text-gray-400 text-sm">
                Checkpoint {checkpoint} / {totalCheckpoints}
              </div>
            </div>

            {/* Movement State */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
              <div className={`text-xl font-bold uppercase ${getStateColor(movementState)}`}>
                {movementState}
              </div>
            </div>

            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 right-4 text-white text-xs opacity-60">
              <div>WASD - Move</div>
              <div>Mouse - Look</div>
              <div>Space - Jump</div>
              <div>Shift - Slide</div>
              <div>A/D near wall - Wall Run</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu */}
      <AnimatePresence>
        {gameState === 'menu' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80"
          >
            <div className="text-center">
              <h1 className="text-5xl font-bold text-purple-400 mb-2">🏃 PARKOUR</h1>
              <p className="text-gray-400 mb-8">Run. Jump. Wall run. Reach the finish!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-purple-600 text-white text-xl font-bold rounded-lg"
              >
                START RUN
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory */}
      <AnimatePresence>
        {gameState === 'victory' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80"
          >
            <div className="text-center">
              <h1 className="text-5xl font-bold text-purple-400 mb-4">COURSE COMPLETE!</h1>
              <p className="text-white text-3xl mb-2">Time: {formatTime(courseTime)}</p>
              <p className="text-yellow-400 text-2xl mb-8">Score: {score}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-purple-600 text-white text-xl font-bold rounded-lg"
              >
                RUN AGAIN
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { ParkourGame };
export default Parkour;
