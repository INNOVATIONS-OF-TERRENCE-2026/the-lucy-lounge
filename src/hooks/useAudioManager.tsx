import { createContext, useContext, useCallback, useRef, useEffect, useState, ReactNode } from 'react';
import { WeatherMode, SeasonMode } from './useWeatherAmbient';
import { useFocusMode } from './useFocusMode';

// Audio state machine states
type AudioState = 'idle' | 'weather' | 'music';

// Music genres
export type MusicGenre = 'none' | 'jazz' | 'rnb' | 'lofi' | 'ambient';

export interface AudioManagerContextType {
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

// ============= AUDIO REGISTRY (ALL 18 TRACKS) =============
interface AudioTrack {
  file: string;
  genres: MusicGenre[];
}

const AUDIO_REGISTRY: AudioTrack[] = [
  // EXISTING 8 TRACKS
  { file: 'ambient-dark.mp3', genres: ['ambient'] },
  { file: 'ambient-emotional.mp3', genres: ['ambient', 'lofi'] },
  { file: 'ambient-spiritual.mp3', genres: ['ambient'] },
  { file: 'jazz-smooth.mp3', genres: ['jazz', 'lofi'] },
  { file: 'jazz-warm.mp3', genres: ['jazz'] },
  { file: 'lofi-mellow.mp3', genres: ['lofi'] },
  { file: 'rnb-soulful.mp3', genres: ['rnb'] },
  { file: 'rnb-upbeat.mp3', genres: ['rnb', 'jazz'] },
  
  // NEW 10 TRACKS
  { file: 'country-road.mp3', genres: ['jazz', 'lofi'] },
  { file: 'blue-bonnets.mp3', genres: ['ambient', 'lofi'] },
  { file: 'big-money-melodies.mp3', genres: ['rnb'] },
  { file: 'comeback-mix.mp3', genres: ['rnb', 'jazz'] },
  { file: 'project2-samples.mp3', genres: ['lofi', 'ambient'] },
  { file: 'kanye-samples-deep.mp3', genres: ['rnb', 'ambient'] },
  { file: 'life-after-pain.mp3', genres: ['ambient', 'lofi'] },
  { file: 'call-me-sample.wav', genres: ['rnb', 'jazz'] },
  { file: 'ttttttt.wav', genres: ['ambient'] },
  { file: 'crushed-velvet.mp3', genres: ['lofi', 'jazz'] },
];

// ============= WEATHER → GENRE POOLS =============
const WEATHER_GENRE_POOLS: Record<WeatherMode, { genres: MusicGenre[]; volumeMod: number }> = {
  clear: { genres: [], volumeMod: 0 },
  rain: { genres: ['lofi', 'jazz', 'ambient'], volumeMod: 1 },
  snow: { genres: ['ambient', 'jazz'], volumeMod: 0.9 },
  sunshine: { genres: ['rnb', 'jazz'], volumeMod: 1 },
  cloudy: { genres: ['lofi', 'jazz', 'ambient'], volumeMod: 0.95 },
  bloomy: { genres: ['lofi', 'jazz'], volumeMod: 1 },
  blizzard: { genres: ['ambient', 'jazz'], volumeMod: 0.85 },
  hurricane: { genres: ['ambient'], volumeMod: 0.7 },
  tornado: { genres: ['ambient'], volumeMod: 0.65 },
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
  
  // Shuffle tracking - avoid consecutive repeats
  const lastPlayedRef = useRef<string>('');
  const currentPoolRef = useRef<string[]>([]);
  const currentVolumeModRef = useRef<number>(1);

  // ============= TRACK SELECTION HELPERS =============
  
  // Get all tracks matching weather's genre pool
  const getTracksForWeather = useCallback((weather: WeatherMode): string[] => {
    const pool = WEATHER_GENRE_POOLS[weather];
    if (!pool.genres.length) return [];
    
    return AUDIO_REGISTRY
      .filter(track => track.genres.some(g => pool.genres.includes(g)))
      .map(t => `/audio/${t.file}`);
  }, []);

  // Get all tracks for a specific genre
  const getTracksForGenre = useCallback((genre: MusicGenre): string[] => {
    if (genre === 'none') return [];
    
    return AUDIO_REGISTRY
      .filter(track => track.genres.includes(genre))
      .map(t => `/audio/${t.file}`);
  }, []);

  // Select random track, avoiding last played
  const selectRandomTrack = useCallback((tracks: string[]): string => {
    if (tracks.length === 0) return '';
    if (tracks.length === 1) return tracks[0];
    
    const available = tracks.filter(t => t !== lastPlayedRef.current);
    const pool = available.length > 0 ? available : tracks;
    const selected = pool[Math.floor(Math.random() * pool.length)];
    lastPlayedRef.current = selected;
    return selected;
  }, []);

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
        audio.loop = false; // Disable loop - we'll handle auto-queue
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

      // Set up auto-queue when track ends
      audio.onended = () => {
        if (focusMode) return;
        
        // Queue next track from current pool
        if (currentPoolRef.current.length > 0) {
          const nextTrack = selectRandomTrack(currentPoolRef.current);
          if (nextTrack) {
            isTransitioningRef.current = false;
            playAudioFile(nextTrack, newState, SEASON_MODIFIERS[currentSeason], currentVolumeModRef.current);
          }
        }
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
  }, [focusMode, volume, currentSeason, initAudioContext, stopAll, clearPendingOperations, selectRandomTrack]);

