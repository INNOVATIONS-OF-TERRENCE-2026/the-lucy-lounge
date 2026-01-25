/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — FAST CHANNELS DIRECTORY                                  │
 * │                                                                             │
 * │ Free Ad-Supported Streaming Television integration                         │
 * │ Pluto TV, Tubi, Plex, Peacock Free — Lucy routes to free first.           │
 * │                                                                             │
 * │ Why pay when free is good enough?                                          │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import type { MediaNode, MediaCategory } from '@/media/types';

// =============================================================================
// FAST PROVIDER TYPES
// =============================================================================

export type FASTProvider = 'pluto' | 'tubi' | 'plex' | 'peacock_free' | 'freevee' | 'roku_channel' | 'xumo';

export interface FASTChannel {
  id: string;
  provider: FASTProvider;
  name: string;
  description: string;
  logoUrl: string;
  category: FASTChannelCategory;
  genres: string[];
  isLive: boolean;
  
  // Deep linking
  webUrl: string;
  appUrl?: string;               // Mobile deep link
  
  // Content info
  currentProgram?: {
    title: string;
    startTime: Date;
    endTime: Date;
    description?: string;
  };
  
  // Quality
  quality: '720p' | '1080p' | '4k';
  hasAds: boolean;
}

export type FASTChannelCategory = 
  | 'movies'
  | 'tv_shows'
  | 'news'
  | 'sports'
  | 'music'
  | 'kids'
  | 'lifestyle'
  | 'documentary'
  | 'comedy'
  | 'drama'
  | 'horror'
  | 'scifi'
  | 'reality';

export interface FASTCatalogItem {
  id: string;
  provider: FASTProvider;
  title: string;
  type: 'movie' | 'series' | 'episode';
  
  // Metadata
  year?: number;
  rating?: string;
  duration?: number;              // minutes
  genres: string[];
  description: string;
  posterUrl: string;
  backdropUrl?: string;
  
  // Series info
  season?: number;
  episode?: number;
  seriesTitle?: string;
  
  // Deep linking
  webUrl: string;
  appUrl?: string;
  
  // Availability
  availableUntil?: Date;
  isNew: boolean;
  isFeatured: boolean;
}

// =============================================================================
// FAST PROVIDER CONFIGURATIONS
// =============================================================================

interface FASTProviderConfig {
  id: FASTProvider;
  name: string;
  tagline: string;
  logoUrl: string;
  baseUrl: string;
  apiEndpoint?: string;
  color: string;
  features: string[];
}

export const FAST_PROVIDERS: Record<FASTProvider, FASTProviderConfig> = {
  pluto: {
    id: 'pluto',
    name: 'Pluto TV',
    tagline: 'Free TV. Stream Now.',
    logoUrl: '/images/providers/pluto.svg',
    baseUrl: 'https://pluto.tv',
    color: '#00E4D4',
    features: ['Live TV', 'On Demand', '250+ Channels'],
  },
  tubi: {
    id: 'tubi',
    name: 'Tubi',
    tagline: 'Free Movies & TV',
    logoUrl: '/images/providers/tubi.svg',
    baseUrl: 'https://tubitv.com',
    color: '#FA382F',
    features: ['40,000+ Titles', 'No Credit Card', 'Fox Entertainment'],
  },
  plex: {
    id: 'plex',
    name: 'Plex',
    tagline: 'Free Movies, TV, Music',
    logoUrl: '/images/providers/plex.svg',
    baseUrl: 'https://watch.plex.tv',
    color: '#E5A00D',
    features: ['Free Streaming', 'Live TV', 'Personal Media'],
  },
  peacock_free: {
    id: 'peacock_free',
    name: 'Peacock Free',
    tagline: 'Stream for Free',
    logoUrl: '/images/providers/peacock.svg',
    baseUrl: 'https://www.peacocktv.com',
    color: '#000000',
    features: ['NBC Shows', 'Live Sports', 'News'],
  },
  freevee: {
    id: 'freevee',
    name: 'Amazon Freevee',
    tagline: 'Free with Ads',
    logoUrl: '/images/providers/freevee.svg',
    baseUrl: 'https://www.amazon.com/gp/video/splash/freevee',
    color: '#00A8E1',
    features: ['Amazon Originals', 'Live TV', 'IMDb TV'],
  },
  roku_channel: {
    id: 'roku_channel',
    name: 'The Roku Channel',
    tagline: 'Free Movies & Live TV',
    logoUrl: '/images/providers/roku.svg',
    baseUrl: 'https://therokuchannel.roku.com',
    color: '#662D91',
    features: ['Live TV', 'Movies', 'Roku Originals'],
  },
  xumo: {
    id: 'xumo',
    name: 'Xumo',
    tagline: 'Free Streaming TV',
    logoUrl: '/images/providers/xumo.svg',
    baseUrl: 'https://www.xumo.tv',
    color: '#00B4E4',
    features: ['Live Channels', 'On Demand', 'Comcast Backed'],
  },
};

