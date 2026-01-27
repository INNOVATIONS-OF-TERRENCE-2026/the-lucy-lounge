// =============================================================================
// THE LUCY LOUNGE - FAST Provider Adapter Base
// =============================================================================
// Free Ad-Supported Streaming Television (FAST) Provider Architecture
// Supports: Internet Archive, Tubi (metadata), Pluto TV, Plex, Roku Channel
// =============================================================================

import type {
  MediaNode,
  MediaAvailability,
  ProviderType,
  MediaType,
  MediaCategory,
} from '../types';

// =============================================================================
// FAST PROVIDER TYPES
// =============================================================================

export type FASTProviderType =
  | 'archive_org'    // Public domain - Full embeds ✓
  | 'youtube'        // YouTube - Full embeds ✓
  | 'vimeo'          // Vimeo - Full embeds ✓
  | 'dailymotion'    // Dailymotion - Full embeds ✓
  | 'tubi'           // Tubi - Deep links only
  | 'pluto_tv'       // Pluto TV - Linear streams
  | 'plex_free'      // Plex - Deep links only
  | 'roku_channel'   // Roku - Deep links only
  | 'freevee';       // Amazon Freevee - Deep links only

export interface FASTProviderInfo {
  id: FASTProviderType;
  name: string;
  logoUrl: string;
  supportsEmbed: boolean;
  supportsDeepLink: boolean;
  supportsFreeContent: boolean;
  contentTypes: MediaType[];
  baseUrl: string;
  embedUrlPattern?: string;
  deepLinkPattern?: string;
  healthCheckUrl?: string;
  termsUrl: string;
}

// =============================================================================
// PROVIDER REGISTRY
// =============================================================================

