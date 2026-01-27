/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY: SENTINEL PROTOCOL — REACT COMPONENT                                  │
 * │                                                                             │
 * │ AAA Flagship FPS with multiple game modes                                  │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SentinelProtocolGame } from './SentinelProtocolGame';
import type { GameMode, HUDState } from './types';
import { GAME_MODES } from './types';

interface SentinelProtocolProps {
  mode?: GameMode;
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  onScoreChange?: (score: number) => void;
  onGameEnd?: (victory: boolean, score: number) => void;
}

export const SentinelProtocol: React.FC<SentinelProtocolProps> = ({
  mode = 'coop_survival',
  difficulty = 'medium',
  onScoreChange,
  onGameEnd,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<SentinelProtocolGame | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showModeSelect, setShowModeSelect] = useState(true);
  const [selectedMode, setSelectedMode] = useState<GameMode>(mode);
  const [hudState, setHudState] = useState<HUDState | null>(null);
  const hudUpdateRef = useRef<number>(0);

  // Initialize game
  useEffect(() => {
    if (!containerRef.current || showModeSelect) return;

    const container = containerRef.current;
    
    const game = new SentinelProtocolGame(container, {
      mode: selectedMode,
      showStats: false,
    });
    
    gameRef.current = game;

    // Setup callbacks
    game.onStateChangeCallback((state) => {
      setIsPaused(state === 'paused');
      
      if (state === 'menu') {
        setIsLoading(false);
      }
      
      if (state === 'gameover' || state === 'victory') {
        const score = game.getScore();
        onGameEnd?.(state === 'victory', score.score);
      }
    });

    game.onScoreChange((score) => {
      onScoreChange?.(score.score);
    });

    // HUD update loop
    const updateHUD = () => {
      if (gameRef.current && gameRef.current.getState() === 'playing') {
        setHudState(gameRef.current.getHUDState());
      }
      hudUpdateRef.current = requestAnimationFrame(updateHUD);
    };
    hudUpdateRef.current = requestAnimationFrame(updateHUD);

    return () => {
      cancelAnimationFrame(hudUpdateRef.current);
      game.dispose();
      gameRef.current = null;
    };
  }, [selectedMode, showModeSelect, onScoreChange, onGameEnd]);

  // Handle game actions
  const handleStart = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.setDifficulty(difficulty);
      gameRef.current.start();
    }
  }, [difficulty]);

  const handleRestart = useCallback(() => {
    gameRef.current?.restart();
  }, []);

  const handleResume = useCallback(() => {
    gameRef.current?.resume();
  }, []);

  const handleModeSelect = (newMode: GameMode) => {
    setSelectedMode(newMode);
    setShowModeSelect(false);
  };

  // Mode selection screen
  if (showModeSelect) {
    return (
      <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          {/* Title */}
          <div className="mb-12 text-center">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-2">
              SENTINEL PROTOCOL
            </h1>
            <p className="text-xl text-slate-400">LUCY'S FLAGSHIP FPS EXPERIENCE</p>
          </div>
          
          {/* Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
            {(Object.keys(GAME_MODES) as GameMode[]).map((modeKey) => {
              const modeConfig = GAME_MODES[modeKey];
              return (
                <button
                  key={modeKey}
                  onClick={() => handleModeSelect(modeKey)}
                  className={`
                    group relative p-6 rounded-xl transition-all duration-300
                    bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-cyan-500
                    hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20
                  `}
                >
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400">
                    {modeConfig.name}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    {modeConfig.description}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                      {modeConfig.minPlayers}-{modeConfig.maxPlayers} Players
                    </span>
                    {modeConfig.supportsAI && (
                      <span className="px-2 py-1 bg-cyan-900/50 rounded text-xs text-cyan-400">
                        AI Opponents
                      </span>
                    )}
                    {modeConfig.supportsPvP && (
                      <span className="px-2 py-1 bg-red-900/50 rounded text-xs text-red-400">
                        PvP
                      </span>
                    )}
                  </div>
                  
                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </button>
              );
            })}
          </div>
          
          {/* Controls hint */}
          <div className="mt-12 text-slate-500 text-sm">
            <span className="px-3 py-1 bg-slate-800 rounded mr-2">WASD</span> Move
            <span className="px-3 py-1 bg-slate-800 rounded mx-2 ml-4">Mouse</span> Aim
            <span className="px-3 py-1 bg-slate-800 rounded mx-2 ml-4">LMB</span> Fire
            <span className="px-3 py-1 bg-slate-800 rounded mx-2 ml-4">RMB</span> ADS
            <span className="px-3 py-1 bg-slate-800 rounded mx-2 ml-4">Shift</span> Sprint
            <span className="px-3 py-1 bg-slate-800 rounded mx-2 ml-4">Ctrl</span> Crouch/Slide
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      {/* Game Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
          <div className="text-4xl font-bold text-cyan-400 mb-4">SENTINEL PROTOCOL</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-slate-400 mt-4">Loading assets...</p>
        </div>
      )}
      
      {/* HUD */}
      {hudState && !isLoading && !isPaused && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Crosshair */}
          <Crosshair spread={hudState.crosshairSpread} hitMarker={hudState.hitMarker} killConfirm={hudState.killConfirmed} />
          
          {/* Health/Armor/Stamina - Bottom Left */}
          <div className="absolute bottom-6 left-6">
            <HealthBar current={hudState.health} max={hudState.maxHealth} />
            <ArmorBar current={hudState.armor} max={hudState.maxArmor} />
            <StaminaBar current={hudState.stamina} max={hudState.maxStamina} />
          </div>
          
          {/* Ammo - Bottom Right */}
          <div className="absolute bottom-6 right-6 text-right">
            <div className="text-slate-400 text-sm mb-1">{hudState.weaponName}</div>
            <div className="text-4xl font-bold text-white">
              {hudState.isReloading ? (
                <span className="text-yellow-400">RELOADING</span>
              ) : (
                <>
                  <span className={hudState.ammo <= hudState.maxAmmo * 0.25 ? 'text-red-400' : ''}>{hudState.ammo}</span>
                  <span className="text-slate-500 text-2xl">/{hudState.reserveAmmo}</span>
                </>
              )}
            </div>
            {hudState.isReloading && (
              <div className="w-32 h-1 bg-slate-700 rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-yellow-400 transition-all"
                  style={{ width: `${hudState.reloadProgress * 100}%` }}
                />
              </div>
            )}
          </div>
          
          {/* Wave/Score - Top */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center">
            <div className="text-cyan-400 text-xl font-bold">
              WAVE {hudState.round}
            </div>
            <div className="text-slate-400 text-sm">
              {hudState.time > 0 ? `${Math.ceil(hudState.time)}s` : ''}
            </div>
          </div>
          
          {/* Kill Feed - Top Right */}
          <div className="absolute top-6 right-6">
            {hudState.killfeed.slice(0, 4).map((entry, i) => (
              <div key={i} className="flex items-center gap-2 mb-1 text-sm animate-fade-in">
                <span className={entry.killerId === 'local' ? 'text-cyan-400' : 'text-slate-400'}>
                  {entry.killerName}
                </span>
                <span className="text-slate-600">{entry.isHeadshot ? '🎯' : '→'}</span>
                <span className={entry.victimId === 'local' ? 'text-red-400' : 'text-slate-400'}>
                  {entry.victimName}
                </span>
              </div>
            ))}
          </div>
          
          {/* Damage Indicators */}
          {hudState.damageIndicators.map((indicator, i) => (
            <DamageIndicator key={i} direction={indicator.direction} intensity={indicator.intensity} />
          ))}
        </div>
      )}
      
      {/* Start Menu */}
      {!isLoading && gameRef.current?.getState() === 'menu' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
          <h2 className="text-5xl font-bold text-white mb-2">SENTINEL PROTOCOL</h2>
          <p className="text-xl text-cyan-400 mb-8">{GAME_MODES[selectedMode].name}</p>
          
          <button
            onClick={handleStart}
            className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xl font-bold rounded-lg
                     hover:from-cyan-400 hover:to-blue-500 transition-all hover:scale-105 shadow-lg shadow-cyan-500/30"
          >
            START MISSION
          </button>
          
          <button
            onClick={() => setShowModeSelect(true)}
            className="mt-4 px-8 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Change Mode
          </button>
        </div>
      )}
      
      {/* Pause Menu */}
      {isPaused && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
          <h2 className="text-4xl font-bold text-white mb-8">PAUSED</h2>
          
          <button
            onClick={handleResume}
            className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 transition-colors mb-4"
          >
            RESUME
          </button>
          
          <button
            onClick={handleRestart}
            className="px-8 py-3 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition-colors"
          >
            RESTART
          </button>
        </div>
      )}
      
      {/* Game Over / Victory */}
      {(gameRef.current?.getState() === 'gameover' || gameRef.current?.getState() === 'victory') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
          <h2 className={`text-6xl font-black mb-4 ${
            gameRef.current?.getState() === 'victory' ? 'text-green-400' : 'text-red-500'
          }`}>
            {gameRef.current?.getState() === 'victory' ? 'VICTORY' : 'MISSION FAILED'}
          </h2>
          
          <div className="text-slate-400 mb-8">
            <p>Wave Reached: {gameRef.current?.getCurrentWave()}</p>
            <p>Score: {gameRef.current?.getScore().score}</p>
            <p>Kills: {gameRef.current?.getScore().kills}</p>
          </div>
          
          <button
            onClick={handleRestart}
            className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 transition-colors"
          >
            TRY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// HUD COMPONENTS
// ============================================================================

const Crosshair: React.FC<{ spread: number; hitMarker: boolean; killConfirm: boolean }> = ({ 
  spread, hitMarker, killConfirm 
}) => {
  const size = 4 + spread * 20;
  const gap = 4 + spread * 15;
  
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      {/* Crosshair lines */}
      <div className="relative" style={{ width: size * 2 + gap * 2, height: size * 2 + gap * 2 }}>
        <div className="absolute bg-white/80" style={{ left: gap + size, top: 0, width: 2, height: size }} />
        <div className="absolute bg-white/80" style={{ left: gap + size, bottom: 0, width: 2, height: size }} />
        <div className="absolute bg-white/80" style={{ left: 0, top: gap + size, width: size, height: 2 }} />
        <div className="absolute bg-white/80" style={{ right: 0, top: gap + size, width: size, height: 2 }} />
        
        {/* Center dot */}
        <div className="absolute w-1 h-1 bg-white/60 rounded-full" 
             style={{ left: gap + size, top: gap + size }} />
      </div>
      
      {/* Hit marker */}
      {hitMarker && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-0.5 bg-white rotate-45 absolute -translate-x-1/2 -translate-y-1/2" />
          <div className="w-8 h-0.5 bg-white -rotate-45 absolute -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}
      
      {/* Kill confirm */}
      {killConfirm && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-10 h-0.5 bg-red-500 rotate-45 absolute -translate-x-1/2 -translate-y-1/2" />
          <div className="w-10 h-0.5 bg-red-500 -rotate-45 absolute -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}
    </div>
  );
};

const HealthBar: React.FC<{ current: number; max: number }> = ({ current, max }) => {
  const percent = (current / max) * 100;
  const color = percent > 50 ? 'bg-green-500' : percent > 25 ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-red-400 text-lg">❤</span>
        <span className="text-white font-bold">{Math.ceil(current)}</span>
      </div>
      <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-200`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

const ArmorBar: React.FC<{ current: number; max: number }> = ({ current, max }) => {
  const percent = (current / max) * 100;
  
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-blue-400 text-lg">🛡</span>
        <span className="text-white font-bold">{Math.ceil(current)}</span>
      </div>
      <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 transition-all duration-200" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

const StaminaBar: React.FC<{ current: number; max: number }> = ({ current, max }) => {
  const percent = (current / max) * 100;
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-yellow-400 text-lg">⚡</span>
        <span className="text-slate-400 text-sm">{Math.ceil(percent)}%</span>
      </div>
      <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-500 transition-all duration-200" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

const DamageIndicator: React.FC<{ direction: number; intensity: number }> = ({ direction, intensity }) => {
  const rotation = (direction * 180) / Math.PI;
  
  return (
    <div 
      className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
    >
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-16"
        style={{
          background: `linear-gradient(to bottom, rgba(255, 0, 0, ${intensity * 0.7}), transparent)`,
        }}
      />
    </div>
  );
};

export default SentinelProtocol;
