/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — TRACK & FIELD OLYMPICS REACT COMPONENT                       │
 * │                                                                             │
 * │ Full-featured Olympic athletics game with HUD and menus                    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame3D } from '../../engine3d/hooks/useGame3D';
import { TrackFieldGame } from './TrackFieldGame';

// ============================================================================
// HUD COMPONENTS
// ============================================================================

interface PowerMeterProps {
  power: number;
  label: string;
}

const PowerMeter: React.FC<PowerMeterProps> = ({ power, label }) => (
  <div className="w-64">
    <div className="text-xs text-center mb-1 text-gray-400 uppercase tracking-wider">
      {label}
    </div>
    <div className="h-6 bg-black/50 rounded-full overflow-hidden border-2 border-yellow-500/50">
      <motion.div
        className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
        style={{ width: `${power * 100}%` }}
        transition={{ duration: 0.05 }}
      />
    </div>
    <div className="text-center text-xs mt-1 text-yellow-400 font-bold">
      TAP RAPIDLY!
    </div>
  </div>
);

interface SpeedDisplayProps {
  speed: number;
  distance: number;
  total: number;
}

const SpeedDisplay: React.FC<SpeedDisplayProps> = ({ speed, distance, total }) => (
  <div className="text-center">
    <div className="text-4xl font-bold tabular-nums">{speed.toFixed(1)}</div>
    <div className="text-xs text-gray-400">m/s</div>
    <div className="mt-2 w-48 h-2 bg-black/50 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-blue-500"
        style={{ width: `${(distance / total) * 100}%` }}
      />
    </div>
    <div className="text-xs text-gray-400 mt-1">
      {distance.toFixed(1)}m / {total}m
    </div>
  </div>
);

interface TimerDisplayProps {
  time: number;
  label: string;
  highlight?: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ time, label, highlight }) => {
  const seconds = Math.floor(time);
  const ms = Math.floor((time % 1) * 100);
  
  return (
    <div className={`text-center ${highlight ? 'text-yellow-400' : ''}`}>
      <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="text-3xl font-mono font-bold tabular-nums">
        {seconds}.{String(ms).padStart(2, '0')}
      </div>
    </div>
  );
};

