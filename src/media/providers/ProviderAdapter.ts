// =============================================================================
// THE LUCY LOUNGE - Provider Adapter Interface
// =============================================================================
// Clean isolation pattern for all media providers
// Each provider MUST implement this interface
// =============================================================================

import type { 
  MediaNode, 
  MediaSeries, 
  MediaAvailability, 
  MediaPerson, 
  MediaCredit,
  MediaTag,
  MediaType,
  MediaCategory,
  ProviderType,
  AvailabilityType
} from '../types';

// =============================================================================
// ADAPTER INTERFACE
// =============================================================================

/**
 * ProviderAdapter - Interface all providers must implement
 * This ensures clean separation between provider logic and UI components
 */
export interface ProviderAdapter {
  /** Unique provider identifier */
  readonly providerId: string;
  
  /** Provider type for categorization */
  readonly providerType: ProviderType;
  
  /** Human-readable name */
  readonly displayName: string;
  
  /** Provider logo URL */
  readonly logoUrl?: string;
  
  /** Whether this provider requires authentication */
  readonly requiresAuth: boolean;
  
  /** Whether playback is supported */
  readonly supportsPlayback: boolean;
  
  /** Priority for routing (higher = preferred) */
  readonly priority: number;
  
  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  
  /**
   * Initialize the adapter (load credentials, validate connection)
   */
  initialize(): Promise<ProviderInitResult>;
  
  /**
   * Check if adapter is ready for operations
   */
  isReady(): boolean;
  
  // =========================================================================
  // SEARCH & DISCOVERY
  // =========================================================================
  
  /**
   * Search for media by query
   */
  search(params: SearchParams): Promise<SearchResult>;
  
  /**
   * Get trending/popular content
   */
  getTrending(params: TrendingParams): Promise<MediaNode[]>;
  
  /**
   * Get content by genre/category
   */
  getByGenre(params: GenreParams): Promise<MediaNode[]>;
  
  /**
   * Get new releases
   */
  getNewReleases(params: NewReleasesParams): Promise<MediaNode[]>;
  
  // =========================================================================
  // CONTENT RETRIEVAL
  // =========================================================================
  
  /**
   * Get detailed information for a media item
   */
  getMediaNode(providerContentId: string): Promise<MediaNode | null>;
  
  /**
   * Get series information (show, album, podcast, etc.)
   */
  getMediaSeries(providerContentId: string): Promise<MediaSeries | null>;
  
  /**
   * Get episodes/tracks for a series
   */
  getSeriesItems(
    seriesProviderContentId: string,
    params?: PaginationParams
  ): Promise<MediaNode[]>;
  
  /**
   * Get availability/playback info
   */
  getAvailability(providerContentId: string): Promise<MediaAvailability | null>;
  
  /**
   * Get credits (cast/crew/artists)
   */
  getCredits(providerContentId: string): Promise<CreditWithPerson[]>;
  
  /**
   * Get related content
   */
  getRelated(providerContentId: string, limit?: number): Promise<MediaNode[]>;
  
  // =========================================================================
  // PLAYBACK (Optional)
  // =========================================================================
  
  /**
   * Get playback URL (direct or deep link)
   */
  getPlaybackUrl?(providerContentId: string): Promise<PlaybackInfo | null>;
  
  /**
   * Get embed URL for iframe playback
   */
  getEmbedUrl?(providerContentId: string): Promise<string | null>;
  
  // =========================================================================
  // SYNC & INGESTION
  // =========================================================================
  
  /**
   * Sync content from provider to local database
   */
  syncContent?(params: SyncParams): Promise<SyncResult>;
  
  /**
   * Get all content IDs for incremental sync
   */
  getContentIds?(params: ContentIdsParams): AsyncGenerator<string[]>;
}

// =============================================================================
// SHARED TYPES
// =============================================================================

export interface ProviderInitResult {
  success: boolean;
  error?: string;
  rateLimitInfo?: {
    remaining: number;
    resetAt: Date;
  };
}

export interface SearchParams {
  query: string;
  mediaType?: MediaType;
  category?: MediaCategory;
  page?: number;
  pageSize?: number;
  filters?: Record<string, string | number | boolean>;
}

export interface SearchResult {
  items: MediaNode[];
  totalResults: number;
  page: number;
  totalPages: number;
  query: string;
}

export interface TrendingParams {
  mediaType?: MediaType;
  category?: MediaCategory;
  timeWindow?: 'day' | 'week' | 'month';
  region?: string;
  limit?: number;
}

export interface GenreParams {
  genre: string;
  mediaType?: MediaType;
  category?: MediaCategory;
  page?: number;
  pageSize?: number;
}

