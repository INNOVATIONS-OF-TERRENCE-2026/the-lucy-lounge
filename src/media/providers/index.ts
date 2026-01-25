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
