/**
 * THE LUCY LOUNGE - AI TTS (TEXT-TO-SPEECH) EDGE FUNCTION
 * 
 * High-quality text-to-speech using ElevenLabs and OpenAI TTS.
 * Returns audio that can be played Safari-safe (after user gesture).
 * 
 * VOICES:
 * - ElevenLabs: High-quality, expressive voices
 * - OpenAI TTS: Reliable fallback
 * 
 * OUTPUT: Base64-encoded MP3 audio
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Voice configurations
const ELEVENLABS_VOICES = {
  'lucy': 'EXAVITQu4vr4xnSDxMaL', // Rachel - warm, professional
  'aria': 'Xb7hH8MSUJpSbSDYk0k2', // Aria - expressive
  'roger': '9BWtsMINqrJLrRacOk9x', // Roger - deep, authoritative
  'sarah': 'SAz9YHcvj6GT2YYXdXww', // Sarah - friendly
  'charlie': 'IKne3meq5aSn9XLyUdCD', // Charlie - casual
  'default': 'EXAVITQu4vr4xnSDxMaL', // Rachel
};

const OPENAI_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

// Maximum text length
const MAX_TEXT_LENGTH = 5000;

// Sanitize error messages
function sanitizeError(error: unknown): string {
  console.error('[INTERNAL]', error);
  return 'Voice generation temporarily unavailable.';
}

interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
  provider?: 'elevenlabs' | 'openai' | 'auto';
}

// Generate speech using ElevenLabs
async function generateWithElevenLabs(
  apiKey: string,
  text: string,
  voice: string,
  speed: number
): Promise<string> {
  const voiceId = ELEVENLABS_VOICES[voice as keyof typeof ELEVENLABS_VOICES] ?? ELEVENLABS_VOICES.default;

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs error: ${response.status}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const base64Audio = btoa(
    String.fromCharCode(...new Uint8Array(audioBuffer))
  );

  return base64Audio;
}

// Generate speech using OpenAI TTS
async function generateWithOpenAI(
  apiKey: string,
  text: string,
  voice: string,
  speed: number
): Promise<string> {
  // Map to OpenAI voices
  const openaiVoice = OPENAI_VOICES.includes(voice) ? voice : 'nova';

  const response = await fetch('https://ai.gateway.lovable.dev/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: openaiVoice,
      speed: Math.max(0.25, Math.min(4.0, speed)),
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI TTS error: ${response.status}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const base64Audio = btoa(
    String.fromCharCode(...new Uint8Array(audioBuffer))
  );

  return base64Audio;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: TTSRequest = await req.json();
    const { 
      text, 
      voice = 'lucy', 
      speed = 1.0, 
      provider = 'auto' 
    } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({
        ok: false,
        error: 'text is required',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Enforce text limits
    const truncatedText = text.slice(0, MAX_TEXT_LENGTH);
    console.log('[ai-tts] Generating speech for', truncatedText.length, 'characters, voice:', voice);

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    let audioContent = '';
    let usedProvider = '';

    // Try providers based on preference
    if (provider === 'elevenlabs' || (provider === 'auto' && ELEVENLABS_API_KEY)) {
      if (ELEVENLABS_API_KEY) {
        try {
          audioContent = await generateWithElevenLabs(ELEVENLABS_API_KEY, truncatedText, voice, speed);
          usedProvider = 'elevenlabs';
        } catch (elevenLabsError) {
          console.warn('[ai-tts] ElevenLabs failed:', elevenLabsError);
          // Fall through to OpenAI
        }
      }
    }

    // Fallback to OpenAI TTS
    if (!audioContent && LOVABLE_API_KEY) {
      try {
        audioContent = await generateWithOpenAI(LOVABLE_API_KEY, truncatedText, voice, speed);
        usedProvider = 'openai';
      } catch (openaiError) {
        console.error('[ai-tts] OpenAI TTS also failed:', openaiError);
        throw openaiError;
      }
    }

    if (!audioContent) {
      throw new Error('No TTS provider available');
    }

    console.log('[ai-tts] Generated audio using', usedProvider, 'length:', audioContent.length);

    return new Response(JSON.stringify({
      ok: true,
      audioContent,
      provider: usedProvider,
      format: 'mp3',
      textLength: truncatedText.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[ai-tts] Error:', error);
    return new Response(JSON.stringify({
      ok: false,
      error: sanitizeError(error),
      audioContent: '',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