export const FAST_PROVIDER_REGISTRY: Record<FASTProviderType, FASTProviderInfo> = {
  archive_org: {
    id: 'archive_org',
    name: 'Internet Archive',
    logoUrl: 'https://archive.org/images/logo_archive.svg',
    supportsEmbed: true,
    supportsDeepLink: true,
    supportsFreeContent: true,
    contentTypes: ['movie', 'tv_show', 'audiobook', 'music_album'],
    baseUrl: 'https://archive.org',
    embedUrlPattern: 'https://archive.org/embed/{id}',
    deepLinkPattern: 'https://archive.org/details/{id}',
    healthCheckUrl: 'https://archive.org/about/',
    termsUrl: 'https://archive.org/about/terms.php',
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    logoUrl: 'https://www.youtube.com/s/desktop/f506bd45/img/favicon_144x144.png',
    supportsEmbed: true,
    supportsDeepLink: true,
    supportsFreeContent: true,
    contentTypes: ['movie', 'tv_show', 'creator_video', 'live_stream'],
    baseUrl: 'https://www.youtube.com',
    embedUrlPattern: 'https://www.youtube.com/embed/{id}?autoplay=1&rel=0',
    deepLinkPattern: 'https://www.youtube.com/watch?v={id}',
    healthCheckUrl: 'https://www.youtube.com/',
    termsUrl: 'https://www.youtube.com/t/terms',
  },
  vimeo: {
    id: 'vimeo',
    name: 'Vimeo',
    logoUrl: 'https://f.vimeocdn.com/images_v6/svg/logo_full_vimeo.svg',
    supportsEmbed: true,
    supportsDeepLink: true,
    supportsFreeContent: true,
    contentTypes: ['movie', 'creator_video'],
    baseUrl: 'https://vimeo.com',
    embedUrlPattern: 'https://player.vimeo.com/video/{id}?autoplay=1',
    deepLinkPattern: 'https://vimeo.com/{id}',
    healthCheckUrl: 'https://vimeo.com/',
    termsUrl: 'https://vimeo.com/terms',
  },
  dailymotion: {
    id: 'dailymotion',
    name: 'Dailymotion',
    logoUrl: 'https://static1.dmcdn.net/images/dailymotion-logo-ogtag.png',
    supportsEmbed: true,
    supportsDeepLink: true,
    supportsFreeContent: true,
    contentTypes: ['movie', 'tv_show', 'creator_video'],
    baseUrl: 'https://www.dailymotion.com',
    embedUrlPattern: 'https://www.dailymotion.com/embed/video/{id}?autoplay=1',
    deepLinkPattern: 'https://www.dailymotion.com/video/{id}',
    healthCheckUrl: 'https://www.dailymotion.com/',
    termsUrl: 'https://www.dailymotion.com/legal/terms',
  },
  tubi: {
    id: 'tubi',
    name: 'Tubi',
    logoUrl: 'https://images.justwatch.com/icon/116305230/s100/tubi.webp',
    supportsEmbed: false,
    supportsDeepLink: true,
    supportsFreeContent: true,
    contentTypes: ['movie', 'tv_show'],
    baseUrl: 'https://tubitv.com',
    deepLinkPattern: 'https://tubitv.com/{type}/{id}',
    healthCheckUrl: 'https://tubitv.com/',
    termsUrl: 'https://tubitv.com/terms',
  },
  pluto_tv: {
    id: 'pluto_tv',
    name: 'Pluto TV',
    logoUrl: 'https://images.justwatch.com/icon/52449861/s100/pluto-tv.webp',
    supportsEmbed: false,
    supportsDeepLink: true,
    supportsFreeContent: true,
    contentTypes: ['movie', 'tv_show', 'live_stream', 'fast_channel'],
    baseUrl: 'https://pluto.tv',
    deepLinkPattern: 'https://pluto.tv/en/on-demand/{type}/{id}',
    healthCheckUrl: 'https://pluto.tv/',
    termsUrl: 'https://pluto.tv/en/terms-of-use',
  },
  plex_free: {
    id: 'plex_free',
    name: 'Plex',
    logoUrl: 'https://images.justwatch.com/icon/116305230/s100/plex.webp',
    supportsEmbed: false,
    supportsDeepLink: true,
    supportsFreeContent: true,
    contentTypes: ['movie', 'tv_show'],
    baseUrl: 'https://watch.plex.tv',
    deepLinkPattern: 'https://watch.plex.tv/{type}/{id}',
    healthCheckUrl: 'https://watch.plex.tv/',
    termsUrl: 'https://www.plex.tv/about/privacy-legal/plex-terms-of-service/',
  },
  roku_channel: {
    id: 'roku_channel',
    name: 'The Roku Channel',
    logoUrl: 'https://images.justwatch.com/icon/116305230/s100/roku.webp',
    supportsEmbed: false,
    supportsDeepLink: true,
    supportsFreeContent: true,
    contentTypes: ['movie', 'tv_show', 'live_stream'],
    baseUrl: 'https://therokuchannel.roku.com',
    deepLinkPattern: 'https://therokuchannel.roku.com/details/{id}',
    healthCheckUrl: 'https://therokuchannel.roku.com/',
    termsUrl: 'https://docs.roku.com/published/userprivacypolicy/',
  },
  freevee: {
    id: 'freevee',
    name: 'Amazon Freevee',
    logoUrl: 'https://images.justwatch.com/icon/207360008/s100/freevee.webp',
    supportsEmbed: false,
    supportsDeepLink: true,
    supportsFreeContent: true,
    contentTypes: ['movie', 'tv_show'],
    baseUrl: 'https://www.amazon.com/gp/video/storefront/ref=atv_fv_hom',
    deepLinkPattern: 'https://www.amazon.com/gp/video/detail/{id}',
    healthCheckUrl: 'https://www.amazon.com/freewithadstv',
    termsUrl: 'https://www.amazon.com/gp/help/customer/display.html?nodeId=201909000',
  },
};

// =============================================================================
// EMBED CONFIGURATION
// =============================================================================

export interface EmbedConfig {
  provider: FASTProviderType;
  embedUrl: string | null;
  deepLinkUrl: string;
  iframeAllowed: boolean;
  playerType: 'iframe' | 'external' | 'hls' | 'dash';
  aspectRatio: '16:9' | '4:3' | '21:9';
  autoplay: boolean;
  controls: boolean;
  attribution?: {
    text: string;
    url: string;
    logo?: string;
  };
}

