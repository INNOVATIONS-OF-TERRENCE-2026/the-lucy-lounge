/**
 * Space Combat - React Component Wrapper
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpaceCombatGame } from './SpaceCombatGame';

export const SpaceCombat: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<SpaceCombatGame | null>(null);
  const [gameState, setGameState] = useState<'loading' | 'menu' | 'playing' | 'paused' | 'gameover'>('loading');
  const [score, setScore] = useState(0);
  const [hull, setHull] = useState(100);
  const [maxHull, setMaxHull] = useState(100);
  const [shields, setShields] = useState(50);
  const [maxShields, setMaxShields] = useState(50);
  const [energy, setEnergy] = useState(100);
  const [speed, setSpeed] = useState(0);
  const [wave, setWave] = useState(1);
  const [enemies, setEnemies] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new SpaceCombatGame(containerRef.current);
    gameRef.current = game;

    game.onStateChange((state) => setGameState(state as any));
    game.onScoreChange((s) => setScore(s.score));

    const updateLoop = setInterval(() => {
      if (game) {
        setHull(game.getPlayerHull());
        setMaxHull(game.getPlayerMaxHull());
        setShields(game.getPlayerShields());
        setMaxShields(game.getPlayerMaxShields());
        setEnergy(game.getPlayerEnergy());
        setSpeed(game.getPlayerSpeed());
        setWave(game.getWaveNumber());
        setEnemies(game.getEnemiesRemaining());
      }
    }, 100);

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
            {/* Hull & Shields */}
            <div className="absolute top-4 left-4">
              <div className="text-cyan-400 text-sm mb-1">SHIELDS</div>
              <div className="w-48 h-3 bg-gray-800 rounded overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-cyan-500"
                  style={{ width: `${(shields / maxShields) * 100}%` }}
                />
              </div>
              <div className="text-red-400 text-sm mb-1">HULL</div>
              <div className="w-48 h-3 bg-gray-800 rounded overflow-hidden">
                <motion.div
                  className="h-full bg-red-500"
                  style={{ width: `${(hull / maxHull) * 100}%` }}
                />
              </div>
            </div>

            {/* Energy */}
            <div className="absolute top-4 right-4">
              <div className="text-yellow-400 text-sm mb-1">ENERGY</div>
              <div className="w-32 h-3 bg-gray-800 rounded overflow-hidden">
                <motion.div
                  className="h-full bg-yellow-500"
                  style={{ width: `${energy}%` }}
                />
              </div>
              <div className="text-white text-xs mt-2">SPEED: {Math.round(speed)} m/s</div>
            </div>

            {/* Wave Info */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
              <div className="text-purple-400 text-2xl font-bold">WAVE {wave}</div>
              <div className="text-white text-sm">{enemies} hostiles</div>
            </div>

            {/* Score */}
            <div className="absolute bottom-4 left-4">
              <div className="text-white text-sm">SCORE</div>
              <div className="text-cyan-400 text-3xl font-bold">{score.toLocaleString()}</div>
            </div>

            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 border-2 border-green-500 rounded-full opacity-50" />
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-green-500 rounded-full -translate-x-1/2 -translate-y-1/2" />
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
              <h1 className="text-5xl font-bold text-cyan-400 mb-2">SPACE COMBAT</h1>
              <p className="text-gray-400 mb-8">Defend the sector. Eliminate all hostiles.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-cyan-600 text-white text-xl font-bold rounded-lg"
              >
                LAUNCH
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over */}
      <AnimatePresence>
        {gameState === 'gameover' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80"
          >
            <div className="text-center">
              <h1 className="text-5xl font-bold text-red-500 mb-4">SHIP DESTROYED</h1>
              <p className="text-white text-2xl mb-2">Waves Cleared: {wave - 1}</p>
              <p className="text-cyan-400 text-3xl font-bold mb-8">Score: {score.toLocaleString()}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-cyan-600 text-white text-xl font-bold rounded-lg"
              >
                RELAUNCH
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { SpaceCombatGame };
export default SpaceCombat;
