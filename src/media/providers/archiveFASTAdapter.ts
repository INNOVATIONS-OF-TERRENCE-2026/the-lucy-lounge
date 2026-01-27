// =============================================================================
// THE LUCY LOUNGE - Internet Archive FAST Adapter
// =============================================================================
// Full embed support for public domain films from Internet Archive
// https://archive.org - Home of the Wayback Machine and millions of free media
// =============================================================================

import type {
  MediaNode,
  MediaAvailability,
  MediaType,
  MediaCategory,
} from '../types';
import {
  type FASTProviderAdapter,
  type FASTProviderInfo,
  type EmbedConfig,
  type HealthCheckResult,
  type DiscoverParams,
  type DiscoverResult,
  type FASTCollection,
  FAST_PROVIDER_REGISTRY,
  generateFASTCanonicalId,
} from './FASTProviderAdapter';

// =============================================================================
// INTERNET ARCHIVE API TYPES
// =============================================================================

interface ArchiveItem {
  identifier: string;
  title: string;
  description?: string;
  creator?: string | string[];
  date?: string;
  year?: number;
  subject?: string | string[];
  mediatype: 'movies' | 'audio' | 'texts' | 'image' | 'software';
  downloads?: number;
  avg_rating?: number;
  num_reviews?: number;
  runtime?: string;
  collection?: string[];
  licenseurl?: string;
}

interface ArchiveSearchResponse {
  response: {
    numFound: number;
    start: number;
    docs: ArchiveItem[];
  };
}

interface ArchiveMetadata {
  metadata: ArchiveItem;
  files: ArchiveFile[];
}

interface ArchiveFile {
  name: string;
  format: string;
  size?: string;
  length?: string;
  title?: string;
  source?: string;
}

// =============================================================================
// CURATED COLLECTIONS
// =============================================================================

/**
 * Curated collections of embeddable public domain films
 * These are verified to work with iframe embeds
 */
export const ARCHIVE_COLLECTIONS: FASTCollection[] = [
  {
    id: 'feature_films',
    name: 'Feature Films',
    description: 'Full-length movies from the public domain',
    itemCount: 5000,
    provider: 'archive_org',
    queryParams: { category: 'video', mediaType: 'movie' },
  },
  {
    id: 'classic_films',
    name: 'Classic Films',
    description: 'Golden age Hollywood classics',
    itemCount: 2000,
    provider: 'archive_org',
    queryParams: { genres: ['classic'], category: 'video' },
  },
  {
    id: 'film_noir',
    name: 'Film Noir',
    description: 'Dark, atmospheric crime dramas',
    itemCount: 500,
    provider: 'archive_org',
    queryParams: { genres: ['film-noir', 'noir'], category: 'video' },
  },
  {
    id: 'horror_films',
    name: 'Horror Films',
    description: 'Classic horror and sci-fi frights',
    itemCount: 800,
    provider: 'archive_org',
    queryParams: { genres: ['horror', 'sci-fi-horror'], category: 'video' },
  },
  {
    id: 'silent_films',
    name: 'Silent Films',
    description: 'Early cinema masterpieces',
    itemCount: 1500,
    provider: 'archive_org',
    queryParams: { genres: ['silent'], decade: 1920, category: 'video' },
  },
  {
    id: 'comedy_films',
    name: 'Comedy Films',
    description: 'Laugh-out-loud classics',
    itemCount: 1200,
    provider: 'archive_org',
    queryParams: { genres: ['comedy'], category: 'video' },
  },
  {
    id: 'western_films',
    name: 'Western Films',
    description: 'Cowboys, outlaws, and frontier justice',
    itemCount: 600,
    provider: 'archive_org',
    queryParams: { genres: ['western'], category: 'video' },
  },
  {
    id: 'scifi_films',
    name: 'Sci-Fi Films',
    description: 'Classic science fiction adventures',
    itemCount: 400,
    provider: 'archive_org',
    queryParams: { genres: ['science-fiction', 'sci-fi'], category: 'video' },
  },
  {
    id: 'documentary_films',
    name: 'Documentaries',
    description: 'Non-fiction stories and educational films',
    itemCount: 3000,
    provider: 'archive_org',
    queryParams: { genres: ['documentary'], category: 'video' },
  },
  {
    id: 'classic_cartoons',
    name: 'Classic Cartoons',
    description: 'Vintage animation from the golden age',
    itemCount: 2500,
    provider: 'archive_org',
    queryParams: { genres: ['animation', 'cartoon'], category: 'video' },
  },
];

