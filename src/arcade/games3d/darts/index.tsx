/**
 * Darts - React Component Wrapper
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DartsGame } from './DartsGame';

export const Darts: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<DartsGame | null>(null);
  const [gameState, setGameState] = useState<'loading' | 'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('loading');
  const [playerScore, setPlayerScore] = useState(501);
  const [opponentScore, setOpponentScore] = useState(501);
  const [turnScore, setTurnScore] = useState(0);
  const [dartsRemaining, setDartsRemaining] = useState(3);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [power, setPower] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new DartsGame(containerRef.current);
    gameRef.current = game;

    game.onStateChange((state) => setGameState(state as any));

    const updateLoop = setInterval(() => {
      if (game) {
        setPlayerScore(game.getPlayerScore());
        setOpponentScore(game.getOpponentScore());
        setTurnScore(game.getTurnScore());
        setDartsRemaining(game.getDartsRemaining());
        setIsPlayerTurn(game.isCurrentlyPlayerTurn());
        setPower(game.getPower());
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
            {/* Scores */}
            <div className="absolute top-4 left-4">
              <div className="text-white text-sm">YOU</div>
              <div className="text-green-400 text-4xl font-bold">{playerScore}</div>
            </div>

            <div className="absolute top-4 right-4 text-right">
              <div className="text-white text-sm">OPPONENT</div>
              <div className="text-red-400 text-4xl font-bold">{opponentScore}</div>
            </div>

            {/* Turn Info */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
              <div className={`text-lg font-bold ${isPlayerTurn ? 'text-green-400' : 'text-red-400'}`}>
                {isPlayerTurn ? 'YOUR TURN' : 'OPPONENT\'S TURN'}
              </div>
              <div className="text-white text-sm">Turn Score: {turnScore}</div>
              <div className="text-gray-400 text-sm">Darts: {dartsRemaining}</div>
            </div>

            {/* Power Meter */}
            {isPlayerTurn && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
                <div className="text-white text-sm text-center mb-2">POWER</div>
                <div className="w-48 h-4 bg-gray-800 rounded overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                    style={{ width: `${power * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 border-2 border-white/50 rounded-full" />
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2" />
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
              <h1 className="text-5xl font-bold text-green-400 mb-2">🎯 DARTS</h1>
              <p className="text-gray-400 mb-8">501 - First to zero wins!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-lg"
              >
                THROW
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

export { DartsGame };
export default Darts;
