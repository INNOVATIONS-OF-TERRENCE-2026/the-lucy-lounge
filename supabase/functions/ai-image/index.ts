/**
 * THE LUCY LOUNGE - AI IMAGE GENERATION EDGE FUNCTION
 * 
 * Server-side image generation using:
 * - Stable Diffusion XL (HuggingFace)
 * - DALL-E 3 (fallback via Lovable)
 * 
 * All generation happens server-side.
 * Returns base64-encoded images for Safari-safe display.
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from "https://esm.sh/@huggingface/inference@2.8.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Image generation models
const SDXL_MODELS = [
  'stabilityai/stable-diffusion-xl-base-1.0',
  'runwayml/stable-diffusion-v1-5',
];

// Image sizes
const SIZES = {
  square: { width: 1024, height: 1024 },
  portrait: { width: 768, height: 1024 },
  landscape: { width: 1024, height: 768 },
  wide: { width: 1280, height: 720 },
};

// Sanitize error messages
function sanitizeError(error: unknown): string {
  console.error('[INTERNAL]', error);
  return 'Image generation temporarily unavailable.';
}

// Content safety - basic prompt filtering
function isPromptSafe(prompt: string): boolean {
  const unsafePatterns = [
    /\b(nude|naked|nsfw|explicit|gore|violence|blood)\b/i,
    /\b(child|minor|underage|kid)\b.*\b(sexy|erotic|nude)/i,
  ];
  
  return !unsafePatterns.some(pattern => pattern.test(prompt));
}

// Enhance prompt for better results
function enhancePrompt(prompt: string, style?: string): string {
  const styleEnhancements: Record<string, string> = {
    photorealistic: ', photorealistic, 8k, detailed, professional photography',
    artistic: ', artistic, painted, illustration style, vibrant colors',
    anime: ', anime style, cel shaded, vibrant, detailed',
    cinematic: ', cinematic lighting, dramatic, film still, movie quality',
    minimal: ', minimalist, clean, simple, elegant',
    default: ', high quality, detailed, professional',
  };

  const enhancement = styleEnhancements[style ?? 'default'] ?? styleEnhancements.default;
  return prompt + enhancement;
}

interface ImageRequest {
  prompt: string;
  negativePrompt?: string;
  style?: 'photorealistic' | 'artistic' | 'anime' | 'cinematic' | 'minimal';
  size?: 'square' | 'portrait' | 'landscape' | 'wide';
  seed?: number;
}

// Generate image with HuggingFace SDXL
async function generateWithHuggingFace(
  hf: HfInference,
  prompt: string,
  negativePrompt: string,
  width: number,
  height: number,
  seed?: number
): Promise<Blob> {
  let lastError: Error | null = null;

  for (const model of SDXL_MODELS) {
    try {
      const result = await hf.textToImage({
        model,
        inputs: prompt,
        parameters: {
          negative_prompt: negativePrompt,
          width,
          height,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          seed: seed ?? Math.floor(Math.random() * 2147483647),
        },
      });

      return result;
    } catch (error) {
      console.warn(`[ai-image] Model ${model} failed:`, error);
      lastError = error as Error;
      continue;
    }
  }

  throw lastError ?? new Error('All HuggingFace models failed');
}

// Generate image with DALL-E via Lovable
async function generateWithDALLE(
  apiKey: string,
  prompt: string,
  size: string
): Promise<string> {
  // Map sizes to DALL-E supported sizes
  const dalleSize = size === 'wide' ? '1792x1024' : 
                    size === 'landscape' ? '1792x1024' :
                    size === 'portrait' ? '1024x1792' : '1024x1024';

  const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://thelucylounge.com',
      'X-Title': 'The Lucy Lounge',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: dalleSize,
      quality: 'standard',
      response_format: 'b64_json',
    }),
  });

  if (!response.ok) {
    throw new Error(`DALL-E error: ${response.status}`);
  }

  const data = await response.json();
  return data.data?.[0]?.b64_json ?? '';
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: ImageRequest = await req.json();
    const {
      prompt,
      negativePrompt = 'blurry, low quality, distorted, ugly, bad anatomy',
      style,
      size = 'square',
      seed,
    } = body;

    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({
        ok: false,
        error: 'prompt is required',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Content safety check
    if (!isPromptSafe(prompt)) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'This prompt cannot be processed due to content guidelines.',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const enhancedPrompt = enhancePrompt(prompt, style);
    const dimensions = SIZES[size] ?? SIZES.square;
    
    console.log('[ai-image] Generating image:', enhancedPrompt.slice(0, 100));

    const HF_TOKEN = Deno.env.get('HUGGINGFACE_API_KEY') || Deno.env.get('HF_TOKEN');
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');

    let imageData = '';
    let usedProvider = '';

    // Try HuggingFace SDXL first
    if (HF_TOKEN) {
      try {
        const hf = new HfInference(HF_TOKEN);
        const blob = await generateWithHuggingFace(
          hf,
          enhancedPrompt,
          negativePrompt,
          dimensions.width,
          dimensions.height,
          seed
        );

        const arrayBuffer = await blob.arrayBuffer();
        imageData = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        usedProvider = 'huggingface';
      } catch (hfError) {
        console.warn('[ai-image] HuggingFace failed:', hfError);
      }
    }

    // Fallback to DALL-E via OpenRouter
    if (!imageData && OPENROUTER_API_KEY) {
      try {
        imageData = await generateWithDALLE(OPENROUTER_API_KEY, enhancedPrompt, size);
        usedProvider = 'dalle';
      } catch (dalleError) {
        console.error('[ai-image] DALL-E also failed:', dalleError);
        throw dalleError;
      }
    }

    if (!imageData) {
      throw new Error('No image generation provider available');
    }

    console.log('[ai-image] Generated image using', usedProvider, 'size:', imageData.length);

    return new Response(JSON.stringify({
      ok: true,
      image: imageData,
      provider: usedProvider,
      format: 'png',
      width: dimensions.width,
      height: dimensions.height,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[ai-image] Error:', error);
    return new Response(JSON.stringify({
      ok: false,
      error: sanitizeError(error),
      image: '',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
