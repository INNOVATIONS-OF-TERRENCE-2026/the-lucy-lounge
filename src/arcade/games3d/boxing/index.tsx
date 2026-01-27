/**
 * Boxing - React Component Wrapper
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BoxingGame } from './BoxingGame';

export const Boxing: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<BoxingGame | null>(null);
  const [gameState, setGameState] = useState<'loading' | 'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('loading');
  const [score, setScore] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [playerStamina, setPlayerStamina] = useState(100);
  const [opponentHealth, setOpponentHealth] = useState(100);
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(3);
  const [roundTime, setRoundTime] = useState(0);
  const [combo, setCombo] = useState(0);
  const [playerKD, setPlayerKD] = useState(0);
  const [opponentKD, setOpponentKD] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new BoxingGame(containerRef.current);
    gameRef.current = game;

    game.onStateChange((state) => setGameState(state as any));
    game.onScoreChange((s) => setScore(s.score));

    const updateLoop = setInterval(() => {
      if (game) {
        setPlayerHealth(game.getPlayerHealth());
        setPlayerStamina(game.getPlayerStamina());
        setOpponentHealth(game.getOpponentHealth());
        setRound(game.getRound());
        setMaxRounds(game.getMaxRounds());
        setRoundTime(game.getRoundTime());
        setCombo(game.getCombo());
        setPlayerKD(game.getPlayerKnockdowns());
        setOpponentKD(game.getOpponentKnockdowns());
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

      {/* HUD */}
      <AnimatePresence>
        {gameState === 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Player Health */}
            <div className="absolute top-4 left-4 w-64">
              <div className="flex justify-between text-white text-sm mb-1">
                <span>YOU</span>
                <span>KD: {playerKD}/3</span>
              </div>
              <div className="h-4 bg-gray-800 rounded overflow-hidden mb-1">
                <motion.div
                  className="h-full bg-green-500"
                  style={{ width: `${playerHealth}%` }}
                />
              </div>
              <div className="h-2 bg-gray-800 rounded overflow-hidden">
                <motion.div
                  className="h-full bg-yellow-500"
                  style={{ width: `${playerStamina}%` }}
                />
              </div>
            </div>

            {/* Opponent Health */}
            <div className="absolute top-4 right-4 w-64">
              <div className="flex justify-between text-white text-sm mb-1">
                <span>KD: {opponentKD}/3</span>
                <span>OPPONENT</span>
              </div>
              <div className="h-4 bg-gray-800 rounded overflow-hidden">
                <motion.div
                  className="h-full bg-red-500 ml-auto"
                  style={{ width: `${opponentHealth}%` }}
                />
              </div>
            </div>

            {/* Round Info */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
              <div className="text-white text-sm">ROUND {round} / {maxRounds}</div>
              <div className="text-yellow-400 text-3xl font-bold font-mono">{formatTime(60 - roundTime)}</div>
            </div>

            {/* Combo */}
            {combo > 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1/3 left-1/2 -translate-x-1/2"
              >
                <div className="text-yellow-400 text-4xl font-bold">{combo}x COMBO!</div>
              </motion.div>
            )}

            {/* Score */}
            <div className="absolute bottom-4 left-4">
              <div className="text-white text-sm">SCORE</div>
              <div className="text-yellow-400 text-2xl font-bold">{score}</div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 right-4 text-white text-xs opacity-60">
              <div>WASD - Move</div>
              <div>J/K - Jab/Cross</div>
              <div>U/I - Hook/Uppercut</div>
              <div>Shift - Block</div>
              <div>Space - Dodge</div>
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
              <h1 className="text-5xl font-bold text-red-500 mb-2">🥊 BOXING</h1>
              <p className="text-gray-400 mb-8">3 rounds. Knock out your opponent!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-red-600 text-white text-xl font-bold rounded-lg"
              >
                FIGHT!
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
                {gameState === 'victory' ? 'KNOCKOUT!' : 'YOU LOST'}
              </h1>
              <p className="text-white text-2xl mb-8">Score: {score}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-red-600 text-white text-xl font-bold rounded-lg"
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

export { BoxingGame };
export default Boxing;
