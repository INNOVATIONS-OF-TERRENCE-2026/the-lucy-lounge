// =============================================================================
// THE LUCY LOUNGE - YouTube FAST Adapter
// =============================================================================
// Full embed support for YouTube content
// Handles: Movies, TV Shows, Creator Content, FAST Channels
// =============================================================================

import type {
  MediaNode,
  MediaAvailability,
  MediaType,
  MediaCategory,
} from '../types';
import {
  type FASTProviderAdapter,
  type FASTProviderInfo,
  type EmbedConfig,
  type HealthCheckResult,
  type DiscoverParams,
  type DiscoverResult,
  type FASTCollection,
  FAST_PROVIDER_REGISTRY,
  generateFASTCanonicalId,
} from './FASTProviderAdapter';

// =============================================================================
// YOUTUBE COLLECTIONS (Curated embeddable content)
// =============================================================================

export const YOUTUBE_COLLECTIONS: FASTCollection[] = [
  {
    id: 'free-movies',
    name: 'Free Movies on YouTube',
    description: 'Full-length movies available for free with ads',
    itemCount: 1000,
    provider: 'youtube',
    queryParams: { category: 'video', mediaType: 'movie' },
  },
  {
    id: 'classic-cinema',
    name: 'Classic Cinema',
    description: 'Golden age Hollywood on YouTube',
    itemCount: 500,
    provider: 'youtube',
    queryParams: { genres: ['classic'], category: 'video' },
  },
  {
    id: 'documentaries',
    name: 'Documentaries',
    description: 'Educational and documentary content',
    itemCount: 2000,
    provider: 'youtube',
    queryParams: { genres: ['documentary'], category: 'video' },
  },
  {
    id: 'indie-films',
    name: 'Independent Films',
    description: 'Creator-uploaded indie movies',
    itemCount: 800,
    provider: 'youtube',
    queryParams: { genres: ['indie', 'independent'], category: 'video' },
  },
];

// =============================================================================
// YOUTUBE FAST ADAPTER
// =============================================================================

export class YouTubeFASTAdapter implements FASTProviderAdapter {
  readonly providerId = 'youtube' as const;
  readonly providerInfo: FASTProviderInfo = FAST_PROVIDER_REGISTRY.youtube;
  
