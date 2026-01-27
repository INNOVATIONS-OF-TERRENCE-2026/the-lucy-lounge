// =============================================================================
// THE LUCY LOUNGE - Provider Adapters Index
// =============================================================================
// Clean exports for all provider adapters
// =============================================================================

// Base types and interface
export {
  type ProviderAdapter,
  type ProviderInitResult,
  type SearchParams,
  type SearchResult,
  type TrendingParams,
  type GenreParams,
  type NewReleasesParams,
  type PaginationParams,
  type CreditWithPerson,
  type PlaybackInfo,
  type SyncParams,
  type SyncResult,
  type ContentIdsParams,
  BaseProviderAdapter,
  generateCanonicalId,
  parseCanonicalId,
  normalizeTitle,
  extractYear,
  normalizeDuration,
  normalizeContentRating,
} from './ProviderAdapter';

// Individual adapters
export { TMDBAdapter, tmdbAdapter } from './tmdbAdapter';
export { YouTubeAdapter, youtubeAdapter, FAST_CHANNELS, type FASTChannel } from './youtubeAdapter';
export { RSSPodcastAdapter, rssPodcastAdapter, CURATED_PODCASTS, type PodcastFeed } from './rssPodcastAdapter';
export { SpotifyAdapter, spotifyAdapter } from './spotifyAdapter';
export { PublicDomainAdapter, publicDomainAdapter } from './publicDomainAdapter';

// FAST Provider System
export {
  type FASTProviderAdapter,
  type FASTProviderType,
  type FASTProviderInfo,
  type EmbedConfig,
  type HealthCheckResult,
  type DiscoverParams,
  type DiscoverResult,
  type FASTCollection,
  FAST_PROVIDER_REGISTRY,
  getEmbedUrl,
  getDeepLinkUrl,
  supportsEmbed,
  getEmbeddableProviders,
  generateFASTCanonicalId,
  parseFASTCanonicalId,
  getFASTAdapter,
  checkAllFASTProviders,
  getHealthyEmbeddableProviders,
} from './FASTProviderAdapter';

// FAST Adapters
export { ArchiveOrgFASTAdapter, archiveOrgAdapter, ARCHIVE_COLLECTIONS } from './archiveFASTAdapter';
export { YouTubeFASTAdapter, youtubeFASTAdapter, YOUTUBE_COLLECTIONS } from './youtubeFASTAdapter';

// Additional FAST Provider Adapters
export { TubiAdapter, TUBI_CATEGORIES, TUBI_CONFIG } from './tubiAdapter';
export { PlutoAdapter, PLUTO_FEATURED_CHANNELS, PLUTO_CONFIG } from './plutoAdapter';
export { PlexAdapter, PLEX_CATEGORIES, PLEX_CONFIG } from './plexAdapter';
export { RokuAdapter, ROKU_CATEGORIES, ROKU_CONFIG } from './rokuAdapter';
export { FreeveeAdapter, FREEVEE_CATEGORIES, FREEVEE_CONFIG } from './freeveeAdapter';

// =============================================================================
// FAST ADAPTER REGISTRY
// =============================================================================

import { TubiAdapter } from './tubiAdapter';
import { PlutoAdapter } from './plutoAdapter';
import { PlexAdapter } from './plexAdapter';
import { RokuAdapter } from './rokuAdapter';
import { FreeveeAdapter } from './freeveeAdapter';
import { archiveOrgAdapter } from './archiveFASTAdapter';
import { youtubeFASTAdapter } from './youtubeFASTAdapter';

/**
 * Complete registry of all FAST provider adapters
 */
export const FAST_ADAPTERS = {
  archive_org: archiveOrgAdapter,
  youtube: youtubeFASTAdapter,
  tubi: TubiAdapter,
  pluto_tv: PlutoAdapter,
  plex_free: PlexAdapter,
  roku_channel: RokuAdapter,
  freevee: FreeveeAdapter,
} as const;

export type FASTAdapterId = keyof typeof FAST_ADAPTERS;

/**
 * Get a FAST adapter by provider ID
 */
export function getFASTAdapterById(providerId: FASTAdapterId) {
  return FAST_ADAPTERS[providerId];
}

/**
 * Get all FAST adapters that support inline embedding
 */
export function getEmbeddableFASTAdapters() {
  return [
    FAST_ADAPTERS.archive_org,
    FAST_ADAPTERS.youtube,
  ];
}

/**
 * Get all FAST adapters (includes deep-link only providers)
 */
export function getAllFASTAdapters() {
  return Object.values(FAST_ADAPTERS);
}

/**
 * Check health of all FAST providers
 */
export async function checkFASTProvidersHealth() {
  const results = await Promise.all(
    getAllFASTAdapters().map(adapter => adapter.healthCheck())
  );
  return results;
}

// =============================================================================
// PROVIDER REGISTRY
// =============================================================================

import { tmdbAdapter } from './tmdbAdapter';
import { youtubeAdapter } from './youtubeAdapter';
import { rssPodcastAdapter } from './rssPodcastAdapter';
import { spotifyAdapter } from './spotifyAdapter';
import { publicDomainAdapter } from './publicDomainAdapter';
import type { ProviderAdapter } from './ProviderAdapter';
import type { ProviderType, MediaCategory } from '../types';

/**
 * Registry of all available provider adapters
 */
export const providerRegistry: Record<string, ProviderAdapter> = {
  tmdb: tmdbAdapter,
  youtube: youtubeAdapter,
  rss_podcast: rssPodcastAdapter,
  spotify: spotifyAdapter,
  public_domain: publicDomainAdapter,
};

/**
 * Get all adapters
 */
export function getAllAdapters(): ProviderAdapter[] {
  return Object.values(providerRegistry);
}

/**
 * Get adapter by provider ID
 */
export function getAdapter(providerId: string): ProviderAdapter | undefined {
  return providerRegistry[providerId];
}

/**
 * Get adapters by category
 */
export function getAdaptersByCategory(category: MediaCategory): ProviderAdapter[] {
  const categoryMap: Record<MediaCategory, string[]> = {
    video: ['tmdb', 'youtube', 'public_domain'],
    audio: ['spotify', 'rss_podcast', 'public_domain'],
    live: ['youtube'],
  };
  
  const adapterIds = categoryMap[category] || [];
  return adapterIds
    .map(id => providerRegistry[id])
    .filter((a): a is ProviderAdapter => a !== undefined);
}

/**
 * Get adapters that support playback
 */
export function getPlaybackAdapters(): ProviderAdapter[] {
  return getAllAdapters().filter(a => a.supportsPlayback);
}

/**
 * Get adapters sorted by priority
 */
export function getAdaptersByPriority(): ProviderAdapter[] {
  return getAllAdapters().sort((a, b) => b.priority - a.priority);
}

/**
 * Initialize all adapters
 */
export async function initializeAllAdapters(): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();
  
  await Promise.all(
    getAllAdapters().map(async adapter => {
      const result = await adapter.initialize();
      results.set(adapter.providerId, result.success);
    })
  );
  
  return results;
}
