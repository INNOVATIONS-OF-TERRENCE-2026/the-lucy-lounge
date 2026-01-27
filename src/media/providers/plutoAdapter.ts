/**
 * Pluto TV FAST Provider Adapter
 * 
 * Pluto TV is a free ad-supported streaming service with linear channels
 * and on-demand content. Owned by Paramount.
 */

import type { 
  FASTProviderAdapter, 
  FASTContentItem, 
  FASTProviderConfig,
  FASTEmbedConfig,
  FASTDiscoverOptions,
  FASTHealthStatus 
} from './FASTProviderAdapter';
import type { MediaNode } from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface PlutoChannel {
  id: string;
  name: string;
  number: number;
  category: string;
  logoUrl: string;
  isLive: boolean;
}

interface PlutoContent {
  id: string;
  title: string;
  type: 'movie' | 'series' | 'live';
  description: string;
  year?: number;
  posterUrl: string;
  thumbnailUrl: string;
  genres: string[];
  duration?: number;
  rating?: string;
  channelId?: string;
}

interface PlutoCuratedCollection {
  id: string;
  title: string;
  type: 'collection';
  genres: string[];
  provider_type: 'FAST';
  provider_name: 'Pluto TV';
  tags: string[];
}

// ============================================================================
// PLUTO TV CHANNELS
// ============================================================================

const PLUTO_FEATURED_CHANNELS: PlutoChannel[] = [
  { id: 'pluto-movies', name: 'Pluto Movies', number: 100, category: 'movies', logoUrl: '', isLive: true },
  { id: 'pluto-action', name: 'Pluto Action', number: 101, category: 'action', logoUrl: '', isLive: true },
  { id: 'pluto-comedy', name: 'Pluto Comedy', number: 102, category: 'comedy', logoUrl: '', isLive: true },
  { id: 'pluto-horror', name: 'Pluto Horror', number: 103, category: 'horror', logoUrl: '', isLive: true },
  { id: 'pluto-thriller', name: 'Pluto Thriller', number: 104, category: 'thriller', logoUrl: '', isLive: true },
  { id: 'pluto-romance', name: 'Pluto Romance', number: 105, category: 'romance', logoUrl: '', isLive: true },
  { id: 'pluto-drama', name: 'Pluto Drama', number: 106, category: 'drama', logoUrl: '', isLive: true },
  { id: 'pluto-scifi', name: 'Sci-Fi', number: 107, category: 'sci-fi', logoUrl: '', isLive: true },
  { id: 'pluto-classic-movies', name: 'Classic Movies', number: 108, category: 'classic', logoUrl: '', isLive: true },
  { id: 'pluto-black-cinema', name: 'Black Cinema', number: 109, category: 'black-cinema', logoUrl: '', isLive: true },
  { id: 'pluto-classic-tv', name: 'Classic TV Vault', number: 115, category: 'classic-tv', logoUrl: '', isLive: true },
  { id: 'crime-movies', name: 'Crime Movies', number: 110, category: 'crime', logoUrl: '', isLive: true },
  { id: 'cult-films', name: 'Cult Films', number: 111, category: 'cult', logoUrl: '', isLive: true },
  { id: 'docs', name: 'Pluto Documentaries', number: 200, category: 'documentary', logoUrl: '', isLive: true },
  { id: 'anime-all-day', name: 'Anime All Day', number: 300, category: 'anime', logoUrl: '', isLive: true },
];

// ============================================================================
// CONFIGURATION
// ============================================================================

const PLUTO_CONFIG: FASTProviderConfig = {
  id: 'pluto_tv',
  name: 'Pluto TV',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Pluto_TV_logo_2020.svg/200px-Pluto_TV_logo_2020.svg.png',
  baseUrl: 'https://pluto.tv',
  supportsEmbed: true, // Pluto supports embedding for some content
  supportsDeepLink: true,
  supportedRegions: ['US', 'CA', 'UK', 'DE', 'FR', 'ES', 'IT', 'AU', 'BR', 'MX'],
  contentRatings: ['G', 'PG', 'PG-13', 'R', 'TV-14', 'TV-MA'],
  adFrequency: 'standard',
  maxQuality: '1080p',
  features: ['free', 'ad-supported', 'live-tv', 'on-demand', 'mobile-app', 'smart-tv', 'linear-channels'],
};

// ============================================================================
// ADAPTER IMPLEMENTATION
// ============================================================================

class PlutoAdapterImpl implements FASTProviderAdapter {
  readonly providerId = 'pluto_tv';
  readonly providerName = 'Pluto TV';
  
  private config = PLUTO_CONFIG;

