/**
 * THE LUCY LOUNGE - ElevenLabs Voice Generation
 * 
 * Premium text-to-speech with ElevenLabs API.
 * Supports multiple voices, voice cloning, and audio enhancement.
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ElevenLabs preset voices
const VOICES = {
  rachel: '21m00Tcm4TlvDq8ikWAM',      // Warm, friendly female
  domi: 'AZnzlk1XvdvUeBnXmlld',        // Strong, confident female
  bella: 'EXAVITQu4vr4xnSDxMaL',       // Soft, young female
  antoni: 'ErXwobaYiN019PkySvjV',      // Well-rounded male
  elli: 'MF3mGyEYCl7XYWbV9V6O',        // Emotional female
  josh: 'TxGEqnHWrfWFTfGW9XjX',        // Deep, narrative male
  arnold: 'VR6AewLTigWG4xSOukaG',      // Strong male
  adam: 'pNInz6obpgDQGcFmaJgB',        // Deep male
  sam: 'yoZ06aMxZJJ28mfd3POQ',         // Dynamic male
};

const VOICE_SETTINGS = {
  default: { stability: 0.5, similarity_boost: 0.75 },
  stable: { stability: 0.75, similarity_boost: 0.5 },
  expressive: { stability: 0.25, similarity_boost: 0.9 },
  narrative: { stability: 0.6, similarity_boost: 0.8 },
};

interface VoiceRequest {
  text: string;
  voice?: keyof typeof VOICES | string;  // preset name or voice ID
  model?: 'eleven_multilingual_v2' | 'eleven_monolingual_v1' | 'eleven_turbo_v2';
  style?: keyof typeof VOICE_SETTINGS;
  speed?: number;  // 0.5 to 2.0
  userId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!ELEVENLABS_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    const body: VoiceRequest = await req.json();
    const {
      text,
      voice = 'rachel',
      model = 'eleven_multilingual_v2',
      style = 'default',
      speed = 1.0,
      userId,
    } = body;

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Limit text length
    if (text.length > 5000) {
      return new Response(JSON.stringify({ 
        error: 'Text too long. Maximum 5000 characters.',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get voice ID
    const voiceId = VOICES[voice as keyof typeof VOICES] || voice;
    const settings = VOICE_SETTINGS[style] || VOICE_SETTINGS.default;

    console.log(`[elevenlabs-voice] Generating voice ${voiceId} for ${text.length} chars`);

    // Call ElevenLabs API
    const elevenResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: model,
          voice_settings: {
            ...settings,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!elevenResponse.ok) {
      const errorText = await elevenResponse.text();
      console.error('[elevenlabs-voice] API Error:', elevenResponse.status, errorText);

      if (elevenResponse.status === 401) {
        throw new Error('ElevenLabs API key invalid');
      }
      if (elevenResponse.status === 429) {
        return new Response(JSON.stringify({
          error: 'Voice generation rate limit exceeded. Please try again later.',
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`ElevenLabs API error: ${elevenResponse.status}`);
    }

    // Get audio
    const audioBlob = await elevenResponse.blob();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Generate filename
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().slice(0, 8);
    const filename = `voice_${voice}_${timestamp}_${randomId}.mp3`;

    let audioUrl: string;
    let storedPath: string | null = null;

    // Store in Supabase
    if (SUPABASE_URL && SUPABASE_KEY && userId) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const storagePath = `${userId}/voice/${filename}`;

        const { error: uploadError } = await supabase.storage
          .from('ai-outputs')
          .upload(storagePath, uint8Array, {
            contentType: 'audio/mpeg',
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
              output_type: 'voice',
              model_used: model,
              prompt: text.substring(0, 500),
              storage_path: storagePath,
              metadata: { voice, voiceId, style, textLength: text.length },
            });
          }
        }
      } catch (storageError) {
        console.error('[elevenlabs-voice] Storage error:', storageError);
      }
    }

    // Fallback to base64
    if (!audioUrl!) {
      const base64 = btoa(String.fromCharCode(...uint8Array));
      audioUrl = `data:audio/mpeg;base64,${base64}`;
    }

    return new Response(JSON.stringify({
      success: true,
      audioUrl,
      storagePath: storedPath,
      voice,
      voiceId,
      model,
      textLength: text.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[elevenlabs-voice] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Voice generation failed',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