export interface NewReleasesParams {
  mediaType?: MediaType;
  category?: MediaCategory;
  region?: string;
  daysBack?: number;
  limit?: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreditWithPerson {
  credit: Omit<MediaCredit, 'id' | 'created_at'>;
  person: Omit<MediaPerson, 'id' | 'created_at' | 'updated_at'>;
}

export interface PlaybackInfo {
  url: string;
  type: 'direct' | 'deep_link' | 'embed' | 'hls' | 'dash';
  quality?: string;
  expiresAt?: Date;
  headers?: Record<string, string>;
}

export interface SyncParams {
  fullSync?: boolean;
  since?: Date;
  mediaTypes?: MediaType[];
  batchSize?: number;
}

export interface SyncResult {
  success: boolean;
  itemsSynced: number;
  itemsFailed: number;
  errors: string[];
  duration: number;
}

export interface ContentIdsParams {
  mediaType?: MediaType;
  since?: Date;
  batchSize?: number;
}

// =============================================================================
// NORMALIZATION UTILITIES
// =============================================================================

/**
 * Generate a canonical ID for a media item
 * Format: lucy:{media_type}:{provider}:{provider_id}
 */
export function generateCanonicalId(
  mediaType: MediaType,
  providerId: string,
  providerContentId: string
): string {
  return `lucy:${mediaType}:${providerId}:${providerContentId}`;
}

/**
 * Parse a canonical ID back to components
 */
export function parseCanonicalId(canonicalId: string): {
  mediaType: MediaType;
  providerId: string;
  providerContentId: string;
} | null {
  const parts = canonicalId.split(':');
  if (parts.length !== 4 || parts[0] !== 'lucy') {
    return null;
  }
  return {
    mediaType: parts[1] as MediaType,
    providerId: parts[2],
    providerContentId: parts[3],
  };
}

/**
 * Normalize a title for comparison/deduplication
 */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract year from various date formats
 */
export function extractYear(dateStr?: string | null): number | undefined {
  if (!dateStr) return undefined;
  const match = dateStr.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : undefined;
}

/**
 * Convert duration to seconds from various formats
 */
export function normalizeDuration(duration: string | number | null | undefined): number | undefined {
  if (duration === null || duration === undefined) return undefined;
  
  if (typeof duration === 'number') {
    // Assume milliseconds if > 10000, seconds otherwise
    return duration > 10000 ? Math.round(duration / 1000) : duration;
  }
  
  // Parse ISO 8601 duration (PT1H30M, etc.)
  const isoMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (isoMatch) {
    const hours = parseInt(isoMatch[1] || '0', 10);
    const minutes = parseInt(isoMatch[2] || '0', 10);
    const seconds = parseInt(isoMatch[3] || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
  }
  
  // Parse HH:MM:SS or MM:SS
  const timeMatch = duration.match(/^(?:(\d+):)?(\d+):(\d+)$/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1] || '0', 10);
    const minutes = parseInt(timeMatch[2], 10);
    const seconds = parseInt(timeMatch[3], 10);
    return hours * 3600 + minutes * 60 + seconds;
  }
  
  return undefined;
}

/**
 * Map external rating to content rating enum
 */
export function normalizeContentRating(
  rating: string | null | undefined,
  mediaCategory: MediaCategory
): string | undefined {
  if (!rating) return undefined;
  
  const normalized = rating.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  
  const validRatings = [
    'G', 'PG', 'PG-13', 'R', 'NC-17',
    'TV-Y', 'TV-Y7', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA',
    'E', 'CLEAN', 'UNRATED'
  ];
  
  if (validRatings.includes(normalized)) {
    return normalized;
  }
  
  // Common mappings
  const mappings: Record<string, string> = {
    'NR': 'UNRATED',
    'NOT RATED': 'UNRATED',
    'EXPLICIT': 'E',
    'NOTEXPLICIT': 'CLEAN',
  };
  
  return mappings[normalized] || undefined;
}

// =============================================================================
// BASE ADAPTER CLASS
// =============================================================================

/**
 * BaseProviderAdapter - Abstract base class with common functionality
 */
export abstract class BaseProviderAdapter implements ProviderAdapter {
  abstract readonly providerId: string;
  abstract readonly providerType: ProviderType;
  abstract readonly displayName: string;
  abstract readonly logoUrl?: string;
  abstract readonly requiresAuth: boolean;
  abstract readonly supportsPlayback: boolean;
  abstract readonly priority: number;
  
  protected _isReady = false;
  protected _lastError?: string;
  
  abstract initialize(): Promise<ProviderInitResult>;
  
  isReady(): boolean {
    return this._isReady;
  }
  
  // Default implementations that throw - subclasses must override
  abstract search(params: SearchParams): Promise<SearchResult>;
  abstract getTrending(params: TrendingParams): Promise<MediaNode[]>;
  abstract getByGenre(params: GenreParams): Promise<MediaNode[]>;
  abstract getNewReleases(params: NewReleasesParams): Promise<MediaNode[]>;
  abstract getMediaNode(providerContentId: string): Promise<MediaNode | null>;
  abstract getMediaSeries(providerContentId: string): Promise<MediaSeries | null>;
  abstract getSeriesItems(seriesProviderContentId: string, params?: PaginationParams): Promise<MediaNode[]>;
  abstract getAvailability(providerContentId: string): Promise<MediaAvailability | null>;
  abstract getCredits(providerContentId: string): Promise<CreditWithPerson[]>;
  abstract getRelated(providerContentId: string, limit?: number): Promise<MediaNode[]>;
  
  /**
   * Helper to create a MediaNode with defaults
   */
  protected createMediaNode(
    partial: Partial<MediaNode> & Pick<MediaNode, 'canonical_id' | 'media_type' | 'category' | 'title'>
  ): MediaNode {
    const now = new Date().toISOString();
    return {
      id: '', // Will be assigned by database
      created_at: now,
      updated_at: now,
      ...partial,
    };
  }
  
  /**
   * Helper to create a MediaSeries with defaults
   */
  protected createMediaSeries(
    partial: Partial<MediaSeries> & Pick<MediaSeries, 'canonical_id' | 'media_type' | 'category' | 'title'>
  ): MediaSeries {
    const now = new Date().toISOString();
    return {
      id: '',
      created_at: now,
      updated_at: now,
      ...partial,
    };
  }
  
  /**
   * Rate-limited fetch wrapper
   */
  protected async rateLimitedFetch(
    url: string,
    options?: RequestInit
  ): Promise<Response> {
    // Subclasses can override with provider-specific rate limiting
    return fetch(url, options);
  }
}