// =============================================================================
// FEATURED FAST CHANNELS (CURATED)
// =============================================================================

export const FEATURED_CHANNELS: FASTChannel[] = [
  // ==== MUSIC ====
  {
    id: 'pluto-mtv-classic',
    provider: 'pluto',
    name: 'MTV Classic',
    description: 'Classic music videos from the 80s and 90s',
    logoUrl: '/images/channels/mtv-classic.png',
    category: 'music',
    genres: ['80s', '90s', 'pop', 'rock'],
    isLive: true,
    webUrl: 'https://pluto.tv/live-tv/mtv-classic',
    quality: '720p',
    hasAds: true,
  },
  {
    id: 'pluto-vh1-classic',
    provider: 'pluto',
    name: 'VH1 Classic',
    description: 'Pop culture and classic music moments',
    logoUrl: '/images/channels/vh1-classic.png',
    category: 'music',
    genres: ['pop', 'rnb', 'classic'],
    isLive: true,
    webUrl: 'https://pluto.tv/live-tv/vh1-classic',
    quality: '720p',
    hasAds: true,
  },
  {
    id: 'plex-jazz-radio',
    provider: 'plex',
    name: 'Jazz Radio',
    description: '24/7 Jazz music streaming',
    logoUrl: '/images/channels/jazz-radio.png',
    category: 'music',
    genres: ['jazz', 'smooth jazz', 'bebop'],
    isLive: true,
    webUrl: 'https://watch.plex.tv/live-tv/jazz-radio',
    quality: '720p',
    hasAds: true,
  },
  
  // ==== MOVIES ====
  {
    id: 'tubi-thriller',
    provider: 'tubi',
    name: 'Tubi Thriller',
    description: 'Heart-pounding thriller movies',
    logoUrl: '/images/channels/tubi-thriller.png',
    category: 'movies',
    genres: ['thriller', 'suspense', 'mystery'],
    isLive: true,
    webUrl: 'https://tubitv.com/live/tubi-thriller',
    quality: '1080p',
    hasAds: true,
  },
  {
    id: 'pluto-cult-films',
    provider: 'pluto',
    name: 'Cult Films',
    description: 'The best cult classic movies',
    logoUrl: '/images/channels/cult-films.png',
    category: 'movies',
    genres: ['cult', 'classic', 'indie'],
    isLive: true,
    webUrl: 'https://pluto.tv/live-tv/cult-films',
    quality: '720p',
    hasAds: true,
  },
  {
    id: 'plex-cinema-noir',
    provider: 'plex',
    name: 'Cinema Noir',
    description: 'Classic film noir and neo-noir',
    logoUrl: '/images/channels/cinema-noir.png',
    category: 'movies',
    genres: ['noir', 'classic', 'drama'],
    isLive: true,
    webUrl: 'https://watch.plex.tv/live-tv/cinema-noir',
    quality: '720p',
    hasAds: true,
  },
  
  // ==== DOCUMENTARY ====
  {
    id: 'pluto-documentary',
    provider: 'pluto',
    name: 'Pluto Documentary',
    description: 'Real stories, real impact',
    logoUrl: '/images/channels/pluto-doc.png',
    category: 'documentary',
    genres: ['documentary', 'true crime', 'nature'],
    isLive: true,
    webUrl: 'https://pluto.tv/live-tv/pluto-tv-documentaries',
    quality: '720p',
    hasAds: true,
  },
  
  // ==== COMEDY ====
  {
    id: 'pluto-comedy-central',
    provider: 'pluto',
    name: 'Comedy Central',
    description: 'Non-stop comedy',
    logoUrl: '/images/channels/comedy-central.png',
    category: 'comedy',
    genres: ['comedy', 'standup', 'sketch'],
    isLive: true,
    webUrl: 'https://pluto.tv/live-tv/comedy-central',
    quality: '720p',
    hasAds: true,
  },
];

