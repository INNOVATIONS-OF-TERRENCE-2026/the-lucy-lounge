/**
 * Jet Ski Racing - React Component Wrapper
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JetSkiGame } from './JetSkiGame';

export const JetSki: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<JetSkiGame | null>(null);
  const [gameState, setGameState] = useState<'loading' | 'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('loading');
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [boost, setBoost] = useState(100);
  const [maxBoost, setMaxBoost] = useState(100);
  const [lap, setLap] = useState(0);
  const [maxLaps, setMaxLaps] = useState(3);
  const [position, setPosition] = useState(1);
  const [raceTime, setRaceTime] = useState(0);
  const [trickScore, setTrickScore] = useState(0);
  const [isAirborne, setIsAirborne] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new JetSkiGame(containerRef.current);
    gameRef.current = game;

    game.onStateChange((state) => setGameState(state as any));
    game.onScoreChange((s) => setScore(s.score));

    const updateLoop = setInterval(() => {
      if (game) {
        setSpeed(game.getSpeed());
        setBoost(game.getBoost());
        setMaxBoost(game.getMaxBoost());
        setLap(game.getLap());
        setMaxLaps(game.getMaxLaps());
        setPosition(game.getPosition());
        setRaceTime(game.getRaceTime());
        setTrickScore(game.getTrickScore());
        setIsAirborne(game.isAirborne());
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
    const secs = (seconds % 60).toFixed(2);
    return `${mins}:${secs.padStart(5, '0')}`;
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
            {/* Speed */}
            <div className="absolute bottom-4 left-4">
              <div className="text-white text-sm">SPEED</div>
              <div className="text-cyan-400 text-4xl font-bold">{Math.round(speed)}</div>
              <div className="text-gray-400 text-sm">KM/H</div>
            </div>

            {/* Boost */}
            <div className="absolute bottom-4 left-32">
              <div className="text-white text-sm mb-1">BOOST</div>
              <div className="w-32 h-4 bg-gray-800 rounded overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                  style={{ width: `${(boost / maxBoost) * 100}%` }}
                />
              </div>
            </div>

            {/* Position & Lap */}
            <div className="absolute top-4 right-4 text-right">
              <div className="text-white text-sm">POSITION</div>
              <div className="text-yellow-400 text-4xl font-bold">{position}<span className="text-xl">/4</span></div>
              <div className="text-white text-sm mt-2">LAP</div>
              <div className="text-cyan-400 text-2xl font-bold">{lap + 1}/{maxLaps}</div>
            </div>

            {/* Time */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
              <div className="text-white text-sm">TIME</div>
              <div className="text-white text-3xl font-mono">{formatTime(raceTime)}</div>
            </div>

            {/* Trick Score */}
            {trickScore > 0 && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2">
                <div className="text-yellow-400 text-2xl font-bold">+{trickScore}</div>
              </div>
            )}

            {/* Air indicator */}
            {isAirborne && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute bottom-20 left-1/2 -translate-x-1/2"
              >
                <div className="text-cyan-400 text-xl font-bold">AIR!</div>
              </motion.div>
            )}

            {/* Controls */}
            <div className="absolute bottom-4 right-4 text-white text-xs opacity-60">
              <div>W/S - Throttle</div>
              <div>A/D - Steer</div>
              <div>Shift - Boost</div>
              <div>Q - Air Trick</div>
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
              <h1 className="text-5xl font-bold text-cyan-400 mb-2">🚤 JET SKI RACING</h1>
              <p className="text-gray-400 mb-8">Race across the waves!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-cyan-600 text-white text-xl font-bold rounded-lg"
              >
                START RACE
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState === 'victory' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80"
          >
            <div className="text-center">
              <h1 className="text-5xl font-bold text-green-400 mb-4">RACE COMPLETE!</h1>
              <p className="text-white text-2xl mb-2">Position: {position}</p>
              <p className="text-cyan-400 text-3xl font-mono mb-8">{formatTime(raceTime)}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-cyan-600 text-white text-xl font-bold rounded-lg"
              >
                RACE AGAIN
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { JetSkiGame };
export default JetSki;
