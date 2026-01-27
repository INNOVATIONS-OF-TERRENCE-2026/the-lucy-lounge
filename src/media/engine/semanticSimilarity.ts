// =============================================================================
// THE LUCY LOUNGE - SEMANTIC SIMILARITY ENGINE
// =============================================================================
// Uses pgvector embeddings for semantic search and similarity matching.
// Powers "taste vectors" and content discovery beyond explicit metadata.
// =============================================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  MediaNode,
  MediaCategory,
  UserTasteProfile,
} from '../types';

// =============================================================================
// TYPES
// =============================================================================

export interface SemanticSearchResult {
  node: MediaNode;
  similarity: number;
  matchType: 'title' | 'description' | 'embedding';
}

export interface TasteVector {
  userId: string;
  videoVector: number[];
  audioVector: number[];
  combinedVector: number[];
  lastUpdated: string;
}

export interface EmbeddingConfig {
  model: string;
  dimensions: number;
  provider: 'openai' | 'local';
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const DEFAULT_EMBEDDING_CONFIG: EmbeddingConfig = {
  model: 'text-embedding-3-small',
  dimensions: 1536,
  provider: 'openai',
};

// =============================================================================
// SEMANTIC SEARCH ENGINE
// =============================================================================

export class SemanticSearchEngine {
  private config: EmbeddingConfig;
  
  constructor(config: Partial<EmbeddingConfig> = {}) {
    this.config = { ...DEFAULT_EMBEDDING_CONFIG, ...config };
  }
  
  /**
   * Search content by natural language query using vector similarity
   */
  async semanticSearch(
    query: string,
    options: {
      category?: MediaCategory;
      limit?: number;
      threshold?: number;
    } = {}
  ): Promise<SemanticSearchResult[]> {
    const { category, limit = 20, threshold = 0.5 } = options;
    
    // Get embedding for query
    const queryEmbedding = await this.getEmbedding(query);
    
    // Use RPC function to search by vector similarity
    const { data, error } = await supabase.rpc('search_media_semantic', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      category_filter: category || null,
    });
    
    if (error || !data) {
      console.error('Semantic search error:', error);
      return [];
    }
    
    return data.map((row: any) => ({
      node: row as MediaNode,
      similarity: row.similarity,
      matchType: 'embedding' as const,
    }));
  }
  
  /**
   * Find similar content to a given media node
   */
  async findSimilar(
    nodeId: string,
    options: {
      limit?: number;
      sameCategory?: boolean;
      threshold?: number;
    } = {}
  ): Promise<SemanticSearchResult[]> {
    const { limit = 10, sameCategory = true, threshold = 0.6 } = options;
    
    // Get source node's embedding
    const { data: sourceNode } = await supabase
      .from('media_nodes')
      .select('embedding, category')
      .eq('id', nodeId)
      .single();
    
    if (!sourceNode?.embedding) {
      return [];
    }
    
    // Search for similar using the node's own embedding
    const { data, error } = await supabase.rpc('search_media_semantic', {
      query_embedding: sourceNode.embedding,
      match_threshold: threshold,
      match_count: limit + 1, // +1 to exclude self
      category_filter: sameCategory ? sourceNode.category : null,
    });
    
    if (error || !data) {
      return [];
    }
    
    // Filter out the source node itself
    return data
      .filter((row: any) => row.id !== nodeId)
      .map((row: any) => ({
        node: row as MediaNode,
        similarity: row.similarity,
        matchType: 'embedding' as const,
      }));
  }
  
  /**
   * Build taste vector from user's interaction history
   */
  async buildTasteVector(userId: string): Promise<TasteVector | null> {
    // Get user's highly-engaged content
    const [watchedData, listenedData, favoritesData] = await Promise.all([
      supabase
        .from('user_watch_events')
        .select('media_nodes!inner(embedding, category)')
        .eq('user_id', userId)
        .eq('completed', true)
        .limit(50),
      supabase
        .from('user_listen_events')
        .select('media_nodes!inner(embedding, category)')
        .eq('user_id', userId)
        .eq('skipped', false)
        .limit(50),
      supabase
        .from('user_collections')
        .select('user_collection_items(media_nodes!inner(embedding, category))')
        .eq('user_id', userId)
        .eq('collection_type', 'favorites')
        .single(),
    ]);
    
    // Collect embeddings by category
    const videoEmbeddings: number[][] = [];
    const audioEmbeddings: number[][] = [];
    
    // Process watched content
    for (const event of watchedData.data || []) {
      const node = (event as any).media_nodes;
      if (!node?.embedding) continue;
      
      if (node.category === 'video') {
        videoEmbeddings.push(node.embedding);
      }
    }
    
    // Process listened content
    for (const event of listenedData.data || []) {
      const node = (event as any).media_nodes;
      if (!node?.embedding) continue;
      
      if (node.category === 'audio') {
        audioEmbeddings.push(node.embedding);
      }
    }
    
    // Process favorites (with higher weight)
    const favorites = (favoritesData.data as any)?.user_collection_items || [];
    for (const item of favorites) {
      const node = item.media_nodes;
      if (!node?.embedding) continue;
      
      // Add twice for higher weight
      if (node.category === 'video') {
        videoEmbeddings.push(node.embedding);
        videoEmbeddings.push(node.embedding);
      } else if (node.category === 'audio') {
        audioEmbeddings.push(node.embedding);
        audioEmbeddings.push(node.embedding);
      }
    }
    
    // Compute average vectors
    const videoVector = this.averageVectors(videoEmbeddings);
    const audioVector = this.averageVectors(audioEmbeddings);
    const combinedVector = this.averageVectors([...videoEmbeddings, ...audioEmbeddings]);
    
    if (combinedVector.length === 0) {
      return null;
    }
    
    const tasteVector: TasteVector = {
      userId,
      videoVector,
      audioVector,
      combinedVector,
      lastUpdated: new Date().toISOString(),
    };
    
    // Store taste vector in user profile
    await supabase.from('user_taste_profiles').upsert({
      user_id: userId,
      taste_embedding_video: videoVector.length > 0 ? videoVector : null,
      taste_embedding_audio: audioVector.length > 0 ? audioVector : null,
      taste_embedding_combined: combinedVector,
      last_computed_at: new Date().toISOString(),
    });
    
    return tasteVector;
  }
  
