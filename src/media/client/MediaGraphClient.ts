// =============================================================================
// THE LUCY LOUNGE - MEDIA GRAPH CLIENT
// =============================================================================
// High-level client for interacting with the Universal Media Graph
// Handles content ingestion, ID normalization, deduplication, and CRUD
// =============================================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  MediaNode,
  MediaSeries,
  MediaProvider,
  MediaAvailability,
  MediaRelationship,
  MediaTag,
  MediaPerson,
  MediaCredit,
  MediaType,
  MediaCategory,
  ProviderType,
  RelationshipType,
} from '../types';
import { generateCanonicalId, parseCanonicalId } from '../providers/ProviderAdapter';

// =============================================================================
// TYPES
// =============================================================================

export interface IngestResult {
  success: boolean;
  nodeId?: string;
  canonicalId?: string;
  deduplicated: boolean;
  errors?: string[];
}

export interface BatchIngestResult {
  total: number;
  inserted: number;
  updated: number;
  deduplicated: number;
  errors: Array<{ index: number; error: string }>;
}

export interface SearchFilters {
  category?: MediaCategory;
  mediaType?: MediaType;
  genres?: string[];
  moods?: string[];
  providers?: ProviderType[];
  minRating?: number;
  maxRating?: number;
  releaseYearFrom?: number;
  releaseYearTo?: number;
  contentRating?: string;
  hasAvailability?: boolean;
  freeOnly?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: 'popularity' | 'rating' | 'release_date' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// =============================================================================
// MEDIA GRAPH CLIENT
// =============================================================================

export class MediaGraphClient {
  // =========================================================================
  // CONTENT RETRIEVAL
  // =========================================================================
  
  /**
   * Get a media node by ID
   */
  async getNode(nodeId: string): Promise<MediaNode | null> {
    const { data, error } = await supabase
      .from('media_nodes')
      .select('*')
      .eq('id', nodeId)
      .single();
    
    if (error || !data) return null;
    return data as MediaNode;
  }
  
  /**
   * Get a media node by canonical ID
   */
  async getNodeByCanonicalId(canonicalId: string): Promise<MediaNode | null> {
    const { data, error } = await supabase
      .from('media_nodes')
      .select('*')
      .eq('canonical_id', canonicalId)
      .single();
    
    if (error || !data) return null;
    return data as MediaNode;
  }
  
  /**
   * Get a media node with all related data
   */
  async getNodeWithDetails(nodeId: string): Promise<{
    node: MediaNode;
    series?: MediaSeries;
    availability: MediaAvailability[];
    credits: MediaCredit[];
    tags: MediaTag[];
    relationships: MediaRelationship[];
  } | null> {
    const [nodeResult, availResult, creditsResult, tagsResult, relResult] = await Promise.all([
      supabase.from('media_nodes').select('*, media_series(*)').eq('id', nodeId).single(),
      supabase.from('media_availability').select('*, media_providers(*)').eq('media_node_id', nodeId),
      supabase.from('media_credits').select('*, media_people(*)').eq('media_node_id', nodeId),
      supabase.from('media_node_tags').select('*, media_tags(*)').eq('media_node_id', nodeId),
      supabase.from('media_relationships').select('*').or(`source_id.eq.${nodeId},target_id.eq.${nodeId}`),
    ]);
    
    if (nodeResult.error || !nodeResult.data) return null;
    
    return {
      node: nodeResult.data as MediaNode,
      series: (nodeResult.data as any).media_series as MediaSeries | undefined,
      availability: (availResult.data || []) as any[],
      credits: (creditsResult.data || []) as any[],
      tags: (tagsResult.data || []).map((t: any) => t.media_tags) as MediaTag[],
      relationships: (relResult.data || []) as MediaRelationship[],
    };
  }
  
