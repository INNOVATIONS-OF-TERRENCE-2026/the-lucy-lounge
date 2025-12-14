import { createContext, useContext, useCallback, useRef, useEffect, useState, ReactNode } from 'react';
import { WeatherMode, SeasonMode } from './useWeatherAmbient';
import { useFocusMode } from './useFocusMode';

// Audio state machine states
type AudioState = 'idle' | 'weather' | 'music';

// Music genres
export type MusicGenre = 'none' | 'jazz' | 'rnb' | 'lofi' | 'ambient';

interface AudioManagerContextType {
  audioState: AudioState;
  currentWeather: WeatherMode;
  currentSeason: SeasonMode;
  currentMusic: MusicGenre;
  volume: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  setVolume: (v: number) => void;
  setSoundEnabled: (e: boolean) => void;
  setMusicEnabled: (e: boolean) => void;
  playWeatherSound: (weather: WeatherMode, season: SeasonMode) => void;
  playMusic: (genre: MusicGenre) => void;
  stopAll: () => void;
  triggerTypingSound: () => void;
}

const AudioManagerContext = createContext<AudioManagerContextType | null>(null);

// Weather to music mapping - each weather type has an assigned beat
const WEATHER_MUSIC_MAP: Record<WeatherMode, { file: string; genre: MusicGenre; volumeMod: number }> = {
  clear: { file: '', genre: 'none', volumeMod: 0 },
  rain: { file: '/audio/lofi-mellow.mp3', genre: 'lofi', volumeMod: 1 },
  snow: { file: '/audio/ambient-emotional.mp3', genre: 'ambient', volumeMod: 0.9 },
  sunshine: { file: '/audio/rnb-soulful.mp3', genre: 'rnb', volumeMod: 1 },
  cloudy: { file: '/audio/jazz-smooth.mp3', genre: 'jazz', volumeMod: 0.95 },
  bloomy: { file: '/audio/jazz-warm.mp3', genre: 'jazz', volumeMod: 1 },
  blizzard: { file: '/audio/ambient-spiritual.mp3', genre: 'ambient', volumeMod: 0.85 },
  hurricane: { file: '/audio/ambient-dark.mp3', genre: 'ambient', volumeMod: 0.7 },
  tornado: { file: '/audio/ambient-dark.mp3', genre: 'ambient', volumeMod: 0.65 },
};

// Genre to file mapping for manual genre selection
const GENRE_FILES: Record<MusicGenre, string> = {
  none: '',
  jazz: '/audio/jazz-smooth.mp3',
  rnb: '/audio/rnb-upbeat.mp3',
  lofi: '/audio/lofi-mellow.mp3',
  ambient: '/audio/ambient-spiritual.mp3',
};

// Season EQ modifiers (applied via Web Audio API)
const SEASON_MODIFIERS: Record<SeasonMode, { filterFreq: number; gainMod: number }> = {
  none: { filterFreq: 20000, gainMod: 1 },
  spring: { filterFreq: 18000, gainMod: 1.05 },
  summer: { filterFreq: 20000, gainMod: 1 },
  fall: { filterFreq: 8000, gainMod: 0.9 },
  winter: { filterFreq: 6000, gainMod: 0.85 },
};