  /**
   * Discover content from Pluto TV
   */
  async discover(options: FASTDiscoverOptions = {}): Promise<FASTContentItem[]> {
    const { 
      category = 'popular',
      limit = 20,
    } = options;

    const items: FASTContentItem[] = [];

    // Find matching channel
    const channel = PLUTO_FEATURED_CHANNELS.find(
      c => c.category === category || c.id === category
    );
    
    if (channel) {
      console.log(`[PlutoAdapter] Discovering ${channel.name} content...`);
    }

    return items;
  }

  /**
   * Normalize Pluto content to MediaNode format
   */
  normalize(item: PlutoContent): Partial<MediaNode> {
    return {
      canonical_id: `lucy:${item.type}:pluto_tv:${item.id}`,
      media_type: item.type === 'series' ? 'series' : item.type === 'live' ? 'live' : 'movie',
      category: 'video',
      title: item.title,
      description: item.description,
      release_year: item.year,
      duration_seconds: item.duration ? item.duration * 60 : undefined,
      poster_url: item.posterUrl,
      thumbnail_url: item.thumbnailUrl,
      content_rating: item.rating,
      provider_source: 'pluto_tv',
      provider_content_id: item.id,
      embed_allowed: true,
    };
  }

  /**
   * Get embed configuration for Pluto TV
   */
  getEmbedConfig(contentId: string, isLive: boolean = false): FASTEmbedConfig {
    const embedUrl = isLive 
      ? `https://pluto.tv/en/live-tv/${contentId}`
      : `https://pluto.tv/en/on-demand/movies/${contentId}`;

    return {
      provider: 'pluto_tv',
      embedUrl: embedUrl,
      deepLinkUrl: embedUrl,
      mobileDeepLink: `pluto://watch/${contentId}`,
      allowFullscreen: true,
      autoplay: false,
      supportsInlinePlay: false, // Requires redirect to Pluto player
      fallbackBehavior: 'deep-link',
      playerOptions: {
        showControls: true,
        adSupported: true,
        linearChannel: isLive,
      },
    };
  }

  /**
   * Check if Pluto TV is accessible
   */
  async healthCheck(): Promise<FASTHealthStatus> {
    try {
      const start = Date.now();
      await fetch('https://pluto.tv', { method: 'HEAD', mode: 'no-cors' });
      const latency = Date.now() - start;
      
      return {
        provider: 'pluto_tv',
        isAvailable: true,
        latencyMs: latency,
        lastChecked: new Date().toISOString(),
        features: this.config.features,
      };
    } catch (error) {
      return {
        provider: 'pluto_tv',
        isAvailable: false,
        latencyMs: -1,
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        features: [],
      };
    }
  }

  /**
   * Get provider configuration
   */
  getConfig(): FASTProviderConfig {
    return { ...this.config };
  }

  /**
   * Get available live channels
   */
  getChannels(): PlutoChannel[] {
    return [...PLUTO_FEATURED_CHANNELS];
  }

  /**
   * Get channel by ID
   */
  getChannel(channelId: string): PlutoChannel | undefined {
    return PLUTO_FEATURED_CHANNELS.find(c => c.id === channelId);
  }

  /**
   * Generate deep link for Pluto TV content
   */
  getDeepLink(contentId: string, type: 'live' | 'on-demand' = 'on-demand'): string {
    if (type === 'live') {
      return `https://pluto.tv/en/live-tv/${contentId}`;
    }
    return `https://pluto.tv/en/on-demand/movies/${contentId}`;
  }

  /**
   * Generate mobile app deep link
   */
  getMobileDeepLink(contentId: string): string {
    return `pluto://watch/${contentId}`;
  }

  /**
   * Search Pluto TV content
   */
  async search(query: string): Promise<FASTContentItem[]> {
    console.log(`[PlutoAdapter] Searching for: ${query}`);
    return [];
  }
}

// ============================================================================
// CURATED COLLECTIONS
// ============================================================================

export const PLUTO_CURATED_COLLECTIONS: PlutoCuratedCollection[] = [
  {
    id: 'pluto_classic_tv',
    title: 'Classic TV Vault',
    type: 'collection',
    genres: ['Drama', 'Comedy'],
    provider_type: 'FAST',
    provider_name: 'Pluto TV',
    tags: ['tv', 'classics'],
  },
];

// ============================================================================
// EXPORT
// ============================================================================

export const PlutoAdapter = new PlutoAdapterImpl();

export { 
  PLUTO_FEATURED_CHANNELS,
  PLUTO_CONFIG,
  PLUTO_CURATED_COLLECTIONS,
  type PlutoChannel,
  type PlutoContent,
  type PlutoCuratedCollection,
};
