/**
 * Surfing - React Component Wrapper
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SurfingGame } from './SurfingGame';

export const Surfing: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<SurfingGame | null>(null);
  const [gameState, setGameState] = useState<'loading' | 'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('loading');
  const [score, setScore] = useState(0);
  const [sessionTime, setSessionTime] = useState(120);
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [trickList, setTrickList] = useState<string[]>([]);
  const [currentTrick, setCurrentTrick] = useState<string | null>(null);
  const [isOnWave, setIsOnWave] = useState(false);
  const [isInTube, setIsInTube] = useState(false);
  const [isInAir, setIsInAir] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new SurfingGame(containerRef.current);
    gameRef.current = game;

    game.onStateChange((state) => setGameState(state as any));
    game.onScoreChange((s) => setScore(s.score));

    const updateLoop = setInterval(() => {
      if (game) {
        setSessionTime(game.getSessionTime());
        setCombo(game.getCombo());
        setMultiplier(game.getComboMultiplier());
        setTrickList(game.getTrickList());
        setCurrentTrick(game.getCurrentTrick());
        setIsOnWave(game.isOnWaveFace());
        setIsInTube(game.isInsideTube());
        setIsInAir(game.isInAir());
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
            {/* Timer */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
              <div className="text-white text-sm">TIME</div>
              <div className="text-yellow-400 text-3xl font-bold font-mono">{formatTime(sessionTime)}</div>
            </div>

            {/* Score */}
            <div className="absolute top-4 left-4">
              <div className="text-white text-sm">SCORE</div>
              <div className="text-yellow-400 text-4xl font-bold">{score.toLocaleString()}</div>
            </div>

            {/* Combo */}
            {combo > 0 && (
              <div className="absolute top-4 right-4 text-right">
                <div className="text-white text-sm">COMBO</div>
                <div className="text-cyan-400 text-2xl font-bold">{combo}x</div>
                <div className="text-yellow-400 text-lg">x{multiplier.toFixed(1)}</div>
              </div>
            )}

            {/* Wave Status */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center">
              {isInTube && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-400 text-2xl font-bold animate-pulse"
                >
                  🌊 IN THE TUBE! 🌊
                </motion.div>
              )}
              {isOnWave && !isInTube && (
                <div className="text-cyan-400 text-lg">RIDING WAVE</div>
              )}
              {isInAir && (
                <div className="text-purple-400 text-lg font-bold">AIRBORNE</div>
              )}
            </div>

            {/* Current Trick */}
            {currentTrick && (
              <motion.div
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="absolute top-1/3 left-1/2 -translate-x-1/2"
              >
                <div className="text-white text-3xl font-bold">{currentTrick}</div>
              </motion.div>
            )}

            {/* Trick List */}
            {trickList.length > 0 && (
              <div className="absolute bottom-32 left-1/2 -translate-x-1/2 text-center">
                <div className="flex gap-2 flex-wrap justify-center">
                  {trickList.slice(-5).map((trick, i) => (
                    <span key={i} className="text-cyan-400 text-sm bg-black/50 px-2 py-1 rounded">
                      {trick}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-4 right-4 text-white text-xs opacity-60">
              <div>A/D - Steer</div>
              <div>W - Pump</div>
              <div>Space - Jump</div>
              <div>J/K - Turn tricks</div>
              <div>A/D (air) - Spin</div>
              <div>W/S (air) - Flip</div>
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
              <h1 className="text-5xl font-bold text-cyan-400 mb-2">🏄 SURFING</h1>
              <p className="text-gray-400 mb-8">Catch waves. Land tricks. Get barreled!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-cyan-600 text-white text-xl font-bold rounded-lg"
              >
                PADDLE OUT
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
              <h1 className="text-5xl font-bold text-cyan-400 mb-4">SESSION COMPLETE!</h1>
              <p className="text-white text-3xl mb-8">Final Score: {score.toLocaleString()}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-cyan-600 text-white text-xl font-bold rounded-lg"
              >
                SURF AGAIN
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { SurfingGame };
export default Surfing;
