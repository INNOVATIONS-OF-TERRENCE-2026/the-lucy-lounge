/**
 * THE LUCY LOUNGE - Audio Cinema Layer
 * 
 * Audio-reactive visual enhancements for Listening Mode:
 * - Frequency-based glow
 * - Beat-aware background motion
 * - Dynamic color grading based on track mood/metadata
 * 
 * Rules:
 * - Spotify playback logic UNTOUCHED
 * - Uses metadata, NOT raw audio streams
 * - Fully toggleable via settings
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useCinematicSafe } from '@/contexts/CinematicContext';

export type AudioMood = 'energetic' | 'chill' | 'melancholic' | 'uplifting' | 'dark' | 'neutral';

interface TrackMetadata {
  name?: string;
  artist?: string;
  genre?: string;
  tempo?: number; // BPM
  energy?: number; // 0-1
  valence?: number; // 0-1 (positivity)
  danceability?: number; // 0-1
}

interface AudioCinemaLayerProps {
  isPlaying?: boolean;
  metadata?: TrackMetadata;
  mood?: AudioMood;
  className?: string;
  disabled?: boolean;
}

// Color schemes based on mood
const moodColors: Record<AudioMood, { primary: string; secondary: string; accent: string }> = {
  energetic: {
    primary: 'rgba(239, 68, 68, 0.3)',   // Red
    secondary: 'rgba(251, 146, 60, 0.2)', // Orange
    accent: 'rgba(251, 191, 36, 0.4)',    // Amber
  },
  chill: {
    primary: 'rgba(34, 211, 238, 0.3)',   // Cyan
    secondary: 'rgba(56, 189, 248, 0.2)', // Sky
    accent: 'rgba(147, 197, 253, 0.4)',   // Light blue
  },
  melancholic: {
    primary: 'rgba(139, 92, 246, 0.3)',   // Purple
    secondary: 'rgba(167, 139, 250, 0.2)', // Violet
    accent: 'rgba(196, 181, 253, 0.4)',   // Lavender
  },
  uplifting: {
    primary: 'rgba(34, 197, 94, 0.3)',    // Green
    secondary: 'rgba(74, 222, 128, 0.2)', // Emerald
    accent: 'rgba(134, 239, 172, 0.4)',   // Light green
  },
  dark: {
    primary: 'rgba(71, 85, 105, 0.3)',    // Slate
    secondary: 'rgba(100, 116, 139, 0.2)', // Gray
    accent: 'rgba(148, 163, 184, 0.4)',   // Light slate
  },
  neutral: {
    primary: 'rgba(29, 185, 84, 0.3)',    // Spotify green
    secondary: 'rgba(30, 215, 96, 0.2)',
    accent: 'rgba(29, 185, 84, 0.4)',
  },
};

// Derive mood from track metadata
function deriveMood(metadata?: TrackMetadata): AudioMood {
  if (!metadata) return 'neutral';
  
  const { energy = 0.5, valence = 0.5 } = metadata;
  
  if (energy > 0.7 && valence > 0.6) return 'energetic';
  if (energy < 0.4 && valence < 0.4) return 'melancholic';
  if (energy < 0.5 && valence > 0.5) return 'chill';
  if (valence > 0.7) return 'uplifting';
  if (energy > 0.6 && valence < 0.4) return 'dark';
  
  return 'neutral';
}

// Simulated beat detection based on tempo
function useBeatPulse(tempo: number = 120, isPlaying: boolean = false) {
  const [beat, setBeat] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isPlaying || tempo <= 0) {
      setBeat(false);
      return;
    }

    const beatInterval = (60 / tempo) * 1000; // ms per beat
    
    intervalRef.current = setInterval(() => {
      setBeat(true);
      setTimeout(() => setBeat(false), 100);
    }, beatInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tempo, isPlaying]);

  return beat;
}

export function AudioCinemaLayer({
  isPlaying = false,
  metadata,
  mood: providedMood,
  className = '',
  disabled = false,
}: AudioCinemaLayerProps) {
  const cinematic = useCinematicSafe();
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  // Delay mount for performance
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Determine if effects should be active
  const isEnabled = useMemo(() => {
    if (disabled) return false;
    if (shouldReduceMotion) return false;
    if (!cinematic) return true;
    return cinematic.isEnabled && cinematic.settings.audioVisualSync;
  }, [disabled, shouldReduceMotion, cinematic]);

  const intensity = cinematic?.intensity ?? 0.5;

  // Derive mood from metadata or use provided
  const mood = providedMood ?? deriveMood(metadata);
  const colors = moodColors[mood];

  // Beat pulse
  const isBeat = useBeatPulse(metadata?.tempo, isPlaying && isEnabled);

  // Animation intensity based on energy
  const energyIntensity = metadata?.energy ?? 0.5;

  if (!isEnabled || !mounted) return null;

  return (
    <div className={`audio-cinema-layer fixed inset-0 pointer-events-none z-0 ${className}`}>
      {/* Base ambient glow */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${colors.primary} 0%, transparent 60%)`,
        }}
        animate={{
          opacity: isPlaying ? [0.3, 0.5 * energyIntensity, 0.3] : 0.2,
          scale: isPlaying ? [1, 1.02, 1] : 1,
        }}
        transition={{
          duration: isPlaying ? 2 / energyIntensity : 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Secondary moving gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 30% 70%, ${colors.secondary} 0%, transparent 50%)`,
        }}
        animate={{
          opacity: isPlaying ? [0.2, 0.4, 0.2] : 0.1,
          x: isPlaying ? [-20, 20, -20] : 0,
        }}
        transition={{
          duration: isPlaying ? 4 / energyIntensity : 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Beat pulse overlay */}
      <AnimatePresence>
        {isBeat && isPlaying && (
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${colors.accent} 0%, transparent 40%)`,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.6 * intensity, scale: 1.1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>

      {/* Top edge glow */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-32"
        style={{
          background: `linear-gradient(to bottom, ${colors.primary} 0%, transparent 100%)`,
        }}
        animate={{
          opacity: isPlaying ? 0.2 * intensity : 0.1,
        }}
      />

      {/* Vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.3) 100%)',
          opacity: isPlaying ? 0.5 : 0.3,
        }}
      />
    </div>
  );
}

/**
 * Audio Reactive Visualizer Bars
 * Decorative frequency bars (not real audio data)
 */
interface AudioBarsProps {
  barCount?: number;
  isPlaying?: boolean;
  mood?: AudioMood;
  className?: string;
}

export function AudioBars({
  barCount = 5,
  isPlaying = false,
  mood = 'neutral',
  className = '',
}: AudioBarsProps) {
  const cinematic = useCinematicSafe();
  const shouldReduceMotion = useReducedMotion();

  const isEnabled = !shouldReduceMotion && (cinematic?.isEnabled ?? true);
  const colors = moodColors[mood];

  if (!isEnabled) return null;

  return (
    <div className={`audio-bars flex items-end gap-1 h-8 ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ backgroundColor: colors.primary.replace('0.3', '0.8') }}
          animate={{
            height: isPlaying 
              ? [`${20 + Math.random() * 30}%`, `${50 + Math.random() * 50}%`, `${20 + Math.random() * 30}%`]
              : '20%',
          }}
          transition={{
            duration: 0.4 + i * 0.1,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Hook to integrate audio cinema with Spotify context
 */
export function useAudioCinema() {
  const [metadata, setMetadata] = useState<TrackMetadata | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);

  // These would be connected to actual Spotify state
  const updateFromSpotify = useCallback((spotifyState: {
    isPlaying: boolean;
    track?: {
      name?: string;
      artist?: string;
    };
  }) => {
    setIsPlaying(spotifyState.isPlaying);
    if (spotifyState.track) {
      setMetadata({
        name: spotifyState.track.name,
        artist: spotifyState.track.artist,
        // Default values - could be enhanced with Spotify audio features API
        tempo: 120,
        energy: 0.6,
        valence: 0.5,
      });
    }
  }, []);

  return {
    metadata,
    isPlaying,
    mood: deriveMood(metadata),
    updateFromSpotify,
  };
}

export default AudioCinemaLayer;
