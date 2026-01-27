/**
 * Tennis - React Component Wrapper
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TennisGame } from './TennisGame';

export const Tennis: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<TennisGame | null>(null);
  const [gameState, setGameState] = useState<'loading' | 'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('loading');
  const [score, setScore] = useState(0);
  const [gameScore, setGameScore] = useState({ player: 0, opponent: 0, playerGames: 0, opponentGames: 0, playerSets: 0, opponentSets: 0 });
  const [isServing, setIsServing] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new TennisGame(containerRef.current);
    gameRef.current = game;

    game.onStateChange((state) => setGameState(state as any));
    game.onScoreChange((s) => setScore(s.score));

    const updateLoop = setInterval(() => {
      if (game) {
        setGameScore(game.getGameScore());
        setIsServing(game.isCurrentlyServing());
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

  const formatPoint = (point: number | string) => {
    if (point === 'AD') return 'AD';
    return point.toString();
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
            {/* Scoreboard */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2">
              <div className="bg-black/80 rounded-lg px-6 py-3">
                <table className="text-white text-center">
                  <thead>
                    <tr className="text-xs text-gray-400">
                      <td className="px-4">PLAYER</td>
                      <td className="px-2">SETS</td>
                      <td className="px-2">GAMES</td>
                      <td className="px-4">POINTS</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-lg">
                      <td className="px-4 text-blue-400">YOU</td>
                      <td className="px-2">{gameScore.playerSets}</td>
                      <td className="px-2">{gameScore.playerGames}</td>
                      <td className="px-4 text-yellow-400 font-bold">{formatPoint(gameScore.player)}</td>
                    </tr>
                    <tr className="text-lg">
                      <td className="px-4 text-red-400">OPP</td>
                      <td className="px-2">{gameScore.opponentSets}</td>
                      <td className="px-2">{gameScore.opponentGames}</td>
                      <td className="px-4 text-yellow-400 font-bold">{formatPoint(gameScore.opponent)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Serving indicator */}
            {isServing && (
              <div className="absolute top-24 left-1/2 -translate-x-1/2">
                <div className="text-yellow-400 text-lg font-bold animate-pulse">SERVING</div>
              </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-4 right-4 text-white text-xs opacity-60">
              <div>WASD - Move</div>
              <div>Click - Swing</div>
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
              <h1 className="text-5xl font-bold text-green-400 mb-2">🎾 TENNIS</h1>
              <p className="text-gray-400 mb-8">Best of 3 sets. Win the match!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-lg"
              >
                SERVE
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory/Defeat */}
      <AnimatePresence>
        {(gameState === 'victory' || gameState === 'gameover') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80"
          >
            <div className="text-center">
              <h1 className={`text-5xl font-bold mb-4 ${gameState === 'victory' ? 'text-green-400' : 'text-red-400'}`}>
                {gameState === 'victory' ? 'MATCH WON!' : 'MATCH LOST'}
              </h1>
              <p className="text-white text-2xl mb-8">
                Sets: {gameScore.playerSets} - {gameScore.opponentSets}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-lg"
              >
                REMATCH
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { TennisGame };
export default Tennis;
