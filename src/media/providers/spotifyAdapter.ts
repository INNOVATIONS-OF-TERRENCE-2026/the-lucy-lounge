// =============================================================================
// THE LUCY LOUNGE - Spotify Provider Adapter
// =============================================================================
// Music playback control via Spotify (requires user auth)
// Embeds work without auth, full playback requires Premium + OAuth
// =============================================================================

import {
  BaseProviderAdapter,
  ProviderInitResult,
  SearchParams,
  SearchResult,
  TrendingParams,
  GenreParams,
  NewReleasesParams,
  PaginationParams,
  CreditWithPerson,
  PlaybackInfo,
  generateCanonicalId,
  extractYear,
  normalizeDuration,
} from './ProviderAdapter';
import type { MediaNode, MediaSeries, MediaAvailability, ProviderType } from '../types';

// =============================================================================
// SPOTIFY API TYPES
// =============================================================================

interface SpotifyTrack {
  id: string;
  name: string;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
  duration_ms: number;
  explicit: boolean;
  preview_url: string | null;
  track_number: number;
  disc_number: number;
  external_ids?: {
    isrc?: string;
  };
  popularity: number;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  album_type: 'album' | 'single' | 'compilation';
  artists: SpotifyArtist[];
  images: SpotifyImage[];
  release_date: string;
  release_date_precision: 'year' | 'month' | 'day';
  total_tracks: number;
  external_urls: {
    spotify: string;
  };
}

interface SpotifyArtist {
  id: string;
  name: string;
  images?: SpotifyImage[];
  genres?: string[];
  popularity?: number;
  external_urls: {
    spotify: string;
  };
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  images: SpotifyImage[];
  owner: {
    id: string;
    display_name: string;
  };
  tracks: {
    total: number;
    items?: Array<{ track: SpotifyTrack }>;
  };
  external_urls: {
    spotify: string;
  };
}

interface SpotifyImage {
  url: string;
  width: number;
  height: number;
}

interface SpotifySearchResponse {
  tracks?: { items: SpotifyTrack[]; total: number };
  albums?: { items: SpotifyAlbum[]; total: number };
  artists?: { items: SpotifyArtist[]; total: number };
  playlists?: { items: SpotifyPlaylist[]; total: number };
}

interface SpotifyFeaturedPlaylists {
  playlists: {
    items: SpotifyPlaylist[];
    total: number;
  };
}

interface SpotifyNewReleases {
  albums: {
    items: SpotifyAlbum[];
    total: number;
  };
}

