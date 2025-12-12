import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Privacy-preserving error sanitizer
function sanitizeError(error: unknown): string {
  console.error('[INTERNAL ERROR]', error);
  return "I couldn't generate that image right now, but I've got you — try again in a moment.";
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, negativePrompt } = await req.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return new Response(JSON.stringify({ 
        error: 'A prompt is required to generate an image.',
        imageBase64: null 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const HF_TOKEN = Deno.env.get('HF_TOKEN');
    if (!HF_TOKEN) {
      console.error('[hf-image-gen] HF_TOKEN not configured');
      return new Response(JSON.stringify({ 
        error: sanitizeError('HF_TOKEN missing'),
        imageBase64: null 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[hf-image-gen] Generating image with SDXL for prompt:', prompt.substring(0, 100));

    const hf = new HfInference(HF_TOKEN);

    // Use Stable Diffusion XL with safe, high-quality defaults
    const imageBlob = await hf.textToImage({
      model: 'stabilityai/stable-diffusion-xl-base-1.0',
      inputs: prompt.trim(),
      parameters: {
        negative_prompt: negativePrompt || 'blurry, low quality, distorted, watermark, text',
        num_inference_steps: 35,
        guidance_scale: 7.5,
        width: 1024,
        height: 1024,
      } as any,
    });

    // Convert blob to base64 for inline display
    const arrayBuffer = await imageBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binary);
    const imageBase64 = `data:image/png;base64,${base64}`;

    console.log('[hf-image-gen] Image generated successfully, size:', arrayBuffer.byteLength);

    return new Response(JSON.stringify({ 
      imageBase64,
      prompt: prompt.trim(),
      model: 'SDXL',
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[hf-image-gen] Generation failed:', error);
    
    // Check for specific error types
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('rate') || errorMessage.includes('429')) {
      return new Response(JSON.stringify({ 
        error: "Image generation is temporarily busy. Try again in a moment.",
        imageBase64: null 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      error: sanitizeError(error),
      imageBase64: null 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