interface ResultDisplayProps {
  result: number;
  unit: string;
  worldRecord: number;
  personalBest: number;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, unit, worldRecord, personalBest }) => {
  const isWorldRecord = result > 0 && result > worldRecord;
  const isPB = result > 0 && result > personalBest;
  
  return (
    <div className="text-center">
      <div className="text-6xl font-bold tabular-nums">
        {result.toFixed(2)}
        <span className="text-2xl text-gray-400">{unit}</span>
      </div>
      {isWorldRecord && (
        <motion.div
          className="text-yellow-400 text-xl font-bold mt-2"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          NEW WORLD RECORD!
        </motion.div>
      )}
      {isPB && !isWorldRecord && (
        <div className="text-green-400 text-lg font-bold mt-2">
          PERSONAL BEST!
        </div>
      )}
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
  
  const labels = ['', 'SET', 'READY', 'ON YOUR MARKS'];
  
  return (
    <motion.div
      key={count}
      className="text-center"
      initial={{ scale: 2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
    >
      <div className="text-4xl font-bold text-yellow-400 mb-2">
        {labels[count] || ''}
      </div>
      <div className="text-9xl font-bold text-white">
        {count}
      </div>
    </motion.div>
  );
};

interface LeaderboardProps {
  results: Array<{ name: string; country: string; result: number; isPlayer: boolean }>;
  unit: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ results, unit }) => (
  <div className="bg-black/70 rounded-lg p-4 min-w-[300px]">
    <div className="text-center text-lg font-bold mb-4 text-yellow-400">RESULTS</div>
    <div className="space-y-2">
      {results.map((r, index) => (
        <div
          key={r.name}
          className={`flex items-center justify-between px-3 py-2 rounded ${
            r.isPlayer ? 'bg-blue-600/50' : 'bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${index === 0 ? 'text-yellow-400' : ''}`}>
              {index + 1}
            </span>
            <div>
              <div className="font-bold">{r.name}</div>
              <div className="text-xs text-gray-400">{r.country}</div>
            </div>
          </div>
          <div className="text-xl font-mono tabular-nums">
            {r.result.toFixed(2)}{unit}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ============================================================================
// MENU SCREENS
// ============================================================================

interface MenuScreenProps {
  onStart: () => void;
  events: Array<{ id: string; name: string; description: string }>;
  selectedEvent: string;
  onSelectEvent: (id: string) => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({
  onStart,
  events,
  selectedEvent,
  onSelectEvent,
}) => (
  <motion.div
    className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.h1
      className="text-5xl font-bold mb-2 text-yellow-400"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      TRACK & FIELD
    </motion.h1>
    
    <motion.h2
      className="text-2xl mb-8 text-gray-400"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      OLYMPIC GAMES
    </motion.h2>
    
    {/* Event Selection */}
    <motion.div
      className="mb-8 max-w-2xl"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="text-sm text-gray-400 text-center mb-3">SELECT EVENT</div>
      <div className="grid grid-cols-4 gap-2">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => onSelectEvent(event.id)}
            className={`px-4 py-3 rounded-lg transition-all text-left ${
              selectedEvent === event.id
                ? 'bg-yellow-600 text-white ring-2 ring-yellow-400'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="font-bold text-sm">{event.name}</div>
          </button>
        ))}
      </div>
      
      {/* Selected event description */}
      <div className="mt-4 text-center text-gray-400">
        {events.find(e => e.id === selectedEvent)?.description}
      </div>
    </motion.div>
    
    <motion.button
      onClick={onStart}
      className="px-12 py-4 bg-yellow-600 hover:bg-yellow-500 text-white text-xl font-bold rounded-lg transition-all"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      START EVENT
    </motion.button>
    
    <motion.p
      className="text-gray-500 text-sm mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      SPACE / A+D to run • Arrow keys to adjust • Gamepad supported
    </motion.p>
  </motion.div>
);

interface ResultsScreenProps {
  results: Array<{ name: string; country: string; result: number; isPlayer: boolean }>;
  unit: string;
  worldRecord: number;
  personalBest: number;
  onRestart: () => void;
  onQuit: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  results,
  unit,
  worldRecord,
  personalBest,
  onRestart,
  onQuit,
}) => {
  const playerResult = results.find(r => r.isPlayer);
  const playerPosition = results.findIndex(r => r.isPlayer) + 1;
  const isMedal = playerPosition <= 3;
  
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="text-center mb-6"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
      >
        {isMedal && (
          <div className="text-6xl mb-4">
            {playerPosition === 1 ? '🥇' : playerPosition === 2 ? '🥈' : '🥉'}
          </div>
        )}
        <h2 className={`text-4xl font-bold ${isMedal ? 'text-yellow-400' : 'text-gray-400'}`}>
          {playerPosition === 1 ? 'GOLD MEDAL!' : 
           playerPosition === 2 ? 'SILVER MEDAL!' :
           playerPosition === 3 ? 'BRONZE MEDAL!' : 'EVENT COMPLETE'}
        </h2>
      </motion.div>
      
      <motion.div
        className="mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <ResultDisplay
          result={playerResult?.result ?? 0}
          unit={unit}
          worldRecord={worldRecord}
          personalBest={personalBest}
        />
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Leaderboard results={results} unit={unit} />
      </motion.div>
      
      <motion.div
        className="flex gap-4 mt-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded transition-colors"
        >
          TRY AGAIN
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

const TrackAndField: React.FC = () => {
  const {
    containerRef,
    game,
    state,
    score,
    stats,
    isLoading,
    start,
    restart,
  } = useGame3D<TrackFieldGame>({
    GameClass: TrackFieldGame,
    config: {
      showStats: true,
    },
  });
  
  const [selectedEvent, setSelectedEvent] = useState('100m-sprint');
  const [hudData, setHudData] = useState({
    power: 0,
    speed: 0,
    distance: 0,
    eventTime: 0,
    countdown: 4,
    isStarted: false,
    result: 0,
    results: [] as Array<{ name: string; country: string; result: number; isPlayer: boolean }>,
    worldRecord: 9.58,
    personalBest: 0,
    unit: 's',
    eventName: '100m Sprint',
  });
  
  const [events, setEvents] = useState<Array<{ id: string; name: string; description: string }>>([]);
  
  // Get available events
  useEffect(() => {
    if (game) {
      setEvents(game.getAvailableEvents().map(e => ({
        id: e.id,
        name: e.name,
        description: e.description,
      })));
    }
  }, [game]);
  
  // Update HUD data from game
  useEffect(() => {
    if (!game || state !== 'playing') return;
    
    const interval = setInterval(() => {
      const eventConfig = game.getCurrentEvent();
      
      setHudData({
        power: game.getPowerMeter(),
        speed: game.getSpeed(),
        distance: game.getDistance(),
        eventTime: game.getEventTime(),
        countdown: game.getCountdown(),
        isStarted: game.isEventStarted(),
        result: game.getPlayerResult(),
        results: game.getAthleteResults(),
        worldRecord: game.getWorldRecord(),
        personalBest: game.getPersonalBest(),
        unit: eventConfig.unit,
        eventName: eventConfig.name,
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [game, state]);
  
  const handleSelectEvent = useCallback((id: string) => {
    setSelectedEvent(id);
    game?.setEvent(id as any);
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
            <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-xl text-gray-400">Loading...</div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Menu Screen */}
      <AnimatePresence>
        {state === 'menu' && (
          <MenuScreen
            onStart={start}
            events={events}
            selectedEvent={selectedEvent}
            onSelectEvent={handleSelectEvent}
          />
        )}
      </AnimatePresence>
      
      {/* Results Screen */}
      <AnimatePresence>
        {(state === 'gameover' || state === 'victory') && (
          <ResultsScreen
            results={hudData.results}
            unit={hudData.unit}
            worldRecord={hudData.worldRecord}
            personalBest={hudData.personalBest}
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
            {!hudData.isStarted && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Countdown count={hudData.countdown} />
              </div>
            )}
          </AnimatePresence>
          
          {/* Event Name */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white">
            <div className="text-2xl font-bold text-center">{hudData.eventName}</div>
          </div>
          
          {/* Timer */}
          <div className="absolute top-4 right-4 text-white">
            <TimerDisplay time={hudData.eventTime} label="TIME" />
          </div>
          
          {/* Power Meter (for sprint events) */}
          {hudData.isStarted && selectedEvent.includes('sprint') && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white">
              <PowerMeter power={hudData.power} label="POWER" />
            </div>
          )}
          
          {/* Speed & Distance */}
          {hudData.isStarted && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
              <SpeedDisplay speed={hudData.speed} distance={hudData.distance} total={100} />
            </div>
          )}
          
          {/* Records */}
          <div className="absolute top-4 left-4 text-white text-sm">
            <div className="text-gray-400">World Record</div>
            <div className="font-bold">{hudData.worldRecord}{hudData.unit}</div>
            {hudData.personalBest > 0 && (
              <>
                <div className="text-gray-400 mt-2">Personal Best</div>
                <div className="font-bold text-green-400">{hudData.personalBest.toFixed(2)}{hudData.unit}</div>
              </>
            )}
          </div>
          
          {/* FPS Counter */}
          {stats && (
            <div className="absolute bottom-4 left-4 text-white text-xs font-mono opacity-50">
              FPS: {stats.fps}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrackAndField;
