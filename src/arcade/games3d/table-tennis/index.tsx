/**
 * Table Tennis - React Component Wrapper
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableTennisGame } from './TableTennisGame';

export const TableTennis: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<TableTennisGame | null>(null);
  const [gameState, setGameState] = useState<'loading' | 'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('loading');
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [isServing, setIsServing] = useState(true);
  const [serverSide, setServerSide] = useState<'player' | 'opponent'>('player');

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new TableTennisGame(containerRef.current);
    gameRef.current = game;

    game.onStateChange((state) => setGameState(state as any));

    const updateLoop = setInterval(() => {
      if (game) {
        setPlayerScore(game.getPlayerScore());
        setOpponentScore(game.getOpponentScore());
        setIsServing(game.isCurrentlyServing());
        setServerSide(game.getServerSide());
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
              <div className="bg-black/80 rounded-lg px-8 py-3 flex items-center gap-8">
                <div className="text-center">
                  <div className="text-green-400 text-sm">YOU</div>
                  <div className="text-white text-4xl font-bold">{playerScore}</div>
                </div>
                <div className="text-gray-400 text-2xl">-</div>
                <div className="text-center">
                  <div className="text-red-400 text-sm">OPP</div>
                  <div className="text-white text-4xl font-bold">{opponentScore}</div>
                </div>
              </div>
            </div>

            {/* Serve indicator */}
            {isServing && (
              <div className="absolute top-24 left-1/2 -translate-x-1/2">
                <div className={`text-lg font-bold ${serverSide === 'player' ? 'text-green-400' : 'text-red-400'}`}>
                  {serverSide === 'player' ? 'YOUR SERVE' : 'OPPONENT SERVING'}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-4 right-4 text-white text-xs opacity-60">
              <div>WASD - Move Paddle</div>
              <div>Click - Serve/Hit</div>
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
              <h1 className="text-5xl font-bold text-orange-400 mb-2">🏓 TABLE TENNIS</h1>
              <p className="text-gray-400 mb-8">First to 11 wins!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-orange-600 text-white text-xl font-bold rounded-lg"
              >
                SERVE
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                {gameState === 'victory' ? 'YOU WIN!' : 'YOU LOSE'}
              </h1>
              <p className="text-white text-2xl mb-8">{playerScore} - {opponentScore}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-orange-600 text-white text-xl font-bold rounded-lg"
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

export { TableTennisGame };
export default TableTennis;
