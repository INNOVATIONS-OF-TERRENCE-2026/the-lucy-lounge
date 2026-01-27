/**
 * Roku Channel FAST Provider Adapter
 * 
 * The Roku Channel offers free ad-supported movies and TV shows,
 * available on Roku devices and the web.
 */

import type { MediaNode, MediaType, ContentRating } from '../types';

// ============================================================================
// LOCAL TYPES
// ============================================================================

interface RokuProviderConfig {
  id: string;
  name: string;
  logoUrl: string;
  baseUrl: string;
  supportsEmbed: boolean;
  supportsDeepLink: boolean;
  supportedRegions: string[];
  contentRatings: string[];
  adFrequency: string;
  maxQuality: string;
  features: string[];
}

interface RokuEmbedConfig {
  provider: string;
  embedUrl: string | null;
  deepLinkUrl: string;
  mobileDeepLink: string;
  allowFullscreen: boolean;
  autoplay: boolean;
  supportsInlinePlay: boolean;
  fallbackBehavior: string;
  playerOptions: {
    showControls: boolean;
    adSupported: boolean;
  };
}

interface RokuHealthStatus {
  provider: string;
  isAvailable: boolean;
  latencyMs: number;
  lastChecked: string;
  features?: string[];
  error?: string;
}

interface RokuDiscoverOptions {
  category?: string;
  limit?: number;
  page?: number;
  genres?: string[];
  sortBy?: string;
}

// ============================================================================
// TYPES
// ============================================================================

interface RokuCategory {
  id: string;
  name: string;
  slug: string;
  genres: string[];
}

interface RokuContent {
  id: string;
  title: string;
  type: 'movie' | 'series' | 'episode';
  synopsis: string;
  releaseYear?: number;
  posterArt: string;
  thumbnailArt: string;
  genres: string[];
  runtime?: number; // in minutes
  rating?: string;
  seasonCount?: number;
}

// ============================================================================
// ROKU CATEGORIES
// ============================================================================

const ROKU_CATEGORIES: RokuCategory[] = [
  { id: 'featured', name: 'Featured', slug: 'featured', genres: [] },
  { id: 'new-releases', name: 'New Releases', slug: 'new-releases', genres: [] },
  { id: 'action', name: 'Action', slug: 'action', genres: ['action', 'adventure'] },
  { id: 'comedy', name: 'Comedy', slug: 'comedy', genres: ['comedy'] },
  { id: 'drama', name: 'Drama', slug: 'drama', genres: ['drama'] },
  { id: 'horror', name: 'Horror', slug: 'horror', genres: ['horror', 'thriller'] },
  { id: 'sci-fi', name: 'Sci-Fi & Fantasy', slug: 'sci-fi-fantasy', genres: ['sci-fi', 'fantasy'] },
  { id: 'documentary', name: 'Documentaries', slug: 'documentaries', genres: ['documentary'] },
  { id: 'crime', name: 'Crime & Thriller', slug: 'crime-thriller', genres: ['crime', 'thriller', 'mystery'] },
  { id: 'romance', name: 'Romance', slug: 'romance', genres: ['romance', 'romantic-comedy'] },
  { id: 'family', name: 'Family', slug: 'family', genres: ['family', 'kids', 'animation'] },
  { id: 'classics', name: 'Classic Movies', slug: 'classics', genres: ['classic', 'golden-age'] },
  { id: 'westerns', name: 'Westerns', slug: 'westerns', genres: ['western'] },
  { id: 'originals', name: 'Roku Originals', slug: 'originals', genres: [] },
  { id: 'live-tv', name: 'Live TV', slug: 'live-tv', genres: [] },
];

// ============================================================================
// CONFIGURATION
// ============================================================================

const ROKU_CONFIG: RokuProviderConfig = {
  id: 'roku_channel',
  name: 'The Roku Channel',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Roku_Channel_logo.svg/200px-Roku_Channel_logo.svg.png',
  baseUrl: 'https://therokuchannel.roku.com',
  supportsEmbed: false, // Roku Channel doesn't support iframe embedding
  supportsDeepLink: true,
  supportedRegions: ['US', 'CA', 'UK'],
  contentRatings: ['G', 'PG', 'PG-13', 'R', 'TV-14', 'TV-MA'],
  adFrequency: 'standard',
  maxQuality: '1080p',
  features: ['free', 'ad-supported', 'roku-originals', 'live-tv', 'mobile-app', 'smart-tv', 'web-player'],
};

