import { createContext, useContext, useCallback, useRef, useEffect, useState, ReactNode } from 'react';
import { WeatherMode, SeasonMode } from './useWeatherAmbient';
import { useFocusMode } from './useFocusMode';
import {
  AUDIO_TRACKS,
  WEATHER_GENRE_MAP,
  SEASON_EQ_MODIFIERS,
  getTracksForWeatherSeason,
  getTracksByGenre,
  shuffleArray,
  getTrackDisplayName,
  type MusicGenre,
} from '@/config/ambientAudioLibrary';

// Re-export MusicGenre for consumers
export type { MusicGenre };

// Audio state machine states
type AudioState = 'idle' | 'weather' | 'music';

// localStorage keys
const STORAGE_KEYS = {
  musicEnabled: 'lucy-music-enabled',
  volume: 'lucy-music-volume',
  shuffleEnabled: 'lucy-music-shuffle',
  soundEnabled: 'lucy-sound-enabled',
} as const;

export interface AudioManagerContextType {
  audioState: AudioState;
  currentWeather: WeatherMode;
  currentSeason: SeasonMode;
  currentMusic: MusicGenre;
  currentTrackName: string;
  volume: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  shuffleEnabled: boolean;
  setVolume: (v: number) => void;
  setSoundEnabled: (e: boolean) => void;
  setMusicEnabled: (e: boolean) => void;
  setShuffleEnabled: (e: boolean) => void;
  playWeatherSound: (weather: WeatherMode, season: SeasonMode) => void;
  playMusic: (genre: MusicGenre) => void;
  stopAll: () => void;
  skipTrack: () => void;
  triggerTypingSound: () => void;
}

const AudioManagerContext = createContext<AudioManagerContextType | null>(null);

