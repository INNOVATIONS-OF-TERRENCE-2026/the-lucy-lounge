/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — NEON RACER REACT COMPONENT                                   │
 * │                                                                             │
 * │ Full-featured racing game with HUD, menus, and controls                    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame3D } from '../../engine3d/hooks/useGame3D';
import { RacingGame } from './RacingGame';
import type { GameScore } from '../../engine3d/core/Game3DBase';

// ============================================================================
// HUD COMPONENTS
// ============================================================================

interface SpeedometerProps {
  speed: number;
  maxSpeed: number;
}

const Speedometer: React.FC<SpeedometerProps> = ({ speed, maxSpeed }) => {
  const percentage = (speed / maxSpeed) * 100;
  const displaySpeed = Math.round(speed);
  
  return (
    <div className="relative w-40 h-40">
      {/* Background circle */}
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
        />
        <circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke="url(#speedGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${percentage * 4.4} 440`}
        />
        <defs>
          <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ff88" />
            <stop offset="50%" stopColor="#ffff00" />
            <stop offset="100%" stopColor="#ff0066" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Speed display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tabular-nums">{displaySpeed}</span>
        <span className="text-xs text-gray-400">KM/H</span>
      </div>
    </div>
  );
};

interface BoostBarProps {
  current: number;
  max: number;
  isActive: boolean;
}

const BoostBar: React.FC<BoostBarProps> = ({ current, max, isActive }) => {
  const percentage = (current / max) * 100;
  
  return (
    <div className="w-40">
      <div className="text-xs text-center mb-1 font-bold">
        {isActive ? (
          <motion.span
            className="text-cyan-400"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 0.2 }}
          >
            BOOST ACTIVE
          </motion.span>
        ) : (
          <span className="text-gray-400">NITRO</span>
        )}
      </div>
      <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-cyan-500/30">
        <motion.div
          className={`h-full rounded-full ${isActive ? 'bg-cyan-400' : 'bg-cyan-600'}`}
          style={{ width: `${percentage}%` }}
          animate={isActive ? { opacity: [1, 0.7, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.1 }}
        />
      </div>
    </div>
  );
};

interface PositionDisplayProps {
  position: number;
  total: number;
}

const PositionDisplay: React.FC<PositionDisplayProps> = ({ position, total }) => {
  const suffix = position === 1 ? 'ST' : position === 2 ? 'ND' : position === 3 ? 'RD' : 'TH';
  
  return (
    <div className="text-center">
      <div className="flex items-baseline justify-center">
        <span className="text-6xl font-bold">{position}</span>
        <span className="text-2xl font-bold text-gray-400">{suffix}</span>
      </div>
      <div className="text-sm text-gray-400">of {total}</div>
    </div>
  );
};

interface LapDisplayProps {
  current: number;
  total: number;
}

const LapDisplay: React.FC<LapDisplayProps> = ({ current, total }) => (
  <div className="text-center">
    <div className="text-xs text-gray-400 uppercase tracking-wider">LAP</div>
    <div className="text-3xl font-bold">
      {current} <span className="text-gray-500">/</span> {total}
    </div>
  </div>
);

interface TimeDisplayProps {
  time: number;
  label: string;
  highlight?: boolean;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ time, label, highlight }) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const ms = Math.floor((time % 1) * 100);
  
  return (
    <div className={`text-center ${highlight ? 'text-green-400' : ''}`}>
      <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="text-xl font-mono font-bold tabular-nums">
        {minutes}:{String(seconds).padStart(2, '0')}.{String(ms).padStart(2, '0')}
      </div>
    </div>
  );
};

interface CountdownProps {
  count: number;
}

