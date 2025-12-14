import { useEffect, useRef, useCallback } from 'react';
import { WeatherMode, SeasonMode } from '@/hooks/useWeatherAmbient';
import { useFocusMode } from '@/hooks/useFocusMode';

interface AmbientSoundControllerProps {
  weather: WeatherMode;
  season: SeasonMode;
  enabled: boolean;
  volume?: number;
}

// Sound configuration for each weather type
const WEATHER_SOUND_CONFIG: Record<WeatherMode, {
  type: 'noise' | 'tone' | 'none';
  frequency?: number;
  filterFreq?: number;
  filterQ?: number;
  gain?: number;
}> = {
  clear: { type: 'none' },
  rain: { type: 'noise', filterFreq: 800, filterQ: 1, gain: 0.15 },
  snow: { type: 'tone', frequency: 220, filterFreq: 400, gain: 0.08 },
  sunshine: { type: 'tone', frequency: 440, filterFreq: 2000, gain: 0.06 },
  cloudy: { type: 'noise', filterFreq: 400, filterQ: 0.5, gain: 0.1 },
  bloomy: { type: 'tone', frequency: 330, filterFreq: 1200, gain: 0.07 },
  blizzard: { type: 'noise', filterFreq: 1200, filterQ: 2, gain: 0.12 },
  hurricane: { type: 'noise', filterFreq: 200, filterQ: 3, gain: 0.1 },
  tornado: { type: 'noise', filterFreq: 100, filterQ: 5, gain: 0.08 },
};

// Season modifiers
const SEASON_MODIFIERS: Record<SeasonMode, { freqMult: number; gainMult: number }> = {
  none: { freqMult: 1, gainMult: 1 },
  spring: { freqMult: 1.2, gainMult: 1.1 },
  summer: { freqMult: 1.1, gainMult: 1 },
  fall: { freqMult: 0.9, gainMult: 0.95 },
  winter: { freqMult: 0.8, gainMult: 0.9 },
};

export const AmbientSoundController = ({
  weather,
  season,
  enabled,
  volume = 0.5,
}: AmbientSoundControllerProps) => {
  const { focusMode } = useFocusMode();
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const isPlayingRef = useRef(false);

  // Create noise buffer
  const createNoiseBuffer = useCallback((context: AudioContext) => {
    const bufferSize = context.sampleRate * 2;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  }, []);

  // Stop all sounds with fade out
  const stopSounds = useCallback((fadeTime = 0.5) => {
    if (gainNodeRef.current && audioContextRef.current) {
      const currentTime = audioContextRef.current.currentTime;
      gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, currentTime);
      gainNodeRef.current.gain.linearRampToValueAtTime(0, currentTime + fadeTime);
      
      setTimeout(() => {
        if (noiseNodeRef.current) {
          try {
            noiseNodeRef.current.stop();
          } catch {
            // Already stopped
          }
          noiseNodeRef.current = null;
        }
        if (oscillatorRef.current) {
          try {
            oscillatorRef.current.stop();
          } catch {
            // Already stopped
          }
          oscillatorRef.current = null;
        }
        isPlayingRef.current = false;
      }, fadeTime * 1000);
    }
  }, []);

  // Start ambient sound
  const startSound = useCallback(() => {
    if (!audioContextRef.current || focusMode || !enabled) return;
    
    const config = WEATHER_SOUND_CONFIG[weather];
    const seasonMod = SEASON_MODIFIERS[season];
    
    if (config.type === 'none') {
      stopSounds(0.3);
      return;
    }

    // Stop existing sounds first
    stopSounds(0.1);

    setTimeout(() => {
      if (!audioContextRef.current) return;
      
      const context = audioContextRef.current;
      
      // Create gain node
      const gainNode = context.createGain();
      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNodeRef.current = gainNode;
      
      // Create filter
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(
        (config.filterFreq || 1000) * seasonMod.freqMult,
        context.currentTime
      );
      filter.Q.setValueAtTime(config.filterQ || 1, context.currentTime);
      filterNodeRef.current = filter;

      if (config.type === 'noise') {
        // Create noise source
        const noiseBuffer = createNoiseBuffer(context);
        const noiseNode = context.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;
        
        noiseNode.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(context.destination);
        
        noiseNode.start();
        noiseNodeRef.current = noiseNode;
      } else if (config.type === 'tone') {
        // Create oscillator for tonal sounds
        const oscillator = context.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(
          (config.frequency || 220) * seasonMod.freqMult,
          context.currentTime
        );
        
        // Add subtle LFO for movement
        const lfo = context.createOscillator();
        const lfoGain = context.createGain();
        lfo.frequency.setValueAtTime(0.5, context.currentTime);
        lfoGain.gain.setValueAtTime(10, context.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        lfo.start();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.start();
        oscillatorRef.current = oscillator;
      }

      // Fade in
      const targetGain = (config.gain || 0.1) * volume * seasonMod.gainMult;
      gainNode.gain.linearRampToValueAtTime(targetGain, context.currentTime + 0.5);
      isPlayingRef.current = true;
    }, 150);
  }, [weather, season, enabled, volume, focusMode, createNoiseBuffer, stopSounds]);

  // Initialize audio context
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };

    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
  }, []);

  // Handle weather/season/enabled changes
  useEffect(() => {
    if (!enabled || focusMode) {
      stopSounds(0.5);
      return;
    }

    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      startSound();
    }
  }, [weather, season, enabled, focusMode, startSound, stopSounds]);

  // Handle volume changes
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current && isPlayingRef.current) {
      const config = WEATHER_SOUND_CONFIG[weather];
      const seasonMod = SEASON_MODIFIERS[season];
      const targetGain = (config.gain || 0.1) * volume * seasonMod.gainMult;
      
      gainNodeRef.current.gain.linearRampToValueAtTime(
        targetGain,
        audioContextRef.current.currentTime + 0.2
      );
    }
  }, [volume, weather, season]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSounds(0);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopSounds]);

  return null;
};
