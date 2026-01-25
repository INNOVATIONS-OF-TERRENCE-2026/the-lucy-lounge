// =============================================================================
// THE LUCY LOUNGE - CONTENT INGESTION PIPELINE
// =============================================================================
// Orchestrates content ingestion from multiple providers
// Handles scheduling, deduplication, and error recovery
// =============================================================================

import { mediaGraphClient, BatchIngestResult } from './MediaGraphClient';
import {
  getAllAdapters,
  getAdapter,
  initializeAllAdapters,
  type ProviderAdapter,
} from '../providers';
import type {
  MediaNode,
  MediaCategory,
  ProviderType,
} from '../types';

// =============================================================================
// TYPES
// =============================================================================

export interface IngestionConfig {
  providers: ProviderType[];
  categories?: MediaCategory[];
  batchSize: number;
  maxItemsPerProvider: number;
  retryAttempts: number;
  retryDelayMs: number;
  concurrentProviders: number;
}

export const DEFAULT_INGESTION_CONFIG: IngestionConfig = {
  providers: ['tmdb', 'youtube', 'rss_podcast', 'archive_org', 'librivox'],
  categories: undefined, // All categories
  batchSize: 100,
  maxItemsPerProvider: 500,
  retryAttempts: 3,
  retryDelayMs: 1000,
  concurrentProviders: 2,
};

export interface IngestionProgress {
  provider: ProviderType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  itemsProcessed: number;
  itemsTotal: number;
  errors: string[];
}

export interface IngestionResult {
  startedAt: string;
  completedAt: string;
  providers: IngestionProgress[];
  totalInserted: number;
  totalUpdated: number;
  totalErrors: number;
}

type ProgressCallback = (progress: IngestionProgress) => void;

// =============================================================================
// INGESTION PIPELINE
// =============================================================================

export class ContentIngestionPipeline {
  private config: IngestionConfig;
  private progress: Map<ProviderType, IngestionProgress> = new Map();
  private progressCallback?: ProgressCallback;
  
  constructor(config: Partial<IngestionConfig> = {}) {
    this.config = { ...DEFAULT_INGESTION_CONFIG, ...config };
  }
  
  /**
   * Set progress callback for real-time updates
   */
  onProgress(callback: ProgressCallback): void {
    this.progressCallback = callback;
  }
  
  /**
   * Run full ingestion from all configured providers
   */
  async runFullIngestion(): Promise<IngestionResult> {
    const startedAt = new Date().toISOString();
    const results: BatchIngestResult[] = [];
    
    // Initialize all adapters
    await initializeAllAdapters();
    
    // Initialize progress tracking
    for (const provider of this.config.providers) {
      this.progress.set(provider, {
        provider,
        status: 'pending',
        itemsProcessed: 0,
        itemsTotal: this.config.maxItemsPerProvider,
        errors: [],
      });
    }
    
    // Process providers in batches for concurrency control
    const providerBatches = this.chunkArray(
      this.config.providers,
      this.config.concurrentProviders
    );
    
    for (const batch of providerBatches) {
      const batchResults = await Promise.all(
        batch.map(provider => this.ingestFromProvider(provider))
      );
      results.push(...batchResults);
    }
    
    // Aggregate results
    const completedAt = new Date().toISOString();
    
    return {
      startedAt,
      completedAt,
      providers: Array.from(this.progress.values()),
      totalInserted: results.reduce((sum, r) => sum + r.inserted, 0),
      totalUpdated: results.reduce((sum, r) => sum + r.updated, 0),
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
    };
  }
  