const Countdown: React.FC<CountdownProps> = ({ count }) => {
  if (count <= 0) {
    return (
      <motion.div
        className="text-8xl font-bold text-green-400"
        initial={{ scale: 2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
      >
        GO!
      </motion.div>
    );
  }
  
  return (
    <motion.div
      key={count}
      className="text-9xl font-bold text-yellow-400"
      initial={{ scale: 2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
    >
      {count}
    </motion.div>
  );
};

// ============================================================================
// MENU SCREENS
// ============================================================================

interface MenuScreenProps {
  onStart: () => void;
  vehicles: Array<{ id: string; name: string; color: number }>;
  selectedVehicle: string;
  onSelectVehicle: (id: string) => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({
  onStart,
  vehicles,
  selectedVehicle,
  onSelectVehicle,
}) => (
  <motion.div
    className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.h1
      className="text-6xl font-bold mb-8 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      NEON RACER
    </motion.h1>
    
    <motion.p
      className="text-gray-400 mb-8 text-center max-w-md"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      Race against AI opponents on the neon circuit. Use WASD or gamepad to drive.
      Hold SHIFT for boost. Complete 3 laps to win!
    </motion.p>
    
    {/* Vehicle Selection */}
    <motion.div
      className="mb-8"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="text-sm text-gray-400 text-center mb-3">SELECT VEHICLE</div>
      <div className="flex gap-4">
        {vehicles.map((vehicle) => (
          <button
            key={vehicle.id}
            onClick={() => onSelectVehicle(vehicle.id)}
            className={`px-6 py-3 rounded-lg transition-all ${
              selectedVehicle === vehicle.id
                ? 'ring-2 ring-white scale-105'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{ backgroundColor: `#${vehicle.color.toString(16).padStart(6, '0')}` }}
          >
            <div className="text-white font-bold text-sm">{vehicle.name}</div>
          </button>
        ))}
      </div>
    </motion.div>
    
    <motion.button
      onClick={onStart}
      className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white text-xl font-bold rounded-lg transition-all"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      START RACE
    </motion.button>
    
    <motion.p
      className="text-gray-500 text-sm mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      WASD / Arrows to drive • SHIFT / A button for boost • Gamepad supported
    </motion.p>
  </motion.div>
);

interface ResultsScreenProps {
  position: number;
  total: number;
  raceTime: number;
  bestLap: number;
  onRestart: () => void;
  onQuit: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  position,
  total,
  raceTime,
  bestLap,
  onRestart,
  onQuit,
}) => {
  const isWin = position === 1;
  
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.h2
        className={`text-5xl font-bold mb-4 ${isWin ? 'text-yellow-400' : 'text-gray-400'}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
      >
        {isWin ? 'WINNER!' : 'RACE COMPLETE'}
      </motion.h2>
      
      <motion.div
        className="text-center mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <PositionDisplay position={position} total={total} />
        
        <div className="flex gap-8 mt-6">
          <TimeDisplay time={raceTime} label="TOTAL TIME" />
          <TimeDisplay time={bestLap} label="BEST LAP" highlight />
        </div>
      </motion.div>
      
      <motion.div
        className="flex gap-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded transition-colors"
        >
          RACE AGAIN
        </button>
        <button
          onClick={onQuit}
          className="px-8 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded transition-colors"
        >
          QUIT
        </button>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const NeonRacer: React.FC = () => {
  const {
    containerRef,
    game,
    state,
    score,
    stats,
    isLoading,
    start,
    restart,
  } = useGame3D<RacingGame>({
    GameClass: RacingGame,
    config: {
      showStats: true,
    },
  });
  
  const [selectedVehicle, setSelectedVehicle] = useState('speedster');
  const [hudData, setHudData] = useState({
    speed: 0,
    boost: 100,
    maxBoost: 100,
    isBoostActive: false,
    isDrifting: false,
    position: 1,
    totalRacers: 4,
    currentLap: 1,
    totalLaps: 3,
    raceTime: 0,
    bestLap: 0,
    lastLap: 0,
    countdown: 4,
    isRaceStarted: false,
  });
  
  const [vehicles, setVehicles] = useState<Array<{ id: string; name: string; color: number }>>([]);
  
  // Get available vehicles
  useEffect(() => {
    if (game) {
      setVehicles(game.getAvailableVehicles().map(v => ({
        id: v.id,
        name: v.name,
        color: v.color,
      })));
    }
  }, [game]);
  
  // Update HUD data from game
  useEffect(() => {
    if (!game || state !== 'playing') return;
    
    const interval = setInterval(() => {
      setHudData({
        speed: game.getPlayerSpeed(),
        boost: game.getPlayerBoost(),
        maxBoost: game.getMaxBoost(),
        isBoostActive: game.isBoostActive(),
        isDrifting: game.isDrifting(),
        position: game.getPosition(),
        totalRacers: game.getTotalRacers(),
        currentLap: game.getCurrentLap(),
        totalLaps: game.getTotalLaps(),
        raceTime: game.getRaceTime(),
        bestLap: game.getBestLapTime(),
        lastLap: game.getLastLapTime(),
        countdown: game.getCountdown(),
        isRaceStarted: game.isRaceStarted(),
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [game, state]);
  
  const handleSelectVehicle = useCallback((id: string) => {
    setSelectedVehicle(id);
    game?.setSelectedVehicle(id);
  }, [game]);
  
  const handleQuit = useCallback(() => {
    window.history.back();
  }, []);
  
  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Game Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50"
            exit={{ opacity: 0 }}
          >
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-xl text-gray-400">Loading...</div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Menu Screen */}
      <AnimatePresence>
        {state === 'menu' && (
          <MenuScreen
            onStart={start}
            vehicles={vehicles}
            selectedVehicle={selectedVehicle}
            onSelectVehicle={handleSelectVehicle}
          />
        )}
      </AnimatePresence>
      
      {/* Results Screen */}
      <AnimatePresence>
        {(state === 'gameover' || state === 'victory') && (
          <ResultsScreen
            position={hudData.position}
            total={hudData.totalRacers}
            raceTime={hudData.raceTime}
            bestLap={hudData.bestLap}
            onRestart={restart}
            onQuit={handleQuit}
          />
        )}
      </AnimatePresence>
      
      {/* HUD - Only visible during gameplay */}
      {state === 'playing' && (
        <>
          {/* Countdown */}
          <AnimatePresence>
            {!hudData.isRaceStarted && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Countdown count={hudData.countdown} />
              </div>
            )}
          </AnimatePresence>
          
          {/* Top Center - Position & Lap */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-12 text-white">
            <PositionDisplay position={hudData.position} total={hudData.totalRacers} />
            <LapDisplay current={hudData.currentLap} total={hudData.totalLaps} />
          </div>
          
          {/* Top Right - Times */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 text-white">
            <TimeDisplay time={hudData.raceTime} label="RACE TIME" />
            {hudData.bestLap > 0 && (
              <TimeDisplay time={hudData.bestLap} label="BEST LAP" highlight />
            )}
            {hudData.lastLap > 0 && (
              <TimeDisplay time={hudData.lastLap} label="LAST LAP" />
            )}
          </div>
          
          {/* Bottom Right - Speedometer & Boost */}
          <div className="absolute bottom-4 right-4 flex flex-col items-center gap-4 text-white">
            <BoostBar
              current={hudData.boost}
              max={hudData.maxBoost}
              isActive={hudData.isBoostActive}
            />
            <Speedometer speed={hudData.speed} maxSpeed={200} />
          </div>
          
          {/* Drift indicator */}
          {hudData.isDrifting && (
            <motion.div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 text-orange-400 text-2xl font-bold"
              animate={{ opacity: [1, 0.5, 1], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 0.3 }}
            >
              DRIFTING!
            </motion.div>
          )}
          
          {/* Top Left - FPS Counter */}
          {stats && (
            <div className="absolute top-4 left-4 text-white text-xs font-mono opacity-50">
              FPS: {stats.fps} | Draw: {stats.drawCalls} | Tris: {(stats.triangles / 1000).toFixed(1)}k
            </div>
          )}
          
          {/* Speed lines effect when boosting */}
          {hudData.isBoostActive && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                  style={{
                    top: `${10 + Math.random() * 80}%`,
                    left: '-10%',
                    width: `${20 + Math.random() * 30}%`,
                  }}
                  animate={{
                    x: ['0%', '500%'],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 0.3 + Math.random() * 0.2,
                    repeat: Infinity,
                    delay: Math.random() * 0.3,
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NeonRacer;
