/**
 * THE LUCY LOUNGE - HuggingFace Music Generation
 * 
 * Uses MusicGen for text-to-music generation.
 * Supports various styles: lo-fi, ambient, hip-hop, cinematic, etc.
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MUSIC_MODELS = {
  small: 'facebook/musicgen-small',
  medium: 'facebook/musicgen-medium',
  large: 'facebook/musicgen-large',
  melody: 'facebook/musicgen-melody',
  stereo: 'facebook/musicgen-stereo-small',
};

const STYLE_PROMPTS: Record<string, string> = {
  lofi: 'lo-fi hip hop, relaxing beats, vinyl crackle, mellow, chill vibes',
  ambient: 'ambient, atmospheric, ethereal, peaceful, floating synths',
  hiphop: 'hip hop beat, trap drums, 808 bass, boom bap',
  cinematic: 'cinematic orchestral, epic, emotional, film score',
  electronic: 'electronic dance music, synthesizers, energetic, modern',
  jazz: 'smooth jazz, saxophone, piano, laid back groove',
  classical: 'classical piano, orchestral, elegant, sophisticated',
  rock: 'rock guitar, drums, energetic, powerful riffs',
};

interface MusicRequest {
  prompt: string;
  style?: keyof typeof STYLE_PROMPTS;
  model?: keyof typeof MUSIC_MODELS;
  duration?: number;  // seconds (max 30)
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

    const body: MusicRequest = await req.json();
    const {
      prompt,
      style,
      model = 'small',
      duration = 10,
      userId,
    } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const modelId = MUSIC_MODELS[model] || MUSIC_MODELS.small;
    
    // Enhance prompt with style
    let enhancedPrompt = prompt;
    if (style && STYLE_PROMPTS[style]) {
      enhancedPrompt = `${STYLE_PROMPTS[style]}, ${prompt}`;
    }

    console.log(`[hf-music-gen] Generating with ${modelId}: ${enhancedPrompt.substring(0, 100)}`);

    // Cap duration at 30 seconds
    const maxDuration = Math.min(duration, 30);

    // Call HuggingFace Inference API
    const hfResponse = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: enhancedPrompt,
        parameters: {
          max_new_tokens: Math.floor(maxDuration * 50), // Approximate token-to-duration
        },
      }),
    });

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error('[hf-music-gen] HF Error:', hfResponse.status, errorText);

      if (hfResponse.status === 503) {
        return new Response(JSON.stringify({
          error: 'Music model is loading. Please wait 30-60 seconds.',
          status: 'loading',
          estimatedTime: 60,
        }), {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`HuggingFace API error: ${hfResponse.status}`);
    }

    // Get audio blob
    const audioBlob = await hfResponse.blob();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Generate filename
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().slice(0, 8);
    const filename = `music_${style || 'custom'}_${timestamp}_${randomId}.wav`;

    let audioUrl: string;
    let storedPath: string | null = null;

    // Store in Supabase
    if (SUPABASE_URL && SUPABASE_KEY && userId) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const storagePath = `${userId}/music/${filename}`;

        const { error: uploadError } = await supabase.storage
          .from('ai-outputs')
          .upload(storagePath, uint8Array, {
            contentType: 'audio/wav',
            upsert: false,
          });

        if (!uploadError) {
          const { data: signedData } = await supabase.storage
            .from('ai-outputs')
            .createSignedUrl(storagePath, 3600);

          if (signedData?.signedUrl) {
            audioUrl = signedData.signedUrl;
            storedPath = storagePath;

            await supabase.from('user_ai_outputs').insert({
              user_id: userId,
              output_type: 'music',
              model_used: modelId,
              prompt: enhancedPrompt,
              storage_path: storagePath,
              metadata: { style, duration: maxDuration, originalPrompt: prompt },
            });
          }
        }
      } catch (storageError) {
        console.error('[hf-music-gen] Storage error:', storageError);
      }
    }

    // Fallback to base64
    if (!audioUrl!) {
      const base64 = btoa(String.fromCharCode(...uint8Array));
      audioUrl = `data:audio/wav;base64,${base64}`;
    }

    return new Response(JSON.stringify({
      success: true,
      audioUrl,
      storagePath: storedPath,
      model: modelId,
      prompt: enhancedPrompt,
      style,
      duration: maxDuration,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[hf-music-gen] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Music generation failed',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
