/**
 * Soccer - React Component Wrapper
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SoccerGame } from './SoccerGame';

export const Soccer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<SoccerGame | null>(null);
  const [gameState, setGameState] = useState<'loading' | 'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('loading');
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [matchTime, setMatchTime] = useState(0);
  const [matchDuration, setMatchDuration] = useState(180);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new SoccerGame(containerRef.current);
    gameRef.current = game;

    game.onStateChange((state) => setGameState(state as any));

    const updateLoop = setInterval(() => {
      if (game) {
        setHomeScore(game.getHomeScore());
        setAwayScore(game.getAwayScore());
        setMatchTime(game.getMatchTime());
        setMatchDuration(game.getMatchDuration());
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
            {/* Scoreboard */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2">
              <div className="bg-black/80 rounded-lg px-8 py-3 flex items-center gap-8">
                <div className="text-center">
                  <div className="text-blue-400 text-sm">HOME</div>
                  <div className="text-white text-4xl font-bold">{homeScore}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-sm">TIME</div>
                  <div className="text-white text-2xl font-mono">{formatTime(matchTime)}</div>
                </div>
                <div className="text-center">
                  <div className="text-red-400 text-sm">AWAY</div>
                  <div className="text-white text-4xl font-bold">{awayScore}</div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 right-4 text-white text-xs opacity-60">
              <div>WASD - Move</div>
              <div>Click - Kick</div>
              <div>Q - Switch Player</div>
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
              <h1 className="text-5xl font-bold text-green-400 mb-2">⚽ SOCCER</h1>
              <p className="text-gray-400 mb-8">3-minute match. Score to win!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-lg"
              >
                KICK OFF
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over */}
      <AnimatePresence>
        {(gameState === 'victory' || gameState === 'gameover') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80"
          >
            <div className="text-center">
              <h1 className={`text-5xl font-bold mb-4 ${homeScore > awayScore ? 'text-green-400' : homeScore < awayScore ? 'text-red-400' : 'text-yellow-400'}`}>
                {homeScore > awayScore ? 'VICTORY!' : homeScore < awayScore ? 'DEFEAT' : 'DRAW'}
              </h1>
              <div className="text-white text-3xl mb-8">
                {homeScore} - {awayScore}
              </div>
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

export { SoccerGame };
export default Soccer;