// =============================================================================
// SPOTIFY ADAPTER
// =============================================================================

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export class SpotifyAdapter extends BaseProviderAdapter {
  readonly providerId = 'spotify';
  readonly providerType: ProviderType = 'spotify';
  readonly displayName = 'Spotify';
  readonly logoUrl = 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png';
  readonly requiresAuth = true; // Full playback requires auth
  readonly supportsPlayback = true;
  readonly priority = 95;
  
  private clientId: string;
  private clientSecret: string;
  private accessToken?: string;
  private tokenExpiry?: number;
  private userAccessToken?: string; // For user-specific operations
  
  constructor(clientId?: string, clientSecret?: string) {
    super();
    this.clientId = clientId || import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
    this.clientSecret = clientSecret || import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || '';
  }
  
  async initialize(): Promise<ProviderInitResult> {
    // Spotify embeds work without credentials
    this._isReady = true;
    
    if (this.clientId && this.clientSecret) {
      try {
        await this.getClientToken();
      } catch (err) {
        console.warn('Spotify client credentials failed, embed-only mode');
      }
    }
    
    return { success: true };
  }
  
  /**
   * Get client credentials token (for browse/search)
   */
  private async getClientToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
      },
      body: 'grant_type=client_credentials',
    });
    
    if (!response.ok) {
      throw new Error(`Spotify token request failed: ${response.status}`);
    }
    
    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 min buffer
    
    return this.accessToken!;
  }
  
  /**
   * Set user access token (from OAuth flow)
   */
  setUserAccessToken(token: string): void {
    this.userAccessToken = token;
  }
  
  private async spotifyFetch(endpoint: string, params: Record<string, string> = {}): Promise<Response> {
    const token = this.userAccessToken || await this.getClientToken();
    
    const url = new URL(`${SPOTIFY_API_BASE}${endpoint}`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    
    return fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  
  // =========================================================================
  // SEARCH
  // =========================================================================
  
  async search(params: SearchParams): Promise<SearchResult> {
    const { query, mediaType, page = 1, pageSize = 20 } = params;
    
    // Determine what to search for
    let type = 'track,album,playlist';
    if (mediaType === 'music_track') type = 'track';
    else if (mediaType === 'music_album') type = 'album';
    
    const offset = (page - 1) * pageSize;
    
    const response = await this.spotifyFetch('/search', {
      q: query,
      type,
      limit: String(pageSize),
      offset: String(offset),
    });
    
    if (!response.ok) {
      throw new Error(`Spotify search failed: ${response.status}`);
    }
    
    const data: SpotifySearchResponse = await response.json();
    
    const items: MediaNode[] = [];
    
    // Add tracks
    if (data.tracks) {
      items.push(...data.tracks.items.map(t => this.trackToMediaNode(t)));
    }
    
    // Add albums
    if (data.albums) {
      items.push(...data.albums.items.map(a => this.albumToMediaNode(a)));
    }
    
    // Add playlists as series
    if (data.playlists) {
      items.push(...data.playlists.items.map(p => this.playlistToMediaNode(p)));
    }
    
    const totalResults = Math.max(
      data.tracks?.total || 0,
      data.albums?.total || 0,
      data.playlists?.total || 0
    );
    
    return {
      items,
      totalResults,
      page,
      totalPages: Math.ceil(totalResults / pageSize),
      query,
    };
  }
  
  // =========================================================================
  // TRENDING (Featured Playlists)
  // =========================================================================
  
  async getTrending(params: TrendingParams): Promise<MediaNode[]> {
    const { limit = 20 } = params;
    
    const response = await this.spotifyFetch('/browse/featured-playlists', {
      limit: String(limit),
      country: 'US',
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data: SpotifyFeaturedPlaylists = await response.json();
    return data.playlists.items.map(p => this.playlistToMediaNode(p));
  }
  
  // =========================================================================
  // BY GENRE (Category Playlists)
  // =========================================================================
  
  async getByGenre(params: GenreParams): Promise<MediaNode[]> {
    const { genre, pageSize = 20 } = params;
    
    // Map common genre names to Spotify category IDs
    const categoryMap: Record<string, string> = {
      'hip-hop': 'hiphop',
      'hip hop': 'hiphop',
      'rap': 'hiphop',
      'rnb': 'rnb',
      'r&b': 'rnb',
      'pop': 'pop',
      'rock': 'rock',
      'jazz': 'jazz',
      'classical': 'classical',
      'electronic': 'edm_dance',
      'edm': 'edm_dance',
      'country': 'country',
      'indie': 'indie_alt',
      'lofi': 'focus',
      'lo-fi': 'focus',
      'chill': 'chill',
      'focus': 'focus',
      'workout': 'workout',
      'party': 'party',
      'mood': 'mood',
    };
    
    const categoryId = categoryMap[genre.toLowerCase()] || genre.toLowerCase();
    
    const response = await this.spotifyFetch(`/browse/categories/${categoryId}/playlists`, {
      limit: String(pageSize),
      country: 'US',
    });
    
    if (!response.ok) {
      // Fallback to search
      return this.search({ query: genre, pageSize }).then(r => r.items);
    }
    
    const data: { playlists: { items: SpotifyPlaylist[] } } = await response.json();
    return data.playlists.items.map(p => this.playlistToMediaNode(p));
  }
  
  // =========================================================================
  // NEW RELEASES
  // =========================================================================
  
  async getNewReleases(params: NewReleasesParams): Promise<MediaNode[]> {
    const { limit = 20, region = 'US' } = params;
    
    const response = await this.spotifyFetch('/browse/new-releases', {
      limit: String(limit),
      country: region,
    });
    
    if (!response.ok) {
      throw new Error(`Spotify new releases failed: ${response.status}`);
    }
    
    const data: SpotifyNewReleases = await response.json();
    return data.albums.items.map(a => this.albumToMediaNode(a));
  }
  
  // =========================================================================
  // GET MEDIA NODE (Track)
  // =========================================================================
  
  async getMediaNode(providerContentId: string): Promise<MediaNode | null> {
    // Could be track ID, album ID, or playlist ID
    // Try track first
    const trackResponse = await this.spotifyFetch(`/tracks/${providerContentId}`);
    
    if (trackResponse.ok) {
      const track: SpotifyTrack = await trackResponse.json();
      return this.trackToMediaNode(track);
    }
    
    // Try album
    const albumResponse = await this.spotifyFetch(`/albums/${providerContentId}`);
    
    if (albumResponse.ok) {
      const album: SpotifyAlbum = await albumResponse.json();
      return this.albumToMediaNode(album);
    }
    
    return null;
  }
  
  // =========================================================================
  // GET MEDIA SERIES (Album/Playlist)
  // =========================================================================
  
  async getMediaSeries(providerContentId: string): Promise<MediaSeries | null> {
    // Try album
    const albumResponse = await this.spotifyFetch(`/albums/${providerContentId}`);
    
    if (albumResponse.ok) {
      const album: SpotifyAlbum & { tracks: { items: SpotifyTrack[] } } = await albumResponse.json();
      return this.albumToMediaSeries(album);
    }
    
    // Try playlist
    const playlistResponse = await this.spotifyFetch(`/playlists/${providerContentId}`);
    
    if (playlistResponse.ok) {
      const playlist: SpotifyPlaylist = await playlistResponse.json();
      return this.playlistToMediaSeries(playlist);
    }
    
    return null;
  }
  
  // =========================================================================
  // GET SERIES ITEMS (Album tracks / Playlist tracks)
  // =========================================================================
  
  async getSeriesItems(seriesProviderContentId: string, params?: PaginationParams): Promise<MediaNode[]> {
    const offset = ((params?.page || 1) - 1) * (params?.pageSize || 50);
    
    // Try album tracks
    const albumResponse = await this.spotifyFetch(`/albums/${seriesProviderContentId}/tracks`, {
      limit: String(params?.pageSize || 50),
      offset: String(offset),
    });
    
    if (albumResponse.ok) {
      const data: { items: SpotifyTrack[] } = await albumResponse.json();
      return data.items.map(t => this.trackToMediaNode(t));
    }
    
    // Try playlist tracks
    const playlistResponse = await this.spotifyFetch(`/playlists/${seriesProviderContentId}/tracks`, {
      limit: String(params?.pageSize || 50),
      offset: String(offset),
    });
    
    if (playlistResponse.ok) {
      const data: { items: Array<{ track: SpotifyTrack }> } = await playlistResponse.json();
      return data.items.map(item => this.trackToMediaNode(item.track));
    }
    
    return [];
  }
  
  // =========================================================================
  // GET AVAILABILITY
  // =========================================================================
  
  async getAvailability(providerContentId: string): Promise<MediaAvailability | null> {
    return {
      id: '',
      media_node_id: '',
      provider_id: '',
      provider_content_id: providerContentId,
      availability_type: 'subscription', // Full playback requires Spotify Premium
      playback_url: `https://open.spotify.com/track/${providerContentId}`,
      embed_url: `https://open.spotify.com/embed/track/${providerContentId}`,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  
  // =========================================================================
  // GET CREDITS (Artists)
  // =========================================================================
  
  async getCredits(providerContentId: string): Promise<CreditWithPerson[]> {
    const node = await this.getMediaNode(providerContentId);
    if (!node) return [];
    
    // Get full track details to get artist info
    const response = await this.spotifyFetch(`/tracks/${providerContentId}`);
    if (!response.ok) return [];
    
    const track: SpotifyTrack = await response.json();
    
    return track.artists.map((artist, index) => ({
      credit: {
        person_id: '',
        role: index === 0 ? 'artist' : 'featured_artist',
        is_primary: index === 0,
        order: index,
      },
      person: {
        canonical_id: generateCanonicalId('music_track', 'spotify', `artist/${artist.id}`),
        name: artist.name,
        profile_image_url: artist.images?.[0]?.url,
        spotify_id: artist.id,
      },
    }));
  }
  
  // =========================================================================
  // GET RELATED (Recommendations)
  // =========================================================================
  
  async getRelated(providerContentId: string, limit: number = 10): Promise<MediaNode[]> {
    const response = await this.spotifyFetch('/recommendations', {
      seed_tracks: providerContentId,
      limit: String(limit),
    });
    
    if (!response.ok) return [];
    
    const data: { tracks: SpotifyTrack[] } = await response.json();
    return data.tracks.map(t => this.trackToMediaNode(t));
  }
  
  // =========================================================================
  // PLAYBACK
  // =========================================================================
  
  getPlaybackUrl(providerContentId: string): Promise<PlaybackInfo | null> {
    return Promise.resolve({
      url: `spotify:track:${providerContentId}`,
      type: 'deep_link',
    });
  }
  
  getEmbedUrl(providerContentId: string): Promise<string | null> {
    return Promise.resolve(`https://open.spotify.com/embed/track/${providerContentId}`);
  }
  
  /**
   * Get embed URL for any Spotify content type
   */
  getEmbedUrlForContent(contentType: 'track' | 'album' | 'playlist', contentId: string): string {
    return `https://open.spotify.com/embed/${contentType}/${contentId}`;
  }
  
  // =========================================================================
  // CONVERSION HELPERS
  // =========================================================================
  
  private trackToMediaNode(track: SpotifyTrack): MediaNode {
    const bestImage = track.album?.images?.[0]?.url;
    
    return this.createMediaNode({
      canonical_id: generateCanonicalId('music_track', 'spotify', track.id),
      media_type: 'music_track',
      category: 'audio',
      title: track.name,
      duration_seconds: Math.round(track.duration_ms / 1000),
      track_number: track.track_number,
      disc_number: track.disc_number,
      content_rating: track.explicit ? 'E' : 'CLEAN',
      popularity_score: track.popularity,
      thumbnail_url: bestImage,
      poster_url: bestImage,
      preview_url: track.preview_url || undefined,
      spotify_id: track.id,
      isrc: track.external_ids?.isrc,
    });
  }
  
  private albumToMediaNode(album: SpotifyAlbum): MediaNode {
    const bestImage = album.images?.[0]?.url;
    
    return this.createMediaNode({
      canonical_id: generateCanonicalId('music_album', 'spotify', album.id),
      media_type: 'music_album',
      category: 'audio',
      title: album.name,
      release_date: album.release_date,
      release_year: extractYear(album.release_date),
      thumbnail_url: bestImage,
      poster_url: bestImage,
      spotify_id: album.id,
    });
  }
  
  private albumToMediaSeries(album: SpotifyAlbum & { tracks?: { items: SpotifyTrack[] } }): MediaSeries {
    const bestImage = album.images?.[0]?.url;
    
    return this.createMediaSeries({
      canonical_id: generateCanonicalId('music_album', 'spotify', album.id),
      media_type: 'music_album',
      category: 'audio',
      title: album.name,
      start_year: extractYear(album.release_date),
      total_tracks: album.total_tracks,
      poster_url: bestImage,
      spotify_id: album.id,
    });
  }
  
  private playlistToMediaNode(playlist: SpotifyPlaylist): MediaNode {
    const bestImage = playlist.images?.[0]?.url;
    
    return this.createMediaNode({
      canonical_id: generateCanonicalId('music_album', 'spotify', `playlist/${playlist.id}`),
      media_type: 'music_album',
      category: 'audio',
      title: playlist.name,
      description: playlist.description || undefined,
      thumbnail_url: bestImage,
      poster_url: bestImage,
      spotify_id: playlist.id,
    });
  }
  
  private playlistToMediaSeries(playlist: SpotifyPlaylist): MediaSeries {
    const bestImage = playlist.images?.[0]?.url;
    
    return this.createMediaSeries({
      canonical_id: generateCanonicalId('music_album', 'spotify', `playlist/${playlist.id}`),
      media_type: 'music_album',
      category: 'audio',
      title: playlist.name,
      description: playlist.description || undefined,
      total_tracks: playlist.tracks.total,
      poster_url: bestImage,
      spotify_id: playlist.id,
    });
  }
}

export const spotifyAdapter = new SpotifyAdapter();
