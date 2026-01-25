// =============================================================================
// THE LUCY LOUNGE - YouTube/FAST Channels Provider Adapter
// =============================================================================
// YouTube videos, playlists, and FAST (Free Ad-Supported Television) channels
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
// YOUTUBE API TYPES
// =============================================================================

interface YouTubeVideo {
  id: string | { videoId: string };
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    channelId: string;
    channelTitle: string;
    thumbnails: {
      default?: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      high?: { url: string; width: number; height: number };
      maxres?: { url: string; width: number; height: number };
    };
    categoryId?: string;
    tags?: string[];
  };
  contentDetails?: {
    duration: string;
    definition: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

interface YouTubePlaylist {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    channelId: string;
    channelTitle: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
      maxres?: { url: string };
    };
  };
  contentDetails?: {
    itemCount: number;
  };
}

interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
  };
  statistics?: {
    viewCount: string;
    subscriberCount: string;
    videoCount: string;
  };
}

interface YouTubeSearchResponse {
  items: YouTubeVideo[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  nextPageToken?: string;
  prevPageToken?: string;
}

// =============================================================================
// FAST CHANNEL DEFINITIONS
// =============================================================================

export interface FASTChannel {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  category: string;
  stream_url?: string;
  youtube_channel_id?: string;
  youtube_playlist_id?: string;
  schedule?: FASTScheduleItem[];
}

interface FASTScheduleItem {
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
}

// Curated FAST channels (free 24/7 streams)
export const FAST_CHANNELS: FASTChannel[] = [
  {
    id: 'pluto-movies',
    name: 'Pluto Movies',
    description: 'Free movies 24/7',
    category: 'movies',
    logo_url: 'https://images.pluto.tv/assets/images/default/vod.poster-art.jpg',
  },
  {
    id: 'tubi-originals',
    name: 'Tubi Originals',
    description: 'Free original content',
    category: 'movies',
  },
  {
    id: 'plex-free-movies',
    name: 'Plex Free Movies',
    description: 'Ad-supported free movies',
    category: 'movies',
  },
  // YouTube-based FAST channels
  {
    id: 'yt-movies-free',
    name: 'YouTube Free Movies',
    description: 'Free full movies on YouTube',
    category: 'movies',
    youtube_playlist_id: 'PLX9_I-EOJPdHZJDzvjjRjpj86ClhZSsVm',
  },
  {
    id: 'yt-cartoons',
    name: 'Classic Cartoons',
    description: 'Full cartoon episodes',
    category: 'animation',
    youtube_playlist_id: 'PLUQR09yEYrP0RaHE3f9vNQkOx08IT9ZTe',
  },
];

// =============================================================================
// YOUTUBE ADAPTER
// =============================================================================

export class YouTubeAdapter extends BaseProviderAdapter {
  readonly providerId = 'youtube';
  readonly providerType: ProviderType = 'youtube';
  readonly displayName = 'YouTube';
  readonly logoUrl = 'https://www.youtube.com/s/desktop/f506bd45/img/favicon_144x144.png';
  readonly requiresAuth = false;
  readonly supportsPlayback = true;
  readonly priority = 90;
  
  private apiKey: string;
  
  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey || import.meta.env.VITE_YOUTUBE_API_KEY || '';
  }
  
  async initialize(): Promise<ProviderInitResult> {
    // YouTube works without API key for basic embedding
    // API key is only needed for search/discovery
    this._isReady = true;
    
    if (!this.apiKey) {
      console.warn('YouTube API key not configured - search disabled');
    }
    
    return { success: true };
  }
  
  private async ytFetch(endpoint: string, params: Record<string, string> = {}): Promise<Response> {
    if (!this.apiKey) {
      throw new Error('YouTube API key required for this operation');
    }
    
    const url = new URL(`https://www.googleapis.com/youtube/v3${endpoint}`);
    url.searchParams.set('key', this.apiKey);
    
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    
    return fetch(url.toString());
  }
  
  // =========================================================================
  // SEARCH
  // =========================================================================
  
  async search(params: SearchParams): Promise<SearchResult> {
    const { query, page = 1, pageSize = 20 } = params;
    
    if (!this.apiKey) {
      // Fallback: return curated results
      return this.searchFASTChannels(query);
    }
    
    const response = await this.ytFetch('/search', {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: String(pageSize),
      videoEmbeddable: 'true',
      videoSyndicated: 'true',
    });
    
    if (!response.ok) {
      throw new Error(`YouTube search failed: ${response.status}`);
    }
    
    const data: YouTubeSearchResponse = await response.json();
    
    const items = data.items.map(item => this.videoToMediaNode(item));
    
    return {
      items,
      totalResults: data.pageInfo.totalResults,
      page,
      totalPages: Math.ceil(data.pageInfo.totalResults / pageSize),
      query,
    };
  }
  