// ============================================================================
// ADAPTER IMPLEMENTATION
// ============================================================================

class RokuAdapterImpl {
  readonly providerId = 'roku_channel';
  readonly providerName = 'The Roku Channel';
  
  private config = ROKU_CONFIG;

  /**
   * Discover content from The Roku Channel
   */
  async discover(options: RokuDiscoverOptions = {}): Promise<Partial<MediaNode>[]> {
    const { 
      category = 'featured',
      limit = 20,
    } = options;

    const items: Partial<MediaNode>[] = [];

    // Find matching category
    const rokuCategory = ROKU_CATEGORIES.find(c => c.id === category || c.slug === category);
    
    if (rokuCategory) {
      console.log(`[RokuAdapter] Discovering ${rokuCategory.name} content...`);
    }

    return items;
  }

  /**
   * Normalize Roku content to MediaNode format
   */
  normalize(item: RokuContent): Partial<MediaNode> {
    const mediaType: MediaType = item.type === 'series' ? 'tv_show' : item.type === 'episode' ? 'tv_episode' : 'movie';
    const rating = item.rating as ContentRating | undefined;
    
    return {
      canonical_id: `lucy:${mediaType}:roku_channel:${item.id}`,
      media_type: mediaType,
      category: 'video',
      title: item.title,
      description: item.synopsis,
      release_year: item.releaseYear,
      duration_seconds: item.runtime ? item.runtime * 60 : undefined,
      poster_url: item.posterArt,
      thumbnail_url: item.thumbnailArt,
      content_rating: rating,
    };
  }

  /**
   * Get embed configuration for Roku Channel
   */
  getEmbedConfig(contentId: string, type: 'movie' | 'series' = 'movie'): RokuEmbedConfig {
    const deepLinkUrl = type === 'series'
      ? `https://therokuchannel.roku.com/details/${contentId}`
      : `https://therokuchannel.roku.com/watch/${contentId}`;

    return {
      provider: 'roku_channel',
      embedUrl: null, // Roku doesn't support iframe embedding
      deepLinkUrl: deepLinkUrl,
      mobileDeepLink: `roku://home/channel/562859`, // Opens Roku Channel app
      allowFullscreen: true,
      autoplay: false,
      supportsInlinePlay: false,
      fallbackBehavior: 'deep-link',
      playerOptions: {
        showControls: true,
        adSupported: true,
      },
    };
  }

  /**
   * Check if Roku Channel is accessible
   */
  async healthCheck(): Promise<RokuHealthStatus> {
    try {
      const start = Date.now();
      await fetch('https://therokuchannel.roku.com', { method: 'HEAD', mode: 'no-cors' });
      const latency = Date.now() - start;
      
      return {
        provider: 'roku_channel',
        isAvailable: true,
        latencyMs: latency,
        lastChecked: new Date().toISOString(),
        features: this.config.features,
      };
    } catch (error) {
      return {
        provider: 'roku_channel',
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
  getConfig(): RokuProviderConfig {
    return { ...this.config };
  }

  /**
   * Get available categories
   */
  getCategories(): RokuCategory[] {
    return [...ROKU_CATEGORIES];
  }

  /**
   * Generate deep link for Roku content
   */
  getDeepLink(contentId: string, mediaType?: MediaType): string {
    if (mediaType === 'tv_show' || mediaType === 'tv_season' || mediaType === 'tv_episode') {
      return `https://therokuchannel.roku.com/details/${contentId}`;
    }
    return `https://therokuchannel.roku.com/watch/${contentId}`;
  }

  /**
   * Generate ECP deep link for Roku devices
   */
  getRokuDeviceDeepLink(contentId: string): string {
    // External Control Protocol for Roku devices
    return `roku://home/channel/562859?contentId=${contentId}`;
  }

  /**
   * Search Roku Channel content
   */
  async search(query: string): Promise<Partial<MediaNode>[]> {
    console.log(`[RokuAdapter] Searching for: ${query}`);
    return [];
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const RokuAdapter = new RokuAdapterImpl();

export { 
  ROKU_CATEGORIES,
  ROKU_CONFIG,
  type RokuCategory,
  type RokuContent,
};