  private apiKey: string;
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env?.VITE_YOUTUBE_API_KEY || '';
  }
  
  // =========================================================================
  // HEALTH CHECK
  // =========================================================================
  
  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Simple check - try to load YouTube homepage
      const response = await fetch('https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&format=json', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
      
      const latencyMs = Date.now() - startTime;
      
      return {
        provider: this.providerId,
        status: response.ok ? (latencyMs < 2000 ? 'healthy' : 'degraded') : 'degraded',
        latencyMs,
        lastChecked: new Date(),
        contentAvailable: response.ok,
      };
    } catch (error) {
      return {
        provider: this.providerId,
        status: 'down',
        latencyMs: Date.now() - startTime,
        lastChecked: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  // =========================================================================
  // DISCOVER
  // =========================================================================
  
  async discover(params: DiscoverParams): Promise<DiscoverResult> {
    // YouTube search requires API key
    // For now, return empty - content comes from Supabase catalog
    if (!this.apiKey) {
      console.warn('YouTube API key not available - using Supabase catalog only');
      return {
        items: [],
        total: 0,
        hasMore: false,
        collections: YOUTUBE_COLLECTIONS,
      };
    }
    
    const { 
      genres = [],
      limit = 20,
      sortBy = 'popularity',
    } = params;
    
    try {
      const query = genres.length > 0 ? genres.join(' ') + ' movie full' : 'full movie free';
      
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` + new URLSearchParams({
          key: this.apiKey,
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults: String(limit),
          videoDuration: 'long',
          videoEmbeddable: 'true',
          videoSyndicated: 'true',
          order: sortBy === 'date' ? 'date' : 'relevance',
        })
      );
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }
      
      const data = await response.json();
      const items = (data.items || []).map((item: YouTubeSearchItem) => this.normalize(item));
      
      return {
        items,
        total: data.pageInfo?.totalResults || items.length,
        hasMore: !!data.nextPageToken,
        collections: YOUTUBE_COLLECTIONS,
      };
    } catch (error) {
      console.error('YouTube discover error:', error);
      return {
        items: [],
        total: 0,
        hasMore: false,
        collections: YOUTUBE_COLLECTIONS,
      };
    }
  }
  
  // =========================================================================
  // NORMALIZE
  // =========================================================================
  
  normalize(rawData: unknown): MediaNode {
    const item = rawData as YouTubeSearchItem;
    const videoId = typeof item.id === 'string' ? item.id : item.id?.videoId || '';
    
    const now = new Date().toISOString();
    
    return {
      id: '',
      canonical_id: generateFASTCanonicalId('youtube', 'movie', videoId),
      media_type: 'movie',
      category: 'video',
      title: item.snippet?.title || 'Unknown Title',
      description: item.snippet?.description,
      release_date: item.snippet?.publishedAt,
      release_year: item.snippet?.publishedAt 
        ? new Date(item.snippet.publishedAt).getFullYear()
        : undefined,
      poster_url: item.snippet?.thumbnails?.maxres?.url 
        || item.snippet?.thumbnails?.high?.url
        || item.snippet?.thumbnails?.medium?.url,
      thumbnail_url: item.snippet?.thumbnails?.medium?.url 
        || item.snippet?.thumbnails?.default?.url,
      backdrop_url: item.snippet?.thumbnails?.maxres?.url 
        || item.snippet?.thumbnails?.high?.url,
      youtube_id: videoId,
      created_at: now,
      updated_at: now,
    };
  }
  
  // =========================================================================
  // EMBED CONFIG
  // =========================================================================
  
  async getEmbedConfig(contentId: string, _mediaType?: MediaType): Promise<EmbedConfig> {
    return {
      provider: this.providerId,
      embedUrl: `https://www.youtube.com/embed/${contentId}?autoplay=1&rel=0&modestbranding=1`,
      deepLinkUrl: `https://www.youtube.com/watch?v=${contentId}`,
      iframeAllowed: true,
      playerType: 'iframe',
      aspectRatio: '16:9',
      autoplay: true,
      controls: true,
      attribution: {
        text: 'Watch on YouTube',
        url: `https://www.youtube.com/watch?v=${contentId}`,
        logo: 'https://www.youtube.com/s/desktop/f506bd45/img/favicon_144x144.png',
      },
    };
  }
  
  // =========================================================================
  // DEEP LINK
  // =========================================================================
  
  getDeepLink(contentId: string, _mediaType?: MediaType): string {
    return `https://www.youtube.com/watch?v=${contentId}`;
  }
  
  // =========================================================================
  // AVAILABILITY
  // =========================================================================
  
  async getAvailability(contentId: string): Promise<MediaAvailability> {
    const now = new Date().toISOString();
    
    return {
      id: '',
      media_node_id: '',
      provider_id: 'youtube',
      provider_content_id: contentId,
      availability_type: 'free_with_ads',
      playback_url: `https://www.youtube.com/watch?v=${contentId}`,
      embed_url: `https://www.youtube.com/embed/${contentId}`,
      is_verified: true,
      last_verified_at: now,
      created_at: now,
      updated_at: now,
    };
  }
  
  // =========================================================================
  // SEARCH
  // =========================================================================
  
  async search(query: string, limit: number = 20): Promise<MediaNode[]> {
    if (!this.apiKey) {
      return [];
    }
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` + new URLSearchParams({
          key: this.apiKey,
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults: String(limit),
          videoEmbeddable: 'true',
          videoSyndicated: 'true',
        })
      );
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      return (data.items || []).map((item: YouTubeSearchItem) => this.normalize(item));
    } catch (error) {
      console.error('YouTube search error:', error);
      return [];
    }
  }
  
  // =========================================================================
  // COLLECTIONS
  // =========================================================================
  
  async getCollections(): Promise<FASTCollection[]> {
    return YOUTUBE_COLLECTIONS;
  }
}

// =============================================================================
// YOUTUBE API TYPES
// =============================================================================

interface YouTubeSearchItem {
  id: string | { videoId: string };
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    channelTitle?: string;
    thumbnails?: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
      maxres?: { url: string };
    };
  };
}

// Export singleton
export const youtubeFASTAdapter = new YouTubeFASTAdapter();
