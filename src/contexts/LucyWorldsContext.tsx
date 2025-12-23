import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type LucyWorld = 
  | 'celestial-core'
  | 'neon-nexus'
  | 'neural-deep'
  | 'dreamveil'
  | 'silent-void'
  | 'quantum-rift'
  | 'command-bridge'
  | 'codefall'
  | 'astral-archive'
  | 'living-core'
  | 'none';

export interface WorldConfig {
  id: LucyWorld;
  name: string;
  emoji: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  motionStyle: 'slow' | 'medium' | 'fast' | 'minimal';
  lucyPresence: string;
}

export const LUCY_WORLDS: WorldConfig[] = [
  {
    id: 'celestial-core',
    name: 'Celestial Core',
    emoji: '🌠',
    description: 'Calm cosmic intelligence with soft starlight drift',
    primaryColor: '270 60% 50%',
    secondaryColor: '220 70% 60%',
    motionStyle: 'slow',
    lucyPresence: 'ancient, wise'
  },
  {
    id: 'neon-nexus',
    name: 'Neon Nexus',
    emoji: '🌆',
    description: 'Cyberpunk AI city with subtle holographic motion',
    primaryColor: '180 100% 50%',
    secondaryColor: '320 100% 60%',
    motionStyle: 'medium',
    lucyPresence: 'sharp, modern'
  },
  {
    id: 'neural-deep',
    name: 'Neural Deep',
    emoji: '🧠',
    description: 'Flowing neural networks with thought-like motion',
    primaryColor: '200 80% 55%',
    secondaryColor: '280 70% 60%',
    motionStyle: 'medium',
    lucyPresence: 'analytical'
  },
  {
    id: 'dreamveil',
    name: 'Dreamveil',
    emoji: '🌙',
    description: 'Ethereal dreamscape with slow ambient particles',
    primaryColor: '260 50% 60%',
    secondaryColor: '300 40% 70%',
    motionStyle: 'slow',
    lucyPresence: 'creative, poetic'
  },
  {
    id: 'silent-void',
    name: 'Silent Void',
    emoji: '🕯',
    description: 'Minimal light, near stillness for meditation',
    primaryColor: '0 0% 20%',
    secondaryColor: '0 0% 30%',
    motionStyle: 'minimal',
    lucyPresence: 'meditative'
  },
  {
    id: 'quantum-rift',
    name: 'Quantum Rift',
    emoji: '⚛',
    description: 'Abstract, nonlinear visuals with gentle temporal distortions',
    primaryColor: '180 70% 50%',
    secondaryColor: '320 60% 55%',
    motionStyle: 'medium',
    lucyPresence: 'speculative'
  },
  {
    id: 'command-bridge',
    name: 'Command Bridge',
    emoji: '🛰',
    description: 'Futuristic control room with tactical panels',
    primaryColor: '210 80% 45%',
    secondaryColor: '30 90% 50%',
    motionStyle: 'fast',
    lucyPresence: 'authoritative'
  },
  {
    id: 'codefall',
    name: 'Codefall',
    emoji: '🌧',
    description: 'Digital rain and code streams with soft vertical motion',
    primaryColor: '120 80% 45%',
    secondaryColor: '160 70% 40%',
    motionStyle: 'medium',
    lucyPresence: 'programmer'
  },
  {
    id: 'astral-archive',
    name: 'Astral Archive',
    emoji: '📚',
    description: 'Infinite knowledge library with floating data glyphs',
    primaryColor: '45 80% 55%',
    secondaryColor: '30 60% 45%',
    motionStyle: 'slow',
    lucyPresence: 'scholarly'
  },
  {
    id: 'living-core',
    name: 'Living Core',
    emoji: '🔥',
    description: 'Pulsing AI heart with warm intelligence glow',
    primaryColor: '15 90% 55%',
    secondaryColor: '350 80% 50%',
    motionStyle: 'medium',
    lucyPresence: 'alive, present'
  }
];

interface LucyWorldsContextType {
  activeWorld: LucyWorld;
  setActiveWorld: (world: LucyWorld) => void;
  worldConfig: WorldConfig | null;
  isWorldEnabled: boolean;
  toggleWorld: () => void;
  transitionState: 'idle' | 'transitioning';
}

const LucyWorldsContext = createContext<LucyWorldsContextType | null>(null);

const STORAGE_KEY = 'lucy-active-world';

export function LucyWorldsProvider({ children }: { children: React.ReactNode }) {
  const [activeWorld, setActiveWorldState] = useState<LucyWorld>('none');
  const [transitionState, setTransitionState] = useState<'idle' | 'transitioning'>('idle');

  // Load saved world preference
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LUCY_WORLDS.some(w => w.id === saved)) {
      setActiveWorldState(saved as LucyWorld);
    }
  }, []);

  // Save world preference
  const setActiveWorld = useCallback((world: LucyWorld) => {
    setTransitionState('transitioning');
    
    // Smooth transition
    setTimeout(() => {
      setActiveWorldState(world);
      localStorage.setItem(STORAGE_KEY, world);
      
      setTimeout(() => {
        setTransitionState('idle');
      }, 300);
    }, 150);
  }, []);

  const worldConfig = LUCY_WORLDS.find(w => w.id === activeWorld) || null;
  const isWorldEnabled = activeWorld !== 'none';

  const toggleWorld = useCallback(() => {
    if (isWorldEnabled) {
      setActiveWorld('none');
    } else {
      // Default to celestial-core if enabling
      setActiveWorld('celestial-core');
    }
  }, [isWorldEnabled, setActiveWorld]);

  return (
    <LucyWorldsContext.Provider value={{
      activeWorld,
      setActiveWorld,
      worldConfig,
      isWorldEnabled,
      toggleWorld,
      transitionState
    }}>
      {children}
    </LucyWorldsContext.Provider>
  );
}

export function useLucyWorlds() {
  const context = useContext(LucyWorldsContext);
  if (!context) {
    throw new Error('useLucyWorlds must be used within a LucyWorldsProvider');
  }
  return context;
}