  /**
   * Get a media series with all episodes/items
   */
  async getSeries(seriesId: string): Promise<{
    series: MediaSeries;
    items: MediaNode[];
  } | null> {
    const { data: series, error } = await supabase
      .from('media_series')
      .select('*')
      .eq('id', seriesId)
      .single();
    
    if (error || !series) return null;
    
    const { data: items } = await supabase
      .from('media_nodes')
      .select('*')
      .eq('series_id', seriesId)
      .order('episode_number', { ascending: true });
    
    return {
      series: series as MediaSeries,
      items: (items || []) as MediaNode[],
    };
  }
  
  /**
   * Search media nodes with filters
   */
  async searchNodes(
    query: string,
    filters: SearchFilters = {},
    pagination: PaginationParams = {}
  ): Promise<{ nodes: MediaNode[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'popularity', sortOrder = 'desc' } = pagination;
    const offset = (page - 1) * limit;
    
    let queryBuilder = supabase
      .from('media_nodes')
      .select('*', { count: 'exact' });
    
    // Text search
    if (query) {
      queryBuilder = queryBuilder.textSearch('search_vector', query, {
        type: 'websearch',
        config: 'english',
      });
    }
    
    // Apply filters
    if (filters.category) {
      queryBuilder = queryBuilder.eq('category', filters.category);
    }
    
    if (filters.mediaType) {
      queryBuilder = queryBuilder.eq('media_type', filters.mediaType);
    }
    
    if (filters.minRating !== undefined) {
      queryBuilder = queryBuilder.gte('average_rating', filters.minRating);
    }
    
    if (filters.maxRating !== undefined) {
      queryBuilder = queryBuilder.lte('average_rating', filters.maxRating);
    }
    
    if (filters.releaseYearFrom !== undefined) {
      const fromDate = `${filters.releaseYearFrom}-01-01`;
      queryBuilder = queryBuilder.gte('release_date', fromDate);
    }
    
    if (filters.releaseYearTo !== undefined) {
      const toDate = `${filters.releaseYearTo}-12-31`;
      queryBuilder = queryBuilder.lte('release_date', toDate);
    }
    
    if (filters.contentRating) {
      queryBuilder = queryBuilder.eq('content_rating', filters.contentRating);
    }
    
    // Sort
    const sortColumn = sortBy === 'popularity' ? 'popularity_score' : sortBy;
    queryBuilder = queryBuilder.order(sortColumn, { ascending: sortOrder === 'asc' });
    
    // Pagination
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);
    
    const { data, error, count } = await queryBuilder;
    
    if (error) {
      console.error('Search error:', error);
      return { nodes: [], total: 0 };
    }
    
    return {
      nodes: (data || []) as MediaNode[],
      total: count || 0,
    };
  }
  
  /**
   * Get availability for a node across all providers
   */
  async getAvailability(nodeId: string): Promise<MediaAvailability[]> {
    const { data, error } = await supabase
      .from('media_availability')
      .select('*, media_providers(*)')
      .eq('media_node_id', nodeId)
      .eq('is_available', true);
    
    if (error || !data) return [];
    return data as any[];
  }
  
  // =========================================================================
  // CONTENT INGESTION
  // =========================================================================
  