// =============================================================================
// FAST CHANNEL ADAPTER
// =============================================================================

export class FASTChannelAdapter {
  private cache: Map<string, FASTCatalogItem[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  
  // ===========================================================================
  // CHANNEL DISCOVERY
  // ===========================================================================
  
  /**
   * Get all featured channels
   */
  getFeaturedChannels(): FASTChannel[] {
    return FEATURED_CHANNELS;
  }
  
  /**
   * Get channels by category
   */
  getChannelsByCategory(category: FASTChannelCategory): FASTChannel[] {
    return FEATURED_CHANNELS.filter(ch => ch.category === category);
  }
  
  /**
   * Get channels by provider
   */
  getChannelsByProvider(provider: FASTProvider): FASTChannel[] {
    return FEATURED_CHANNELS.filter(ch => ch.provider === provider);
  }
  
  /**
   * Search channels by genre
   */
  searchChannels(query: string): FASTChannel[] {
    const q = query.toLowerCase();
    return FEATURED_CHANNELS.filter(ch => 
      ch.name.toLowerCase().includes(q) ||
      ch.description.toLowerCase().includes(q) ||
      ch.genres.some(g => g.toLowerCase().includes(q))
    );
  }
  
  // ===========================================================================
  // CATALOG SEARCH (SIMULATED - WOULD USE REAL APIS)
  // ===========================================================================
  
  /**
   * Search for free content across all FAST providers
   */
  async searchCatalog(query: string): Promise<FASTCatalogItem[]> {
    const cacheKey = `search:${query}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey) || [];
    }
    
    // In production, this would call each provider's API
    // For now, return simulated results
    const results = await this.simulateCatalogSearch(query);
    
    this.setCache(cacheKey, results);
    return results;
  }
  
  /**
   * Get trending content on FAST platforms
   */
  async getTrending(category?: FASTChannelCategory): Promise<FASTCatalogItem[]> {
    const cacheKey = `trending:${category || 'all'}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey) || [];
    }
    
    const results = await this.simulateTrending(category);
    
