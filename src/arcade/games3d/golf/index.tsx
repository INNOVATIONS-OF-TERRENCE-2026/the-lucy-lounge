/**
 * Golf - React Component Wrapper
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GolfGame } from './GolfGame';

export const Golf: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GolfGame | null>(null);
  const [gameState, setGameState] = useState<'loading' | 'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('loading');
  const [score, setScore] = useState(0);
  const [strokes, setStrokes] = useState(0);
  const [hole, setHole] = useState(1);
  const [par, setPar] = useState(4);
  const [distance, setDistance] = useState(0);
  const [power, setPower] = useState(0);
  const [club, setClub] = useState('Driver');
  const [wind, setWind] = useState(0);
  const [isAiming, setIsAiming] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new GolfGame(containerRef.current);
    gameRef.current = game;

    game.onStateChange((state) => setGameState(state as any));
    game.onScoreChange((s) => setScore(s.score));

    const updateLoop = setInterval(() => {
      if (game) {
        setStrokes(game.getStrokes());
        setHole(game.getCurrentHole());
        setPar(game.getPar());
        setDistance(game.getDistanceToHole());
        setPower(game.getPower());
        setClub(game.getCurrentClub().name);
        setWind(game.getWindSpeed());
        setIsAiming(game.isCurrentlyAiming());
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

      {/* HUD */}
      <AnimatePresence>
        {gameState === 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Hole Info */}
            <div className="absolute top-4 left-4">
              <div className="text-white text-sm">HOLE {hole}</div>
              <div className="text-gray-400 text-sm">Par {par}</div>
              <div className="text-yellow-400 text-2xl font-bold mt-2">Stroke {strokes + 1}</div>
            </div>

            {/* Distance & Wind */}
            <div className="absolute top-4 right-4 text-right">
              <div className="text-white text-sm">DISTANCE TO HOLE</div>
              <div className="text-green-400 text-2xl font-bold">{Math.round(distance)}m</div>
              <div className="text-gray-400 text-sm mt-2">Wind: {wind.toFixed(1)} m/s</div>
            </div>

            {/* Club Selection */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
              <div className="text-white text-sm">CLUB</div>
              <div className="text-cyan-400 text-xl font-bold">{club}</div>
              <div className="text-gray-400 text-xs">Q/E to change</div>
            </div>

            {/* Power Meter */}
            {isAiming && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
                <div className="text-white text-sm text-center mb-2">POWER</div>
                <div className="w-48 h-6 bg-gray-800 rounded overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                    style={{ width: `${power * 100}%` }}
                    animate={{ width: `${power * 100}%` }}
                  />
                </div>
                <div className="text-gray-400 text-xs text-center mt-1">Hold to charge, release to swing</div>
              </div>
            )}

            {/* Score */}
            <div className="absolute bottom-4 left-4">
              <div className="text-white text-sm">TOTAL SCORE</div>
              <div className="text-yellow-400 text-2xl font-bold">{score}</div>
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
              <h1 className="text-5xl font-bold text-green-400 mb-2">⛳ GOLF</h1>
              <p className="text-gray-400 mb-8">Master the course. Beat par.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-lg"
              >
                TEE OFF
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
              <h1 className="text-5xl font-bold text-green-400 mb-4">ROUND COMPLETE!</h1>
              <p className="text-white text-2xl mb-8">Final Score: {score}</p>
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

export { GolfGame };
export default Golf;
