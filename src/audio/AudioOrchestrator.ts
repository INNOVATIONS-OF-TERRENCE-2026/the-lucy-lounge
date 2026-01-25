/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — UNIFIED AUDIO ORCHESTRATOR                               │
 * │                                                                             │
 * │ The intelligence layer that unifies all audio sources                      │
 * │ into a single, seamless listening experience                               │
 * │                                                                             │
 * │ Lucy doesn't compete for content.                                          │
 * │ Lucy owns the relationship between humans and audio.                       │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import type {
  AudioTrack,
  AudioSourceType,
  PlaybackState,
  RepeatMode,
  QueueState,
  PlaybackSnapshot,
  OrchestratorEvent,
  OrchestratorEventListener,
  AudioSourceAdapter,
  ListeningSession,
} from './types';

// =============================================================================
// ORCHESTRATOR CONFIGURATION
// =============================================================================

export interface OrchestratorConfig {
  // Crossfade settings
  crossfadeEnabled: boolean;
  crossfadeDuration: number;        // ms
  
  // Gapless playback
  gaplessEnabled: boolean;
  preloadNextTrack: boolean;
  
  // Volume normalization
  normalizeVolume: boolean;
  targetLoudness: number;           // LUFS
  
  // Offline
  offlineCacheEnabled: boolean;
  maxCacheSize: number;             // MB
  
  // Session
  sessionTimeoutMinutes: number;
}

const DEFAULT_CONFIG: OrchestratorConfig = {
  crossfadeEnabled: true,
  crossfadeDuration: 3000,
  gaplessEnabled: true,
  preloadNextTrack: true,
  normalizeVolume: true,
  targetLoudness: -14,
  offlineCacheEnabled: true,
  maxCacheSize: 500,
  sessionTimeoutMinutes: 30,
};

// =============================================================================
// AUDIO ORCHESTRATOR IMPLEMENTATION
// =============================================================================

export class AudioOrchestrator {
  private config: OrchestratorConfig;
  private adapters: Map<AudioSourceType, AudioSourceAdapter> = new Map();
  private listeners: Set<OrchestratorEventListener> = new Set();
  
  // Current state
  private currentTrack: AudioTrack | null = null;
  private currentAdapter: AudioSourceAdapter | null = null;
  private playbackState: PlaybackState = 'idle';
  private position: number = 0;
  private volume: number = 0.8;
  private muted: boolean = false;
  private repeat: RepeatMode = 'none';
  private shuffle: boolean = false;
  
  // Queue management
  private queue: QueueState = {
    tracks: [],
    currentIndex: -1,
    history: [],
    source: 'user',
  };
  
  // Native audio element (for podcast, audiobook, ambient, uploads)
  private audioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  
  // Session tracking
  private currentSession: ListeningSession | null = null;
  private sessionStartTime: number = 0;
  
  // Crossfade
  private isCrossfading: boolean = false;
  private crossfadeAudio: HTMLAudioElement | null = null;
  