    this.setCache(cacheKey, results);
    return results;
  }
  
  /**
   * Get newly added free content
   */
  async getNewlyAdded(): Promise<FASTCatalogItem[]> {
    const cacheKey = 'newly-added';
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey) || [];
    }
    
    const results = await this.simulateNewlyAdded();
    
    this.setCache(cacheKey, results);
    return results;
  }
  
  // ===========================================================================
  // DEEP LINKING
  // ===========================================================================
  
  /**
   * Generate deep link for content
   */
  getDeepLink(item: FASTCatalogItem): string {
    return item.webUrl;
  }
  
  /**
   * Generate mobile app deep link
   */
  getMobileDeepLink(item: FASTCatalogItem): string | null {
    return item.appUrl || null;
  }
  
  /**
   * Generate universal link (chooses best platform)
   */
  getUniversalLink(item: FASTCatalogItem): string {
    // Check if mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile && item.appUrl) {
      return item.appUrl;
    }
    
    return item.webUrl;
  }
  
  // ===========================================================================
  // CONVERSION TO MEDIA NODE
  // ===========================================================================
  
  /**
   * Convert FAST catalog item to MediaNode for unified UI
   */
  toMediaNode(item: FASTCatalogItem): MediaNode {
    const category: MediaCategory = item.type === 'movie' ? 'video' : 'video';
    
    return {
      id: `fast:${item.provider}:${item.id}`,
      type: category,
      title: item.title,
      description: item.description,
      artwork: item.posterUrl,
      artists: [],
      genres: item.genres,
      release_date: item.year?.toString(),
      duration: item.duration ? item.duration * 60 : undefined, // Convert to seconds
      source: 'fast',
      provider: item.provider,
      external_ids: {
        fast_id: item.id,
        provider: item.provider,
      },
      deep_links: {
        web: item.webUrl,
        app: item.appUrl,
      },
      metadata: {
        isNew: item.isNew,
        isFeatured: item.isFeatured,
        rating: item.rating,
        isFree: true,
        hasAds: true,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  
  // ===========================================================================
  // CACHE MANAGEMENT
  // ===========================================================================
  
  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    if (!expiry) return false;
    return Date.now() < expiry;
  }
  
  private setCache(key: string, data: FASTCatalogItem[]): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }
  
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
  
  // ===========================================================================
  // SIMULATED DATA (WOULD BE REPLACED WITH REAL API CALLS)
  // ===========================================================================
  
  private async simulateCatalogSearch(query: string): Promise<FASTCatalogItem[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const q = query.toLowerCase();
    
    // Return simulated results based on query
    const simulatedCatalog: FASTCatalogItem[] = [
      {
        id: 'tubi-1',
        provider: 'tubi',
        title: 'The Matrix',
        type: 'movie',
        year: 1999,
        rating: 'R',
        duration: 136,
        genres: ['scifi', 'action'],
        description: 'A computer hacker learns about the true nature of reality.',
        posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
        webUrl: 'https://tubitv.com/movies/100004308',
        isNew: false,
        isFeatured: true,
      },
      {
        id: 'pluto-1',
        provider: 'pluto',
        title: 'Blade Runner',
        type: 'movie',
        year: 1982,
        rating: 'R',
        duration: 117,
        genres: ['scifi', 'noir'],
        description: 'A blade runner must pursue and terminate replicants.',
        posterUrl: 'https://image.tmdb.org/t/p/w500/63N9uy8nd9j7Eog2axPQ8lbr3Wj.jpg',
        webUrl: 'https://pluto.tv/on-demand/movies/blade-runner',
        isNew: false,
        isFeatured: true,
      },
      {
        id: 'plex-1',
        provider: 'plex',
        title: 'Pulp Fiction',
        type: 'movie',
        year: 1994,
        rating: 'R',
        duration: 154,
        genres: ['crime', 'drama'],
        description: 'Interconnected stories of criminals in Los Angeles.',
        posterUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
        webUrl: 'https://watch.plex.tv/movie/pulp-fiction',
        isNew: false,
        isFeatured: true,
      },
    ];
    
    // Filter based on query
    if (q) {
      return simulatedCatalog.filter(item => 
        item.title.toLowerCase().includes(q) ||
        item.genres.some(g => g.includes(q))
      );
    }
    
    return simulatedCatalog;
  }
  
  private async simulateTrending(category?: FASTChannelCategory): Promise<FASTCatalogItem[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Would fetch from real APIs
    return [
      {
        id: 'trending-1',
        provider: 'tubi',
        title: 'Breaking Bad',
        type: 'series',
        year: 2008,
        rating: 'TV-MA',
        genres: ['drama', 'thriller'],
        description: 'A high school chemistry teacher turned meth producer.',
        posterUrl: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
        webUrl: 'https://tubitv.com/series/300003062',
        isNew: true,
        isFeatured: true,
      },
    ];
  }
  
  private async simulateNewlyAdded(): Promise<FASTCatalogItem[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return [
      {
        id: 'new-1',
        provider: 'peacock_free',
        title: 'The Office',
        type: 'series',
        year: 2005,
        rating: 'TV-14',
        genres: ['comedy'],
        description: 'A mockumentary sitcom about office employees.',
        posterUrl: 'https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg',
        webUrl: 'https://www.peacocktv.com/watch/asset/tv/the-office',
        isNew: true,
        isFeatured: true,
      },
    ];
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let adapterInstance: FASTChannelAdapter | null = null;

export function getFASTChannelAdapter(): FASTChannelAdapter {
  if (!adapterInstance) {
    adapterInstance = new FASTChannelAdapter();
  }
  return adapterInstance;
}
