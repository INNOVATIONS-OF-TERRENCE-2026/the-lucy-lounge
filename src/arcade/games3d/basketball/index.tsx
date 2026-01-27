/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — STREET BASKETBALL 3D REACT COMPONENT                         │
 * │                                                                             │
 * │ Full-featured basketball game with HUD and menus                           │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame3D } from '../../engine3d/hooks/useGame3D';
import { BasketballGame } from './BasketballGame';

// ============================================================================
// HUD COMPONENTS
// ============================================================================

interface ScoreboardProps {
  playerScore: number;
  opponentScore: number;
  gameTime: number;
  shotClock: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({
  playerScore,
  opponentScore,
  gameTime,
  shotClock,
}) => {
  const minutes = Math.floor(gameTime / 60);
  const seconds = Math.floor(gameTime % 60);
  
  return (
    <div className="bg-black/80 rounded-lg px-6 py-3 flex items-center gap-8">
      {/* Player Score */}
      <div className="text-center">
        <div className="text-xs text-blue-400 uppercase tracking-wider">YOU</div>
        <div className="text-4xl font-bold text-blue-400 tabular-nums">{playerScore}</div>
      </div>
      
      {/* Time */}
      <div className="text-center">
        <div className="text-3xl font-mono font-bold tabular-nums">
          {minutes}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="text-sm text-yellow-400 font-bold">
          Shot: {shotClock}
        </div>
      </div>
      
      {/* Opponent Score */}
      <div className="text-center">
        <div className="text-xs text-red-400 uppercase tracking-wider">CPU</div>
        <div className="text-4xl font-bold text-red-400 tabular-nums">{opponentScore}</div>
      </div>
    </div>
  );
};

interface ShotMeterProps {
  power: number;
  angle: number;
  isActive: boolean;
}

const ShotMeter: React.FC<ShotMeterProps> = ({ power, angle, isActive }) => {
  if (!isActive) return null;
  
  // Optimal power zone (0.7 - 0.9)
  const isOptimal = power >= 0.7 && power <= 0.9;
  
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Power bar */}
      <div className="w-8 h-48 bg-black/50 rounded-full overflow-hidden border-2 border-white/30 relative">
        {/* Optimal zone indicator */}
        <div
          className="absolute w-full bg-green-500/30"
          style={{ bottom: '70%', height: '20%' }}
        />
        
        {/* Power fill */}
        <motion.div
          className={`absolute bottom-0 w-full ${isOptimal ? 'bg-green-500' : 'bg-orange-500'}`}
          style={{ height: `${power * 100}%` }}
        />
      </div>
      
      {/* Angle display */}
      <div className="text-center">
        <div className="text-xs text-gray-400">ANGLE</div>
        <div className="text-lg font-bold">{Math.round(angle)}°</div>
      </div>
      
      {/* Instructions */}
      <div className="text-xs text-gray-400 text-center">
        ↑↓ Adjust angle
      </div>
    </div>
  );
};

interface ComboDisplayProps {
  multiplier: number;
  streak: number;
}

const ComboDisplay: React.FC<ComboDisplayProps> = ({ multiplier, streak }) => {
  if (streak < 2) return null;
  
  return (
    <motion.div
      className="text-center"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      key={streak}
    >
      <div className="text-yellow-400 text-2xl font-bold">
        {streak}x STREAK!
      </div>
      <div className="text-orange-400 text-lg">
        {multiplier.toFixed(1)}x POINTS
      </div>
    </motion.div>
  );
};

// ============================================================================
// MENU SCREENS
// ============================================================================

interface MenuScreenProps {
  onStart: () => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ onStart }) => (
  <motion.div
    className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="text-8xl mb-4"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      🏀
    </motion.div>
    
    <motion.h1
      className="text-5xl font-bold mb-2 text-orange-500"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      STREET BASKETBALL
    </motion.h1>
    
    <motion.p
      className="text-gray-400 mb-8 text-center max-w-md"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      Score as many points as you can in 2 minutes!
      Build combos for bonus points!
    </motion.p>
    
    <motion.button
      onClick={onStart}
      className="px-12 py-4 bg-orange-600 hover:bg-orange-500 text-white text-xl font-bold rounded-lg transition-all"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      PLAY BALL
    </motion.button>
    
    <motion.div
      className="mt-8 text-gray-500 text-sm text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      <div>WASD to move • Hold CLICK to aim & shoot</div>
      <div>↑↓ to adjust shot angle • SHIFT to sprint</div>
    </motion.div>
  </motion.div>
);

