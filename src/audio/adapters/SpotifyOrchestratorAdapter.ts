/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — SPOTIFY ORCHESTRATOR ADAPTER                             │
 * │                                                                             │
 * │ Bridges existing Spotify iframe system with Audio Orchestrator             │
 * │ Maintains iframe playback while providing unified interface                │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import type {
  AudioTrack,
  AudioSourceType,
  AudioSourceAdapter,
  PlaybackState,
} from '../types';

// =============================================================================
// SPOTIFY ADAPTER IMPLEMENTATION
// =============================================================================

/**
 * SpotifyOrchestratorAdapter bridges the existing Spotify iframe system
 * with the unified Audio Orchestrator.
 * 
 * NOTE: Spotify playback is handled by iframe embed - we can't directly control
 * playback. This adapter provides metadata and state tracking while actual
 * playback continues through GlobalSpotifyContext.
 */
export class SpotifyOrchestratorAdapter implements AudioSourceAdapter {
  readonly source: AudioSourceType = 'spotify';
  readonly displayName = 'Spotify';
  readonly supportsOffline = false;
  readonly requiresAuth = true;  // Full playback requires Spotify Premium
  readonly canSeek = false;       // Can't control iframe playback
  readonly canControlPlayback = false;
  
  private currentTrack: AudioTrack | null = null;
  private state: PlaybackState = 'idle';
  private spotifyContextCallback: ((contentId: string, genre: string, type: 'playlist' | 'album' | 'track') => void) | null = null;
  
  async initialize(): Promise<boolean> {
    console.log('[SpotifyOrchestratorAdapter] Initialized');
    return true;
  }
  
  dispose(): void {
    this.spotifyContextCallback = null;
  }
  
  /**
   * Register callback to GlobalSpotifyContext
   * This allows the orchestrator to trigger Spotify playback through the existing system
   */
  setSpotifyContextCallback(callback: (contentId: string, genre: string, type: 'playlist' | 'album' | 'track') => void): void {
    this.spotifyContextCallback = callback;
  }
  
  // ===========================================================================
  // PLAYBACK CONTROL
  // ===========================================================================
  
  async play(track: AudioTrack, _position?: number): Promise<boolean> {
    if (!track.sourceId) return false;
    
    // Parse Spotify ID
    const [type, id] = this.parseSpotifyId(track.sourceId);
    if (!type || !id) return false;
    
    // Delegate to GlobalSpotifyContext
    if (this.spotifyContextCallback) {
      this.spotifyContextCallback(id, track.genre || 'music', type as 'playlist' | 'album' | 'track');
      this.currentTrack = track;
      this.state = 'playing';
      return true;
    }
    
    // Fallback: open in new tab
    if (track.deepLinkUrl) {
      window.open(track.deepLinkUrl, '_blank');
      return true;
    }
    
    return false;
  }
  
  async pause(): Promise<void> {
    // Can't control iframe playback
    this.state = 'paused';
  }
  
  async resume(): Promise<void> {
    // Can't control iframe playback
    this.state = 'playing';
  }
  
  async seek(_position: number): Promise<void> {
    // Can't control iframe playback
  }
  
  async stop(): Promise<void> {
    this.state = 'idle';
    this.currentTrack = null;
  }
  
  async getPosition(): Promise<number> {
    return 0; // Can't get iframe position
  }
  
  async getDuration(): Promise<number> {
    return this.currentTrack?.duration ?? 0;
  }
  
  getState(): PlaybackState {
    return this.state;
  }
  
  // ===========================================================================
  // STATE SYNC (from GlobalSpotifyContext)
  // ===========================================================================
  
  /**
   * Update internal state when Spotify context changes
   */
  updateFromSpotifyContext(isPlaying: boolean, contentId?: string, genre?: string): void {
    this.state = isPlaying ? 'playing' : 'idle';
    
    if (contentId && this.currentTrack?.sourceId !== contentId) {
      // Track changed externally
      this.currentTrack = {
        id: `spotify_${contentId}`,
        source: 'spotify',
        sourceId: contentId,
        title: 'Spotify Content', // Would need API call for metadata
        genre,
        embedUrl: `https://open.spotify.com/embed/${contentId.includes(':') ? contentId.replace(':', '/') : `track/${contentId}`}`,
        deepLinkUrl: `https://open.spotify.com/${contentId.includes(':') ? contentId.replace(':', '/') : `track/${contentId}`}`,
      };
    }
  }
  
  // ===========================================================================
  // TRACK RESOLUTION
  // ===========================================================================
  
  async resolveTrack(sourceId: string): Promise<AudioTrack | null> {
    const [type, id] = this.parseSpotifyId(sourceId);
    if (!type || !id) return null;
    
    return {
      id: `spotify_${id}`,
      source: 'spotify',
      sourceId,
      title: 'Spotify Content',
      embedUrl: `https://open.spotify.com/embed/${type}/${id}`,
      deepLinkUrl: `https://open.spotify.com/${type}/${id}`,
    };
  }
  
  async searchTracks(_query: string, _limit?: number): Promise<AudioTrack[]> {
    // Would require Spotify API integration
    // For now, return empty - searches should go through spotifyAdapter in providers
    return [];
  }
  
  // ===========================================================================
  // HELPERS
  // ===========================================================================
  
  private parseSpotifyId(sourceId: string): [string | null, string | null] {
    // Handle various formats:
    // - track:id
    // - album:id
    // - playlist:id
    // - spotify:track:id
    // - just id (assume track)
    
    if (sourceId.startsWith('spotify:')) {
      const parts = sourceId.split(':');
      return [parts[1], parts[2]];
    }
    
    if (sourceId.includes(':')) {
      const [type, id] = sourceId.split(':');
      return [type, id];
    }
    
    // Assume track
    return ['track', sourceId];
  }
  
  // ===========================================================================
  // UTILITIES
  // ===========================================================================
  
  /**
   * Create AudioTrack from Spotify content
   */
  createTrackFromSpotifyContent(
    contentId: string,
    contentType: 'track' | 'album' | 'playlist',
    metadata?: {
      title?: string;
      artist?: string;
      artwork?: string;
      duration?: number;
      genre?: string;
    }
  ): AudioTrack {
    return {
      id: `spotify_${contentId}`,
      source: 'spotify',
      sourceId: `${contentType}:${contentId}`,
      title: metadata?.title || 'Spotify Content',
      artist: metadata?.artist,
      artwork: metadata?.artwork,
      duration: metadata?.duration,
      genre: metadata?.genre,
      embedUrl: `https://open.spotify.com/embed/${contentType}/${contentId}`,
      deepLinkUrl: `https://open.spotify.com/${contentType}/${contentId}`,
    };
  }
  
  /**
   * Create AudioTrack from existing playlist data
   */
  createTrackFromPlaylist(playlistId: string, playlistName: string, genre: string): AudioTrack {
    return {
      id: `spotify_playlist_${playlistId}`,
      source: 'spotify',
      sourceId: `playlist:${playlistId}`,
      title: playlistName,
      genre,
      embedUrl: `https://open.spotify.com/embed/playlist/${playlistId}`,
      deepLinkUrl: `https://open.spotify.com/playlist/${playlistId}`,
    };
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const spotifyOrchestratorAdapter = new SpotifyOrchestratorAdapter();
