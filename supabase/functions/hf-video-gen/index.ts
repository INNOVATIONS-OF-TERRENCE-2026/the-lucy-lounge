/**
 * THE LUCY LOUNGE - HuggingFace Video Generation
 * 
 * Uses text-to-video models for AI video generation.
 * Supports ModelScope and Zeroscope models.
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VIDEO_MODELS = {
  modelscope: 'ali-vilab/text-to-video-ms-1.7b',
  zeroscope: 'cerspense/zeroscope_v2_576w',
  animatediff: 'guoyww/animatediff-motion-adapter-v1-5-2',
};

interface VideoRequest {
  prompt: string;
  negativePrompt?: string;
  model?: keyof typeof VIDEO_MODELS;
  duration?: number;  // seconds
  fps?: number;
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

    const body: VideoRequest = await req.json();
    const {
      prompt,
      negativePrompt = 'blurry, low quality, distorted',
      model = 'modelscope',
      duration = 3,
      fps = 8,
      userId,
    } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const modelId = VIDEO_MODELS[model] || VIDEO_MODELS.modelscope;
    console.log(`[hf-video-gen] Generating with ${modelId}: ${prompt.substring(0, 100)}`);

    const numFrames = Math.min(duration * fps, 24); // Cap at 24 frames for API limits

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
          num_frames: numFrames,
          num_inference_steps: 25,
        },
      }),
    });

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error('[hf-video-gen] HF Error:', hfResponse.status, errorText);

      if (hfResponse.status === 503) {
        return new Response(JSON.stringify({
          error: 'Video model is loading. This may take 1-2 minutes.',
          status: 'loading',
          estimatedTime: 120,
        }), {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`HuggingFace API error: ${hfResponse.status}`);
    }

    // Get video blob
    const videoBlob = await hfResponse.blob();
    const arrayBuffer = await videoBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Generate filename
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().slice(0, 8);
    const filename = `video_${timestamp}_${randomId}.mp4`;

    let videoUrl: string;
    let storedPath: string | null = null;

    // Store in Supabase
    if (SUPABASE_URL && SUPABASE_KEY && userId) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const storagePath = `${userId}/videos/${filename}`;

        const { error: uploadError } = await supabase.storage
          .from('ai-outputs')
          .upload(storagePath, uint8Array, {
            contentType: 'video/mp4',
            upsert: false,
          });

        if (!uploadError) {
          const { data: signedData } = await supabase.storage
            .from('ai-outputs')
            .createSignedUrl(storagePath, 3600);

          if (signedData?.signedUrl) {
            videoUrl = signedData.signedUrl;
            storedPath = storagePath;

            await supabase.from('user_ai_outputs').insert({
              user_id: userId,
              output_type: 'video',
              model_used: modelId,
              prompt,
              storage_path: storagePath,
              metadata: { duration, fps, numFrames },
            });
          }
        }
      } catch (storageError) {
        console.error('[hf-video-gen] Storage error:', storageError);
      }
    }

    // Fallback to base64
    if (!videoUrl!) {
      const base64 = btoa(String.fromCharCode(...uint8Array));
      videoUrl = `data:video/mp4;base64,${base64}`;
    }

    return new Response(JSON.stringify({
      success: true,
      videoUrl,
      storagePath: storedPath,
      model: modelId,
      prompt,
      duration: numFrames / fps,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[hf-video-gen] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Video generation failed',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