  /**
   * Run incremental ingestion (new/updated content only)
   */
  async runIncrementalIngestion(sinceDate?: Date): Promise<IngestionResult> {
    const startedAt = new Date().toISOString();
    const since = sinceDate || this.getLastSyncDate();
    const results: BatchIngestResult[] = [];
    
    // Initialize adapters
    await initializeAllAdapters();
    
    // Focus on trending and new releases
    for (const provider of this.config.providers) {
      this.updateProgress(provider, { status: 'running' });
      
      try {
        const adapter = getAdapter(provider);
        if (!adapter) continue;
        
        // Get trending content (likely to be new/updated)
        const trendingNodes = await this.fetchWithRetry(() =>
          adapter.getTrending(undefined, Math.floor(this.config.maxItemsPerProvider / 2))
        );
        
        // Get new releases
        const newReleaseNodes = await this.fetchWithRetry(() =>
          adapter.getNewReleases(undefined, Math.floor(this.config.maxItemsPerProvider / 2))
        );
        
        const allNodes = [...trendingNodes, ...newReleaseNodes];
        const result = await mediaGraphClient.ingestNodesBatch(allNodes, {
          batchSize: this.config.batchSize,
          updateIfExists: true,
        });
        
        results.push(result);
        
        this.updateProgress(provider, {
          status: 'completed',
          itemsProcessed: allNodes.length,
          itemsTotal: allNodes.length,
        });
      } catch (error: any) {
        this.updateProgress(provider, {
          status: 'failed',
          errors: [error.message],
        });
      }
    }
    
    const completedAt = new Date().toISOString();
    
    return {
      startedAt,
      completedAt,
      providers: Array.from(this.progress.values()),
      totalInserted: results.reduce((sum, r) => sum + r.inserted, 0),
      totalUpdated: results.reduce((sum, r) => sum + r.updated, 0),
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
    };
  }
  
  /**
   * Ingest content from a single provider
   */
  async ingestFromProvider(providerType: ProviderType): Promise<BatchIngestResult> {
    const adapter = getAdapter(providerType);
    
    if (!adapter) {
      return {
        total: 0,
        inserted: 0,
        updated: 0,
        deduplicated: 0,
        errors: [{ index: 0, error: `Adapter not found for ${providerType}` }],
      };
    }
    
    this.updateProgress(providerType, { status: 'running' });
    
    try {
      const nodes: MediaNode[] = [];
      const categories = this.config.categories || ['video', 'audio'];
      
      for (const category of categories) {
        // Fetch trending
        const trending = await this.fetchWithRetry(() =>
          adapter.getTrending(category as any, Math.floor(this.config.maxItemsPerProvider / 4))
        );
        nodes.push(...trending);
        
        this.updateProgress(providerType, { itemsProcessed: nodes.length });
        
        // Fetch by popular genres
        const genres = this.getPopularGenres(category as MediaCategory);
        for (const genre of genres) {
          const genreNodes = await this.fetchWithRetry(() =>
            adapter.getByGenre(genre, Math.floor(this.config.maxItemsPerProvider / (genres.length * 2)))
          );
          nodes.push(...genreNodes);
          
          this.updateProgress(providerType, { itemsProcessed: nodes.length });
        }
        
        // Fetch new releases
        const newReleases = await this.fetchWithRetry(() =>
          adapter.getNewReleases(category as any, Math.floor(this.config.maxItemsPerProvider / 4))
        );
        nodes.push(...newReleases);
        
        this.updateProgress(providerType, { itemsProcessed: nodes.length });
        
        // Respect max items limit
        if (nodes.length >= this.config.maxItemsPerProvider) {
          break;
        }
      }
      
      // Dedupe within batch
      const uniqueNodes = this.dedupeNodes(nodes);
      
      // Ingest to database
      const result = await mediaGraphClient.ingestNodesBatch(
        uniqueNodes.slice(0, this.config.maxItemsPerProvider),
        {
          batchSize: this.config.batchSize,
          updateIfExists: true,
        }
      );
      
      this.updateProgress(providerType, {
        status: 'completed',
        itemsProcessed: uniqueNodes.length,
        itemsTotal: uniqueNodes.length,
        errors: result.errors.map(e => e.error),
      });
      
      // Ingest availability info
      await this.ingestAvailability(adapter, uniqueNodes);
      
      return result;
    } catch (error: any) {
      this.updateProgress(providerType, {
        status: 'failed',
        errors: [error.message],
      });
      
      return {
        total: 0,
        inserted: 0,
        updated: 0,
        deduplicated: 0,
        errors: [{ index: 0, error: error.message }],
      };
    }
  }
  
