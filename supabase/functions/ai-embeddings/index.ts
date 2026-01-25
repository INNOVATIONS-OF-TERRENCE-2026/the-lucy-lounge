/**
 * THE LUCY LOUNGE - AI EMBEDDINGS EDGE FUNCTION
 * 
 * Generates text embeddings for semantic search using:
 * - BGE-large-en-v1.5 (primary)
 * - sentence-transformers/all-MiniLM-L6-v2 (fallback)
 * 
 * Supports batch embedding generation for efficiency.
 * Embeddings are used for:
 * - User memory search (pgvector)
 * - Semantic similarity
 * - Document clustering
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from "https://esm.sh/@huggingface/inference@2.8.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Embedding models in order of preference
const EMBEDDING_MODELS = [
  'BAAI/bge-large-en-v1.5',           // 1024 dimensions, best quality
  'intfloat/e5-large-v2',              // 1024 dimensions, excellent quality
  'sentence-transformers/all-MiniLM-L6-v2', // 384 dimensions, fastest
];

// Maximum texts per batch
const MAX_BATCH_SIZE = 32;
const MAX_TEXT_LENGTH = 512;

// Sanitize errors
function sanitizeError(error: unknown): string {
  console.error('[INTERNAL]', error);
  return 'Embedding generation temporarily unavailable.';
}

// Normalize text for better embedding quality
function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_TEXT_LENGTH);
}

interface EmbeddingRequest {
  texts: string[];
  model?: string;
  normalize?: boolean;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const HF_TOKEN = Deno.env.get('HF_TOKEN');
    
    if (!HF_TOKEN) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'Embedding service not configured',
        fallback: true,
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: EmbeddingRequest = await req.json();
    const { texts, model, normalize = true } = body;

    // Validate input
    if (!Array.isArray(texts) || texts.length === 0) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'texts[] is required',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Enforce batch limits
    if (texts.length > MAX_BATCH_SIZE) {
      return new Response(JSON.stringify({
        ok: false,
        error: `Maximum ${MAX_BATCH_SIZE} texts per batch`,
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Normalize texts
    const processedTexts = normalize ? texts.map(normalizeText) : texts;

    console.log('[ai-embeddings] Generating embeddings for', processedTexts.length, 'texts');

    const hf = new HfInference(HF_TOKEN);
    
    // Try models in order of preference
    let embeddings: number[][] = [];
    let usedModel = '';
    let success = false;

    for (const modelName of EMBEDDING_MODELS) {
      if (model && modelName !== model) continue; // Skip if specific model requested

      try {
        // Generate embeddings in parallel for speed
        const results = await Promise.all(
          processedTexts.map(async (text) => {
            const result = await hf.featureExtraction({
              model: modelName,
              inputs: text,
            });
            // Flatten if nested array
            return Array.isArray(result[0]) ? result[0] : result;
          })
        );

        embeddings = results as number[][];
        usedModel = modelName;
        success = true;
        break;
      } catch (modelError) {
        console.warn(`[ai-embeddings] Model ${modelName} failed:`, modelError);
        continue;
      }
    }

    if (!success) {
      throw new Error('All embedding models failed');
    }

    // Validate embedding dimensions
    const dimensions = embeddings[0]?.length ?? 0;
    console.log('[ai-embeddings] Generated', embeddings.length, 'embeddings with', dimensions, 'dimensions');

    return new Response(JSON.stringify({
      ok: true,
      embeddings,
      model: usedModel,
      dimensions,
      count: embeddings.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[ai-embeddings] Error:', error);
    return new Response(JSON.stringify({
      ok: false,
      error: sanitizeError(error),
      embeddings: [],
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