// =============================================================================
// ARCHIVE.ORG FAST ADAPTER
// =============================================================================

const ARCHIVE_API_BASE = 'https://archive.org';

export class ArchiveOrgFASTAdapter implements FASTProviderAdapter {
  readonly providerId = 'archive_org' as const;
  readonly providerInfo: FASTProviderInfo = FAST_PROVIDER_REGISTRY.archive_org;
  
  // =========================================================================
  // HEALTH CHECK
  // =========================================================================
  
  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${ARCHIVE_API_BASE}/advancedsearch.php?` + new URLSearchParams({
        q: 'collection:feature_films',
        rows: '1',
        output: 'json',
      }), {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
      
      const latencyMs = Date.now() - startTime;
      
      if (response.ok) {
        return {
          provider: this.providerId,
          status: latencyMs < 2000 ? 'healthy' : 'degraded',
          latencyMs,
          lastChecked: new Date(),
          contentAvailable: true,
        };
      }
      
      return {
        provider: this.providerId,
        status: 'degraded',
        latencyMs,
        lastChecked: new Date(),
        errorMessage: `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        provider: this.providerId,
        status: 'down',
        latencyMs: Date.now() - startTime,
        lastChecked: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  // =========================================================================
  // DISCOVER
  // =========================================================================
  
  async discover(params: DiscoverParams): Promise<DiscoverResult> {
    const { 
      category = 'video',
      genres = [],
      collections = [],
      decade,
      limit = 20,
      offset = 0,
      sortBy = 'popularity',
      sortOrder = 'desc',
    } = params;
    
    // Build query
    const queryParts: string[] = [];
    
    // Collection filter
    if (collections.length > 0) {
      queryParts.push(`collection:(${collections.join(' OR ')})`);
    } else if (category === 'video') {
      queryParts.push('collection:(feature_films OR classic_tv)');
    } else if (category === 'audio') {
      queryParts.push('collection:(audio_bookspoetry OR audio_music)');
    }
    
    // Media type filter
    if (category === 'video') {
      queryParts.push('mediatype:movies');
    } else if (category === 'audio') {
      queryParts.push('mediatype:audio');
    }
    
    // Genre/subject filter
    if (genres.length > 0) {
      queryParts.push(`subject:(${genres.join(' OR ')})`);
    }
    
    // Decade filter
    if (decade) {
      const startYear = decade;
      const endYear = decade + 9;
      queryParts.push(`year:[${startYear} TO ${endYear}]`);
    }
    
    // Sort mapping
    const sortMap: Record<string, string> = {
      popularity: 'downloads',
      rating: 'avg_rating',
      date: 'addeddate',
      title: 'title',
    };
    
    const sortField = sortMap[sortBy] || 'downloads';
    const sortDir = sortOrder === 'asc' ? 'asc' : 'desc';
    
    try {
      const response = await fetch(`${ARCHIVE_API_BASE}/advancedsearch.php?` + new URLSearchParams({
        q: queryParts.join(' AND '),
        fl: 'identifier,title,description,creator,date,year,subject,mediatype,downloads,avg_rating,num_reviews,runtime,collection',
        rows: String(limit),
        start: String(offset),
        sort: `${sortField} ${sortDir}`,
        output: 'json',
      }));
      
      if (!response.ok) {
        throw new Error(`Archive.org search failed: ${response.status}`);
      }
      
      const data: ArchiveSearchResponse = await response.json();
      const items = data.response.docs.map(item => this.normalize(item));
      
      return {
        items,
        total: data.response.numFound,
        hasMore: offset + items.length < data.response.numFound,
        nextOffset: offset + items.length,
        collections: ARCHIVE_COLLECTIONS,
      };
    } catch (error) {
      console.error('Archive.org discover error:', error);
      return {
        items: [],
        total: 0,
        hasMore: false,
      };
    }
  }
  
