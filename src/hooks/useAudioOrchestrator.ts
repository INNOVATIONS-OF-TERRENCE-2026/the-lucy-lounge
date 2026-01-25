/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — UNIFIED AUDIO ORCHESTRATOR HOOK                          │
 * │                                                                             │
 * │ React hook to control all audio sources from one interface                 │
 * │ Spotify, Podcasts, Audiobooks — all through Lucy.                         │
 * │                                                                             │
 * │ One API to rule them all.                                                  │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getAudioOrchestrator, 
  type AudioOrchestrator 
} from '@/audio/AudioOrchestrator';
import type { 
  AudioTrack, 
  QueueState, 
  OrchestratorEvent,
  PlaybackSnapshot 
} from '@/audio/types';
import { 
  getCrossDeviceSync, 
  initializeCrossDeviceSync 
} from '@/audio/CrossDeviceSync';
import { getTemporalEngine, type TemporalContext } from '@/audio/TemporalEngine';

// =============================================================================
// HOOK TYPES
// =============================================================================

export interface UseAudioOrchestratorReturn {
  // State
  isPlaying: boolean;
  currentTrack: AudioTrack | null;
  queue: QueueState;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Temporal context
  temporalContext: TemporalContext;
  
  // Playback controls
  play: (track?: AudioTrack) => Promise<void>;
  pause: () => void;
  resume: () => Promise<void>;
  stop: () => void;
  
  // Navigation
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seekTo: (position: number) => void;
  
  // Volume
  setVolume: (level: number) => void;
  mute: () => void;
  unmute: () => void;
  toggleMute: () => void;
  
  // Queue management
  addToQueue: (tracks: AudioTrack | AudioTrack[]) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  
  // Shuffle & Repeat
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  
  // Cross-device
  syncToCloud: () => Promise<void>;
  resumeFromCloud: () => Promise<AudioTrack | null>;
  transferToDevice: (deviceId: string) => Promise<void>;
  
  // Snapshot
  getPlaybackSnapshot: () => PlaybackSnapshot;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useAudioOrchestrator(): UseAudioOrchestratorReturn {
  // References
  const orchestratorRef = useRef<AudioOrchestrator | null>(null);
  const temporalEngineRef = useRef(getTemporalEngine());
  
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [queue, setQueue] = useState<QueueState>({
    tracks: [],
    currentIndex: -1,
    shuffled: false,
    repeatMode: 'none',
    history: [],
  });
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [temporalContext, setTemporalContext] = useState<TemporalContext>(
    temporalEngineRef.current.getContext()
  );
  
  // Initialize orchestrator
  useEffect(() => {
    orchestratorRef.current = getAudioOrchestrator();
    
    // Event handler
    const handleEvent = (event: OrchestratorEvent) => {
      switch (event.type) {
        case 'play':
          setIsPlaying(true);
          setIsLoading(false);
          if (event.track) setCurrentTrack(event.track);
          break;
          
        case 'pause':
          setIsPlaying(false);
          break;
          
        case 'stop':
          setIsPlaying(false);
          setCurrentTrack(null);
          setProgress(0);
          break;
          
        case 'trackChange':
          if (event.track) setCurrentTrack(event.track);
          setProgress(0);
          break;
          
        case 'progress':
          if (typeof event.position === 'number') {
            setProgress(event.position);
          }
          break;
          
        case 'queueUpdate':
          if (event.queue) setQueue(event.queue);
          break;
          
        case 'volumeChange':
          if (typeof event.volume === 'number') {
            setVolumeState(event.volume);
          }
          break;
          
        case 'error':
          setError(event.error || 'Unknown error');
          setIsLoading(false);
          break;
          
        case 'loading':
          setIsLoading(true);
          break;
          
        case 'ended':
          // Auto-advance handled by orchestrator
          break;
      }
    };
    
    // Subscribe to events
    orchestratorRef.current.on(handleEvent);
    
    // Initialize with current state
    const snapshot = orchestratorRef.current.getPlaybackSnapshot();
    setIsPlaying(snapshot.isPlaying);
    setCurrentTrack(snapshot.track);
    setQueue(snapshot.queue);
    setProgress(snapshot.position);
    setVolumeState(snapshot.volume);
    
    // Update temporal context periodically
    const temporalInterval = setInterval(() => {
      setTemporalContext(temporalEngineRef.current.getContext());
    }, 60000);
    
    return () => {
      orchestratorRef.current?.off(handleEvent);
      clearInterval(temporalInterval);
    };
  }, []);
  
  // Update duration when track changes
  useEffect(() => {
    if (currentTrack?.duration) {
      setDuration(currentTrack.duration);
    }
  }, [currentTrack]);
  
  // ===========================================================================
  // PLAYBACK CONTROLS
  // ===========================================================================
  
  const play = useCallback(async (track?: AudioTrack) => {
    if (!orchestratorRef.current) return;
    setError(null);
    
    try {
      if (track) {
        await orchestratorRef.current.play(track);
      } else if (currentTrack) {
        await orchestratorRef.current.resume();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Playback failed');
    }
  }, [currentTrack]);
  
  const pause = useCallback(() => {
    orchestratorRef.current?.pause();
  }, []);
  
  const resume = useCallback(async () => {
    try {
      await orchestratorRef.current?.resume();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resume failed');
    }
  }, []);
  
  const stop = useCallback(() => {
    orchestratorRef.current?.stop();
  }, []);
  
  // ===========================================================================
  // NAVIGATION
  // ===========================================================================
  
  const next = useCallback(async () => {
    try {
      await orchestratorRef.current?.next();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Next track failed');
    }
  }, []);
  
  const previous = useCallback(async () => {
    try {
      await orchestratorRef.current?.previous();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Previous track failed');
    }
  }, []);
  
  const seekTo = useCallback((position: number) => {
    orchestratorRef.current?.seekTo(position);
    setProgress(position);
  }, []);
  
  // ===========================================================================
  // VOLUME
  // ===========================================================================
  
  const setVolume = useCallback((level: number) => {
    orchestratorRef.current?.setVolume(level);
    setVolumeState(level);
    if (level > 0) setIsMuted(false);
  }, []);
  
  const mute = useCallback(() => {
    orchestratorRef.current?.setVolume(0);
    setIsMuted(true);
  }, []);
  
  const unmute = useCallback(() => {
    const previousVolume = volume > 0 ? volume : 1;
    orchestratorRef.current?.setVolume(previousVolume);
    setIsMuted(false);
  }, [volume]);
  
  const toggleMute = useCallback(() => {
    if (isMuted) {
      unmute();
    } else {
      mute();
    }
  }, [isMuted, mute, unmute]);
  
  // ===========================================================================
  // QUEUE MANAGEMENT
  // ===========================================================================
  
  const addToQueue = useCallback((tracks: AudioTrack | AudioTrack[]) => {
    orchestratorRef.current?.addToQueue(tracks);
  }, []);
  
  const removeFromQueue = useCallback((index: number) => {
    orchestratorRef.current?.removeFromQueue(index);
  }, []);
  
  const clearQueue = useCallback(() => {
    orchestratorRef.current?.clearQueue();
  }, []);
  
  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    orchestratorRef.current?.reorderQueue(fromIndex, toIndex);
  }, []);
  
