/**
 * Bowling - React Component Wrapper
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BowlingGame } from './BowlingGame';

export const Bowling: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<BowlingGame | null>(null);
  const [gameState, setGameState] = useState<'loading' | 'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('loading');
  const [totalScore, setTotalScore] = useState(0);
  const [frame, setFrame] = useState(1);
  const [roll, setRoll] = useState(1);
  const [power, setPower] = useState(0);
  const [spin, setSpin] = useState(0);
  const [isAiming, setIsAiming] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new BowlingGame(containerRef.current);
    gameRef.current = game;

    game.onStateChange((state) => setGameState(state as any));

    const updateLoop = setInterval(() => {
      if (game) {
        setTotalScore(game.getTotalScore());
        setFrame(game.getCurrentFrame() + 1);
        setRoll(game.getCurrentRoll() + 1);
        setPower(game.getPower());
        setSpin(game.getSpin());
        setIsAiming(game.isCurrentlyAiming());
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

      {/* HUD */}
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
              <div className="text-white text-sm">TOTAL SCORE</div>
              <div className="text-yellow-400 text-4xl font-bold">{totalScore}</div>
            </div>

            {/* Frame Info */}
            <div className="absolute top-4 right-4 text-right">
              <div className="text-white text-sm">FRAME {frame} / 10</div>
              <div className="text-gray-400 text-sm">Roll {roll}</div>
            </div>

            {/* Power Meter */}
            {isAiming && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
                <div className="text-white text-sm text-center mb-2">POWER</div>
                <div className="w-48 h-6 bg-gray-800 rounded overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                    style={{ width: `${power * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Spin Indicator */}
            {isAiming && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                <div className="text-white text-sm text-center mb-1">SPIN</div>
                <div className="w-32 h-3 bg-gray-800 rounded overflow-hidden relative">
                  <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white" />
                  <motion.div
                    className="absolute top-0 h-full w-2 bg-blue-500 rounded"
                    style={{ left: `${50 + spin * 50}%`, transform: 'translateX(-50%)' }}
                  />
                </div>
                <div className="text-gray-400 text-xs text-center mt-1">Q/E to adjust</div>
              </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-4 right-4 text-white text-xs opacity-60">
              <div>A/D - Position</div>
              <div>Q/E - Spin</div>
              <div>Hold Click - Power</div>
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
              <h1 className="text-5xl font-bold text-white mb-2">🎳 BOWLING</h1>
              <p className="text-gray-400 mb-8">10 frames. Aim for 300!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-orange-600 text-white text-xl font-bold rounded-lg"
              >
                START GAME
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
              <h1 className="text-5xl font-bold text-yellow-400 mb-4">GAME COMPLETE!</h1>
              <p className="text-white text-3xl mb-8">Final Score: {totalScore}</p>
              {totalScore === 300 && (
                <p className="text-green-400 text-2xl mb-4">🎉 PERFECT GAME! 🎉</p>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-orange-600 text-white text-xl font-bold rounded-lg"
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

export { BowlingGame };
export default Bowling;