  private searchFASTChannels(query: string): SearchResult {
    const lowerQuery = query.toLowerCase();
    const matches = FAST_CHANNELS.filter(ch => 
      ch.name.toLowerCase().includes(lowerQuery) ||
      ch.description?.toLowerCase().includes(lowerQuery) ||
      ch.category.toLowerCase().includes(lowerQuery)
    );
    
    return {
      items: matches.map(ch => this.fastChannelToMediaNode(ch)),
      totalResults: matches.length,
      page: 1,
      totalPages: 1,
      query,
    };
  }
  
  // =========================================================================
  // TRENDING
  // =========================================================================
  
  async getTrending(params: TrendingParams): Promise<MediaNode[]> {
    const { region = 'US', limit = 20 } = params;
    
    if (!this.apiKey) {
      return FAST_CHANNELS.slice(0, limit).map(ch => this.fastChannelToMediaNode(ch));
    }
    
    const response = await this.ytFetch('/videos', {
      part: 'snippet,contentDetails,statistics',
      chart: 'mostPopular',
      regionCode: region,
      maxResults: String(limit),
      videoCategoryId: '1', // Film & Animation
    });
    
    if (!response.ok) {
      throw new Error(`YouTube trending failed: ${response.status}`);
    }
    
    const data: { items: YouTubeVideo[] } = await response.json();
    return data.items.map(item => this.videoToMediaNode(item));
  }
  
  // =========================================================================
  // BY GENRE
  // =========================================================================
  
  async getByGenre(params: GenreParams): Promise<MediaNode[]> {
    const { genre, page = 1, pageSize = 20 } = params;
    
    // Map genre to category
    const categoryMap: Record<string, string> = {
      'movies': '1',
      'music': '10',
      'comedy': '23',
      'entertainment': '24',
      'news': '25',
      'sports': '17',
      'gaming': '20',
      'education': '27',
      'documentary': '35',
      'animation': '1',
    };
    
    // Search within category
    return this.search({
      query: genre,
      page,
      pageSize,
    }).then(r => r.items);
  }
  
  // =========================================================================
  // NEW RELEASES (Not really applicable for YouTube)
  // =========================================================================
  
  async getNewReleases(params: NewReleasesParams): Promise<MediaNode[]> {
    return this.getTrending({ ...params, timeWindow: 'day' });
  }
  
  // =========================================================================
  // GET MEDIA NODE
  // =========================================================================
  
  async getMediaNode(providerContentId: string): Promise<MediaNode | null> {
    // Check if it's a FAST channel first
    const fastChannel = FAST_CHANNELS.find(ch => ch.id === providerContentId);
    if (fastChannel) {
      return this.fastChannelToMediaNode(fastChannel);
    }
    
    if (!this.apiKey) {
      // Return basic node without API details
      return this.createMediaNode({
        canonical_id: generateCanonicalId('creator_video', 'youtube', providerContentId),
        media_type: 'creator_video',
        category: 'video',
        title: 'YouTube Video',
        youtube_id: providerContentId,
      });
    }
    
    const response = await this.ytFetch('/videos', {
      part: 'snippet,contentDetails,statistics',
      id: providerContentId,
    });
    
    if (!response.ok) {
      throw new Error(`YouTube video fetch failed: ${response.status}`);
    }
    
    const data: { items: YouTubeVideo[] } = await response.json();
    
    if (!data.items.length) return null;
    
    return this.videoToMediaNode(data.items[0]);
  }
  
  // =========================================================================
  // GET MEDIA SERIES (Playlists/Channels)
  // =========================================================================
  
  async getMediaSeries(providerContentId: string): Promise<MediaSeries | null> {
    if (!this.apiKey) return null;
    
    // Try as playlist first
    const playlistResponse = await this.ytFetch('/playlists', {
      part: 'snippet,contentDetails',
      id: providerContentId,
    });
    
    if (playlistResponse.ok) {
      const data: { items: YouTubePlaylist[] } = await playlistResponse.json();
      if (data.items.length) {
        return this.playlistToMediaSeries(data.items[0]);
      }
    }
    
    // Try as channel
    const channelResponse = await this.ytFetch('/channels', {
      part: 'snippet,statistics',
      id: providerContentId,
    });
    
    if (channelResponse.ok) {
      const data: { items: YouTubeChannel[] } = await channelResponse.json();
      if (data.items.length) {
        return this.channelToMediaSeries(data.items[0]);
      }
    }
    
    return null;
  }
  
  // =========================================================================
  // GET SERIES ITEMS (Playlist videos)
  // =========================================================================
  