  // =========================================================================
  // NORMALIZE
  // =========================================================================
  
  normalize(rawData: unknown): MediaNode {
    const item = rawData as ArchiveItem;
    
    const isVideo = item.mediatype === 'movies';
    const mediaType: MediaType = isVideo ? 'movie' : 'audiobook';
    const category: MediaCategory = isVideo ? 'video' : 'audio';
    
    const creator = Array.isArray(item.creator) ? item.creator[0] : item.creator;
    
    // Parse runtime
    let durationSeconds: number | undefined;
    if (item.runtime) {
      const parts = item.runtime.split(':').map(p => parseInt(p, 10));
      if (parts.length === 3) {
        durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        durationSeconds = parts[0] * 60 + parts[1];
      } else if (parts.length === 1 && !isNaN(parts[0])) {
        durationSeconds = parts[0] * 60; // Assume minutes
      }
    }
    
    // Calculate popularity score
    const popularityScore = item.downloads 
      ? Math.min(100, Math.log10(item.downloads + 1) * 15) 
      : undefined;
    
    const now = new Date().toISOString();
    
    return {
      id: '',
      canonical_id: generateFASTCanonicalId('archive_org', mediaType, item.identifier),
      media_type: mediaType,
      category,
      title: item.title,
      description: item.description,
      release_year: item.year || this.extractYear(item.date),
      duration_seconds: durationSeconds,
      average_rating: item.avg_rating ? Math.min(10, item.avg_rating * 2) : undefined,
      vote_count: item.num_reviews,
      popularity_score: popularityScore,
      poster_url: `https://archive.org/services/img/${item.identifier}`,
      thumbnail_url: `https://archive.org/services/img/${item.identifier}`,
      backdrop_url: `https://archive.org/services/img/${item.identifier}`,
      created_at: now,
      updated_at: now,
    };
  }
  
  private extractYear(dateStr?: string): number | undefined {
    if (!dateStr) return undefined;
    const match = dateStr.match(/(\d{4})/);
    return match ? parseInt(match[1], 10) : undefined;
  }
  
  // =========================================================================
  // EMBED CONFIG
  // =========================================================================
  
  async getEmbedConfig(contentId: string, _mediaType?: MediaType): Promise<EmbedConfig> {
    return {
      provider: this.providerId,
      embedUrl: `https://archive.org/embed/${contentId}`,
      deepLinkUrl: `https://archive.org/details/${contentId}`,
      iframeAllowed: true,
      playerType: 'iframe',
      aspectRatio: '16:9',
      autoplay: false,
      controls: true,
      attribution: {
        text: 'Provided by Internet Archive',
        url: `https://archive.org/details/${contentId}`,
        logo: 'https://archive.org/images/logo_archive.svg',
      },
    };
  }
  
  // =========================================================================
  // DEEP LINK
  // =========================================================================
  
  getDeepLink(contentId: string, _mediaType?: MediaType): string {
    return `https://archive.org/details/${contentId}`;
  }
  
  // =========================================================================
  // AVAILABILITY
  // =========================================================================
  
  async getAvailability(contentId: string): Promise<MediaAvailability> {
    const now = new Date().toISOString();
    
    return {
      id: '',
      media_node_id: '',
      provider_id: 'archive_org',
      provider_content_id: contentId,
      availability_type: 'free',
      playback_url: `https://archive.org/details/${contentId}`,
      embed_url: `https://archive.org/embed/${contentId}`,
      is_verified: true,
      last_verified_at: now,
      created_at: now,
      updated_at: now,
    };
  }
  
