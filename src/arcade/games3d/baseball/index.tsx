/**
 * Baseball - React Component Wrapper
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseballGame } from './BaseballGame';

export const Baseball: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<BaseballGame | null>(null);
  const [gameState, setGameState] = useState<'loading' | 'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('loading');
  const [score, setScore] = useState(0);
  const [pitchCount, setPitchCount] = useState(0);
  const [maxPitches, setMaxPitches] = useState(10);
  const [homeRuns, setHomeRuns] = useState(0);
  const [longestHit, setLongestHit] = useState(0);
  const [currentPitch, setCurrentPitch] = useState('fastball');
  const [isPitchIncoming, setIsPitchIncoming] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new BaseballGame(containerRef.current);
    gameRef.current = game;

    game.onStateChange((state) => setGameState(state as any));
    game.onScoreChange((s) => setScore(s.score));

    const updateLoop = setInterval(() => {
      if (game) {
        setPitchCount(game.getPitchCount());
        setMaxPitches(game.getMaxPitches());
        setHomeRuns(game.getHomeRuns());
        setLongestHit(game.getLongestHit());
        setCurrentPitch(game.getCurrentPitch());
        setIsPitchIncoming(game.isPitchIncoming());
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

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={containerRef} className="w-full h-full" />

      <AnimatePresence>
        {gameState === 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Score */}
            <div className="absolute top-4 left-4">
              <div className="text-white text-sm">SCORE</div>
              <div className="text-yellow-400 text-4xl font-bold">{score}</div>
            </div>

            {/* Pitch Count */}
            <div className="absolute top-4 right-4 text-right">
              <div className="text-white text-sm">PITCHES</div>
              <div className="text-cyan-400 text-2xl font-bold">{pitchCount} / {maxPitches}</div>
            </div>

            {/* Stats */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
              <div className="text-white text-sm">HOME RUNS</div>
              <div className="text-green-400 text-3xl font-bold">{homeRuns}</div>
              <div className="text-gray-400 text-sm mt-1">Longest: {Math.round(longestHit)}m</div>
            </div>

            {/* Pitch Type */}
            {isPitchIncoming && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute bottom-20 left-1/2 -translate-x-1/2"
              >
                <div className="text-yellow-400 text-xl font-bold uppercase">{currentPitch}</div>
              </motion.div>
            )}

            {/* Strike Zone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-24 h-32 border-2 border-white/30 rounded" />
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 right-4 text-white text-xs opacity-60">
              <div>Mouse - Aim Bat</div>
              <div>Click - Swing</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState === 'menu' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80"
          >
            <div className="text-center">
              <h1 className="text-5xl font-bold text-green-400 mb-2">⚾ HOME RUN DERBY</h1>
              <p className="text-gray-400 mb-8">10 pitches. Hit as many home runs as you can!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-lg"
              >
                PLAY BALL
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState === 'victory' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80"
          >
            <div className="text-center">
              <h1 className="text-5xl font-bold text-green-400 mb-4">DERBY COMPLETE!</h1>
              <p className="text-white text-2xl mb-2">Home Runs: {homeRuns}</p>
              <p className="text-yellow-400 text-3xl font-bold mb-2">Score: {score}</p>
              <p className="text-gray-400 mb-8">Longest Hit: {Math.round(longestHit)}m</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-lg"
              >
                PLAY AGAIN
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { BaseballGame };
export default Baseball;
