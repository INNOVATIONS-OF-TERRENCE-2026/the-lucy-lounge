/**
 * Amazon Freevee FAST Provider Adapter
 * 
 * Amazon Freevee (formerly IMDb TV) is a free ad-supported streaming service
 * owned by Amazon with a curated library of movies and TV shows.
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

interface FreeveeCategory {
  id: string;
  name: string;
  refTag: string;
  genres: string[];
}

interface FreeveeContent {
  asin: string;
  title: string;
  type: 'movie' | 'series' | 'episode';
  synopsis: string;
  releaseYear?: number;
  imageUrl: string;
  backdropUrl?: string;
  genres: string[];
  runtimeMinutes?: number;
  rating?: string;
  imdbRating?: number;
  imdbId?: string;
  seasonCount?: number;
}

// ============================================================================
// FREEVEE CATEGORIES
// ============================================================================

const FREEVEE_CATEGORIES: FreeveeCategory[] = [
  { id: 'popular', name: 'Popular', refTag: 'atv_mr_c_2', genres: [] },
  { id: 'originals', name: 'Freevee Originals', refTag: 'atv_mr_c_originals', genres: [] },
  { id: 'action', name: 'Action & Adventure', refTag: 'atv_mr_c_action', genres: ['action', 'adventure'] },
  { id: 'comedy', name: 'Comedy', refTag: 'atv_mr_c_comedy', genres: ['comedy'] },
  { id: 'drama', name: 'Drama', refTag: 'atv_mr_c_drama', genres: ['drama'] },
  { id: 'horror', name: 'Horror', refTag: 'atv_mr_c_horror', genres: ['horror'] },
  { id: 'thriller', name: 'Suspense & Thriller', refTag: 'atv_mr_c_thriller', genres: ['thriller', 'suspense'] },
  { id: 'sci-fi', name: 'Sci-Fi & Fantasy', refTag: 'atv_mr_c_scifi', genres: ['sci-fi', 'fantasy'] },
  { id: 'documentary', name: 'Documentary', refTag: 'atv_mr_c_documentary', genres: ['documentary'] },
  { id: 'romance', name: 'Romance', refTag: 'atv_mr_c_romance', genres: ['romance', 'romantic-comedy'] },
  { id: 'family', name: 'Kids & Family', refTag: 'atv_mr_c_family', genres: ['family', 'kids', 'animation'] },
  { id: 'crime', name: 'Crime', refTag: 'atv_mr_c_crime', genres: ['crime', 'mystery'] },
  { id: 'classics', name: 'Classic Movies', refTag: 'atv_mr_c_classics', genres: ['classic', 'golden-age'] },
  { id: 'international', name: 'International', refTag: 'atv_mr_c_international', genres: ['international', 'foreign'] },
  { id: 'music', name: 'Music & Concert', refTag: 'atv_mr_c_music', genres: ['music', 'concert', 'musical'] },
];

// ============================================================================
// CONFIGURATION
// ============================================================================

const FREEVEE_CONFIG: FASTProviderConfig = {
  id: 'freevee',
  name: 'Amazon Freevee',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Amazon_Freevee_logo.svg/200px-Amazon_Freevee_logo.svg.png',
  baseUrl: 'https://www.amazon.com/gp/video/storefront/ref=atv_hm_fre_c_ln',
  supportsEmbed: false, // Amazon doesn't support iframe embedding
  supportsDeepLink: true,
  supportedRegions: ['US', 'UK', 'DE'],
  contentRatings: ['G', 'PG', 'PG-13', 'R', 'TV-14', 'TV-MA'],
  adFrequency: 'standard',
  maxQuality: '1080p',
  features: ['free', 'ad-supported', 'freevee-originals', 'imdb-integration', 'mobile-app', 'smart-tv', 'fire-tv', 'x-ray'],
};

// ============================================================================
// ADAPTER IMPLEMENTATION
// ============================================================================

class FreeveeAdapterImpl implements FASTProviderAdapter {
  readonly providerId = 'freevee';
  readonly providerName = 'Amazon Freevee';
  
  private config = FREEVEE_CONFIG;

  /**
   * Discover content from Amazon Freevee
   */
  async discover(options: FASTDiscoverOptions = {}): Promise<FASTContentItem[]> {
    const { 
      category = 'popular',
      limit = 20,
    } = options;

    const items: FASTContentItem[] = [];

    // Find matching category
    const freeveeCategory = FREEVEE_CATEGORIES.find(c => c.id === category);
    
    if (freeveeCategory) {
      console.log(`[FreeveeAdapter] Discovering ${freeveeCategory.name} content...`);
    }

    return items;
  }

  /**
   * Normalize Freevee content to MediaNode format
   */
  normalize(item: FreeveeContent): Partial<MediaNode> {
    const mediaType = item.type === 'series' ? 'series' : item.type === 'episode' ? 'episode' : 'movie';
    
    return {
      canonical_id: `lucy:${mediaType}:freevee:${item.asin}`,
      media_type: mediaType,
      category: 'video',
      title: item.title,
      description: item.synopsis,
      release_year: item.releaseYear,
      duration_seconds: item.runtimeMinutes ? item.runtimeMinutes * 60 : undefined,
      poster_url: item.imageUrl,
      thumbnail_url: item.imageUrl,
      backdrop_url: item.backdropUrl,
      content_rating: item.rating,
      average_rating: item.imdbRating,
      provider_source: 'freevee',
      provider_content_id: item.asin,
      embed_allowed: false,
      metadata: {
        imdb_id: item.imdbId,
      },
    };
  }

  /**
   * Get embed configuration for Freevee
   */
  getEmbedConfig(contentId: string): FASTEmbedConfig {
    const deepLinkUrl = `https://www.amazon.com/gp/video/detail/${contentId}`;

    return {
      provider: 'freevee',
      embedUrl: null, // Amazon doesn't support iframe embedding
      deepLinkUrl: deepLinkUrl,
      mobileDeepLink: `aiv://aiv/watch?asin=${contentId}`,
      allowFullscreen: true,
      autoplay: false,
      supportsInlinePlay: false,
      fallbackBehavior: 'deep-link',
      playerOptions: {
        showControls: true,
        adSupported: true,
        xrayEnabled: true, // Amazon X-Ray feature
      },
    };
  }

  /**
   * Check if Freevee is accessible
   */
  async healthCheck(): Promise<FASTHealthStatus> {
    try {
      const start = Date.now();
      await fetch('https://www.amazon.com/gp/video/storefront', { method: 'HEAD', mode: 'no-cors' });
      const latency = Date.now() - start;
      
      return {
        provider: 'freevee',
        isAvailable: true,
        latencyMs: latency,
        lastChecked: new Date().toISOString(),
        features: this.config.features,
      };
    } catch (error) {
      return {
        provider: 'freevee',
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
  getCategories(): FreeveeCategory[] {
    return [...FREEVEE_CATEGORIES];
  }

  /**
   * Generate deep link for Freevee content
   */
  getDeepLink(asin: string): string {
    return `https://www.amazon.com/gp/video/detail/${asin}`;
  }

  /**
   * Generate mobile app deep link
   */
  getMobileDeepLink(asin: string): string {
    return `aiv://aiv/watch?asin=${asin}`;
  }

  /**
   * Generate Fire TV deep link
   */
  getFireTvDeepLink(asin: string): string {
    return `amzn://apps/android?p=com.amazon.avod&asin=${asin}`;
  }

  /**
   * Generate watch link from IMDb ID
   */
  getWatchLinkFromImdb(imdbId: string): string {
    return `https://www.amazon.com/gp/video/detail/${imdbId}`;
  }

  /**
   * Search Freevee content
   */
  async search(query: string): Promise<FASTContentItem[]> {
    console.log(`[FreeveeAdapter] Searching for: ${query}`);
    return [];
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const FreeveeAdapter = new FreeveeAdapterImpl();

export { 
  FREEVEE_CATEGORIES,
  FREEVEE_CONFIG,
  type FreeveeCategory,
  type FreeveeContent,
};
