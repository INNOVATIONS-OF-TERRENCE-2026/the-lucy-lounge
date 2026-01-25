/**
 * THE LUCY LOUNGE - HuggingFace Image Generation
 * 
 * Uses SDXL for high-quality text-to-image generation.
 * Stores outputs in Supabase Storage with signed URLs.
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HF_MODELS = {
  sdxl: 'stabilityai/stable-diffusion-xl-base-1.0',
  sdxlTurbo: 'stabilityai/sdxl-turbo',
  realistic: 'SG161222/Realistic_Vision_V6.0_B1_noVAE',
  anime: 'cagliostrolab/animagine-xl-3.1',
  flux: 'black-forest-labs/FLUX.1-schnell',
};

interface GenerationRequest {
  prompt: string;
  negativePrompt?: string;
  model?: keyof typeof HF_MODELS;
  width?: number;
  height?: number;
  steps?: number;
  guidance?: number;
  userId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const HF_TOKEN = Deno.env.get('HUGGINGFACE_API_KEY') || Deno.env.get('HF_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!HF_TOKEN) {
      throw new Error('HuggingFace API key not configured');
    }

    const body: GenerationRequest = await req.json();
    const { 
      prompt, 
      negativePrompt = 'blurry, low quality, distorted, deformed',
      model = 'sdxl',
      width = 1024,
      height = 1024,
      steps = 30,
      guidance = 7.5,
      userId,
    } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const modelId = HF_MODELS[model] || HF_MODELS.sdxl;
    console.log(`[hf-image-gen] Generating with ${modelId}: ${prompt.substring(0, 100)}`);

    // Call HuggingFace Inference API
    const hfResponse = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt: negativePrompt,
          width,
          height,
          num_inference_steps: steps,
          guidance_scale: guidance,
        },
      }),
    });

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error('[hf-image-gen] HF Error:', hfResponse.status, errorText);
      
      // Handle model loading
      if (hfResponse.status === 503) {
        return new Response(JSON.stringify({ 
          error: 'Model is loading. Please try again in 20-30 seconds.',
          status: 'loading',
          estimatedTime: 30,
        }), {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`HuggingFace API error: ${hfResponse.status}`);
    }

    // Get image as blob
    const imageBlob = await hfResponse.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().slice(0, 8);
    const filename = `image_${timestamp}_${randomId}.png`;

    let imageUrl: string;
    let storedPath: string | null = null;

    // Try to store in Supabase Storage
    if (SUPABASE_URL && SUPABASE_KEY && userId) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const storagePath = `${userId}/images/${filename}`;

        const { error: uploadError } = await supabase.storage
          .from('ai-outputs')
          .upload(storagePath, uint8Array, {
            contentType: 'image/png',
            upsert: false,
          });

        if (!uploadError) {
          // Get signed URL (valid for 1 hour)
          const { data: signedData } = await supabase.storage
            .from('ai-outputs')
            .createSignedUrl(storagePath, 3600);

          if (signedData?.signedUrl) {
            imageUrl = signedData.signedUrl;
            storedPath = storagePath;

            // Log to user_ai_outputs
            await supabase.from('user_ai_outputs').insert({
              user_id: userId,
              output_type: 'image',
              model_used: modelId,
              prompt,
              storage_path: storagePath,
              metadata: { width, height, steps, guidance, negativePrompt },
            });
          }
        }
      } catch (storageError) {
        console.error('[hf-image-gen] Storage error:', storageError);
      }
    }

    // Fallback to base64 if storage failed
    if (!imageUrl!) {
      const base64 = btoa(String.fromCharCode(...uint8Array));
      imageUrl = `data:image/png;base64,${base64}`;
    }

    return new Response(JSON.stringify({
      success: true,
      imageUrl,
      storagePath: storedPath,
      model: modelId,
      prompt,
      dimensions: { width, height },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[hf-image-gen] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Image generation failed',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
