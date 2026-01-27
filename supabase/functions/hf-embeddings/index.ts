import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from "https://esm.sh/@huggingface/inference@2.8.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Privacy sanitizer
function sanitizeError(error: unknown): string {
  console.error('[INTERNAL ERROR]', error);
  return "Semantic search enhancement temporarily unavailable.";
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const HF_TOKEN = Deno.env.get('HUGGINGFACE_API_KEY') || Deno.env.get('HF_TOKEN');
    
    if (!HF_TOKEN) {
      return new Response(JSON.stringify({ 
        error: 'HF enhancement not configured',
        fallback: true 
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { texts } = await req.json();

    if (!Array.isArray(texts) || texts.length === 0) {
      return new Response(JSON.stringify({ error: 'texts[] is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[hf-embeddings] Generating embeddings for', texts.length, 'texts');

    const hf = new HfInference(HF_TOKEN);

    const embeddings = await Promise.all(
      texts.map(async (text: string) => {
        const result = await hf.featureExtraction({
          model: "sentence-transformers/all-MiniLM-L6-v2",
          inputs: text,
        });
        return result;
      })
    );

    return new Response(JSON.stringify({
      ok: true,
      embeddings,
      provider: 'hf-embeddings'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[hf-embeddings] Internal error:', error);
    return new Response(JSON.stringify({ 
      error: sanitizeError(error),
      fallback: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