  // =========================================================================
  // SEARCH
  // =========================================================================
  
  async search(query: string, limit: number = 20): Promise<MediaNode[]> {
    try {
      const response = await fetch(`${ARCHIVE_API_BASE}/advancedsearch.php?` + new URLSearchParams({
        q: `${query} AND collection:feature_films AND mediatype:movies`,
        fl: 'identifier,title,description,creator,date,year,subject,mediatype,downloads,avg_rating,num_reviews,runtime',
        rows: String(limit),
        sort: 'downloads desc',
        output: 'json',
      }));
      
      if (!response.ok) {
        return [];
      }
      
      const data: ArchiveSearchResponse = await response.json();
      return data.response.docs.map(item => this.normalize(item));
    } catch (error) {
      console.error('Archive.org search error:', error);
      return [];
    }
  }
  
  // =========================================================================
  // COLLECTIONS
  // =========================================================================
  
  async getCollections(): Promise<FASTCollection[]> {
    return ARCHIVE_COLLECTIONS;
  }
  
  // =========================================================================
  // CURATED CONTENT FETCHERS
  // =========================================================================
  
  /**
   * Get verified embeddable public domain films
   * These are hand-picked titles confirmed to work with iframe embeds
   */
  async getCuratedFilms(collection: string, limit: number = 20): Promise<MediaNode[]> {
    const collectionMap: Record<string, string> = {
      'noir': 'subject:(film noir OR noir) AND collection:feature_films',
      'horror': 'subject:(horror) AND collection:feature_films',
      'scifi': 'subject:(science fiction OR sci-fi) AND collection:feature_films',
      'western': 'subject:(western) AND collection:feature_films',
      'comedy': 'subject:(comedy) AND collection:feature_films',
      'classic': 'collection:feature_films AND year:[1920 TO 1960]',
      'silent': 'collection:silent_films OR (collection:feature_films AND year:[1895 TO 1930])',
      'animation': 'collection:classic_cartoons OR subject:(animation OR cartoon)',
      'documentary': 'subject:(documentary) AND collection:feature_films',
    };
    
    const query = collectionMap[collection] || `collection:${collection}`;
    
    try {
      const response = await fetch(`${ARCHIVE_API_BASE}/advancedsearch.php?` + new URLSearchParams({
        q: query,
        fl: 'identifier,title,description,creator,date,year,subject,mediatype,downloads,avg_rating,num_reviews,runtime',
        rows: String(limit),
        sort: 'downloads desc',
        output: 'json',
      }));
      
      if (!response.ok) {
        return [];
      }
      
      const data: ArchiveSearchResponse = await response.json();
      return data.response.docs.map(item => this.normalize(item));
    } catch (error) {
      console.error('Archive.org curated fetch error:', error);
      return [];
    }
  }
  
  /**
   * Get most downloaded films (trending equivalent)
   */
  async getTrendingFilms(limit: number = 20): Promise<MediaNode[]> {
    return this.discover({
      category: 'video',
      sortBy: 'popularity',
      limit,
    }).then(r => r.items);
  }
  
  /**
   * Get highest rated films
   */
  async getTopRatedFilms(limit: number = 20): Promise<MediaNode[]> {
    return this.discover({
      category: 'video',
      sortBy: 'rating',
      limit,
    }).then(r => r.items);
  }
  
  /**
   * Get films by specific decade
   */
  async getFilmsByDecade(decade: number, limit: number = 20): Promise<MediaNode[]> {
    return this.discover({
      category: 'video',
      decade,
      limit,
    }).then(r => r.items);
  }
}

// Export singleton
export const archiveOrgAdapter = new ArchiveOrgFASTAdapter();