  /**
   * Ingest availability info for nodes
   */
  private async ingestAvailability(
    adapter: ProviderAdapter,
    nodes: MediaNode[]
  ): Promise<void> {
    for (const node of nodes) {
      try {
        const availability = await adapter.getAvailability(node.id);
        
        for (const avail of availability) {
          await mediaGraphClient.upsertAvailability(
            node.id,
            avail.provider_id,
            avail
          );
        }
      } catch {
        // Non-critical, continue
      }
    }
  }
  
  // =========================================================================
  // HELPERS
  // =========================================================================
  
  private async fetchWithRetry<T>(
    fn: () => Promise<T>,
    attempts: number = this.config.retryAttempts
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        
        if (i < attempts - 1) {
          await this.delay(this.config.retryDelayMs * (i + 1));
        }
      }
    }
    
    throw lastError;
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private updateProgress(
    provider: ProviderType,
    update: Partial<IngestionProgress>
  ): void {
    const current = this.progress.get(provider);
    if (current) {
      const updated = { ...current, ...update };
      this.progress.set(provider, updated);
      this.progressCallback?.(updated);
    }
  }
  
  private dedupeNodes(nodes: MediaNode[]): MediaNode[] {
    const seen = new Map<string, MediaNode>();
    
    for (const node of nodes) {
      const key = node.canonical_id || `${node.title}:${node.media_type}`;
      
      if (!seen.has(key)) {
        seen.set(key, node);
      }
    }
    
    return Array.from(seen.values());
  }
  
  private getPopularGenres(category: MediaCategory): string[] {
    if (category === 'video') {
      return ['action', 'comedy', 'drama', 'thriller', 'sci-fi', 'documentary'];
    }
    
    if (category === 'audio') {
      return ['pop', 'rock', 'hip-hop', 'indie', 'classical', 'jazz', 'electronic'];
    }
    
    return [];
  }
  
  private getLastSyncDate(): Date {
    // Default to 24 hours ago
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  }
  
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// =============================================================================
// SCHEDULED SYNC
// =============================================================================

export interface SyncSchedule {
  type: 'full' | 'incremental';
  cronExpression: string;
  providers?: ProviderType[];
  enabled: boolean;
}

export const DEFAULT_SYNC_SCHEDULES: SyncSchedule[] = [
  {
    type: 'incremental',
    cronExpression: '0 */4 * * *', // Every 4 hours
    enabled: true,
  },
  {
    type: 'full',
    cronExpression: '0 2 * * 0', // Weekly on Sunday at 2 AM
    enabled: true,
  },
];

/**
 * Create a scheduled sync job (for use with cron-like schedulers)
 */
export function createSyncJob(
  type: 'full' | 'incremental',
  config?: Partial<IngestionConfig>
): () => Promise<IngestionResult> {
  const pipeline = new ContentIngestionPipeline(config);
  
  return async () => {
    console.log(`[ContentIngestion] Starting ${type} sync at ${new Date().toISOString()}`);
    
    const result = type === 'full'
      ? await pipeline.runFullIngestion()
      : await pipeline.runIncrementalIngestion();
    
    console.log(`[ContentIngestion] Completed ${type} sync:`, {
      inserted: result.totalInserted,
      updated: result.totalUpdated,
      errors: result.totalErrors,
    });
    
    return result;
  };
}

// =============================================================================
// EXPORT
// =============================================================================

export function createIngestionPipeline(
  config?: Partial<IngestionConfig>
): ContentIngestionPipeline {
  return new ContentIngestionPipeline(config);
}