interface ResultsScreenProps {
  playerScore: number;
  opponentScore: number;
  onRestart: () => void;
  onQuit: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  playerScore,
  opponentScore,
  onRestart,
  onQuit,
}) => {
  const isWin = playerScore > opponentScore;
  
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.h2
        className={`text-5xl font-bold mb-4 ${isWin ? 'text-green-400' : 'text-red-400'}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
      >
        {isWin ? 'YOU WIN!' : 'GAME OVER'}
      </motion.h2>
      
      <motion.div
        className="flex gap-12 mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="text-center">
          <div className="text-gray-400 text-sm">YOUR SCORE</div>
          <div className="text-5xl font-bold text-blue-400">{playerScore}</div>
        </div>
        <div className="text-4xl font-bold text-gray-600 self-center">-</div>
        <div className="text-center">
          <div className="text-gray-400 text-sm">OPPONENT</div>
          <div className="text-5xl font-bold text-red-400">{opponentScore}</div>
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
          PLAY AGAIN
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

const StreetBasketball: React.FC = () => {
  const {
    containerRef,
    game,
    state,
    stats,
    isLoading,
    start,
    restart,
  } = useGame3D<BasketballGame>({
    GameClass: BasketballGame,
    config: {
      showStats: true,
    },
  });
  
  const [hudData, setHudData] = useState({
    playerScore: 0,
    opponentScore: 0,
    gameTime: 120,
    shotClock: 24,
    shotPower: 0,
    shotAngle: 45,
    isAiming: false,
    comboMultiplier: 1,
    consecutiveShots: 0,
    hasBall: true,
  });
  
  // Update HUD data from game
  useEffect(() => {
    if (!game || state !== 'playing') return;
    
    const interval = setInterval(() => {
      setHudData({
        playerScore: game.getPlayerScore(),
        opponentScore: game.getOpponentScore(),
        gameTime: game.getGameTime(),
        shotClock: game.getShotClock(),
        shotPower: game.getShotPower(),
        shotAngle: game.getShotAngle(),
        isAiming: game.isAiming(),
        comboMultiplier: game.getComboMultiplier(),
        consecutiveShots: game.getConsecutiveShots(),
        hasBall: game.hasBall(),
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [game, state]);
  
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
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-xl text-gray-400">Loading...</div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Menu Screen */}
      <AnimatePresence>
        {state === 'menu' && <MenuScreen onStart={start} />}
      </AnimatePresence>
      
      {/* Results Screen */}
      <AnimatePresence>
        {(state === 'gameover' || state === 'victory') && (
          <ResultsScreen
            playerScore={hudData.playerScore}
            opponentScore={hudData.opponentScore}
            onRestart={restart}
            onQuit={handleQuit}
          />
        )}
      </AnimatePresence>
      
      {/* HUD - Only visible during gameplay */}
      {state === 'playing' && (
        <>
          {/* Scoreboard */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white">
            <Scoreboard
              playerScore={hudData.playerScore}
              opponentScore={hudData.opponentScore}
              gameTime={hudData.gameTime}
              shotClock={hudData.shotClock}
            />
          </div>
          
          {/* Shot Meter */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-white">
            <ShotMeter
              power={hudData.shotPower}
              angle={hudData.shotAngle}
              isActive={hudData.isAiming}
            />
          </div>
          
          {/* Combo Display */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2 text-white">
            <ComboDisplay
              multiplier={hudData.comboMultiplier}
              streak={hudData.consecutiveShots}
            />
          </div>
          
          {/* Ball indicator */}
          {hudData.hasBall && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
              <div className="bg-orange-600/80 px-4 py-2 rounded-full text-sm font-bold">
                🏀 HOLD CLICK TO SHOOT
              </div>
            </div>
          )}
          
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

export default StreetBasketball;