  async getSeriesItems(seriesProviderContentId: string, params?: PaginationParams): Promise<MediaNode[]> {
    if (!this.apiKey) return [];
    
    const response = await this.ytFetch('/playlistItems', {
      part: 'snippet,contentDetails',
      playlistId: seriesProviderContentId,
      maxResults: String(params?.pageSize || 50),
    });
    
    if (!response.ok) {
      throw new Error(`YouTube playlist items fetch failed: ${response.status}`);
    }
    
    const data: { items: any[] } = await response.json();
    
    return data.items.map(item => this.createMediaNode({
      canonical_id: generateCanonicalId('creator_video', 'youtube', item.contentDetails.videoId),
      media_type: 'creator_video',
      category: 'video',
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail_url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
      youtube_id: item.contentDetails.videoId,
      release_date: item.snippet.publishedAt,
    }));
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
      availability_type: 'free_with_ads',
      playback_url: `https://www.youtube.com/watch?v=${providerContentId}`,
      embed_url: `https://www.youtube.com/embed/${providerContentId}`,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  
  // =========================================================================
  // GET CREDITS
  // =========================================================================
  
  async getCredits(providerContentId: string): Promise<CreditWithPerson[]> {
    // YouTube doesn't have traditional credits
    // Could potentially return channel as creator
    return [];
  }
  
  // =========================================================================
  // GET RELATED
  // =========================================================================
  
  async getRelated(providerContentId: string, limit: number = 10): Promise<MediaNode[]> {
    if (!this.apiKey) return [];
    
    const response = await this.ytFetch('/search', {
      part: 'snippet',
      relatedToVideoId: providerContentId,
      type: 'video',
      maxResults: String(limit),
    });
    
    if (!response.ok) return [];
    
    const data: YouTubeSearchResponse = await response.json();
    return data.items.map(item => this.videoToMediaNode(item));
  }
  
  // =========================================================================
  // PLAYBACK
  // =========================================================================
  
  getPlaybackUrl(providerContentId: string): Promise<PlaybackInfo | null> {
    return Promise.resolve({
      url: `https://www.youtube.com/watch?v=${providerContentId}`,
      type: 'deep_link',
    });
  }
  
  getEmbedUrl(providerContentId: string): Promise<string | null> {
    return Promise.resolve(`https://www.youtube.com/embed/${providerContentId}`);
  }
  
  // =========================================================================
  // FAST CHANNEL HELPERS
  // =========================================================================
  
  getFASTChannels(): FASTChannel[] {
    return FAST_CHANNELS;
  }
  
  getFASTChannelsByCategory(category: string): FASTChannel[] {
    return FAST_CHANNELS.filter(ch => ch.category === category);
  }
  
  // =========================================================================
  // CONVERSION HELPERS
  // =========================================================================
  
  private videoToMediaNode(video: YouTubeVideo): MediaNode {
    const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
    const duration = video.contentDetails?.duration 
      ? normalizeDuration(video.contentDetails.duration)
      : undefined;
    
    const popularity = video.statistics?.viewCount 
      ? Math.log10(parseInt(video.statistics.viewCount, 10) + 1) * 10
      : undefined;
    
    return this.createMediaNode({
      canonical_id: generateCanonicalId('creator_video', 'youtube', videoId),
      media_type: 'creator_video',
      category: 'video',
      title: video.snippet.title,
      description: video.snippet.description,
      release_date: video.snippet.publishedAt,
      release_year: extractYear(video.snippet.publishedAt),
      duration_seconds: duration,
      popularity_score: popularity,
      thumbnail_url: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url,
      backdrop_url: video.snippet.thumbnails?.maxres?.url,
      youtube_id: videoId,
    });
  }
  
  private playlistToMediaSeries(playlist: YouTubePlaylist): MediaSeries {
    return this.createMediaSeries({
      canonical_id: generateCanonicalId('tv_show', 'youtube', playlist.id),
      media_type: 'tv_show',
      category: 'video',
      title: playlist.snippet.title,
      description: playlist.snippet.description,
      start_year: extractYear(playlist.snippet.publishedAt),
      total_episodes: playlist.contentDetails?.itemCount,
      poster_url: playlist.snippet.thumbnails?.high?.url,
    });
  }
  
  private channelToMediaSeries(channel: YouTubeChannel): MediaSeries {
    return this.createMediaSeries({
      canonical_id: generateCanonicalId('tv_show', 'youtube', channel.id),
      media_type: 'tv_show',
      category: 'video',
      title: channel.snippet.title,
      description: channel.snippet.description,
      start_year: extractYear(channel.snippet.publishedAt),
      total_episodes: channel.statistics?.videoCount ? parseInt(channel.statistics.videoCount, 10) : undefined,
      poster_url: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.medium?.url,
    });
  }
  
  private fastChannelToMediaNode(channel: FASTChannel): MediaNode {
    return this.createMediaNode({
      canonical_id: generateCanonicalId('fast_channel', 'youtube', channel.id),
      media_type: 'fast_channel',
      category: 'live',
      title: channel.name,
      description: channel.description,
      poster_url: channel.logo_url,
      thumbnail_url: channel.logo_url,
      youtube_id: channel.youtube_playlist_id,
    });
  }
}

export const youtubeAdapter = new YouTubeAdapter();
