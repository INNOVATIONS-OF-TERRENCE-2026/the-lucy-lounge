/**
 * Flight Simulator - React Component Wrapper
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlightSimGame } from './FlightSimGame';

export const FlightSim: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<FlightSimGame | null>(null);
  const [gameState, setGameState] = useState<'loading' | 'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('loading');
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [throttle, setThrottle] = useState(0);
  const [health, setHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [ammo, setAmmo] = useState(500);
  const [missiles, setMissiles] = useState(4);
  const [targetsDestroyed, setTargetsDestroyed] = useState(0);
  const [totalTargets, setTotalTargets] = useState(10);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new FlightSimGame(containerRef.current);
    gameRef.current = game;

    game.onStateChange((state) => setGameState(state as any));
    game.onScoreChange((s) => setScore(s.score));

    const updateLoop = setInterval(() => {
      if (game) {
        setSpeed(game.getSpeed());
        setAltitude(game.getAltitude());
        setThrottle(game.getThrottle());
        setHealth(game.getHealth());
        setMaxHealth(game.getMaxHealth());
        setAmmo(game.getAmmo());
        setMissiles(game.getMissiles());
        setTargetsDestroyed(game.getTargetsDestroyed());
        setTotalTargets(game.getTotalTargets());
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
            {/* HUD Left - Speed & Altitude */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <div className="bg-black/60 rounded-lg p-3">
                <div className="text-green-400 text-sm">SPEED</div>
                <div className="text-white text-2xl font-mono">{Math.round(speed)}</div>
                <div className="text-gray-400 text-xs">KNOTS</div>
                
                <div className="text-green-400 text-sm mt-4">ALT</div>
                <div className="text-white text-2xl font-mono">{Math.round(altitude)}</div>
                <div className="text-gray-400 text-xs">METERS</div>
              </div>
            </div>

            {/* HUD Right - Throttle */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="bg-black/60 rounded-lg p-3">
                <div className="text-green-400 text-sm mb-2">THROTTLE</div>
                <div className="w-4 h-32 bg-gray-800 rounded relative">
                  <motion.div
                    className="absolute bottom-0 w-full bg-green-500 rounded"
                    style={{ height: `${throttle * 100}%` }}
                  />
                </div>
                <div className="text-white text-center mt-1">{Math.round(throttle * 100)}%</div>
              </div>
            </div>

            {/* Health */}
            <div className="absolute top-4 left-4">
              <div className="text-white text-sm mb-1">HULL</div>
              <div className="w-40 h-4 bg-gray-800 rounded overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-600 to-green-500"
                  style={{ width: `${(health / maxHealth) * 100}%` }}
                />
              </div>
            </div>

            {/* Weapons */}
            <div className="absolute top-4 right-4 text-right">
              <div className="text-white text-sm">AMMO: <span className="text-yellow-400">{ammo}</span></div>
              <div className="text-white text-sm">MISSILES: <span className="text-red-400">{missiles}</span></div>
            </div>

            {/* Mission */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
              <div className="text-white text-sm">TARGETS</div>
              <div className="text-yellow-400 text-2xl font-bold">{targetsDestroyed}/{totalTargets}</div>
            </div>

            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 border-2 border-green-400/50 rounded-full" />
              <div className="absolute top-1/2 left-0 w-4 h-0.5 bg-green-400/50 -translate-y-1/2" />
              <div className="absolute top-1/2 right-0 w-4 h-0.5 bg-green-400/50 -translate-y-1/2" />
              <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-green-400/50 -translate-x-1/2" />
              <div className="absolute bottom-0 left-1/2 w-0.5 h-4 bg-green-400/50 -translate-x-1/2" />
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 right-4 text-white text-xs opacity-60">
              <div>W/S - Throttle</div>
              <div>Mouse - Pitch/Roll</div>
              <div>Q/E - Yaw</div>
              <div>Click - Fire Guns</div>
              <div>R - Fire Missile</div>
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
              <h1 className="text-5xl font-bold text-blue-400 mb-2">✈️ FLIGHT SIM</h1>
              <p className="text-gray-400 mb-8">Destroy all ground targets!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-lg"
              >
                TAKE OFF
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
              <h1 className="text-5xl font-bold text-green-400 mb-4">MISSION COMPLETE!</h1>
              <p className="text-yellow-400 text-3xl font-bold mb-8">Score: {score}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-lg"
              >
                NEW MISSION
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
              <h1 className="text-5xl font-bold text-red-400 mb-4">SHOT DOWN</h1>
              <p className="text-white text-2xl mb-2">Targets: {targetsDestroyed}/{totalTargets}</p>
              <p className="text-yellow-400 text-3xl font-bold mb-8">Score: {score}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-lg"
              >
                RETRY
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { FlightSimGame };
export default FlightSim;