  // Play weather sound (triggers assigned beat from pool)
  const playWeatherSound = useCallback((weather: WeatherMode, season: SeasonMode) => {
    setCurrentWeather(weather);
    setCurrentSeason(season);
    
    if (focusMode || !soundEnabled) {
      stopAll(0.2);
      return;
    }

    const pool = WEATHER_GENRE_POOLS[weather];
    if (pool.genres.length === 0) {
      stopAll(0.3);
      setCurrentMusic('none');
      currentPoolRef.current = [];
      return;
    }

    // Get tracks for this weather and store pool for auto-queue
    const tracks = getTracksForWeather(weather);
    currentPoolRef.current = tracks;
    currentVolumeModRef.current = pool.volumeMod;
    
    const selectedTrack = selectRandomTrack(tracks);
    
    if (!selectedTrack) {
      stopAll(0.3);
      return;
    }

    setCurrentMusic(pool.genres[0]); // Primary genre for display
    setMusicEnabled(false); // Weather controls audio, not manual music
    
    const seasonMod = SEASON_MODIFIERS[season];
    playAudioFile(selectedTrack, 'weather', seasonMod, pool.volumeMod);
  }, [focusMode, soundEnabled, stopAll, getTracksForWeather, selectRandomTrack, playAudioFile]);

  // Play music by genre (manual selection)
  const playMusic = useCallback((genre: MusicGenre) => {
    setCurrentMusic(genre);
    
    if (genre === 'none' || focusMode || !musicEnabled) {
      stopAll(0.3);
      currentPoolRef.current = [];
      return;
    }

    setSoundEnabled(false); // Music controls audio, not weather
    
    // Get tracks for this genre and store pool for auto-queue
    const tracks = getTracksForGenre(genre);
    currentPoolRef.current = tracks;
    currentVolumeModRef.current = 1;
    
    const selectedTrack = selectRandomTrack(tracks);
    
    if (!selectedTrack) {
      stopAll(0.3);
      return;
    }

    const seasonMod = SEASON_MODIFIERS[currentSeason];
    playAudioFile(selectedTrack, 'music', seasonMod, 1);
  }, [focusMode, musicEnabled, currentSeason, stopAll, getTracksForGenre, selectRandomTrack, playAudioFile]);

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
    const seasonMod = SEASON_MODIFIERS[currentSeason];
    
    if (audioState === 'weather') {
      const targetVolume = volume * currentVolumeModRef.current * seasonMod.gainMod;
      gainNode.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + 0.1);
    } else if (audioState === 'music') {
      gainNode.gain.linearRampToValueAtTime(volume * seasonMod.gainMod, ctx.currentTime + 0.1);
    }
  }, [volume, audioState, currentSeason]);

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
      currentPoolRef.current = [];
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