export const AudioManagerProvider = ({ children }: { children: ReactNode }) => {
  const { focusMode } = useFocusMode();
  
  // State
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [currentWeather, setCurrentWeather] = useState<WeatherMode>('clear');
  const [currentSeason, setCurrentSeason] = useState<SeasonMode>('none');
  const [currentMusic, setCurrentMusic] = useState<MusicGenre>('none');
  const [volume, setVolume] = useState(0.5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  
  // Audio refs - SINGLE source of truth
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);
  const isTransitioningRef = useRef(false);
  const hasUserInteractedRef = useRef(false);

  // Clean up any pending operations
  const clearPendingOperations = useCallback(() => {
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
  }, []);

  // Initialize audio context and nodes
  const initAudioContext = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;
    
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      
      // Create gain node
      const gainNode = ctx.createGain();
      gainNode.gain.value = volume;
      gainNodeRef.current = gainNode;
      
      // Create filter node for season EQ
      const filterNode = ctx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 20000;
      filterNode.Q.value = 0.5;
      filterNodeRef.current = filterNode;
      
      // Connect: source -> filter -> gain -> destination
      filterNode.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      return ctx;
    } catch (e) {
      console.warn('Audio context init failed:', e);
      return null;
    }
  }, [volume]);

  // Stop all audio with fade out
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
      // Smooth fade out
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

  // Core function to play an audio file
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

    // Prevent rapid transitions
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    clearPendingOperations();

    const ctx = initAudioContext();
    if (!ctx) {
      isTransitioningRef.current = false;
      return;
    }

    // Resume context if suspended
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const performTransition = () => {
      // Create or reuse audio element
      let audio = audioElementRef.current;
      if (!audio) {
        audio = new Audio();
        audio.loop = true;
        audio.crossOrigin = 'anonymous';
        audioElementRef.current = audio;
        
        // Connect to Web Audio API
        try {
          const source = ctx.createMediaElementSource(audio);
          source.connect(filterNodeRef.current!);
          sourceNodeRef.current = source;
        } catch (e) {
          // Already connected, that's fine
        }
      }

      // Set up error handling
      audio.onerror = () => {
        console.warn('Audio file failed to load:', filePath);
        isTransitioningRef.current = false;
        setAudioState('idle');
      };

      // Set up load and play
      audio.oncanplaythrough = () => {
        if (!hasUserInteractedRef.current) {
          // Wait for user interaction
          return;
        }

        const gainNode = gainNodeRef.current;
        const filterNode = filterNodeRef.current;
        
        if (gainNode && filterNode && ctx) {
          const now = ctx.currentTime;
          
          // Apply season EQ
          filterNode.frequency.setValueAtTime(seasonMod.filterFreq, now);
          
          // Fade in
          const targetVolume = volume * volumeMod * seasonMod.gainMod;
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(targetVolume, now + 0.5);
        }

        audio.play().then(() => {
          setAudioState(newState);
          isTransitioningRef.current = false;
        }).catch((e) => {
          console.warn('Playback failed:', e);
          isTransitioningRef.current = false;
        });
      };

      // If already loaded same file, just restart
      if (audio.src.endsWith(filePath) && audio.readyState >= 3) {
        audio.currentTime = 0;
        audio.oncanplaythrough?.(new Event('canplaythrough'));
      } else {
        audio.src = filePath;
        audio.load();
      }
    };

    // If something is playing, fade it out first
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
  }, [focusMode, volume, initAudioContext, stopAll, clearPendingOperations]);

  // Play weather sound (triggers assigned beat)
  const playWeatherSound = useCallback((weather: WeatherMode, season: SeasonMode) => {
    setCurrentWeather(weather);
    setCurrentSeason(season);
    
    if (focusMode || !soundEnabled) {
      stopAll(0.2);
      return;
    }

    const mapping = WEATHER_MUSIC_MAP[weather];
    if (!mapping.file) {
      stopAll(0.3);
      setCurrentMusic('none');
      return;
    }

    setCurrentMusic(mapping.genre);
    setMusicEnabled(false); // Weather controls audio, not manual music
    
    const seasonMod = SEASON_MODIFIERS[season];
    playAudioFile(mapping.file, 'weather', seasonMod, mapping.volumeMod);
  }, [focusMode, soundEnabled, stopAll, playAudioFile]);

  // Play music by genre (manual selection)
  const playMusic = useCallback((genre: MusicGenre) => {
    setCurrentMusic(genre);
    
    if (genre === 'none' || focusMode || !musicEnabled) {
      stopAll(0.3);
      return;
    }

    setSoundEnabled(false); // Music controls audio, not weather
    
    const filePath = GENRE_FILES[genre];
    if (!filePath) {
      stopAll(0.3);
      return;
    }

    const seasonMod = SEASON_MODIFIERS[currentSeason];
    playAudioFile(filePath, 'music', seasonMod, 1);
  }, [focusMode, musicEnabled, currentSeason, stopAll, playAudioFile]);

  // Typing sound (very subtle, only when idle)
  const triggerTypingSound = useCallback(() => {
    // Typing sounds disabled when other audio is playing
    if (focusMode || audioState !== 'idle') return;
    
    const ctx = initAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Create a very short, subtle click
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

  // Handle volume changes
  useEffect(() => {
    if (!gainNodeRef.current || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const gainNode = gainNodeRef.current;
    
    if (audioState === 'weather') {
      const mapping = WEATHER_MUSIC_MAP[currentWeather];
      const seasonMod = SEASON_MODIFIERS[currentSeason];
      const targetVolume = volume * mapping.volumeMod * seasonMod.gainMod;
      gainNode.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + 0.1);
    } else if (audioState === 'music') {
      const seasonMod = SEASON_MODIFIERS[currentSeason];
      gainNode.gain.linearRampToValueAtTime(volume * seasonMod.gainMod, ctx.currentTime + 0.1);
    }
  }, [volume, audioState, currentWeather, currentSeason]);

  // Handle season changes (update EQ)
  useEffect(() => {
    if (!filterNodeRef.current || !audioContextRef.current) return;
    if (audioState === 'idle') return;
    
    const seasonMod = SEASON_MODIFIERS[currentSeason];
    const ctx = audioContextRef.current;
    filterNodeRef.current.frequency.linearRampToValueAtTime(seasonMod.filterFreq, ctx.currentTime + 0.3);
  }, [currentSeason, audioState]);

  // Focus mode handler
  useEffect(() => {
    if (focusMode) {
      stopAll(0.3);
    }
  }, [focusMode, stopAll]);

  // User interaction tracker (required for autoplay)
  useEffect(() => {
    const handleInteraction = () => {
      hasUserInteractedRef.current = true;
      initAudioContext();
      
      // If there's a pending audio, try to play it
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

  const value: AudioManagerContextType = {
    audioState,
    currentWeather,
    currentSeason,
    currentMusic,
    volume,
    soundEnabled,
    musicEnabled,
    setVolume,
    setSoundEnabled,
    setMusicEnabled,
    playWeatherSound,
    playMusic,
    stopAll,
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
      volume: 0.5,
      soundEnabled: true,
      musicEnabled: false,
      setVolume: () => {},
      setSoundEnabled: () => {},
      setMusicEnabled: () => {},
      playWeatherSound: () => {},
      playMusic: () => {},
      stopAll: () => {},
      triggerTypingSound: () => {},
    };
  }
  return context;
};