export interface HealthCheckResult {
  provider: FASTProviderType;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  latencyMs?: number;
  lastChecked: Date;
  errorMessage?: string;
  contentAvailable?: boolean;
}

// =============================================================================
// FAST PROVIDER ADAPTER INTERFACE
// =============================================================================

export interface FASTProviderAdapter {
  /**
   * Unique provider identifier
   */
  readonly providerId: FASTProviderType;
  
  /**
   * Provider display info
   */
  readonly providerInfo: FASTProviderInfo;
  
  /**
   * Check if provider is operational
   */
  healthCheck(): Promise<HealthCheckResult>;
  
  /**
   * Discover content from the provider
   * Returns standardized MediaNode format
   */
  discover(params: DiscoverParams): Promise<DiscoverResult>;
  
  /**
   * Normalize raw provider data to MediaNode
   */
  normalize(rawData: unknown): MediaNode;
  
  /**
   * Get embed configuration for inline playback
   */
  getEmbedConfig(contentId: string, mediaType?: MediaType): Promise<EmbedConfig>;
  
  /**
   * Get deep link for external viewing
   */
  getDeepLink(contentId: string, mediaType?: MediaType): string;
  
  /**
   * Get availability info
   */
  getAvailability(contentId: string): Promise<MediaAvailability>;
  
  /**
   * Search provider catalog
   */
  search?(query: string, limit?: number): Promise<MediaNode[]>;
  
  /**
   * Get curated collections (e.g., "Classic Noir", "80s Action")
   */
  getCollections?(): Promise<FASTCollection[]>;
}

// =============================================================================
// DISCOVER TYPES
// =============================================================================