  /**
   * Ingest a single media node (handles deduplication)
   */
  async ingestNode(
    node: Omit<MediaNode, 'id' | 'created_at' | 'updated_at'>,
    options: {
      upsert?: boolean;
      updateIfExists?: boolean;
    } = {}
  ): Promise<IngestResult> {
    const { upsert = true, updateIfExists = true } = options;
    
    try {
      // Generate canonical ID if not provided
      const canonicalId = node.canonical_id || this.generateCanonicalIdForNode(node);
      
      // Check for existing node
      const { data: existing } = await supabase
        .from('media_nodes')
        .select('id, canonical_id')
        .eq('canonical_id', canonicalId)
        .single();
      
      if (existing) {
        if (updateIfExists) {
          // Update existing node
          const { error } = await supabase
            .from('media_nodes')
            .update({
              ...node,
              canonical_id: canonicalId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
          
          if (error) {
            return { success: false, errors: [error.message], deduplicated: true };
          }
          
          return {
            success: true,
            nodeId: existing.id,
            canonicalId,
            deduplicated: true,
          };
        }
        
        return {
          success: true,
          nodeId: existing.id,
          canonicalId,
          deduplicated: true,
        };
      }
      
      // Insert new node
      const { data: inserted, error } = await supabase
        .from('media_nodes')
        .insert({
          ...node,
          canonical_id: canonicalId,
        })
        .select('id')
        .single();
      
      if (error || !inserted) {
        return { success: false, errors: [error?.message || 'Insert failed'], deduplicated: false };
      }
      
      return {
        success: true,
        nodeId: inserted.id,
        canonicalId,
        deduplicated: false,
      };
    } catch (err: any) {
      return { success: false, errors: [err.message], deduplicated: false };
    }
  }
  
  /**
   * Batch ingest multiple nodes
   */
  async ingestNodesBatch(
    nodes: Omit<MediaNode, 'id' | 'created_at' | 'updated_at'>[],
    options: {
      batchSize?: number;
      updateIfExists?: boolean;
    } = {}
  ): Promise<BatchIngestResult> {
    const { batchSize = 100, updateIfExists = true } = options;
    
    const result: BatchIngestResult = {
      total: nodes.length,
      inserted: 0,
      updated: 0,
      deduplicated: 0,
      errors: [],
    };
    
    // Process in batches
    for (let i = 0; i < nodes.length; i += batchSize) {
      const batch = nodes.slice(i, i + batchSize);
      
      // Generate canonical IDs
      const nodesWithIds = batch.map(node => ({
        ...node,
        canonical_id: node.canonical_id || this.generateCanonicalIdForNode(node),
      }));
      
      // Get existing nodes by canonical ID
      const canonicalIds = nodesWithIds.map(n => n.canonical_id);
      const { data: existing } = await supabase
        .from('media_nodes')
        .select('id, canonical_id')
        .in('canonical_id', canonicalIds);
      
      const existingMap = new Map(
        (existing || []).map(e => [e.canonical_id, e.id])
      );
      
      // Separate new vs existing
      const toInsert: typeof nodesWithIds = [];
      const toUpdate: Array<typeof nodesWithIds[0] & { id: string }> = [];
      
      for (const node of nodesWithIds) {
        const existingId = existingMap.get(node.canonical_id!);
        if (existingId) {
          result.deduplicated++;
          if (updateIfExists) {
            toUpdate.push({ ...node, id: existingId });
          }
        } else {
          toInsert.push(node);
        }
      }
      
      // Insert new nodes
      if (toInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('media_nodes')
          .insert(toInsert);
        
        if (insertError) {
          result.errors.push({ index: i, error: insertError.message });
        } else {
          result.inserted += toInsert.length;
        }
      }
      
      // Update existing nodes
      for (const node of toUpdate) {
        const { error: updateError } = await supabase
          .from('media_nodes')
          .update({
            ...node,
            updated_at: new Date().toISOString(),
          })
          .eq('id', node.id);
        
        if (updateError) {
          result.errors.push({ index: i, error: updateError.message });
        } else {
          result.updated++;
        }
      }
    }
    
    return result;
  }
  
  /**
   * Ingest a series with all its items
   */
  async ingestSeries(
    series: Omit<MediaSeries, 'id' | 'created_at' | 'updated_at'>,
    items: Omit<MediaNode, 'id' | 'series_id' | 'created_at' | 'updated_at'>[]
  ): Promise<{ seriesId: string | null; nodeIds: string[]; errors: string[] }> {
    const errors: string[] = [];
    const nodeIds: string[] = [];
    
    // Insert series
    const { data: insertedSeries, error: seriesError } = await supabase
      .from('media_series')
      .insert(series)
      .select('id')
      .single();
    
    if (seriesError || !insertedSeries) {
      return { seriesId: null, nodeIds: [], errors: [seriesError?.message || 'Series insert failed'] };
    }
    
    const seriesId = insertedSeries.id;
    
    // Insert items linked to series
    for (const item of items) {
      const result = await this.ingestNode({
        ...item,
        series_id: seriesId,
      } as any);
      
      if (result.success && result.nodeId) {
        nodeIds.push(result.nodeId);
      } else if (result.errors) {
        errors.push(...result.errors);
      }
    }
    
    return { seriesId, nodeIds, errors };
  }
  
  // =========================================================================
  // AVAILABILITY MANAGEMENT
  // =========================================================================
  
  /**
   * Add or update availability for a node
   */
  async upsertAvailability(
    nodeId: string,
    providerId: string,
    availability: Omit<MediaAvailability, 'id' | 'media_node_id' | 'provider_id' | 'created_at' | 'updated_at'>
  ): Promise<boolean> {
    const { error } = await supabase
      .from('media_availability')
      .upsert({
        media_node_id: nodeId,
        provider_id: providerId,
        ...availability,
        last_checked_at: new Date().toISOString(),
      }, {
        onConflict: 'media_node_id,provider_id',
      });
    
    return !error;
  }
  
  /**
   * Mark availability as expired/unavailable
   */
  async expireAvailability(nodeId: string, providerId: string): Promise<boolean> {
    const { error } = await supabase
      .from('media_availability')
      .update({
        is_available: false,
        updated_at: new Date().toISOString(),
      })
      .eq('media_node_id', nodeId)
      .eq('provider_id', providerId);
    
    return !error;
  }
  
  // =========================================================================
  // RELATIONSHIP MANAGEMENT
  // =========================================================================
  
  /**
   * Create a relationship between two nodes
   */
  async createRelationship(
    sourceId: string,
    targetId: string,
    relationshipType: RelationshipType,
    weight: number = 1.0,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    const { error } = await supabase
      .from('media_relationships')
      .upsert({
        source_id: sourceId,
        target_id: targetId,
        relationship_type: relationshipType,
        weight,
        metadata,
      }, {
        onConflict: 'source_id,target_id,relationship_type',
      });
    
    return !error;
  }
  
  /**
   * Get related content by relationship type
   */
  async getRelated(
    nodeId: string,
    relationshipTypes?: RelationshipType[]
  ): Promise<Array<{ node: MediaNode; relationshipType: RelationshipType; weight: number }>> {
    let query = supabase
      .from('media_relationships')
      .select('target_id, relationship_type, weight, media_nodes!media_relationships_target_id_fkey(*)')
      .eq('source_id', nodeId);
    
    if (relationshipTypes && relationshipTypes.length > 0) {
      query = query.in('relationship_type', relationshipTypes);
    }
    
    const { data, error } = await query.order('weight', { ascending: false });
    
    if (error || !data) return [];
    
    return data
      .filter((r: any) => r.media_nodes)
      .map((r: any) => ({
        node: r.media_nodes as MediaNode,
        relationshipType: r.relationship_type as RelationshipType,
        weight: r.weight,
      }));
  }
  
  // =========================================================================
  // TAG MANAGEMENT
  // =========================================================================
  
  /**
   * Add tags to a node
   */
  async addTags(
    nodeId: string,
    tagSlugs: string[],
    relevance: number = 1.0
  ): Promise<boolean> {
    // Get tag IDs
    const { data: tags } = await supabase
      .from('media_tags')
      .select('id, slug')
      .in('slug', tagSlugs);
    
    if (!tags || tags.length === 0) return false;
    
    // Create node-tag associations
    const associations = tags.map(tag => ({
      media_node_id: nodeId,
      tag_id: tag.id,
      relevance,
    }));
    
    const { error } = await supabase
      .from('media_node_tags')
      .upsert(associations, {
        onConflict: 'media_node_id,tag_id',
      });
    
    return !error;
  }
  
  /**
   * Get all tags for a node
   */
  async getTags(nodeId: string): Promise<MediaTag[]> {
    const { data, error } = await supabase
      .from('media_node_tags')
      .select('media_tags(*), relevance')
      .eq('media_node_id', nodeId)
      .order('relevance', { ascending: false });
    
    if (error || !data) return [];
    
    return data.map((t: any) => t.media_tags as MediaTag);
  }
  
  // =========================================================================
  // CREDITS MANAGEMENT
  // =========================================================================
  
  /**
   * Add credits to a node
   */
  async addCredits(
    nodeId: string,
    credits: Array<{
      personId: string;
      role: string;
      characterName?: string;
      displayOrder?: number;
    }>
  ): Promise<boolean> {
    const creditRecords = credits.map((c, idx) => ({
      media_node_id: nodeId,
      person_id: c.personId,
      credit_role: c.role,
      character_name: c.characterName,
      display_order: c.displayOrder ?? idx,
    }));
    
    const { error } = await supabase
      .from('media_credits')
      .insert(creditRecords);
    
    return !error;
  }
  
  /**
   * Get or create a person
   */
  async upsertPerson(
    person: Omit<MediaPerson, 'id' | 'created_at' | 'updated_at'>
  ): Promise<string | null> {
    // Try to find by external ID first
    if (person.tmdb_id) {
      const { data: existing } = await supabase
        .from('media_people')
        .select('id')
        .eq('tmdb_id', person.tmdb_id)
        .single();
      
      if (existing) {
        // Update
        await supabase
          .from('media_people')
          .update(person)
          .eq('id', existing.id);
        return existing.id;
      }
    }
    
    // Insert new
    const { data: inserted, error } = await supabase
      .from('media_people')
      .insert(person)
      .select('id')
      .single();
    
    if (error || !inserted) return null;
    return inserted.id;
  }
  
  // =========================================================================
  // PROVIDER MANAGEMENT
  // =========================================================================
  
  /**
   * Get all active providers
   */
  async getProviders(): Promise<MediaProvider[]> {
    const { data, error } = await supabase
      .from('media_providers')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true });
    
    if (error || !data) return [];
    return data as MediaProvider[];
  }
  
