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
  FASTHealthStatus,
  MediaAvailability
} from './FASTProviderAdapter';
import type { MediaNode, ContentRating } from '../types';

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
  supportsFreeContent: true,
  contentTypes: ['movie', 'show'],
  termsUrl: 'https://www.amazon.com/gp/help/customer/display.html?nodeId=201376540',
};

// ============================================================================
// ADAPTER IMPLEMENTATION
// ============================================================================

class FreeveeAdapterImpl implements FASTProviderAdapter {
  readonly providerId = 'freevee';
  readonly providerName = 'Amazon Freevee';
  
  private config = FREEVEE_CONFIG;
  private features = ['free', 'ad-supported', 'freevee-originals', 'imdb-integration', 'mobile-app', 'smart-tv', 'fire-tv', 'x-ray'];

  readonly providerInfo = {
    id: 'freevee',
    name: 'Amazon Freevee',
    logoUrl: FREEVEE_CONFIG.logoUrl,
    description: 'Free ad-supported streaming service from Amazon with movies and TV shows',
    features: this.features,
  };

  /**
   * Get availability information for content
   */
  async getAvailability(contentId: string): Promise<MediaAvailability> {
    const now = new Date().toISOString();
    return {
      id: `freevee:avail:${contentId}`,
      media_node_id: `freevee:${contentId}`,
      provider_id: 'freevee',
      provider_content_id: contentId,
      available: true,
      regions: ['US', 'UK', 'DE'],
      url: `https://www.amazon.com/gp/video/detail/${contentId}`,
      free: true,
      created_at: now,
      updated_at: now,
    };
  }

  /**
   * Get availability information for a specific region
   */
  async getRegionAvailability(region?: string): Promise<{ available: boolean; regions: string[]; restrictions?: string[] }> {
    // Freevee is available in US, UK, and Germany
    const supportedRegions = ['US', 'UK', 'DE'];
    const isAvailable = region ? supportedRegions.includes(region.toUpperCase()) : true;
    
    return {
      available: isAvailable,
      regions: supportedRegions,
      restrictions: region && !isAvailable ? [`Freevee is not available in ${region}`] : undefined,
    };
  }

  /**
   * Discover content from Amazon Freevee
   */
  async discover(options: FASTDiscoverOptions = {}): Promise<{ items: MediaNode[]; total: number; hasMore: boolean }> {
    const { 
      category = 'popular',
      limit = 20,
    } = options;

    const items: MediaNode[] = [];

    // Find matching category
    const freeveeCategory = FREEVEE_CATEGORIES.find(c => c.id === category);
    
    if (freeveeCategory) {
      console.log(`[FreeveeAdapter] Discovering ${freeveeCategory.name} content...`);
    }

    return {
      items,
      total: items.length,
      hasMore: false,
    };
  }

  /**
   * Normalize Freevee content to MediaNode format
   */
  normalize(item: FreeveeContent): MediaNode {
    const mediaType = item.type === 'series' || item.type === 'episode' ? 'show' : 'movie';
    
    const now = new Date().toISOString();
    return {
      id: `freevee:${item.asin}`,
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
      content_rating: item.rating as ContentRating | undefined,
      average_rating: item.imdbRating,
      provider_source: 'freevee',
      provider_content_id: item.asin,
      embed_allowed: false,
      created_at: now,
      updated_at: now,
      metadata: {
        imdb_id: item.imdbId,
      },
    } as MediaNode;
  }

  /**
   * Get embed configuration for Freevee
   */
  async getEmbedConfig(contentId: string, mediaType?: string): Promise<FASTEmbedConfig> {
    const deepLinkUrl = `https://www.amazon.com/gp/video/detail/${contentId}`;

    return {
      provider: 'freevee',
      embedUrl: null, // Amazon doesn't support iframe embedding
      deepLinkUrl: deepLinkUrl,
      autoplay: false,
      iframeAllowed: false,
      playerType: 'external',
      aspectRatio: '16:9',
      controls: true,
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
        status: 'healthy',
        latencyMs: latency,
        lastChecked: new Date(),
      };
    } catch {
      return {
        provider: 'freevee',
        status: 'down',
        latencyMs: -1,
        lastChecked: new Date(),
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
  async search(query: string, limit?: number): Promise<MediaNode[]> {
    console.log(`[FreeveeAdapter] Searching for: ${query}${limit ? ` (limit: ${limit})` : ''}`);
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
