/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — FPS SHOOTER REACT COMPONENT                                  │
 * │                                                                             │
 * │ Full-featured FPS game with HUD, menus, and controls                       │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame3D } from '../../engine3d/hooks/useGame3D';
import { FPSShooterGame } from './FPSShooterGame';
import type { GameState, GameScore } from '../../engine3d/core/Game3DBase';

// ============================================================================
// HUD COMPONENTS
// ============================================================================

interface HealthBarProps {
  current: number;
  max: number;
  label: string;
  color: string;
}

const HealthBar: React.FC<HealthBarProps> = ({ current, max, label, color }) => {
  const percentage = (current / max) * 100;
  
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs font-bold">
        <span>{label}</span>
        <span>{Math.round(current)}/{max}</span>
      </div>
      <div className="w-48 h-3 bg-black/50 rounded overflow-hidden border border-white/20">
        <motion.div
          className="h-full rounded"
          style={{ backgroundColor: color }}
          initial={{ width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </div>
  );
};

interface AmmoDisplayProps {
  current: number;
  magazine: number;
  reserve: number;
  weaponName: string;
  isReloading: boolean;
}

const AmmoDisplay: React.FC<AmmoDisplayProps> = ({
  current,
  magazine,
  reserve,
  weaponName,
  isReloading,
}) => (
  <div className="text-right">
    <div className="text-xs text-gray-400 uppercase tracking-wider">{weaponName}</div>
    <div className="flex items-baseline gap-2 justify-end">
      <span className="text-4xl font-bold tabular-nums">
        {isReloading ? '---' : current}
      </span>
      <span className="text-xl text-gray-400">/ {magazine}</span>
    </div>
    <div className="text-sm text-gray-500">Reserve: {reserve}</div>
    {isReloading && (
      <motion.div
        className="text-yellow-400 text-sm font-bold"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ repeat: Infinity, duration: 0.5 }}
      >
        RELOADING...
      </motion.div>
    )}
  </div>
);

interface CrosshairProps {
  spread: number;
}

