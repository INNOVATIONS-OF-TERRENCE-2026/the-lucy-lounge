/**
 * Robot Battle - React Component Wrapper
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RobotBattleGame } from './RobotBattleGame';

export const RobotBattle: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<RobotBattleGame | null>(null);
  const [gameState, setGameState] = useState<'loading' | 'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('loading');
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(200);
  const [maxHealth, setMaxHealth] = useState(200);
  const [energy, setEnergy] = useState(100);
  const [wave, setWave] = useState(1);
  const [enemiesRemaining, setEnemiesRemaining] = useState(0);
  const [kills, setKills] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new RobotBattleGame(containerRef.current);
    gameRef.current = game;

    game.onStateChange((state) => setGameState(state as any));
    game.onScoreChange((s) => setScore(s.score));

    const updateLoop = setInterval(() => {
      if (game) {
        setHealth(game.getPlayerHealth());
        setMaxHealth(game.getPlayerMaxHealth());
        setEnergy(game.getPlayerEnergy());
        setWave(game.getWave());
        setEnemiesRemaining(game.getEnemiesRemaining());
        setKills(game.getKills());
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
            {/* Health & Energy */}
            <div className="absolute top-4 left-4">
              <div className="text-white text-sm mb-1">HULL INTEGRITY</div>
              <div className="w-48 h-4 bg-gray-800 rounded overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-600 to-green-500"
                  style={{ width: `${(health / maxHealth) * 100}%` }}
                />
              </div>
              <div className="text-white text-sm mb-1">ENERGY</div>
              <div className="w-48 h-3 bg-gray-800 rounded overflow-hidden">
                <motion.div
                  className="h-full bg-cyan-500"
                  style={{ width: `${energy}%` }}
                />
              </div>
            </div>

            {/* Wave Info */}
            <div className="absolute top-4 right-4 text-right">
              <div className="text-cyan-400 text-sm">WAVE</div>
              <div className="text-white text-3xl font-bold">{wave}</div>
              <div className="text-red-400 text-sm mt-2">ENEMIES: {enemiesRemaining}</div>
            </div>

            {/* Score */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
              <div className="text-gray-400 text-sm">SCORE</div>
              <div className="text-yellow-400 text-3xl font-bold">{score}</div>
              <div className="text-gray-400 text-sm mt-1">KILLS: {kills}</div>
            </div>

            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 border-2 border-cyan-400/50 rounded-full" />
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 right-4 text-white text-xs opacity-60">
              <div>WASD - Move</div>
              <div>Mouse - Aim</div>
              <div>Click - Fire Laser</div>
              <div>E - Fire Cannon</div>
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
              <h1 className="text-5xl font-bold text-cyan-400 mb-2">🤖 ROBOT BATTLE</h1>
              <p className="text-gray-400 mb-8">Survive the mech onslaught!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-cyan-600 text-white text-xl font-bold rounded-lg"
              >
                DEPLOY
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState === 'gameover' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80"
          >
            <div className="text-center">
              <h1 className="text-5xl font-bold text-red-400 mb-4">DESTROYED</h1>
              <p className="text-white text-2xl mb-2">Wave: {wave}</p>
              <p className="text-yellow-400 text-3xl font-bold mb-8">Score: {score}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-cyan-600 text-white text-xl font-bold rounded-lg"
              >
                REDEPLOY
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { RobotBattleGame };
export default RobotBattle;
