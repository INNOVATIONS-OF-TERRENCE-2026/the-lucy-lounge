/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — UNIFIED AUDIO ORCHESTRATOR TYPES                          │
 * │                                                                             │
 * │ Type system for multi-source audio intelligence                            │
 * │ Netflix + Spotify-level abstraction for audio content                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

// =============================================================================
// AUDIO SOURCE TYPES
// =============================================================================

export type AudioSourceType = 
  | 'spotify'           // Spotify (iframe embed or deep-link)
  | 'podcast_rss'       // Podcast via RSS feed
  | 'audiobook'         // Audiobook (LibriVox, Open Library, Archive.org)
  | 'ambient'           // Ambient/soundscape audio
  | 'user_upload'       // User-owned audio files
  | 'independent'       // Independent artist platforms
  | 'youtube_audio';    // YouTube audio extraction

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error' | 'ended';

export type RepeatMode = 'none' | 'one' | 'all';

// =============================================================================
// AUDIO TRACK (NORMALIZED ACROSS SOURCES)
// =============================================================================

export interface AudioTrack {
  id: string;                    // Internal Lucy ID
  source: AudioSourceType;       // Where this track comes from
  sourceId: string;              // ID in the source system
  
  // Core metadata
  title: string;
  artist?: string;
  album?: string;
  duration?: number;             // Duration in seconds
  artwork?: string;              // Cover art URL
  
  // Playback info
  playbackUrl?: string;          // Direct audio URL (for non-Spotify sources)
  embedUrl?: string;             // Embed URL (Spotify)
  deepLinkUrl?: string;          // Native app deep link
  
  // Lucy intelligence
  mediaNodeId?: string;          // Link to Universal Media Graph
  mood?: string;
  genre?: string;
  energy?: number;               // 0-1 energy level
  
  // Source-specific metadata
  podcastInfo?: {
    feedUrl: string;
    episodeGuid: string;
    publishDate: string;
    showName: string;
  };
  
  audiobookInfo?: {
    bookTitle: string;
    author: string;
    chapter: number;
    totalChapters: number;
    narrator?: string;
  };
  
  // Offline capability
  cachedLocally?: boolean;
  cacheExpiry?: string;
}

// =============================================================================
// UNIFIED QUEUE
// =============================================================================

export interface QueueState {
  tracks: AudioTrack[];
  currentIndex: number;
  history: string[];              // Track IDs that were played
  
  // Queue metadata
  source: 'user' | 'lucy' | 'auto' | 'mood';
  mood?: string;
  journeyId?: string;
}

// =============================================================================
// PLAYBACK STATE
// =============================================================================

export interface PlaybackSnapshot {
  track: AudioTrack | null;
  state: PlaybackState;
  position: number;              // Current position in seconds
  duration: number;
  volume: number;
  muted: boolean;
  repeat: RepeatMode;
  shuffle: boolean;
  
  // Source-specific state
  spotifyActive: boolean;        // Is Spotify iframe the active source?
  nativeAudioActive: boolean;    // Is HTML5 audio the active source?
}

// =============================================================================
// ORCHESTRATOR COMMANDS
// =============================================================================

export interface PlayCommand {
  track: AudioTrack;
  startPosition?: number;        // Resume position
  fadeIn?: boolean;
  crossfade?: boolean;
}

export interface QueueCommand {
  tracks: AudioTrack[];
  insertAt?: 'next' | 'end' | number;
  clearExisting?: boolean;
  shuffle?: boolean;
}

// =============================================================================
// ORCHESTRATOR EVENTS
// =============================================================================

export type OrchestratorEvent =
  | { type: 'play'; track: AudioTrack }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'stop' }
  | { type: 'seek'; position: number }
  | { type: 'trackEnd'; track: AudioTrack }
  | { type: 'trackChange'; from: AudioTrack | null; to: AudioTrack }
  | { type: 'queueChange'; queue: QueueState }
  | { type: 'error'; error: string; track?: AudioTrack }
  | { type: 'sourceSwitch'; from: AudioSourceType; to: AudioSourceType }
  | { type: 'buffering'; progress: number }
  | { type: 'volumeChange'; volume: number };

export type OrchestratorEventListener = (event: OrchestratorEvent) => void;

// =============================================================================
// SOURCE ADAPTER INTERFACE
// =============================================================================

export interface AudioSourceAdapter {
  readonly source: AudioSourceType;
  readonly displayName: string;
  readonly supportsOffline: boolean;
  readonly requiresAuth: boolean;
  readonly canSeek: boolean;
  readonly canControlPlayback: boolean;
  
  // Lifecycle
  initialize(): Promise<boolean>;
  dispose(): void;
  
  // Playback control (for controllable sources)
  play(track: AudioTrack, position?: number): Promise<boolean>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  seek(position: number): Promise<void>;
  stop(): Promise<void>;
  
  // State
  getPosition(): Promise<number>;
  getDuration(): Promise<number>;
  getState(): PlaybackState;
  
  // Track resolution
  resolveTrack(sourceId: string): Promise<AudioTrack | null>;
  searchTracks(query: string, limit?: number): Promise<AudioTrack[]>;
}

// =============================================================================
// CROSS-DEVICE SYNC
// =============================================================================

export interface DeviceState {
  deviceId: string;
  deviceName: string;
  deviceType: 'web' | 'mobile' | 'desktop' | 'tv' | 'speaker';
  isActive: boolean;
  lastSeen: string;
  playbackState?: PlaybackSnapshot;
}

export interface SyncCommand {
  type: 'transfer' | 'push' | 'pull';
  targetDeviceId?: string;
  playbackState: PlaybackSnapshot;
  queue: QueueState;
}

// =============================================================================
// LISTENING SESSION
// =============================================================================

export interface ListeningSession {
  id: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  
  // What was played
  tracks: Array<{
    trackId: string;
    startedAt: string;
    endedAt?: string;
    completionPercentage: number;
    skipped: boolean;
  }>;
  
  // Context
  mood?: string;
  journeyId?: string;
  source: 'manual' | 'lucy_suggestion' | 'mood_match' | 'continue';
  
  // Device
  deviceId: string;
  deviceType: string;
}

// =============================================================================
// TASTE SIGNALS
// =============================================================================

export interface AudioTasteSignal {
  trackId: string;
  mediaNodeId?: string;
  
  // Engagement signals
  playCount: number;
  totalListenTime: number;
  completionRate: number;
  skips: number;
  
  // Explicit signals
  liked: boolean;
  disliked: boolean;
  addedToCollection: boolean;
  shared: boolean;
  
  // Context signals
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: number;
  mood?: string;
  
  // Derived
  engagementScore: number;       // 0-1 composite score
}
