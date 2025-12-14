import { createContext, useContext, useCallback, useRef, useEffect, useState, ReactNode } from 'react';
import { WeatherMode, SeasonMode } from './useWeatherAmbient';
import { useFocusMode } from './useFocusMode';

// Audio state machine states
type AudioState = 'idle' | 'weather' | 'music' | 'typing';

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

// Weather sound configurations using Web Audio API procedural synthesis
const WEATHER_AUDIO_CONFIG: Record<WeatherMode, {
  type: 'noise' | 'tone' | 'none';
  filterFreq: number;
  filterQ: number;
  gain: number;
  oscillatorFreq?: number;
}> = {
  clear: { type: 'none', filterFreq: 0, filterQ: 0, gain: 0 },
  rain: { type: 'noise', filterFreq: 600, filterQ: 0.8, gain: 0.18 },
  snow: { type: 'noise', filterFreq: 300, filterQ: 0.3, gain: 0.08 },
  sunshine: { type: 'tone', filterFreq: 1500, filterQ: 0.5, gain: 0.05, oscillatorFreq: 440 },
  cloudy: { type: 'noise', filterFreq: 350, filterQ: 0.4, gain: 0.1 },
  bloomy: { type: 'tone', filterFreq: 800, filterQ: 0.6, gain: 0.06, oscillatorFreq: 330 },
  blizzard: { type: 'noise', filterFreq: 900, filterQ: 1.5, gain: 0.14 },
  hurricane: { type: 'noise', filterFreq: 180, filterQ: 2, gain: 0.12 },
  tornado: { type: 'noise', filterFreq: 80, filterQ: 4, gain: 0.1 },
};