  /**
   * Get provider by ID
   */
  async getProvider(providerId: string): Promise<MediaProvider | null> {
    const { data, error } = await supabase
      .from('media_providers')
      .select('*')
      .eq('id', providerId)
      .single();
    
    if (error || !data) return null;
    return data as MediaProvider;
  }
  
  // =========================================================================
  // SYNC JOBS
  // =========================================================================
  
  /**
   * Create a provider sync job
   */
  async createSyncJob(
    providerId: string,
    syncType: 'full' | 'incremental'
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from('provider_sync_jobs')
      .insert({
        provider_id: providerId,
        sync_type: syncType,
        status: 'pending',
      })
      .select('id')
      .single();
    
    if (error || !data) return null;
    return data.id;
  }
  
  /**
   * Update sync job status
   */
  async updateSyncJob(
    jobId: string,
    update: {
      status?: 'pending' | 'running' | 'completed' | 'failed';
      items_processed?: number;
      items_total?: number;
      errors?: string[];
    }
  ): Promise<boolean> {
    const { error } = await supabase
      .from('provider_sync_jobs')
      .update({
        ...update,
        ...(update.status === 'completed' || update.status === 'failed'
          ? { completed_at: new Date().toISOString() }
          : {}),
      })
      .eq('id', jobId);
    
    return !error;
  }
  
  // =========================================================================
  // HELPERS
  // =========================================================================
  
  private generateCanonicalIdForNode(
    node: Omit<MediaNode, 'id' | 'created_at' | 'updated_at'>
  ): string {
    // Extract provider info from node metadata if available
    const metadata = node.metadata as any;
    
    if (metadata?.tmdb_id) {
      return generateCanonicalId('tmdb', metadata.tmdb_id);
    }
    
    if (metadata?.youtube_id) {
      return generateCanonicalId('youtube', metadata.youtube_id);
    }
    
    if (metadata?.spotify_id) {
      return generateCanonicalId('spotify', metadata.spotify_id);
    }
    
    // Fallback: generate from title + year
    const year = node.release_date 
      ? new Date(node.release_date).getFullYear() 
      : 'unknown';
    const normalized = node.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    return `lucy:${node.media_type}:${normalized}-${year}`;
  }
}

// =============================================================================
// EXPORT
// =============================================================================

export const mediaGraphClient = new MediaGraphClient();

export function createMediaGraphClient(): MediaGraphClient {
  return new MediaGraphClient();
}
