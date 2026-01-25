// =============================================================================
// THE LUCY LOUNGE - ROW DATA LOADER
// =============================================================================
// Loads data for each row type using the recommendation engine
// =============================================================================

import { createUnifiedEngine, UnifiedRecommendationEngine } from '../engine';
import { mediaGraphClient } from '../client';
import type {
  MediaNode,
  MediaCategory,
  LucyJourney,
} from '../types';
import type { RowConfig, RowType } from './rowDefinitions';

// =============================================================================
// TYPES
// =============================================================================

export interface LoadedRow {
  config: RowConfig;
  items: MediaNode[];
  journeys?: LucyJourney[];
  loading: boolean;
  error?: string;
}

// =============================================================================
// ROW DATA LOADER
// =============================================================================

export class RowDataLoader {
  private engine: UnifiedRecommendationEngine;
  private cache = new Map<string, LoadedRow>();
  private cacheExpiry = new Map<string, number>();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes
  
  constructor(userId: string) {
    this.engine = createUnifiedEngine(userId);
  }
  
  /**
   * Load data for a single row
   */
  async loadRow(config: RowConfig): Promise<LoadedRow> {
    // Check cache
    const cached = this.getFromCache(config.id);
    if (cached) return cached;
    
    try {
      const items = await this.fetchRowData(config);
      const journeys = config.type === 'lucy_journeys'
        ? await this.fetchJourneys(config)
        : undefined;
      
      const loadedRow: LoadedRow = {
        config,
        items,
        journeys,
        loading: false,
      };
      
      this.setCache(config.id, loadedRow);
      return loadedRow;
    } catch (error: any) {
      return {
        config,
        items: [],
        loading: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Load data for multiple rows (batched)
   */
  async loadRows(configs: RowConfig[]): Promise<LoadedRow[]> {
    return Promise.all(configs.map(config => this.loadRow(config)));
  }
  
  /**
   * Clear cache for a specific row or all rows
   */
  clearCache(rowId?: string): void {
    if (rowId) {
      this.cache.delete(rowId);
      this.cacheExpiry.delete(rowId);
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
    }
  }
  
  // =========================================================================
  // DATA FETCHING
  // =========================================================================
  
  private async fetchRowData(config: RowConfig): Promise<MediaNode[]> {
    const limit = config.maxItems || 15;
    
    switch (config.type) {
      case 'continue_watching':
        return this.engine.getContinueWatching(limit);
      
      case 'continue_listening':
        return this.engine.getContinueListening(limit);
      
      case 'for_you':
      case 'top_picks':
        const recs = await this.engine.getRecommendations({
          category: config.category,
          mediaType: config.mediaType,
          limit,
        });
        return recs.flatMap(r => r.items).slice(0, limit);
      
      case 'because_you_watched':
      case 'because_you_listened':
        if (!config.sourceNodeId) return [];
        return this.engine.getBecauseYouWatched(config.sourceNodeId, limit);
      
      case 'hidden_gems':
        return this.fetchHiddenGems(config, limit);
      
      case 'trending_now':
        return this.fetchTrending(config, limit);
      
      case 'new_releases':
        return this.fetchNewReleases(config, limit);
      
      case 'popular_in_genre':
        return this.fetchByGenre(config, limit);
      
      case 'mood_discovery':
        if (!config.moodSlug) return [];
        return this.engine.getMoodDiscovery(config.moodSlug, limit);
      
      case 'featured_movies':
        return this.fetchByMediaType('movie', limit);
      
      case 'featured_shows':
        return this.fetchByMediaType('tv_show', limit);
      
      case 'featured_music':
        return this.fetchByMediaType('music_album', limit);
      
      case 'featured_podcasts':
        return this.fetchByMediaType('podcast_show', limit);
      
      case 'featured_audiobooks':
        return this.fetchByMediaType('audiobook', limit);
      
      case 'free_to_watch':
      case 'public_domain':
        return this.fetchFreeContent(config, limit);
      
      case 'fast_channels':
        return this.fetchFastChannels(limit);
      
      case 'curated_collection':
        return this.fetchCuratedCollection(config, limit);
      
      case 'morning_picks':
      case 'afternoon_vibes':
      case 'evening_watch':
      case 'late_night':
      case 'weekend_binge':
        return this.fetchTimeBasedContent(config, limit);
      
      default:
        return [];
    }
  }
  
  private async fetchJourneys(config: RowConfig): Promise<LucyJourney[]> {
    return this.engine.getJourneys({
      category: config.category,
      featured: config.type === 'lucy_journeys',
      limit: config.maxItems || 10,
    });
  }
  
  private async fetchHiddenGems(config: RowConfig, limit: number): Promise<MediaNode[]> {
    const { nodes } = await mediaGraphClient.searchNodes('', {
      category: config.category,
      minRating: 7.5,
    }, {
      limit,
      sortBy: 'rating',
      sortOrder: 'desc',
    });
    
    // Filter to less popular items
    return nodes.filter((n: any) => (n.popularity_score || 0) < 50);
  }
  
  private async fetchTrending(config: RowConfig, limit: number): Promise<MediaNode[]> {
    const { nodes } = await mediaGraphClient.searchNodes('', {
      category: config.category,
      mediaType: config.mediaType,
    }, {
      limit,
      sortBy: 'popularity',
      sortOrder: 'desc',
    });
    
    return nodes;
  }
  
  private async fetchNewReleases(config: RowConfig, limit: number): Promise<MediaNode[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { nodes } = await mediaGraphClient.searchNodes('', {
      category: config.category,
      releaseYearFrom: sevenDaysAgo.getFullYear(),
    }, {
      limit,
      sortBy: 'release_date',
      sortOrder: 'desc',
    });
    
    return nodes;
  }
  
  private async fetchByGenre(config: RowConfig, limit: number): Promise<MediaNode[]> {
    const { nodes } = await mediaGraphClient.searchNodes('', {
      category: config.category,
      genres: config.genres,
    }, {
      limit,
      sortBy: 'popularity',
      sortOrder: 'desc',
    });
    
    return nodes;
  }
  
  private async fetchByMediaType(mediaType: string, limit: number): Promise<MediaNode[]> {
    const { nodes } = await mediaGraphClient.searchNodes('', {
      mediaType: mediaType as any,
    }, {
      limit,
      sortBy: 'popularity',
      sortOrder: 'desc',
    });
    
    return nodes;
  }
  
  private async fetchFreeContent(config: RowConfig, limit: number): Promise<MediaNode[]> {
    const { nodes } = await mediaGraphClient.searchNodes('', {
      category: config.category,
      providers: config.providers as any,
      freeOnly: true,
    }, {
      limit,
      sortBy: 'rating',
      sortOrder: 'desc',
    });
    
    return nodes;
  }
  
  private async fetchFastChannels(limit: number): Promise<MediaNode[]> {
    const { nodes } = await mediaGraphClient.searchNodes('', {
      mediaType: 'fast_channel' as any,
    }, {
      limit,
      sortBy: 'popularity',
      sortOrder: 'desc',
    });
    
    return nodes;
  }
  
  private async fetchCuratedCollection(config: RowConfig, limit: number): Promise<MediaNode[]> {
    const { nodes } = await mediaGraphClient.searchNodes('', {
      genres: config.genres,
      moods: config.moods,
    }, {
      limit,
      sortBy: 'rating',
      sortOrder: 'desc',
    });
    
    return nodes;
  }
  
  private async fetchTimeBasedContent(config: RowConfig, limit: number): Promise<MediaNode[]> {
    // Use mood discovery for time-based content
    const moodMap: Record<string, string> = {
      'morning_picks': 'uplifting',
      'afternoon_vibes': 'focus',
      'evening_watch': 'relaxing',
      'late_night': 'chill',
      'weekend_binge': 'bingeable',
    };
    
    const mood = moodMap[config.type] || 'discover';
    return this.engine.getMoodDiscovery(mood, limit);
  }
  
  // =========================================================================
  // CACHE
  // =========================================================================
  
  private getFromCache(rowId: string): LoadedRow | null {
    const expiry = this.cacheExpiry.get(rowId);
    
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(rowId);
      this.cacheExpiry.delete(rowId);
      return null;
    }
    
    return this.cache.get(rowId) || null;
  }
  
  private setCache(rowId: string, row: LoadedRow): void {
    this.cache.set(rowId, row);
    this.cacheExpiry.set(rowId, Date.now() + this.cacheTTL);
  }
}

// =============================================================================
// EXPORT
// =============================================================================

export function createRowDataLoader(userId: string): RowDataLoader {
  return new RowDataLoader(userId);
}