// Season EQ modifiers
const SEASON_MODIFIERS: Record<SeasonMode, { freqMult: number; gainMult: number }> = {
  none: { freqMult: 1, gainMult: 1 },
  spring: { freqMult: 1.15, gainMult: 1.05 },
  summer: { freqMult: 1.1, gainMult: 1 },
  fall: { freqMult: 0.85, gainMult: 0.9 },
  winter: { freqMult: 0.75, gainMult: 0.85 },
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
  
  // Audio refs - single source of truth
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const isInitializedRef = useRef(false);
  const fadeTimeoutRef = useRef<number | null>(null);

  // Initialize audio context on first user interaction
  const initAudioContext = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;
    
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      
      // Create master gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;
      
      isInitializedRef.current = true;
      return ctx;
    } catch (e) {
      console.warn('Audio context initialization failed:', e);
      return null;
    }
  }, [volume]);

  // Create noise buffer for weather sounds
  const createNoiseBuffer = useCallback((ctx: AudioContext): AudioBuffer => {
    const bufferSize = ctx.sampleRate * 3; // 3 seconds of noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate pink-ish noise (more pleasant than white noise)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    
    return buffer;
  }, []);

  // Stop all audio with fade
  const stopAll = useCallback((fadeTime = 0.3) => {
    // Clear any pending fade timeout
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }

    const ctx = audioContextRef.current;
    if (!ctx || !masterGainRef.current) {
      setAudioState('idle');
      return;
    }

    const now = ctx.currentTime;
    
    // Fade out master gain
    masterGainRef.current.gain.cancelScheduledValues(now);
    masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, now);
    masterGainRef.current.gain.linearRampToValueAtTime(0, now + fadeTime);

    // Schedule cleanup
    fadeTimeoutRef.current = window.setTimeout(() => {
      // Stop noise source
      if (noiseSourceRef.current) {
        try { noiseSourceRef.current.stop(); } catch {}
        noiseSourceRef.current.disconnect();
        noiseSourceRef.current = null;
      }
      
      // Stop oscillator
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); } catch {}
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      
      // Stop LFO
      if (lfoRef.current) {
        try { lfoRef.current.stop(); } catch {}
        lfoRef.current.disconnect();
        lfoRef.current = null;
      }
      
      // Disconnect filter
      if (filterRef.current) {
        filterRef.current.disconnect();
        filterRef.current = null;
      }
      
      setAudioState('idle');
    }, fadeTime * 1000 + 50);
  }, []);

  // Play weather sound
  const playWeatherSound = useCallback((weather: WeatherMode, season: SeasonMode) => {
    setCurrentWeather(weather);
    setCurrentSeason(season);
    
    if (focusMode || !soundEnabled) {
      stopAll(0.1);
      return;
    }

    const config = WEATHER_AUDIO_CONFIG[weather];
    if (config.type === 'none') {
      stopAll(0.3);
      return;
    }

    // Stop current audio first
    stopAll(0.15);

    // Start new sound after fade
    fadeTimeoutRef.current = window.setTimeout(() => {
      const ctx = initAudioContext();
      if (!ctx || !masterGainRef.current) return;

      // Resume context if suspended
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const seasonMod = SEASON_MODIFIERS[season];
      const now = ctx.currentTime;

      // Create filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(config.filterFreq * seasonMod.freqMult, now);
      filter.Q.setValueAtTime(config.filterQ, now);
      filterRef.current = filter;

      // Create source based on type
      if (config.type === 'noise') {
        const noiseBuffer = createNoiseBuffer(ctx);
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        
        noiseSource.connect(filter);
        filter.connect(masterGainRef.current);
        
        noiseSource.start();
        noiseSourceRef.current = noiseSource;
      } else if (config.type === 'tone') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime((config.oscillatorFreq || 220) * seasonMod.freqMult, now);
        
        // Add LFO for movement
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.3, now);
        lfoGain.gain.setValueAtTime(8, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
        lfoRef.current = lfo;
        
        osc.connect(filter);
        filter.connect(masterGainRef.current);
        
        osc.start();
        oscillatorRef.current = osc;
      }

      // Fade in
      const targetGain = config.gain * volume * seasonMod.gainMult;
      masterGainRef.current.gain.setValueAtTime(0, now);
      masterGainRef.current.gain.linearRampToValueAtTime(targetGain, now + 0.4);
      
      setAudioState('weather');
      setMusicEnabled(false);
      setCurrentMusic('none');
    }, 200);
  }, [focusMode, soundEnabled, volume, initAudioContext, createNoiseBuffer, stopAll]);

  // Play music (placeholder - would use audio files)
  const playMusic = useCallback((genre: MusicGenre) => {
    setCurrentMusic(genre);
    
    if (genre === 'none' || focusMode || !musicEnabled) {
      stopAll(0.3);
      return;
    }

    // Stop weather sounds
    stopAll(0.3);
    
    // Music would be implemented with <audio> elements and local files
    // For now, play a procedural ambient pad based on genre
    fadeTimeoutRef.current = window.setTimeout(() => {
      const ctx = initAudioContext();
      if (!ctx || !masterGainRef.current) return;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      
      // Create a simple pad sound based on genre
      const baseFreq = genre === 'jazz' ? 220 : genre === 'rnb' ? 196 : genre === 'lofi' ? 185 : 165;
      
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(genre === 'jazz' ? 800 : 400, now);
      filter.Q.setValueAtTime(0.5, now);
      filterRef.current = filter;
      
      // Add LFO
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.2, now);
      lfoGain.gain.setValueAtTime(5, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      lfoRef.current = lfo;
      
      osc.connect(filter);
      filter.connect(masterGainRef.current);
      osc.start();
      oscillatorRef.current = osc;
      
      // Fade in
      masterGainRef.current.gain.setValueAtTime(0, now);
      masterGainRef.current.gain.linearRampToValueAtTime(volume * 0.08, now + 0.5);
      
      setAudioState('music');
      setSoundEnabled(false);
    }, 350);
  }, [focusMode, musicEnabled, volume, initAudioContext, stopAll]);

  // Typing sound trigger (very subtle click)
  const triggerTypingSound = useCallback(() => {
    if (focusMode || audioState !== 'idle') return;
    
    const ctx = initAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Create a very short click sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.02);
    
    gain.gain.setValueAtTime(0.02 * volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  }, [focusMode, audioState, volume, initAudioContext]);

  // Handle volume changes
  useEffect(() => {
    if (!masterGainRef.current || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const config = WEATHER_AUDIO_CONFIG[currentWeather];
    const seasonMod = SEASON_MODIFIERS[currentSeason];
    
    if (audioState === 'weather') {
      const targetGain = config.gain * volume * seasonMod.gainMult;
      masterGainRef.current.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 0.1);
    } else if (audioState === 'music') {
      masterGainRef.current.gain.linearRampToValueAtTime(volume * 0.08, ctx.currentTime + 0.1);
    }
  }, [volume, audioState, currentWeather, currentSeason]);

  // Focus mode handler - stops all audio
  useEffect(() => {
    if (focusMode) {
      stopAll(0.3);
    }
  }, [focusMode, stopAll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Initialize on first user interaction
  useEffect(() => {
    const handleInteraction = () => {
      initAudioContext();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
    
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [initAudioContext]);

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
    // Fallback for components outside provider
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