  // ===========================================================================
  // SHUFFLE & REPEAT
  // ===========================================================================
  
  const toggleShuffle = useCallback(() => {
    orchestratorRef.current?.toggleShuffle();
  }, []);
  
  const toggleRepeat = useCallback(() => {
    orchestratorRef.current?.toggleRepeat();
  }, []);
  
  // ===========================================================================
  // CROSS-DEVICE
  // ===========================================================================
  
  const syncToCloud = useCallback(async () => {
    const sync = getCrossDeviceSync();
    if (!sync) {
      console.warn('[useAudioOrchestrator] CrossDeviceSync not initialized');
      return;
    }
    
    const snapshot = orchestratorRef.current?.getPlaybackSnapshot();
    if (snapshot) {
      await sync.syncPlayback(snapshot, true);
    }
  }, []);
  
  const resumeFromCloud = useCallback(async (): Promise<AudioTrack | null> => {
    const sync = getCrossDeviceSync();
    if (!sync) return null;
    
    const track = await sync.resumeFromCloud();
    return track;
  }, []);
  
  const transferToDevice = useCallback(async (deviceId: string) => {
    const sync = getCrossDeviceSync();
    if (!sync) return;
    
    const snapshot = orchestratorRef.current?.getPlaybackSnapshot();
    if (snapshot) {
      await sync.transferTo(deviceId, snapshot);
      // Pause local playback
      pause();
    }
  }, [pause]);
  
  // ===========================================================================
  // SNAPSHOT
  // ===========================================================================
  
  const getPlaybackSnapshot = useCallback((): PlaybackSnapshot => {
    return orchestratorRef.current?.getPlaybackSnapshot() || {
      track: null,
      position: 0,
      isPlaying: false,
      queue: { tracks: [], currentIndex: -1, shuffled: false, repeatMode: 'none', history: [] },
      volume: 1,
      timestamp: Date.now(),
    };
  }, []);
  
  return {
    // State
    isPlaying,
    currentTrack,
    queue,
    progress,
    duration,
    volume,
    isMuted,
    isLoading,
    error,
    temporalContext,
    
    // Playback controls
    play,
    pause,
    resume,
    stop,
    
    // Navigation
    next,
    previous,
    seekTo,
    
    // Volume
    setVolume,
    mute,
    unmute,
    toggleMute,
    
    // Queue management
    addToQueue,
    removeFromQueue,
    clearQueue,
    reorderQueue,
    
    // Shuffle & Repeat
    toggleShuffle,
    toggleRepeat,
    
    // Cross-device
    syncToCloud,
    resumeFromCloud,
    transferToDevice,
    
    // Snapshot
    getPlaybackSnapshot,
  };
}

// =============================================================================
// INITIALIZATION HELPER
// =============================================================================

export async function initializeAudioSystem(userId: string): Promise<void> {
  // Initialize cross-device sync
  await initializeCrossDeviceSync(userId);
  
  // Get orchestrator (lazy initialization)
  getAudioOrchestrator();
  
  console.log('[AudioSystem] Initialized for user:', userId);
}
