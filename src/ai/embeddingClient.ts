/**
 * THE LUCY LOUNGE - EMBEDDING CLIENT
 * 
 * Client-side interface for semantic embeddings and vector search.
 * Uses BGE-large-en-v1.5 or sentence-transformers via HuggingFace.
 * 
 * CAPABILITIES:
 * - Generate embeddings for text
 * - Semantic search across user memories
 * - Store memories with automatic embedding
 * - Similarity scoring between texts
 * 
 * All embedding generation happens server-side via Edge Functions.
 * This client manages the interface and caching.
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface EmbeddingResult {
  text: string;
  embedding: number[];
  model: string;
  dimensions: number;
}

export interface MemoryRecord {
  id: string;
  content: string;
  type: string;
  importance: number;
  createdAt: string;
  embedding?: number[];
  similarity?: number;
}

export interface SearchResult {
  id: string;
  content: string;
  type: string;
  importance: number;
  createdAt: string;
  similarity: number;
}

export interface StoreMemoryOptions {
  type?: 'conversation' | 'preference' | 'fact' | 'context';
  importance?: number;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// EMBEDDING CACHE
// ============================================================================

const EMBEDDING_CACHE_KEY = 'lucy_embedding_cache';
const MAX_CACHE_SIZE = 100;

interface CacheEntry {
  text: string;
  embedding: number[];
  timestamp: number;
}

/**
 * Simple LRU cache for embeddings to reduce API calls
 */
class EmbeddingCache {
  private cache: Map<string, CacheEntry> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(EMBEDDING_CACHE_KEY);
      if (stored) {
        const entries: [string, CacheEntry][] = JSON.parse(stored);
        this.cache = new Map(entries);
      }
    } catch {
      // Ignore storage errors (iOS Safari restrictions)
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const entries = Array.from(this.cache.entries()).slice(-MAX_CACHE_SIZE);
      localStorage.setItem(EMBEDDING_CACHE_KEY, JSON.stringify(entries));
    } catch {
      // Ignore storage errors
    }
  }

  private hash(text: string): string {
    // Simple hash for cache key
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  get(text: string): number[] | null {
    const key = this.hash(text);
    const entry = this.cache.get(key);
    if (entry && entry.text === text) {
      return entry.embedding;
    }
    return null;
  }

  set(text: string, embedding: number[]): void {
    const key = this.hash(text);
    
    // Evict oldest if cache is full
    if (this.cache.size >= MAX_CACHE_SIZE) {
      const oldest = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      if (oldest) this.cache.delete(oldest[0]);
    }

    this.cache.set(key, {
      text,
      embedding,
      timestamp: Date.now(),
    });

    this.saveToStorage();
  }

  clear(): void {
    this.cache.clear();
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(EMBEDDING_CACHE_KEY);
      } catch {
        // Ignore
      }
    }
  }
}

const embeddingCache = new EmbeddingCache();

// ============================================================================
// EMBEDDING FUNCTIONS
// ============================================================================

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  // Check cache first
  const cached = embeddingCache.get(text);
  if (cached) {
    return {
      text,
      embedding: cached,
      model: 'cached',
      dimensions: cached.length,
    };
  }

  // Generate via edge function
  const { data, error } = await supabase.functions.invoke('hf-embeddings', {
    body: { texts: [text] },
  });

  if (error || !data?.ok) {
    throw new Error(data?.error ?? 'Failed to generate embedding');
  }

  const embedding = data.embeddings[0];
  
  // Cache for future use
  embeddingCache.set(text, embedding);

  return {
    text,
    embedding,
    model: 'sentence-transformers/all-MiniLM-L6-v2',
    dimensions: embedding.length,
  };
}

/**
 * Generate embeddings for multiple texts (batched)
 */
export async function generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  // Check cache for each text
  const uncached: { index: number; text: string }[] = [];
  const results: EmbeddingResult[] = new Array(texts.length);

  texts.forEach((text, index) => {
    const cached = embeddingCache.get(text);
    if (cached) {
      results[index] = {
        text,
        embedding: cached,
        model: 'cached',
        dimensions: cached.length,
      };
    } else {
      uncached.push({ index, text });
    }
  });

  // Generate uncached embeddings
  if (uncached.length > 0) {
    const { data, error } = await supabase.functions.invoke('hf-embeddings', {
      body: { texts: uncached.map(u => u.text) },
    });

    if (error || !data?.ok) {
      throw new Error(data?.error ?? 'Failed to generate embeddings');
    }

    // Fill in results and cache
    uncached.forEach((item, i) => {
      const embedding = data.embeddings[i];
      embeddingCache.set(item.text, embedding);
      results[item.index] = {
        text: item.text,
        embedding,
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        dimensions: embedding.length,
      };
    });
  }

  return results;
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embedding dimensions must match');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ============================================================================
// MEMORY FUNCTIONS
// ============================================================================

