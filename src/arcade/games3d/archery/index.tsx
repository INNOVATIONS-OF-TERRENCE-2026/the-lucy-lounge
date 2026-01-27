/**
 * Archery - React Component Wrapper
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArcheryGame } from './ArcheryGame';

export const Archery: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<ArcheryGame | null>(null);
  const [gameState, setGameState] = useState<'loading' | 'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('loading');
  const [score, setScore] = useState(0);
  const [arrows, setArrows] = useState(10);
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(3);
  const [drawStrength, setDrawStrength] = useState(0);
  const [wind, setWind] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new ArcheryGame(containerRef.current);
    gameRef.current = game;

    game.onStateChange((state) => setGameState(state as any));
    game.onScoreChange((s) => setScore(s.score));

    const updateLoop = setInterval(() => {
      if (game) {
        setArrows(game.getArrowsRemaining());
        setRound(game.getCurrentRound());
        setMaxRounds(game.getMaxRounds());
        setDrawStrength(game.getDrawStrength());
        setWind(game.getWindSpeed());
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
              <div className="text-white text-sm">SCORE</div>
              <div className="text-yellow-400 text-4xl font-bold">{score}</div>
            </div>

            {/* Round & Arrows */}
            <div className="absolute top-4 right-4 text-right">
              <div className="text-white text-sm">ROUND {round} / {maxRounds}</div>
              <div className="text-cyan-400 text-2xl font-bold">{arrows} arrows</div>
            </div>

            {/* Wind */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
              <div className="text-white text-sm">WIND</div>
              <div className="text-gray-400 text-lg">{wind.toFixed(1)} m/s</div>
            </div>

            {/* Draw Strength */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
              <div className="text-white text-sm text-center mb-2">DRAW</div>
              <div className="w-48 h-4 bg-gray-800 rounded overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                  style={{ width: `${drawStrength * 100}%` }}
                />
              </div>
            </div>

            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 border-2 border-white/30 rounded-full" />
              <div className="absolute top-1/2 left-0 w-4 h-0.5 bg-white/50 -translate-y-1/2" />
              <div className="absolute top-1/2 right-0 w-4 h-0.5 bg-white/50 -translate-y-1/2" />
              <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-white/50 -translate-x-1/2" />
              <div className="absolute bottom-0 left-1/2 w-0.5 h-4 bg-white/50 -translate-x-1/2" />
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 right-4 text-white text-xs opacity-60">
              <div>Mouse - Aim</div>
              <div>Hold Click - Draw</div>
              <div>Release - Shoot</div>
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
              <h1 className="text-5xl font-bold text-green-400 mb-2">🏹 ARCHERY</h1>
              <p className="text-gray-400 mb-8">3 rounds. 10 arrows each. Hit the bullseye!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-lg"
              >
                DRAW BOW
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
              <h1 className="text-5xl font-bold text-green-400 mb-4">TOURNAMENT COMPLETE!</h1>
              <p className="text-white text-3xl mb-8">Final Score: {score}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-lg"
              >
                SHOOT AGAIN
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { ArcheryGame };
export default Archery;
