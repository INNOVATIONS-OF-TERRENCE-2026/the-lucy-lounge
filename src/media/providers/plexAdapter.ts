/**
 * Plex Free FAST Provider Adapter
 * 
 * Plex offers free ad-supported movies and TV shows through their platform.
 * Content is curated and includes a mix of classic films, indie movies, and TV series.
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

interface PlexCategory {
  id: string;
  name: string;
  hubIdentifier: string;
  genres: string[];
}

interface PlexContent {
  ratingKey: string;
  title: string;
  type: 'movie' | 'show' | 'episode';
  summary: string;
  year?: number;
  thumb: string;
  art: string;
  genres: string[];
  duration?: number;
  contentRating?: string;
  audienceRating?: number;
}

// ============================================================================
// PLEX CATEGORIES
// ============================================================================

const PLEX_CATEGORIES: PlexCategory[] = [
  { id: 'featured', name: 'Featured Movies', hubIdentifier: 'movies.featured', genres: [] },
  { id: 'action', name: 'Action & Adventure', hubIdentifier: 'movies.action', genres: ['action', 'adventure'] },
  { id: 'comedy', name: 'Comedy', hubIdentifier: 'movies.comedy', genres: ['comedy'] },
  { id: 'drama', name: 'Drama', hubIdentifier: 'movies.drama', genres: ['drama'] },
  { id: 'horror', name: 'Horror', hubIdentifier: 'movies.horror', genres: ['horror'] },
  { id: 'thriller', name: 'Thriller', hubIdentifier: 'movies.thriller', genres: ['thriller'] },
  { id: 'sci-fi', name: 'Sci-Fi & Fantasy', hubIdentifier: 'movies.scifi', genres: ['sci-fi', 'fantasy'] },
  { id: 'documentary', name: 'Documentaries', hubIdentifier: 'movies.documentary', genres: ['documentary'] },
  { id: 'classics', name: 'Classic Movies', hubIdentifier: 'movies.classics', genres: ['classic', 'golden-age'] },
  { id: 'indie', name: 'Indie Films', hubIdentifier: 'movies.indie', genres: ['indie', 'arthouse'] },
  { id: 'international', name: 'International', hubIdentifier: 'movies.international', genres: ['international', 'foreign'] },
  { id: 'family', name: 'Family', hubIdentifier: 'movies.family', genres: ['family', 'kids'] },
  { id: 'anime', name: 'Anime', hubIdentifier: 'movies.anime', genres: ['anime', 'animation'] },
  { id: 'cult', name: 'Cult Classics', hubIdentifier: 'movies.cult', genres: ['cult-classic', 'b-movie'] },
];

// ============================================================================
// CONFIGURATION
// ============================================================================

const PLEX_CONFIG: FASTProviderConfig = {
  id: 'plex_free',
  name: 'Plex Free',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Plex_logo_2022.svg/200px-Plex_logo_2022.svg.png',
  baseUrl: 'https://www.plex.tv',
  supportsEmbed: false, // Plex requires their player
  supportsDeepLink: true,
  supportedRegions: ['US', 'CA', 'UK', 'AU', 'DE', 'NZ'],
  contentRatings: ['G', 'PG', 'PG-13', 'R', 'TV-14', 'TV-MA'],
  adFrequency: 'low', // Plex has fewer ads than competitors
  maxQuality: '1080p',
  features: ['free', 'ad-supported', 'personal-library', 'mobile-app', 'smart-tv', 'chromecast', 'airplay'],
};

// ============================================================================
// ADAPTER IMPLEMENTATION
// ============================================================================

class PlexAdapterImpl implements FASTProviderAdapter {
  readonly providerId = 'plex_free';
  readonly providerName = 'Plex';
  
  private config = PLEX_CONFIG;

  /**
   * Discover content from Plex Free
   */
  async discover(options: FASTDiscoverOptions = {}): Promise<FASTContentItem[]> {
    const { 
      category = 'featured',
      limit = 20,
    } = options;

    const items: FASTContentItem[] = [];

    // Find matching category
    const plexCategory = PLEX_CATEGORIES.find(c => c.id === category);
    
    if (plexCategory) {
      console.log(`[PlexAdapter] Discovering ${plexCategory.name} content...`);
    }

    return items;
  }

  /**
   * Normalize Plex content to MediaNode format
   */
  normalize(item: PlexContent): Partial<MediaNode> {
    const mediaType = item.type === 'show' ? 'series' : item.type === 'episode' ? 'episode' : 'movie';
    
    return {
      canonical_id: `lucy:${mediaType}:plex_free:${item.ratingKey}`,
      media_type: mediaType,
      category: 'video',
      title: item.title,
      description: item.summary,
      release_year: item.year,
      duration_seconds: item.duration ? Math.round(item.duration / 1000) : undefined, // Plex uses ms
      poster_url: item.thumb,
      thumbnail_url: item.thumb,
      backdrop_url: item.art,
      content_rating: item.contentRating,
      average_rating: item.audienceRating,
      provider_source: 'plex_free',
      provider_content_id: item.ratingKey,
      embed_allowed: false,
    };
  }

  /**
   * Get embed configuration for Plex
   */
  getEmbedConfig(contentId: string): FASTEmbedConfig {
    return {
      provider: 'plex_free',
      embedUrl: null, // Plex doesn't support iframe embedding
      deepLinkUrl: `https://app.plex.tv/desktop/#!/provider/tv.plex.provider.vod/details?key=/library/metadata/${contentId}`,
      mobileDeepLink: `plex://preplay?metadataKey=/library/metadata/${contentId}`,
      allowFullscreen: true,
      autoplay: false,
      supportsInlinePlay: false,
      fallbackBehavior: 'deep-link',
      playerOptions: {
        showControls: true,
        adSupported: true,
        requiresAccount: true, // Free account required
      },
    };
  }

  /**
   * Check if Plex is accessible
   */
  async healthCheck(): Promise<FASTHealthStatus> {
    try {
      const start = Date.now();
      await fetch('https://www.plex.tv', { method: 'HEAD', mode: 'no-cors' });
      const latency = Date.now() - start;
      
      return {
        provider: 'plex_free',
        isAvailable: true,
        latencyMs: latency,
        lastChecked: new Date().toISOString(),
        features: this.config.features,
      };
    } catch (error) {
      return {
        provider: 'plex_free',
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
   * Get available categories
   */
  getCategories(): PlexCategory[] {
    return [...PLEX_CATEGORIES];
  }

  /**
   * Generate deep link for Plex content
   */
  getDeepLink(contentId: string): string {
    return `https://app.plex.tv/desktop/#!/provider/tv.plex.provider.vod/details?key=/library/metadata/${contentId}`;
  }

  /**
   * Generate mobile app deep link
   */
  getMobileDeepLink(contentId: string): string {
    return `plex://preplay?metadataKey=/library/metadata/${contentId}`;
  }

  /**
   * Generate web watch link
   */
  getWatchLink(contentId: string): string {
    return `https://watch.plex.tv/movie/${contentId}`;
  }

  /**
   * Search Plex content
   */
  async search(query: string): Promise<FASTContentItem[]> {
    console.log(`[PlexAdapter] Searching for: ${query}`);
    return [];
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const PlexAdapter = new PlexAdapterImpl();

export { 
  PLEX_CATEGORIES,
  PLEX_CONFIG,
  type PlexCategory,
  type PlexContent,
};
