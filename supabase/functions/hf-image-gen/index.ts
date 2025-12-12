import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    // Use the new HuggingFace router endpoint directly
    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt.trim(),
          parameters: {
            negative_prompt: negativePrompt || 'blurry, low quality, distorted, watermark, text',
            num_inference_steps: 30,
            guidance_scale: 7.5,
            width: 1024,
            height: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[hf-image-gen] HF API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Image generation is temporarily busy. Try again in a moment.",
          imageBase64: null 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 503) {
        return new Response(JSON.stringify({ 
          error: "The image model is loading. Please try again in 20-30 seconds.",
          imageBase64: null 
        }), {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`HF API returned ${response.status}`);
    }

    // Response is binary image data
    const imageBlob = await response.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64
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
