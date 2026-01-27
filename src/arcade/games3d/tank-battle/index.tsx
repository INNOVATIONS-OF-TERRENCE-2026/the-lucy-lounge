/**
 * Tank Battle - React Component Wrapper
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TankBattleGame } from './TankBattleGame';

export const TankBattle: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<TankBattleGame | null>(null);
  const [gameState, setGameState] = useState<'loading' | 'menu' | 'playing' | 'paused' | 'gameover'>('loading');
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [wave, setWave] = useState(1);
  const [enemies, setEnemies] = useState(0);
  const [reload, setReload] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new TankBattleGame(containerRef.current);
    gameRef.current = game;

    game.onStateChange((state) => setGameState(state as any));
    game.onScoreChange((s) => setScore(s.score));

    const updateLoop = setInterval(() => {
      if (game) {
        setHealth(game.getPlayerHealth());
        setMaxHealth(game.getPlayerMaxHealth());
        setWave(game.getWaveNumber());
        setEnemies(game.getEnemiesRemaining());
        setReload(game.getReloadProgress());
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
            {/* Health Bar */}
            <div className="absolute top-4 left-4">
              <div className="text-white text-sm mb-1">HULL INTEGRITY</div>
              <div className="w-48 h-4 bg-gray-800 rounded overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-600 to-green-500"
                  style={{ width: `${(health / maxHealth) * 100}%` }}
                />
              </div>
              <div className="text-white text-xs mt-1">{Math.round(health)} / {maxHealth}</div>
            </div>

            {/* Reload Indicator */}
            <div className="absolute top-4 right-4">
              <div className="text-white text-sm mb-1">MAIN GUN</div>
              <div className="w-32 h-3 bg-gray-800 rounded overflow-hidden">
                <motion.div
                  className={`h-full ${reload >= 1 ? 'bg-green-500' : 'bg-yellow-500'}`}
                  style={{ width: `${reload * 100}%` }}
                />
              </div>
              <div className="text-white text-xs mt-1">{reload >= 1 ? 'READY' : 'RELOADING...'}</div>
            </div>

            {/* Wave Info */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
              <div className="text-yellow-400 text-2xl font-bold">WAVE {wave}</div>
              <div className="text-white text-sm">{enemies} enemies remaining</div>
            </div>

            {/* Score */}
            <div className="absolute bottom-4 left-4">
              <div className="text-white text-sm">SCORE</div>
              <div className="text-yellow-400 text-3xl font-bold">{score.toLocaleString()}</div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 right-4 text-white text-xs opacity-60">
              <div>WASD - Move Tank</div>
              <div>Mouse - Aim Turret</div>
              <div>Click - Fire</div>
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
              <h1 className="text-5xl font-bold text-white mb-2">TANK BATTLE</h1>
              <p className="text-gray-400 mb-8">Destroy enemy tanks. Survive the waves.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-lg"
              >
                START BATTLE
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
              <h1 className="text-5xl font-bold text-red-500 mb-4">DESTROYED</h1>
              <p className="text-white text-2xl mb-2">Waves Survived: {wave}</p>
              <p className="text-yellow-400 text-3xl font-bold mb-8">Score: {score.toLocaleString()}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-lg"
              >
                TRY AGAIN
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { TankBattleGame };
export default TankBattle;