/**
 * Store a memory with automatic embedding generation
 */
export async function storeMemory(
  userId: string,
  content: string,
  typeOrOptions?: string | StoreMemoryOptions
): Promise<string> {
  const options: StoreMemoryOptions = typeof typeOrOptions === 'string'
    ? { type: typeOrOptions as StoreMemoryOptions['type'] }
    : typeOrOptions ?? {};

  const { type = 'conversation', importance = 0.5, metadata } = options;

  // Generate embedding
  const { embedding } = await generateEmbedding(content);

  // Store via edge function
  const { data, error } = await supabase.functions.invoke('memory-save', {
    body: {
      userId,
      content,
      memoryType: type,
      importanceScore: importance,
      embedding,
      metadata,
    },
  });

  if (error) {
    console.error('[Embedding Client] Store memory failed:', error);
    throw new Error('Failed to store memory');
  }

  return data?.id ?? 'stored';
}

/**
 * Search memories using semantic similarity
 */
export async function searchMemories(
  userId: string,
  query: string,
  limit: number = 5
): Promise<SearchResult[]> {
  // Generate query embedding
  const { embedding } = await generateEmbedding(query);

  // Search via edge function (uses pgvector)
  const { data, error } = await supabase.functions.invoke('memory-search', {
    body: {
      userId,
      query,
      embedding,
      topK: limit,
    },
  });

  if (error) {
    console.error('[Embedding Client] Search memories failed:', error);
    return [];
  }

  return (data?.memories ?? []).map((m: MemoryRecord) => ({
    id: m.id,
    content: m.content,
    type: m.type,
    importance: m.importance,
    createdAt: m.createdAt,
    similarity: m.similarity ?? 0,
  }));
}

/**
 * Find similar content using embedding comparison
 */
export async function findSimilar(
  query: string,
  candidates: string[],
  topK: number = 5
): Promise<{ text: string; similarity: number }[]> {
  // Generate all embeddings
  const [queryResult, ...candidateResults] = await generateEmbeddings([query, ...candidates]);
  const queryEmbedding = queryResult.embedding;

  // Calculate similarities
  const similarities = candidateResults.map((result, i) => ({
    text: candidates[i],
    similarity: cosineSimilarity(queryEmbedding, result.embedding),
  }));

  // Sort and return top K
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Cluster texts by semantic similarity
 */
export async function clusterBySimilarity(
  texts: string[],
  threshold: number = 0.8
): Promise<string[][]> {
  if (texts.length === 0) return [];
  if (texts.length === 1) return [[texts[0]]];

  // Generate all embeddings
  const results = await generateEmbeddings(texts);
  const embeddings = results.map(r => r.embedding);

  // Simple clustering: group texts above threshold
  const clusters: string[][] = [];
  const assigned = new Set<number>();

  for (let i = 0; i < texts.length; i++) {
    if (assigned.has(i)) continue;

    const cluster: string[] = [texts[i]];
    assigned.add(i);

    for (let j = i + 1; j < texts.length; j++) {
      if (assigned.has(j)) continue;

      const similarity = cosineSimilarity(embeddings[i], embeddings[j]);
      if (similarity >= threshold) {
        cluster.push(texts[j]);
        assigned.add(j);
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Clear the embedding cache
 */
export function clearCache(): void {
  embeddingCache.clear();
}

/**
 * Get embedding dimension (varies by model)
 */
export function getEmbeddingDimension(): number {
  // MiniLM-L6-v2 produces 384-dimensional embeddings
  return 384;
}

/**
 * Normalize text for better embedding quality
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 512); // Limit length for efficiency
}

// ============================================================================
// EXPORTS
// ============================================================================

export const embeddingClient = {
  generateEmbedding,
  generateEmbeddings,
  cosineSimilarity,
  storeMemory,
  searchMemories,
  findSimilar,
  clusterBySimilarity,
  clearCache,
  getEmbeddingDimension,
  normalizeText,
};

export default embeddingClient;