  // Position tracking interval
  private positionInterval: number | null = null;
  
  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeAudioElements();
  }
  
  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================
  
  private initializeAudioElements(): void {
    if (typeof window === 'undefined') return;
    
    // Primary audio element
    this.audioElement = new Audio();
    this.audioElement.preload = 'auto';
    this.audioElement.crossOrigin = 'anonymous';
    
    // Event listeners
    this.audioElement.addEventListener('play', () => this.handleNativePlay());
    this.audioElement.addEventListener('pause', () => this.handleNativePause());
    this.audioElement.addEventListener('ended', () => this.handleNativeEnded());
    this.audioElement.addEventListener('error', (e) => this.handleNativeError(e));
    this.audioElement.addEventListener('loadedmetadata', () => this.handleLoadedMetadata());
    this.audioElement.addEventListener('timeupdate', () => this.handleTimeUpdate());
    this.audioElement.addEventListener('waiting', () => this.handleBuffering(true));
    this.audioElement.addEventListener('canplay', () => this.handleBuffering(false));
    
    // Crossfade audio element
    this.crossfadeAudio = new Audio();
    this.crossfadeAudio.preload = 'auto';
    this.crossfadeAudio.crossOrigin = 'anonymous';
    
    // Initialize Web Audio API for advanced features
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    } catch (e) {
      console.warn('[AudioOrchestrator] Web Audio API not available');
    }
    
    // Position tracking
    this.startPositionTracking();
  }
  
  /**
   * Register an audio source adapter
   */
  registerAdapter(adapter: AudioSourceAdapter): void {
    this.adapters.set(adapter.source, adapter);
  }
  
  /**
   * Initialize all registered adapters
   */
  async initializeAdapters(): Promise<void> {
    const initPromises = Array.from(this.adapters.values()).map(async (adapter) => {
      try {
        await adapter.initialize();
        console.log(`[AudioOrchestrator] Initialized ${adapter.displayName}`);
      } catch (e) {
        console.error(`[AudioOrchestrator] Failed to initialize ${adapter.displayName}:`, e);
      }
    });
    
    await Promise.all(initPromises);
  }
  
  // ===========================================================================
  // PLAYBACK CONTROL
  // ===========================================================================
  
  /**
   * Play a track
   */
  async play(track: AudioTrack, startPosition?: number): Promise<boolean> {
    console.log(`[AudioOrchestrator] Play: ${track.title} (${track.source})`);
    
    // Get the appropriate adapter
    const adapter = this.adapters.get(track.source);
    
    // Crossfade from current track
    if (this.config.crossfadeEnabled && this.currentTrack && this.playbackState === 'playing') {
      this.startCrossfade(track, startPosition);
      return true;
    }
    
    // Stop current playback
    await this.stop();
    
    // Update state
    const previousTrack = this.currentTrack;
    this.currentTrack = track;
    this.currentAdapter = adapter || null;
    this.playbackState = 'loading';
    this.emit({ type: 'trackChange', from: previousTrack, to: track });
    
    // Handle based on source type
    try {
      if (track.source === 'spotify') {
        // Spotify uses iframe - we can't directly control playback
        // But we track state and provide UI integration
        this.playbackState = 'playing';
        this.emit({ type: 'play', track });
        return true;
      }
      
      // For all other sources, use native audio
      if (track.playbackUrl && this.audioElement) {
        this.audioElement.src = track.playbackUrl;
        if (startPosition) {
          this.audioElement.currentTime = startPosition;
        }
        await this.audioElement.play();
        this.playbackState = 'playing';
        this.emit({ type: 'play', track });
        this.startSession(track);
        return true;
      }
      
      // Try adapter-specific playback
      if (adapter && adapter.canControlPlayback) {
        const success = await adapter.play(track, startPosition);
        if (success) {
          this.playbackState = 'playing';
          this.emit({ type: 'play', track });
          this.startSession(track);
          return true;
        }
      }
      
      // Fallback: open deep link
      if (track.deepLinkUrl) {
        window.open(track.deepLinkUrl, '_blank');
        return true;
      }
      
      throw new Error('No playback method available');
      
    } catch (error) {
      this.playbackState = 'error';
      this.emit({ type: 'error', error: String(error), track });
      return false;
    }
  }
  
  /**
   * Pause playback
   */
  async pause(): Promise<void> {
    if (this.playbackState !== 'playing') return;
    
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
    }
    
    if (this.currentAdapter?.canControlPlayback) {
      await this.currentAdapter.pause();
    }
    
    this.playbackState = 'paused';
    this.emit({ type: 'pause' });
  }
  
  /**
   * Resume playback
   */
  async resume(): Promise<void> {
    if (this.playbackState !== 'paused') return;
    
    if (this.audioElement && this.audioElement.paused && this.audioElement.src) {
      await this.audioElement.play();
    }
    
    if (this.currentAdapter?.canControlPlayback) {
      await this.currentAdapter.resume();
    }
    
    this.playbackState = 'playing';
    this.emit({ type: 'resume' });
  }
  
  /**
   * Toggle play/pause
   */
  async togglePlayback(): Promise<void> {
    if (this.playbackState === 'playing') {
      await this.pause();
    } else if (this.playbackState === 'paused') {
      await this.resume();
    } else if (this.currentTrack) {
      await this.play(this.currentTrack);
    }
  }
  
  /**
   * Stop playback completely
   */
  async stop(): Promise<void> {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement.src = '';
    }
    
    if (this.currentAdapter?.canControlPlayback) {
      await this.currentAdapter.stop();
    }
    
    this.playbackState = 'idle';
    this.position = 0;
    this.endSession();
    this.emit({ type: 'stop' });
  }
  
  /**
   * Seek to position
   */
  async seek(position: number): Promise<void> {
    if (this.audioElement && this.audioElement.src) {
      this.audioElement.currentTime = position;
    }
    
    if (this.currentAdapter?.canSeek) {
      await this.currentAdapter.seek(position);
    }
    
    this.position = position;
    this.emit({ type: 'seek', position });
  }
  
  // ===========================================================================
  // QUEUE MANAGEMENT
  // ===========================================================================
  
  /**
   * Set the queue
   */
  setQueue(tracks: AudioTrack[], options?: {
    startIndex?: number;
    source?: QueueState['source'];
    mood?: string;
    journeyId?: string;
    shuffle?: boolean;
  }): void {
    let processedTracks = [...tracks];
    
    if (options?.shuffle) {
      processedTracks = this.shuffleArray(processedTracks);
    }
    
    this.queue = {
      tracks: processedTracks,
      currentIndex: options?.startIndex ?? 0,
      history: [],
      source: options?.source ?? 'user',
      mood: options?.mood,
      journeyId: options?.journeyId,
    };
    
    this.shuffle = options?.shuffle ?? false;
    this.emit({ type: 'queueChange', queue: this.queue });
  }
  
  /**
   * Add tracks to queue
   */
  addToQueue(tracks: AudioTrack[], position: 'next' | 'end' = 'end'): void {
    if (position === 'next') {
      const insertIndex = this.queue.currentIndex + 1;
      this.queue.tracks.splice(insertIndex, 0, ...tracks);
    } else {
      this.queue.tracks.push(...tracks);
    }
    
    this.emit({ type: 'queueChange', queue: this.queue });
  }
  
  /**
   * Remove track from queue
   */
  removeFromQueue(index: number): void {
    if (index < 0 || index >= this.queue.tracks.length) return;
    
    this.queue.tracks.splice(index, 1);
    
    if (index < this.queue.currentIndex) {
      this.queue.currentIndex--;
    } else if (index === this.queue.currentIndex && this.queue.currentIndex >= this.queue.tracks.length) {
      this.queue.currentIndex = Math.max(0, this.queue.tracks.length - 1);
    }
    
    this.emit({ type: 'queueChange', queue: this.queue });
  }
  
  /**
   * Clear the queue
   */
  clearQueue(): void {
    this.queue = {
      tracks: [],
      currentIndex: -1,
      history: [],
      source: 'user',
    };
    this.emit({ type: 'queueChange', queue: this.queue });
  }
  
  /**
   * Skip to next track
   */
  async next(): Promise<void> {
    if (this.queue.tracks.length === 0) return;
    
    // Add current to history
    if (this.currentTrack) {
      this.queue.history.push(this.currentTrack.id);
    }
    
    // Determine next index
    let nextIndex = this.queue.currentIndex + 1;
    
    if (nextIndex >= this.queue.tracks.length) {
      if (this.repeat === 'all') {
        nextIndex = 0;
      } else {
        await this.stop();
        return;
      }
    }
    
    this.queue.currentIndex = nextIndex;
    const nextTrack = this.queue.tracks[nextIndex];
    
    if (nextTrack) {
      await this.play(nextTrack);
    }
  }
  
  /**
   * Skip to previous track
   */
  async previous(): Promise<void> {
    // If more than 3 seconds in, restart current track
    if (this.position > 3) {
      await this.seek(0);
      return;
    }
    
    // Go to previous in history or queue
    if (this.queue.history.length > 0) {
      const previousId = this.queue.history.pop();
      const previousTrack = this.queue.tracks.find(t => t.id === previousId);
      if (previousTrack) {
        const previousIndex = this.queue.tracks.indexOf(previousTrack);
        if (previousIndex !== -1) {
          this.queue.currentIndex = previousIndex;
          await this.play(previousTrack);
          return;
        }
      }
    }
    
    // Just restart current track
    await this.seek(0);
  }
  
  /**
   * Play track at specific queue index
   */
  async playAtIndex(index: number): Promise<void> {
    if (index < 0 || index >= this.queue.tracks.length) return;
    
    this.queue.currentIndex = index;
    const track = this.queue.tracks[index];
    if (track) {
      await this.play(track);
    }
  }
  
  // ===========================================================================
  // VOLUME CONTROL
  // ===========================================================================
  
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    
    if (this.audioElement) {
      this.audioElement.volume = this.muted ? 0 : this.volume;
    }
    
    if (this.gainNode) {
      this.gainNode.gain.value = this.muted ? 0 : this.volume;
    }
    
    this.emit({ type: 'volumeChange', volume: this.volume });
  }
  
  setMuted(muted: boolean): void {
    this.muted = muted;
    
    if (this.audioElement) {
      this.audioElement.volume = muted ? 0 : this.volume;
    }
    
    if (this.gainNode) {
      this.gainNode.gain.value = muted ? 0 : this.volume;
    }
  }
  
  // ===========================================================================
  // PLAYBACK OPTIONS
  // ===========================================================================
  
  setRepeat(mode: RepeatMode): void {
    this.repeat = mode;
    
    if (this.audioElement) {
      this.audioElement.loop = mode === 'one';
    }
  }
  
  setShuffle(enabled: boolean): void {
    this.shuffle = enabled;
    
    if (enabled && this.queue.tracks.length > 0) {
      // Reshuffle remaining tracks
      const played = this.queue.tracks.slice(0, this.queue.currentIndex + 1);
      const remaining = this.queue.tracks.slice(this.queue.currentIndex + 1);
      const shuffled = this.shuffleArray(remaining);
      this.queue.tracks = [...played, ...shuffled];
      this.emit({ type: 'queueChange', queue: this.queue });
    }
  }
  
  // ===========================================================================
  // CROSSFADE
  // ===========================================================================
  
  private async startCrossfade(nextTrack: AudioTrack, startPosition?: number): Promise<void> {
    if (!this.audioElement || !this.crossfadeAudio) return;
    if (nextTrack.source === 'spotify') return; // Can't crossfade Spotify
    
    this.isCrossfading = true;
    
    // Prepare crossfade audio
    if (nextTrack.playbackUrl) {
      this.crossfadeAudio.src = nextTrack.playbackUrl;
      this.crossfadeAudio.volume = 0;
      if (startPosition) {
        this.crossfadeAudio.currentTime = startPosition;
      }
      
      // Start crossfade
      const duration = this.config.crossfadeDuration;
      const steps = 20;
      const stepDuration = duration / steps;
      
      // Start playing new track silently
      await this.crossfadeAudio.play();
      
      // Fade volumes
      for (let i = 0; i <= steps; i++) {
        await new Promise(resolve => setTimeout(resolve, stepDuration));
        const progress = i / steps;
        this.audioElement.volume = (1 - progress) * this.volume;
        this.crossfadeAudio.volume = progress * this.volume;
      }
      
      // Swap elements
      const oldAudio = this.audioElement;
      this.audioElement = this.crossfadeAudio;
      this.crossfadeAudio = oldAudio;
      
      // Stop old audio
      this.crossfadeAudio.pause();
      this.crossfadeAudio.src = '';
      
      // Update state
      this.currentTrack = nextTrack;
      this.emit({ type: 'trackChange', from: this.currentTrack, to: nextTrack });
      this.emit({ type: 'play', track: nextTrack });
    }
    
    this.isCrossfading = false;
  }
  
  // ===========================================================================
  // SESSION TRACKING
  // ===========================================================================
  
  private startSession(track: AudioTrack): void {
    this.sessionStartTime = Date.now();
    this.currentSession = {
      id: crypto.randomUUID(),
      userId: '', // Will be set by sync layer
      startedAt: new Date().toISOString(),
      tracks: [{
        trackId: track.id,
        startedAt: new Date().toISOString(),
        completionPercentage: 0,
        skipped: false,
      }],
      source: this.queue.source === 'lucy' ? 'lucy_suggestion' : 'manual',
      mood: this.queue.mood,
      journeyId: this.queue.journeyId,
      deviceId: this.getDeviceId(),
      deviceType: this.getDeviceType(),
    };
  }
  
  private endSession(): void {
    if (this.currentSession) {
      this.currentSession.endedAt = new Date().toISOString();
      // Session will be synced to Supabase
      this.currentSession = null;
    }
  }
  
  private getDeviceId(): string {
    if (typeof window === 'undefined') return 'server';
    let deviceId = localStorage.getItem('lucy_device_id');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('lucy_device_id', deviceId);
    }
    return deviceId;
  }
  
  private getDeviceType(): string {
    if (typeof window === 'undefined') return 'server';
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) return 'mobile';
    if (/Android/.test(ua)) return 'mobile';
    if (/Mac|Windows|Linux/.test(ua)) return 'desktop';
    return 'web';
  }
  
  // ===========================================================================
  // NATIVE AUDIO EVENT HANDLERS
  // ===========================================================================
  
  private handleNativePlay(): void {
    this.playbackState = 'playing';
  }
  
  private handleNativePause(): void {
    if (!this.isCrossfading) {
      this.playbackState = 'paused';
    }
  }
  
  private handleNativeEnded(): void {
    if (this.repeat === 'one') {
      this.audioElement?.play();
      return;
    }
    
    this.emit({ type: 'trackEnd', track: this.currentTrack! });
    
    // Auto-play next
    this.next();
  }
  
  private handleNativeError(event: Event): void {
    console.error('[AudioOrchestrator] Playback error:', event);
    this.playbackState = 'error';
    this.emit({ type: 'error', error: 'Playback failed', track: this.currentTrack || undefined });
  }
  
  private handleLoadedMetadata(): void {
    if (this.audioElement && this.currentTrack) {
      this.currentTrack.duration = this.audioElement.duration;
    }
  }
  
  private handleTimeUpdate(): void {
    if (this.audioElement) {
      this.position = this.audioElement.currentTime;
    }
  }
  
  private handleBuffering(isBuffering: boolean): void {
    if (isBuffering) {
      this.emit({ type: 'buffering', progress: 0 });
    }
  }
  
  // ===========================================================================
  // POSITION TRACKING
  // ===========================================================================
  
  private startPositionTracking(): void {
    if (typeof window === 'undefined') return;
    
    this.positionInterval = window.setInterval(() => {
      if (this.audioElement && this.playbackState === 'playing') {
        this.position = this.audioElement.currentTime;
      }
    }, 1000);
  }
  
  // ===========================================================================
  // EVENT SYSTEM
  // ===========================================================================
  
  addEventListener(listener: OrchestratorEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  private emit(event: OrchestratorEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (e) {
        console.error('[AudioOrchestrator] Event listener error:', e);
      }
    });
  }
  
  // ===========================================================================
  // STATE GETTERS
  // ===========================================================================
  
  getSnapshot(): PlaybackSnapshot {
    return {
      track: this.currentTrack,
      state: this.playbackState,
      position: this.position,
      duration: this.currentTrack?.duration ?? 0,
      volume: this.volume,
      muted: this.muted,
      repeat: this.repeat,
      shuffle: this.shuffle,
      spotifyActive: this.currentTrack?.source === 'spotify',
      nativeAudioActive: this.currentTrack?.source !== 'spotify' && this.playbackState === 'playing',
    };
  }
  
  getQueue(): QueueState {
    return { ...this.queue };
  }
  
  getCurrentTrack(): AudioTrack | null {
    return this.currentTrack;
  }
  
  // ===========================================================================
  // UTILITIES
  // ===========================================================================
  
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // ===========================================================================
  // CLEANUP
  // ===========================================================================
  
  dispose(): void {
    if (this.positionInterval) {
      clearInterval(this.positionInterval);
    }
    
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }
    
    if (this.crossfadeAudio) {
      this.crossfadeAudio.pause();
      this.crossfadeAudio.src = '';
    }
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    this.adapters.forEach(adapter => adapter.dispose());
    this.adapters.clear();
    this.listeners.clear();
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let orchestratorInstance: AudioOrchestrator | null = null;

export function getAudioOrchestrator(config?: Partial<OrchestratorConfig>): AudioOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AudioOrchestrator(config);
  }
  return orchestratorInstance;
}

export function resetAudioOrchestrator(): void {
  if (orchestratorInstance) {
    orchestratorInstance.dispose();
    orchestratorInstance = null;
  }
}
