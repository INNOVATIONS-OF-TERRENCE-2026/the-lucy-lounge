/**
 * Tubi FAST Provider Adapter
 * 
 * Tubi is a free ad-supported streaming service with a large library of movies and TV shows.
 * Note: Tubi does not provide a public embed API, so this adapter creates deep links
 * that open in a new tab or can be used with mobile app integration.
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

interface TubiCategory {
  id: string;
  name: string;
  genres: string[];
}

interface TubiSearchResult {
  id: string;
  title: string;
  type: 'movie' | 'series';
  description: string;
  year: number;
  posterUrl: string;
  genres: string[];
  duration?: number;
  episodeCount?: number;
  rating?: string;
}

interface TubiCuratedCollection {
  id: string;
  title: string;
  type: 'collection';
  genres: string[];
  provider_type: 'FAST';
  provider_name: 'Tubi';
  tags: string[];
}

// ============================================================================
// TUBI CATEGORIES MAPPING
// ============================================================================

const TUBI_CATEGORIES: TubiCategory[] = [
  { id: 'action', name: 'Action', genres: ['action', 'adventure', 'thriller'] },
  { id: 'comedy', name: 'Comedy', genres: ['comedy', 'romantic-comedy'] },
  { id: 'drama', name: 'Drama', genres: ['drama'] },
  { id: 'horror', name: 'Horror', genres: ['horror', 'thriller'] },
  { id: 'sci-fi', name: 'Sci-Fi & Fantasy', genres: ['sci-fi', 'fantasy'] },
  { id: 'documentaries', name: 'Documentaries', genres: ['documentary'] },
  { id: 'black-cinema', name: 'Black Cinema', genres: ['black-cinema', 'drama'] },
  { id: 'black-action', name: 'Black Action Spotlight', genres: ['action', 'black-cinema'] },
  { id: 'classics', name: 'Classics', genres: ['classic', 'golden-age'] },
  { id: 'anime', name: 'Anime', genres: ['anime', 'animation'] },
  { id: 'foreign', name: 'Foreign Films', genres: ['international', 'foreign'] },
  { id: 'cult', name: 'Cult Classics', genres: ['cult-classic', 'b-movie'] },
  { id: 'thriller', name: 'Thrillers', genres: ['thriller', 'mystery'] },
  { id: 'romance', name: 'Romance', genres: ['romance', 'romantic-comedy'] },
  { id: 'family', name: 'Family', genres: ['family', 'kids'] },
  { id: 'sports', name: 'Sports', genres: ['sports'] },
  { id: 'reality', name: 'Reality TV', genres: ['reality', 'competition'] },
];

// ============================================================================
// CONFIGURATION
// ============================================================================

const TUBI_CONFIG: FASTProviderConfig = {
  id: 'tubi',
  name: 'Tubi',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Tubi_logo.svg/200px-Tubi_logo.svg.png',
  baseUrl: 'https://tubitv.com',
  supportsEmbed: false, // Tubi doesn't support iframe embedding
  supportsDeepLink: true,
  supportedRegions: ['US', 'CA', 'MX', 'AU', 'GB'],
  contentRatings: ['G', 'PG', 'PG-13', 'R', 'TV-14', 'TV-MA'],
  adFrequency: 'standard', // ~5 min ad breaks
  maxQuality: '1080p',
  features: ['free', 'ad-supported', 'mobile-app', 'smart-tv', 'chromecast'],
};

// ============================================================================
// ADAPTER IMPLEMENTATION
// ============================================================================

class TubiAdapterImpl implements FASTProviderAdapter {
  readonly providerId = 'tubi';
  readonly providerName = 'Tubi';
  
  private config = TUBI_CONFIG;

  /**
   * Discover content from Tubi by category
   */
  async discover(options: FASTDiscoverOptions = {}): Promise<FASTContentItem[]> {
    const { 
      category = 'popular',
      limit = 20,
      page = 1,
      genres = [],
      sortBy = 'popularity'
    } = options;

    // In production, this would call Tubi's API
    // For now, return curated content that's available on Tubi
    const items: FASTContentItem[] = [];

    // Map category to Tubi content
    const tubiCategory = TUBI_CATEGORIES.find(c => c.id === category);
    
    if (tubiCategory) {
      // Return genre-matched content
      console.log(`[TubiAdapter] Discovering ${category} content...`);
    }

    return items;
  }

  /**
   * Normalize Tubi content to MediaNode format
   */
  normalize(item: TubiSearchResult): Partial<MediaNode> {
    return {
      canonical_id: `lucy:${item.type}:tubi:${item.id}`,
      media_type: item.type === 'series' ? 'series' : 'movie',
      category: 'video',
      title: item.title,
      description: item.description,
      release_year: item.year,
      duration_seconds: item.duration ? item.duration * 60 : undefined,
      poster_url: item.posterUrl,
      thumbnail_url: item.posterUrl,
      content_rating: item.rating,
      provider_source: 'tubi',
      provider_content_id: item.id,
      embed_allowed: false, // Tubi doesn't allow iframe embedding
    };
  }

  /**
   * Get embed configuration for Tubi
   * Note: Tubi doesn't support iframe embedding, returns deep link instead
   */
  getEmbedConfig(contentId: string): FASTEmbedConfig {
    return {
      provider: 'tubi',
      embedUrl: null, // No iframe support
      deepLinkUrl: `https://tubitv.com/movies/${contentId}`,
      mobileDeepLink: `tubi://movies/${contentId}`,
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
   * Check if Tubi is accessible
   */
  async healthCheck(): Promise<FASTHealthStatus> {
    try {
      // In production, ping Tubi's status endpoint
      const response = await fetch('https://tubitv.com', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      return {
        provider: 'tubi',
        isAvailable: true,
        latencyMs: 0,
        lastChecked: new Date().toISOString(),
        features: this.config.features,
      };
    } catch (error) {
      return {
        provider: 'tubi',
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
   * Search Tubi content
   */
  async search(query: string, options: FASTDiscoverOptions = {}): Promise<FASTContentItem[]> {
    const { limit = 20 } = options;
    
    // In production, this would call Tubi's search API
    console.log(`[TubiAdapter] Searching for: ${query}`);
    
    return [];
  }

  /**
   * Get content by ID
   */
  async getContent(contentId: string): Promise<FASTContentItem | null> {
    // In production, this would fetch content details from Tubi
    console.log(`[TubiAdapter] Fetching content: ${contentId}`);
    
    return null;
  }

  /**
   * Generate deep link for Tubi content
   */
  getDeepLink(contentId: string, type: 'movie' | 'series' = 'movie'): string {
    if (type === 'series') {
      return `https://tubitv.com/series/${contentId}`;
    }
    return `https://tubitv.com/movies/${contentId}`;
  }

  /**
   * Generate mobile app deep link
   */
  getMobileDeepLink(contentId: string, type: 'movie' | 'series' = 'movie'): string {
    if (type === 'series') {
      return `tubi://series/${contentId}`;
    }
    return `tubi://movies/${contentId}`;
  }
}

// ============================================================================
// CURATED COLLECTIONS
// ============================================================================

export const TUBI_CURATED_COLLECTIONS: TubiCuratedCollection[] = [
  {
    id: 'tubi_black_action_collection',
    title: 'Black Action Spotlight',
    type: 'collection',
    genres: ['Action'],
    provider_type: 'FAST',
    provider_name: 'Tubi',
    tags: ['black_cinema', 'action', 'fast'],
  },
];

// ============================================================================
// EXPORT
// ============================================================================

export const TubiAdapter = new TubiAdapterImpl();

export { 
  TUBI_CATEGORIES,
  TUBI_CONFIG,
  TUBI_CURATED_COLLECTIONS,
  type TubiCategory,
  type TubiSearchResult,
  type TubiCuratedCollection,
};