  /**
   * Get recommendations using taste vector similarity
   */
  async getVectorRecommendations(
    userId: string,
    options: {
      category?: MediaCategory;
      limit?: number;
      threshold?: number;
    } = {}
  ): Promise<SemanticSearchResult[]> {
    const { category, limit = 20, threshold = 0.5 } = options;
    
    // Get user's taste vector
    const { data: profile } = await supabase
      .from('user_taste_profiles')
      .select('taste_embedding_video, taste_embedding_audio, taste_embedding_combined')
      .eq('user_id', userId)
      .single();
    
    if (!profile) {
      return [];
    }
    
    // Select appropriate vector
    let queryVector: number[] | null = null;
    
    if (category === 'video' && profile.taste_embedding_video) {
      queryVector = profile.taste_embedding_video;
    } else if (category === 'audio' && profile.taste_embedding_audio) {
      queryVector = profile.taste_embedding_audio;
    } else if (profile.taste_embedding_combined) {
      queryVector = profile.taste_embedding_combined;
    }
    
    if (!queryVector) {
      return [];
    }
    
    // Search using taste vector
    const { data, error } = await supabase.rpc('search_media_semantic', {
      query_embedding: queryVector,
      match_threshold: threshold,
      match_count: limit,
      category_filter: category || null,
    });
    
    if (error || !data) {
      return [];
    }
    
    return data.map((row: any) => ({
      node: row as MediaNode,
      similarity: row.similarity,
      matchType: 'embedding' as const,
    }));
  }
  
  /**
   * Generate embedding for text using configured provider
   */
  async getEmbedding(text: string): Promise<number[]> {
    if (this.config.provider === 'openai') {
      return this.getOpenAIEmbedding(text);
    }
    
    // Local embedding fallback (would use a local model)
    throw new Error('Local embeddings not yet implemented');
  }
  
  /**
   * Generate embeddings for a batch of texts
   */
  async getEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    // Process in batches of 100 (OpenAI limit)
    const batchSize = 100;
    const results: number[][] = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchEmbeddings = await this.getOpenAIEmbeddingsBatch(batch);
      results.push(...batchEmbeddings);
    }
    
    return results;
  }
  
  /**
   * Update embeddings for content without them
   */
  async backfillEmbeddings(limit: number = 100): Promise<number> {
    // Get nodes without embeddings
    const { data: nodes } = await supabase
      .from('media_nodes')
      .select('id, title, description')
      .is('embedding', null)
      .limit(limit);
    
    if (!nodes || nodes.length === 0) {
      return 0;
    }
    
    // Generate text for embedding
    const texts = nodes.map(node => 
      `${node.title}. ${node.description || ''}`
    );
    
    // Get embeddings
    const embeddings = await this.getEmbeddingsBatch(texts);
    
    // Update nodes
    let updated = 0;
    for (let i = 0; i < nodes.length; i++) {
      const { error } = await supabase
        .from('media_nodes')
        .update({ embedding: embeddings[i] })
        .eq('id', nodes[i].id);
      
      if (!error) updated++;
    }
    
    return updated;
  }
  
  // =========================================================================
  // PRIVATE METHODS
  // =========================================================================
  
  private async getOpenAIEmbedding(text: string): Promise<number[]> {
    // Call HuggingFace embeddings via Edge Function (unified embedding endpoint)
    const { data, error } = await supabase.functions.invoke('hf-embeddings', {
      body: { texts: [text] },
    });
    
    if (error || !data?.ok || !data?.embeddings?.[0]) {
      throw new Error(`Failed to generate embedding: ${error?.message || data?.error || 'Unknown error'}`);
    }
    
    return data.embeddings[0];
  }
  
  private async getOpenAIEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    // Call HuggingFace embeddings via Edge Function (supports batch)
    const { data, error } = await supabase.functions.invoke('hf-embeddings', {
      body: { texts },
    });
    
    if (error || !data?.ok || !data?.embeddings) {
      throw new Error(`Failed to generate embeddings: ${error?.message || data?.error || 'Unknown error'}`);
    }
    
    return data.embeddings;
  }
  
  private averageVectors(vectors: number[][]): number[] {
    if (vectors.length === 0) return [];
    
    const dimensions = vectors[0].length;
    const result = new Array(dimensions).fill(0);
    
    for (const vector of vectors) {
      for (let i = 0; i < dimensions; i++) {
        result[i] += vector[i];
      }
    }
    
    for (let i = 0; i < dimensions; i++) {
      result[i] /= vectors.length;
    }
    
    // Normalize
    const magnitude = Math.sqrt(result.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < dimensions; i++) {
        result[i] /= magnitude;
      }
    }
    
    return result;
  }
}

// =============================================================================
// EXPORT
// =============================================================================

export function createSemanticSearchEngine(
  config?: Partial<EmbeddingConfig>
): SemanticSearchEngine {
  return new SemanticSearchEngine(config);
}
