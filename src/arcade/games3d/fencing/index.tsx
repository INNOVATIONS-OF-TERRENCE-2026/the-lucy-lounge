/**
 * Fencing - React Component Wrapper
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FencingGame } from './FencingGame';

export const Fencing: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<FencingGame | null>(null);
  const [gameState, setGameState] = useState<'loading' | 'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('loading');
  const [playerTouches, setPlayerTouches] = useState(0);
  const [opponentTouches, setOpponentTouches] = useState(0);
  const [playerStamina, setPlayerStamina] = useState(100);
  const [bout, setBout] = useState(1);
  const [roundTime, setRoundTime] = useState(0);
  const [playerAction, setPlayerAction] = useState('idle');

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new FencingGame(containerRef.current);
    gameRef.current = game;

    game.onStateChange((state) => setGameState(state as any));

    const updateLoop = setInterval(() => {
      if (game) {
        setPlayerTouches(game.getPlayerTouches());
        setOpponentTouches(game.getOpponentTouches());
        setPlayerStamina(game.getPlayerStamina());
        setBout(game.getBout());
        setRoundTime(game.getRoundTime());
        setPlayerAction(game.getPlayerAction());
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
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
                  <div className="text-white text-4xl font-bold">{playerTouches}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-sm">BOUT {bout}</div>
                  <div className="text-yellow-400 text-xl">{formatTime(roundTime)}</div>
                </div>
                <div className="text-center">
                  <div className="text-red-400 text-sm">OPP</div>
                  <div className="text-white text-4xl font-bold">{opponentTouches}</div>
                </div>
              </div>
            </div>

            {/* Stamina */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
              <div className="text-white text-sm text-center mb-1">STAMINA</div>
              <div className="w-48 h-3 bg-gray-800 rounded overflow-hidden">
                <motion.div
                  className="h-full bg-green-500"
                  style={{ width: `${playerStamina}%` }}
                />
              </div>
            </div>

            {/* Action indicator */}
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
              <div className={`text-lg font-bold uppercase ${
                playerAction === 'parry' ? 'text-blue-400' :
                playerAction === 'attack' || playerAction === 'lunge' ? 'text-red-400' :
                playerAction === 'riposte' ? 'text-yellow-400' : 'text-gray-400'
              }`}>
                {playerAction !== 'idle' && playerAction}
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 right-4 text-white text-xs opacity-60">
              <div>W/S - Advance/Retreat</div>
              <div>J - Attack | K - Lunge</div>
              <div>L - Parry | U - Riposte</div>
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
              <h1 className="text-5xl font-bold text-white mb-2">⚔️ FENCING</h1>
              <p className="text-gray-400 mb-8">First to 5 touches wins the bout!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-white text-black text-xl font-bold rounded-lg"
              >
                EN GARDE
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
                {gameState === 'victory' ? 'VICTORY!' : 'DEFEAT'}
              </h1>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-white text-black text-xl font-bold rounded-lg"
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

export { FencingGame };
export default Fencing;