export const AudioManagerProvider = ({ children }: { children: ReactNode }) => {
  const { focusMode } = useFocusMode();
  
  // Initialize state from localStorage
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [currentWeather, setCurrentWeather] = useState<WeatherMode>('clear');
  const [currentSeason, setCurrentSeason] = useState<SeasonMode>('none');
  const [currentMusic, setCurrentMusic] = useState<MusicGenre>('none');
  const [currentTrackPath, setCurrentTrackPath] = useState<string>('');
  
  // Persisted preferences - load from localStorage
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.volume);
    return saved !== null ? parseFloat(saved) : 0.5;
  });
  const [soundEnabled, setSoundEnabledState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.soundEnabled);
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [musicEnabled, setMusicEnabledState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.musicEnabled);
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [shuffleEnabled, setShuffleEnabledState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.shuffleEnabled);
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  // Audio refs - SINGLE source of truth
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);
  const isTransitioningRef = useRef(false);
  const hasUserInteractedRef = useRef(false);
  
  // Deck shuffle tracking
  const playedTracksRef = useRef<Set<string>>(new Set());
  const shuffledQueueRef = useRef<string[]>([]);
  const currentPoolRef = useRef<string[]>([]);
  const currentVolumeModRef = useRef<number>(1);

  // ============= PERSISTENCE HELPERS =============
  
  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    localStorage.setItem(STORAGE_KEYS.volume, v.toString());
  }, []);

  const setSoundEnabled = useCallback((e: boolean) => {
    setSoundEnabledState(e);
    localStorage.setItem(STORAGE_KEYS.soundEnabled, JSON.stringify(e));
  }, []);

  const setMusicEnabled = useCallback((e: boolean) => {
    setMusicEnabledState(e);
    localStorage.setItem(STORAGE_KEYS.musicEnabled, JSON.stringify(e));
  }, []);

  const setShuffleEnabled = useCallback((e: boolean) => {
    setShuffleEnabledState(e);
    localStorage.setItem(STORAGE_KEYS.shuffleEnabled, JSON.stringify(e));
  }, []);

  // ============= DECK SHUFFLE LOGIC =============

  /**
   * Get next track using true deck-style shuffle
   * All tracks play before any repeat
   */
  const getNextTrackFromDeck = useCallback((pool: string[]): string => {
    if (pool.length === 0) return '';
    if (pool.length === 1) return pool[0];
    
    // If queue is empty or all tracks played, reshuffle
    if (shuffledQueueRef.current.length === 0 || playedTracksRef.current.size >= pool.length) {
      playedTracksRef.current.clear();
      shuffledQueueRef.current = shuffleEnabled ? shuffleArray(pool) : [...pool];
    }
    
    // Get next track from queue
    const nextTrack = shuffledQueueRef.current.shift();
    if (nextTrack) {
      playedTracksRef.current.add(nextTrack);
      return nextTrack;
    }
    
    // Fallback - should not reach here
    return pool[0];
  }, [shuffleEnabled]);

  /**
   * Reset shuffle state when pool changes
   */
  const resetShuffleState = useCallback((newPool: string[]) => {
    playedTracksRef.current.clear();
    shuffledQueueRef.current = shuffleEnabled ? shuffleArray(newPool) : [...newPool];
    currentPoolRef.current = newPool;
  }, [shuffleEnabled]);

  // ============= AUDIO CONTEXT HELPERS =============

  const clearPendingOperations = useCallback(() => {
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
  }, []);

  const initAudioContext = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;
    
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      
      const gainNode = ctx.createGain();
      gainNode.gain.value = volume;
      gainNodeRef.current = gainNode;
      
      const filterNode = ctx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 20000;
      filterNode.Q.value = 0.5;
      filterNodeRef.current = filterNode;
      
      filterNode.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      return ctx;
    } catch (e) {
      console.warn('Audio context init failed:', e);
      return null;
    }
  }, [volume]);

  // ============= STOP ALL AUDIO =============

  const stopAll = useCallback((fadeTime = 0.4) => {
    clearPendingOperations();
    
    if (!audioElementRef.current) {
      setAudioState('idle');
      return;
    }

    const audio = audioElementRef.current;
    const gainNode = gainNodeRef.current;
    const ctx = audioContextRef.current;

    if (gainNode && ctx && ctx.state === 'running') {
      const now = ctx.currentTime;
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + fadeTime);
      
      fadeTimeoutRef.current = window.setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
        setAudioState('idle');
        isTransitioningRef.current = false;
      }, fadeTime * 1000 + 50);
    } else {
      audio.pause();
      audio.currentTime = 0;
      setAudioState('idle');
    }
  }, [clearPendingOperations]);

  // ============= CORE PLAY FUNCTION =============

  const playAudioFile = useCallback((
    filePath: string, 
    newState: AudioState,
    seasonMod: { filterFreq: number; gainMod: number },
    volumeMod: number = 1
  ) => {
    if (!filePath || focusMode) {
      stopAll(0.2);
      return;
    }

    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    clearPendingOperations();

    const ctx = initAudioContext();
    if (!ctx) {
      isTransitioningRef.current = false;
      return;
    }

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const performTransition = () => {
      let audio = audioElementRef.current;
      if (!audio) {
        audio = new Audio();
        audio.loop = false;
        audio.crossOrigin = 'anonymous';
        audioElementRef.current = audio;
        
        try {
          const source = ctx.createMediaElementSource(audio);
          source.connect(filterNodeRef.current!);
          sourceNodeRef.current = source;
        } catch (e) {
          // Already connected
        }
      }

      audio.onerror = () => {
        console.warn('Audio file failed to load:', filePath);
        isTransitioningRef.current = false;
        // Auto-skip to next track on error
        if (currentPoolRef.current.length > 0) {
          const nextTrack = getNextTrackFromDeck(currentPoolRef.current);
          if (nextTrack && nextTrack !== filePath) {
            setTimeout(() => {
              isTransitioningRef.current = false;
              playAudioFile(nextTrack, newState, seasonMod, volumeMod);
            }, 100);
            return;
          }
        }
        setAudioState('idle');
      };

      audio.onended = () => {
        if (focusMode) return;
        
        if (currentPoolRef.current.length > 0) {
          const nextTrack = getNextTrackFromDeck(currentPoolRef.current);
          if (nextTrack) {
            isTransitioningRef.current = false;
            playAudioFile(nextTrack, newState, SEASON_EQ_MODIFIERS[currentSeason], currentVolumeModRef.current);
          }
        }
      };

      audio.oncanplaythrough = () => {
        if (!hasUserInteractedRef.current) return;

        const gainNode = gainNodeRef.current;
        const filterNode = filterNodeRef.current;
        
        if (gainNode && filterNode && ctx) {
          const now = ctx.currentTime;
          filterNode.frequency.setValueAtTime(seasonMod.filterFreq, now);
          
          const targetVolume = volume * volumeMod * seasonMod.gainMod;
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(targetVolume, now + 0.5);
        }

        audio.play().then(() => {
          setAudioState(newState);
          setCurrentTrackPath(filePath);
          isTransitioningRef.current = false;
        }).catch((e) => {
          console.warn('Playback failed:', e);
          isTransitioningRef.current = false;
        });
      };

      // Use encodeURI for path safety with special characters
      const safePath = encodeURI(filePath);
      
      if (audio.src.endsWith(filePath) && audio.readyState >= 3) {
        audio.currentTime = 0;
        audio.oncanplaythrough?.(new Event('canplaythrough'));
      } else {
        audio.src = safePath;
        audio.load();
      }
    };

    if (audioElementRef.current && !audioElementRef.current.paused) {
      const gainNode = gainNodeRef.current;
      if (gainNode && ctx.state === 'running') {
        const now = ctx.currentTime;
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
        
        fadeTimeoutRef.current = window.setTimeout(() => {
          audioElementRef.current?.pause();
          performTransition();
        }, 350);
      } else {
        audioElementRef.current.pause();
        performTransition();
      }
    } else {
      performTransition();
    }
  }, [focusMode, volume, currentSeason, initAudioContext, stopAll, clearPendingOperations, getNextTrackFromDeck]);

  // ============= PLAY WEATHER SOUND =============

  const playWeatherSound = useCallback((weather: WeatherMode, season: SeasonMode) => {
    setCurrentWeather(weather);
    setCurrentSeason(season);
    
    if (focusMode || !soundEnabled) {
      stopAll(0.2);
      return;
    }

    const pool = WEATHER_GENRE_MAP[weather];
    if (pool.genres.length === 0) {
      stopAll(0.3);
      setCurrentMusic('none');
      resetShuffleState([]);
      return;
    }

    const tracks = getTracksForWeatherSeason(weather, season).map(t => t.src);
    resetShuffleState(tracks);
    currentVolumeModRef.current = pool.volumeMod;
    
    const selectedTrack = getNextTrackFromDeck(tracks);
    
    if (!selectedTrack) {
      stopAll(0.3);
      return;
    }

    setCurrentMusic(pool.genres[0]);
    setMusicEnabled(false);
    
    const seasonMod = SEASON_EQ_MODIFIERS[season];
    playAudioFile(selectedTrack, 'weather', seasonMod, pool.volumeMod);
  }, [focusMode, soundEnabled, stopAll, resetShuffleState, getNextTrackFromDeck, playAudioFile, setMusicEnabled]);

  // ============= PLAY MUSIC BY GENRE =============

  const playMusic = useCallback((genre: MusicGenre) => {
    setCurrentMusic(genre);
    
    if (genre === 'none' || focusMode || !musicEnabled) {
      stopAll(0.3);
      resetShuffleState([]);
      return;
    }

    setSoundEnabled(false);
    
    const tracks = getTracksByGenre(genre).map(t => t.src);
    resetShuffleState(tracks);
    currentVolumeModRef.current = 1;
    
    const selectedTrack = getNextTrackFromDeck(tracks);
    
    if (!selectedTrack) {
      stopAll(0.3);
      return;
    }

    const seasonMod = SEASON_EQ_MODIFIERS[currentSeason];
    playAudioFile(selectedTrack, 'music', seasonMod, 1);
  }, [focusMode, musicEnabled, currentSeason, stopAll, resetShuffleState, getNextTrackFromDeck, playAudioFile, setSoundEnabled]);

  // ============= SKIP TRACK =============

  const skipTrack = useCallback(() => {
    if (focusMode || currentPoolRef.current.length === 0) return;
    
    const nextTrack = getNextTrackFromDeck(currentPoolRef.current);
    if (!nextTrack) return;
    
    const seasonMod = SEASON_EQ_MODIFIERS[currentSeason];
    isTransitioningRef.current = false;
    playAudioFile(nextTrack, audioState === 'idle' ? 'weather' : audioState, seasonMod, currentVolumeModRef.current);
  }, [focusMode, currentSeason, audioState, getNextTrackFromDeck, playAudioFile]);

  // ============= TYPING SOUND (SUBTLE) =============

  const triggerTypingSound = useCallback(() => {
    if (focusMode || audioState !== 'idle') return;
    
    const ctx = initAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600 + Math.random() * 200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.015);
      
      gain.gain.setValueAtTime(0.015 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.03);
    } catch (e) {
      // Ignore typing sound errors
    }
  }, [focusMode, audioState, volume, initAudioContext]);

  // ============= EFFECTS =============

  // Handle volume changes
  useEffect(() => {
    if (!gainNodeRef.current || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const gainNode = gainNodeRef.current;
    const seasonMod = SEASON_EQ_MODIFIERS[currentSeason];
    
    if (audioState === 'weather') {
      const targetVolume = volume * currentVolumeModRef.current * seasonMod.gainMod;
      gainNode.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + 0.1);
    } else if (audioState === 'music') {
      gainNode.gain.linearRampToValueAtTime(volume * seasonMod.gainMod, ctx.currentTime + 0.1);
    }
  }, [volume, audioState, currentSeason]);

  // Handle season EQ changes
  useEffect(() => {
    if (!filterNodeRef.current || !audioContextRef.current) return;
    if (audioState === 'idle') return;
    
    const seasonMod = SEASON_EQ_MODIFIERS[currentSeason];
    const ctx = audioContextRef.current;
    filterNodeRef.current.frequency.linearRampToValueAtTime(seasonMod.filterFreq, ctx.currentTime + 0.3);
  }, [currentSeason, audioState]);

  // Focus mode handler
  useEffect(() => {
    if (focusMode) {
      stopAll(0.3);
      resetShuffleState([]);
    }
  }, [focusMode, stopAll, resetShuffleState]);

  // User interaction tracker (required for autoplay)
  useEffect(() => {
    const handleInteraction = () => {
      hasUserInteractedRef.current = true;
      initAudioContext();
      
      const audio = audioElementRef.current;
      if (audio && audio.readyState >= 3 && audio.paused && audioState !== 'idle') {
        audio.play().catch(() => {});
      }
      
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
    
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [initAudioContext, audioState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPendingOperations();
      
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
        audioElementRef.current = null;
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [clearPendingOperations]);

  // ============= CONTEXT VALUE =============

  const value: AudioManagerContextType = {
    audioState,
    currentWeather,
    currentSeason,
    currentMusic,
    currentTrackName: getTrackDisplayName(currentTrackPath),
    volume,
    soundEnabled,
    musicEnabled,
    shuffleEnabled,
    setVolume,
    setSoundEnabled,
    setMusicEnabled,
    setShuffleEnabled,
    playWeatherSound,
    playMusic,
    stopAll,
    skipTrack,
    triggerTypingSound,
  };

  return (
    <AudioManagerContext.Provider value={value}>
      {children}
    </AudioManagerContext.Provider>
  );
};

export const useAudioManager = (): AudioManagerContextType => {
  const context = useContext(AudioManagerContext);
  if (!context) {
    return {
      audioState: 'idle',
      currentWeather: 'clear',
      currentSeason: 'none',
      currentMusic: 'none',
      currentTrackName: '',
      volume: 0.5,
      soundEnabled: true,
      musicEnabled: false,
      shuffleEnabled: true,
      setVolume: () => {},
      setSoundEnabled: () => {},
      setMusicEnabled: () => {},
      setShuffleEnabled: () => {},
      playWeatherSound: () => {},
      playMusic: () => {},
      stopAll: () => {},
      skipTrack: () => {},
      triggerTypingSound: () => {},
    };
  }
  return context;
};