const Crosshair: React.FC<CrosshairProps> = ({ spread }) => {
  const size = 20 + spread * 30;
  const gap = 4 + spread * 10;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative" style={{ width: size * 2, height: size * 2 }}>
        {/* Top */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-white/80"
          style={{ top: 0, height: size - gap }}
        />
        {/* Bottom */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-white/80"
          style={{ bottom: 0, height: size - gap }}
        />
        {/* Left */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-white/80"
          style={{ left: 0, width: size - gap }}
        />
        {/* Right */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-white/80"
          style={{ right: 0, width: size - gap }}
        />
        {/* Center dot */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-red-500 rounded-full" />
      </div>
    </div>
  );
};

interface WaveIndicatorProps {
  wave: number;
  enemiesRemaining: number;
  isWaveActive: boolean;
  nextWaveTimer: number;
}

const WaveIndicator: React.FC<WaveIndicatorProps> = ({
  wave,
  enemiesRemaining,
  isWaveActive,
  nextWaveTimer,
}) => (
  <div className="text-center">
    <div className="text-2xl font-bold">WAVE {wave}</div>
    {isWaveActive ? (
      <div className="text-sm text-red-400">
        Enemies: {enemiesRemaining}
      </div>
    ) : (
      <div className="text-sm text-yellow-400">
        Next wave in {Math.ceil(nextWaveTimer)}s
      </div>
    )}
  </div>
);

// ============================================================================
// MENU SCREENS
// ============================================================================

interface MenuScreenProps {
  onStart: () => void;
  onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard' | 'expert') => void;
  difficulty: string;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ onStart, onDifficultyChange, difficulty }) => (
  <motion.div
    className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.h1
      className="text-6xl font-bold mb-8 text-red-500"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      TACTICAL ASSAULT
    </motion.h1>
    
    <motion.p
      className="text-gray-400 mb-8 text-center max-w-md"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      Survive endless waves of enemies. Use WASD to move, mouse to aim, left-click to shoot.
      Press R to reload. How long can you last?
    </motion.p>
    
    <motion.div
      className="flex flex-col gap-4 items-center"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex gap-2 mb-4">
        {(['easy', 'medium', 'hard', 'expert'] as const).map((d) => (
          <button
            key={d}
            onClick={() => onDifficultyChange(d)}
            className={`px-4 py-2 rounded uppercase text-sm font-bold transition-colors ${
              difficulty === d
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {d}
          </button>
        ))}
      </div>
      
      <button
        onClick={onStart}
        className="px-12 py-4 bg-red-600 hover:bg-red-500 text-white text-xl font-bold rounded-lg transition-colors"
      >
        START GAME
      </button>
      
      <p className="text-gray-500 text-sm mt-4">
        Click to lock mouse • ESC to pause • Gamepad supported
      </p>
    </motion.div>
  </motion.div>
);

interface PauseScreenProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

const PauseScreen: React.FC<PauseScreenProps> = ({ onResume, onRestart, onQuit }) => (
  <motion.div
    className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <h2 className="text-4xl font-bold mb-8">PAUSED</h2>
    
    <div className="flex flex-col gap-4">
      <button
        onClick={onResume}
        className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded transition-colors"
      >
        RESUME
      </button>
      <button
        onClick={onRestart}
        className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded transition-colors"
      >
        RESTART
      </button>
      <button
        onClick={onQuit}
        className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition-colors"
      >
        QUIT
      </button>
    </div>
  </motion.div>
);

interface GameOverScreenProps {
  score: GameScore;
  wave: number;
  onRestart: () => void;
  onQuit: () => void;
  victory: boolean;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  wave,
  onRestart,
  onQuit,
  victory,
}) => (
  <motion.div
    className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.h2
      className={`text-5xl font-bold mb-4 ${victory ? 'text-green-500' : 'text-red-500'}`}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', delay: 0.2 }}
    >
      {victory ? 'VICTORY!' : 'GAME OVER'}
    </motion.h2>
    
    <motion.div
      className="text-center mb-8"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="text-3xl font-bold text-yellow-400 mb-2">
        SCORE: {score.score.toLocaleString()}
      </div>
      <div className="text-xl text-gray-400">
        Wave Reached: {wave}
      </div>
      <div className="text-xl text-gray-400">
        Kills: {score.kills || 0}
      </div>
      <div className="text-xl text-gray-400">
        Time: {Math.floor(score.time / 60)}:{String(Math.floor(score.time % 60)).padStart(2, '0')}
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const FPSShooter: React.FC = () => {
  const {
    containerRef,
    game,
    state,
    score,
    stats,
    isLoading,
    start,
    pause,
    resume,
    restart,
    setDifficulty,
  } = useGame3D<FPSShooterGame>({
    GameClass: FPSShooterGame,
    config: {
      showStats: true,
    },
  });
  
  const [difficulty, setLocalDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [hudData, setHudData] = useState({
    health: 100,
    maxHealth: 100,
    armor: 50,
    currentAmmo: 15,
    magazineSize: 15,
    reserveAmmo: 60,
    weaponName: 'M9 Pistol',
    isReloading: false,
    wave: 0,
    enemiesRemaining: 0,
    isWaveActive: false,
    waveTimer: 0,
    crosshairSpread: 0,
  });
  
  // Update HUD data from game
  useEffect(() => {
    if (!game || state !== 'playing') return;
    
    const interval = setInterval(() => {
      const weapon = game.getCurrentWeapon();
      
      setHudData({
        health: game.getPlayerHealth(),
        maxHealth: game.getPlayerMaxHealth(),
        armor: game.getPlayerArmor(),
        currentAmmo: weapon?.currentAmmo ?? 0,
        magazineSize: weapon?.weapon.magazineSize ?? 0,
        reserveAmmo: weapon?.reserveAmmo ?? 0,
        weaponName: weapon?.weapon.name ?? 'None',
        isReloading: weapon?.isReloading ?? false,
        wave: game.getCurrentWave(),
        enemiesRemaining: game.getEnemiesRemaining(),
        isWaveActive: game.isWaveInProgress(),
        waveTimer: game.getWaveTimer(),
        crosshairSpread: game.getCrosshairSpread(),
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [game, state]);
  
  const handleDifficultyChange = useCallback((d: 'easy' | 'medium' | 'hard' | 'expert') => {
    setLocalDifficulty(d);
    setDifficulty(d);
  }, [setDifficulty]);
  
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
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-xl text-gray-400">Loading...</div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Menu Screen */}
      <AnimatePresence>
        {state === 'menu' && (
          <MenuScreen
            onStart={start}
            onDifficultyChange={handleDifficultyChange}
            difficulty={difficulty}
          />
        )}
      </AnimatePresence>
      
      {/* Pause Screen */}
      <AnimatePresence>
        {state === 'paused' && (
          <PauseScreen
            onResume={resume}
            onRestart={restart}
            onQuit={handleQuit}
          />
        )}
      </AnimatePresence>
      
      {/* Game Over Screen */}
      <AnimatePresence>
        {(state === 'gameover' || state === 'victory') && (
          <GameOverScreen
            score={score}
            wave={hudData.wave}
            onRestart={restart}
            onQuit={handleQuit}
            victory={state === 'victory'}
          />
        )}
      </AnimatePresence>
      
      {/* HUD - Only visible during gameplay */}
      {state === 'playing' && (
        <>
          {/* Crosshair */}
          <Crosshair spread={hudData.crosshairSpread} />
          
          {/* Top HUD */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white">
            <WaveIndicator
              wave={hudData.wave}
              enemiesRemaining={hudData.enemiesRemaining}
              isWaveActive={hudData.isWaveActive}
              nextWaveTimer={hudData.waveTimer}
            />
          </div>
          
          {/* Bottom Left - Health & Armor */}
          <div className="absolute bottom-4 left-4 text-white">
            <HealthBar
              current={hudData.health}
              max={hudData.maxHealth}
              label="HEALTH"
              color="#ef4444"
            />
            <div className="mt-2">
              <HealthBar
                current={hudData.armor}
                max={100}
                label="ARMOR"
                color="#3b82f6"
              />
            </div>
          </div>
          
          {/* Bottom Right - Ammo */}
          <div className="absolute bottom-4 right-4 text-white">
            <AmmoDisplay
              current={hudData.currentAmmo}
              magazine={hudData.magazineSize}
              reserve={hudData.reserveAmmo}
              weaponName={hudData.weaponName}
              isReloading={hudData.isReloading}
            />
          </div>
          
          {/* Top Right - Score */}
          <div className="absolute top-4 right-4 text-white text-right">
            <div className="text-sm text-gray-400">SCORE</div>
            <div className="text-2xl font-bold">{score.score.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Kills: {score.kills || 0}</div>
          </div>
          
          {/* Top Left - FPS Counter */}
          {stats && (
            <div className="absolute top-4 left-4 text-white text-xs font-mono opacity-50">
              FPS: {stats.fps} | Draw: {stats.drawCalls} | Tris: {(stats.triangles / 1000).toFixed(1)}k
            </div>
          )}
          
          {/* Damage Vignette */}
          {hudData.health < 30 && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, transparent 50%, rgba(255,0,0,0.3) 100%)',
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default FPSShooter;