export interface DiscoverParams {
  category?: MediaCategory;
  mediaType?: MediaType;
  genres?: string[];
  collections?: string[];
  decade?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'popularity' | 'rating' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface DiscoverResult {
  items: MediaNode[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
  collections?: FASTCollection[];
}

export interface FASTCollection {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  itemCount: number;
  provider: FASTProviderType;
  queryParams?: DiscoverParams;
}

// =============================================================================
// BACKWARD COMPATIBILITY TYPE ALIASES
// =============================================================================
// These aliases maintain compatibility with existing adapter implementations

/** @deprecated Use MediaNode instead */
export type FASTContentItem = Partial<MediaNode>;

/** @deprecated Use FASTProviderInfo instead */
export type FASTProviderConfig = FASTProviderInfo;

/** @deprecated Use EmbedConfig instead */
export type FASTEmbedConfig = EmbedConfig;

/** @deprecated Use DiscoverParams instead */
export type FASTDiscoverOptions = DiscoverParams;

/** @deprecated Use HealthCheckResult instead */
export type FASTHealthStatus = HealthCheckResult;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get embed URL for a specific provider and content ID
 */
export function getEmbedUrl(
  provider: FASTProviderType,
  contentId: string,
  options?: { autoplay?: boolean; controls?: boolean; muted?: boolean }
): string | null {
  const info = FAST_PROVIDER_REGISTRY[provider];
  if (!info.supportsEmbed || !info.embedUrlPattern) {
    return null;
  }
  
  let url = info.embedUrlPattern.replace('{id}', contentId);
  
  // Add optional parameters
  const params = new URLSearchParams();
  if (options?.autoplay !== undefined) params.set('autoplay', options.autoplay ? '1' : '0');
  if (options?.muted) params.set('muted', '1');
  
  if (params.toString()) {
    url += (url.includes('?') ? '&' : '?') + params.toString();
  }
  
  return url;
}

/**
 * Get deep link URL for external viewing
 */
export function getDeepLinkUrl(
  provider: FASTProviderType,
  contentId: string,
  mediaType?: MediaType
): string {
  const info = FAST_PROVIDER_REGISTRY[provider];
  let url = info.deepLinkPattern || `${info.baseUrl}/${contentId}`;
  
  url = url.replace('{id}', contentId);
  
  // Handle type substitution
  if (url.includes('{type}')) {
    const typeMap: Record<MediaType, string> = {
      movie: 'movies',
      tv_show: 'series',
      tv_season: 'series',
      tv_episode: 'episode',
      creator_video: 'video',
      live_stream: 'live',
      fast_channel: 'channel',
      music_album: 'album',
      music_track: 'track',
      podcast_show: 'podcast',
      podcast_episode: 'podcast',
      audiobook: 'audiobook',
      audiobook_chapter: 'audiobook',
      creator_audio: 'audio',
    };
    url = url.replace('{type}', typeMap[mediaType || 'movie'] || 'movie');
  }
  
  return url;
}

/**
 * Check if a provider supports iframe embedding
 */
export function supportsEmbed(provider: FASTProviderType): boolean {
  return FAST_PROVIDER_REGISTRY[provider]?.supportsEmbed ?? false;
}

/**
 * Get all embeddable providers
 */
export function getEmbeddableProviders(): FASTProviderType[] {
  return Object.entries(FAST_PROVIDER_REGISTRY)
    .filter(([_, info]) => info.supportsEmbed)
    .map(([id]) => id as FASTProviderType);
}

/**
 * Generate canonical ID for FAST content
 */
export function generateFASTCanonicalId(
  provider: FASTProviderType,
  mediaType: MediaType,
  contentId: string
): string {
  return `lucy:${mediaType}:${provider}:${contentId}`;
}

/**
 * Parse canonical ID to extract provider info
 */
export function parseFASTCanonicalId(canonicalId: string): {
  provider: FASTProviderType;
  mediaType: MediaType;
  contentId: string;
} | null {
  const parts = canonicalId.split(':');
  if (parts.length !== 4 || parts[0] !== 'lucy') {
    return null;
  }
  return {
    mediaType: parts[1] as MediaType,
    provider: parts[2] as FASTProviderType,
    contentId: parts[3],
  };
}

// =============================================================================
// PROVIDER FACTORY
// =============================================================================

const adapterCache = new Map<FASTProviderType, FASTProviderAdapter>();

/**
 * Get or create adapter for a FAST provider
 */
export async function getFASTAdapter(provider: FASTProviderType): Promise<FASTProviderAdapter | null> {
  if (adapterCache.has(provider)) {
    return adapterCache.get(provider)!;
  }
  
  // Dynamic import based on provider
  try {
    let adapter: FASTProviderAdapter;
    
    switch (provider) {
      case 'archive_org':
        const { ArchiveOrgFASTAdapter } = await import('./archiveFASTAdapter');
        adapter = new ArchiveOrgFASTAdapter();
        break;
      case 'youtube':
        const { YouTubeFASTAdapter } = await import('./youtubeFASTAdapter');
        adapter = new YouTubeFASTAdapter();
        break;
      default:
        console.warn(`FAST adapter not implemented for provider: ${provider}`);
        return null;
    }
    
    adapterCache.set(provider, adapter);
    return adapter;
  } catch (error) {
    console.error(`Failed to load FAST adapter for ${provider}:`, error);
    return null;
  }
}

/**
 * Clear adapter cache (for testing)
 */
export function clearFASTAdapterCache(): void {
  adapterCache.clear();
}

// =============================================================================
// HEALTH CHECK UTILITIES
// =============================================================================

/**
 * Run health checks on all FAST providers
 */
export async function checkAllFASTProviders(): Promise<Map<FASTProviderType, HealthCheckResult>> {
  const results = new Map<FASTProviderType, HealthCheckResult>();
  
  const providers = Object.keys(FAST_PROVIDER_REGISTRY) as FASTProviderType[];
  
  await Promise.all(
    providers.map(async (provider) => {
      const adapter = await getFASTAdapter(provider);
      if (adapter) {
        const result = await adapter.healthCheck();
        results.set(provider, result);
      } else {
        results.set(provider, {
          provider,
          status: 'unknown',
          lastChecked: new Date(),
          errorMessage: 'Adapter not implemented',
        });
      }
    })
  );
  
  return results;
}

/**
 * Get healthy embeddable providers
 */
export async function getHealthyEmbeddableProviders(): Promise<FASTProviderType[]> {
  const healthResults = await checkAllFASTProviders();
  
  return getEmbeddableProviders().filter(provider => {
    const result = healthResults.get(provider);
    return result?.status === 'healthy' || result?.status === 'degraded';
  });
}
