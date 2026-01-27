/**
 * THE LUCY LOUNGE — LUCY AUDIO GENERATE
 * 
 * Unified audio generation endpoint for the Audio Studio.
 * 
 * Features:
 * - Music generation via HuggingFace MusicGen
 * - Voice generation via ElevenLabs TTS
 * - Full generation history tracking
 * - Secure storage with signed URLs
 * 
 * Provider Strategy:
 * - Primary (Music): HuggingFace MusicGen
 * - Primary (Voice): ElevenLabs TTS
 * - Users see only "Lucy AI" - no provider details exposed
 * 
 * All generation happens SERVER-SIDE. No API keys exposed to frontend.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =============================================================================
// TYPES
// =============================================================================

type GenerationType = 'music' | 'voice';
type MusicStyle = 'lofi' | 'ambient' | 'hiphop' | 'cinematic' | 'electronic' | 'jazz' | 'classical' | 'rock';
type VoiceId = 'rachel' | 'domi' | 'bella' | 'antoni' | 'josh' | 'adam' | 'sam';
type VoiceStyle = 'default' | 'stable' | 'expressive' | 'narrative';

interface GenerateRequest {
  type: GenerationType;
  prompt: string;
  // Music options
  style?: MusicStyle;
  duration?: number;
  // Voice options
  voice?: VoiceId;
  voiceStyle?: VoiceStyle;
}

interface GenerationResult {
  success: boolean;
  generationId: string;
  audioUrl?: string;
  error?: string;
}

// =============================================================================
// MUSIC GENERATION CONFIG
// =============================================================================

const MUSIC_MODELS = {
  small: 'facebook/musicgen-small',
  medium: 'facebook/musicgen-medium',
  melody: 'facebook/musicgen-melody',
} as const;

const STYLE_PROMPTS: Record<MusicStyle, string> = {
  lofi: 'lo-fi hip hop, relaxing beats, vinyl crackle, mellow, chill vibes',
  ambient: 'ambient, atmospheric, ethereal, peaceful, floating synths',
  hiphop: 'hip hop beat, trap drums, 808 bass, boom bap',
  cinematic: 'cinematic orchestral, epic, emotional, film score',
  electronic: 'electronic dance music, synthesizers, energetic, modern',
  jazz: 'smooth jazz, saxophone, piano, laid back groove',
  classical: 'classical piano, orchestral, elegant, sophisticated',
  rock: 'rock guitar, drums, energetic, powerful riffs',
};

// =============================================================================
// VOICE GENERATION CONFIG (ElevenLabs)
// =============================================================================

const ELEVENLABS_VOICES: Record<VoiceId, string> = {
  rachel: '21m00Tcm4TlvDq8ikWAM',
  domi: 'AZnzlk1XvdvUeBnXmlld',
  bella: 'EXAVITQu4vr4xnSDxMaL',
  antoni: 'ErXwobaYiN019PkySvjV',
  josh: 'TxGEqnHWrfWFTfGW9XjX',
  adam: 'pNInz6obpgDQGcFmaJgB',
  sam: 'yoZ06aMxZJJ28mfd3POQ',
};

const VOICE_SETTINGS: Record<VoiceStyle, { stability: number; similarity_boost: number }> = {
  default: { stability: 0.5, similarity_boost: 0.75 },
  stable: { stability: 0.75, similarity_boost: 0.5 },
  expressive: { stability: 0.25, similarity_boost: 0.9 },
  narrative: { stability: 0.6, similarity_boost: 0.8 },
};

// =============================================================================
// HELPERS
// =============================================================================

function jsonResponse(data: object, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function errorResponse(message: string, status = 500): Response {
  return jsonResponse({ success: false, error: message }, status);
}

// =============================================================================
// MUSIC GENERATION (HuggingFace MusicGen)
// =============================================================================

async function generateMusic(
  prompt: string,
  style: MusicStyle,
  duration: number,
  hfToken: string
): Promise<{ audioData: Uint8Array; contentType: string }> {
  const modelId = MUSIC_MODELS.small;
  const maxDuration = Math.min(duration, 30);
  
  // Enhance prompt with style
  const enhancedPrompt = `${STYLE_PROMPTS[style]}, ${prompt}`;
  
  console.log(`[lucy-audio-generate] Music: ${modelId}, style: ${style}, duration: ${maxDuration}s`);

  const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hfToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: enhancedPrompt,
      parameters: {
        max_new_tokens: Math.floor(maxDuration * 50),
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[lucy-audio-generate] HF Error:', response.status, errorText);
    
    if (response.status === 503) {
      throw new Error('Music model is loading. Please try again in 30-60 seconds.');
    }
    throw new Error(`Music generation failed (${response.status})`);
  }

  const audioBlob = await response.blob();
  const arrayBuffer = await audioBlob.arrayBuffer();
  
  return {
    audioData: new Uint8Array(arrayBuffer),
    contentType: 'audio/wav',
  };
}

// =============================================================================
// VOICE GENERATION (ElevenLabs)
// =============================================================================

async function generateVoice(
  text: string,
  voice: VoiceId,
  style: VoiceStyle,
  elevenLabsKey: string
): Promise<{ audioData: Uint8Array; contentType: string }> {
  const voiceId = ELEVENLABS_VOICES[voice] || ELEVENLABS_VOICES.rachel;
  const settings = VOICE_SETTINGS[style] || VOICE_SETTINGS.default;
  
  console.log(`[lucy-audio-generate] Voice: ${voice}, style: ${style}, chars: ${text.length}`);

  if (text.length > 5000) {
    throw new Error('Text too long. Maximum 5000 characters.');
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': elevenLabsKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        ...settings,
        style: 0.5,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[lucy-audio-generate] ElevenLabs Error:', response.status, errorText);
    
    if (response.status === 401) {
      throw new Error('Voice service configuration error');
    }
    if (response.status === 429) {
      throw new Error('Voice generation rate limit exceeded. Please try again later.');
    }
    throw new Error(`Voice generation failed (${response.status})`);
  }

  const audioBlob = await response.blob();
  const arrayBuffer = await audioBlob.arrayBuffer();
  
  return {
    audioData: new Uint8Array(arrayBuffer),
    contentType: 'audio/mpeg',
  };
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const HF_TOKEN = Deno.env.get('HUGGINGFACE_API_KEY') || Deno.env.get('HF_TOKEN');
    const ELEVENLABS_KEY = Deno.env.get('ELEVENLABS_API_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Server configuration error');
    }

    // Authenticate user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return errorResponse('Authentication required', 401);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Verify the user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return errorResponse('Invalid authentication', 401);
    }

    const userId = user.id;

    // Parse request
    const body: GenerateRequest = await req.json();
    const { type, prompt, style, duration, voice, voiceStyle } = body;

    if (!prompt || !prompt.trim()) {
      return errorResponse('Prompt is required', 400);
    }

    if (!type || !['music', 'voice'].includes(type)) {
      return errorResponse('Type must be "music" or "voice"', 400);
    }

    // Create generation record (status = 'running')
    const generationId = crypto.randomUUID();
    const { error: insertError } = await supabase
      .from('audio_generations')
      .insert({
        id: generationId,
        user_id: userId,
        prompt: prompt.trim(),
        style: type === 'music' ? (style || 'lofi') : (voiceStyle || 'default'),
        duration_seconds: type === 'music' ? (duration || 10) : null,
        generation_type: type,
        status: 'running',
        metadata: {
          voice: type === 'voice' ? (voice || 'rachel') : null,
        },
      });

    if (insertError) {
      console.error('[lucy-audio-generate] Insert error:', insertError);
      return errorResponse('Failed to start generation', 500);
    }

    try {
      // Generate audio based on type
      let result: { audioData: Uint8Array; contentType: string };
      let fileExtension: string;

      if (type === 'music') {
        if (!HF_TOKEN) {
          throw new Error('Music generation service not configured');
        }
        result = await generateMusic(
          prompt.trim(),
          (style as MusicStyle) || 'lofi',
          duration || 10,
          HF_TOKEN
        );
        fileExtension = 'wav';
      } else {
        if (!ELEVENLABS_KEY) {
          throw new Error('Voice generation service not configured');
        }
        result = await generateVoice(
          prompt.trim(),
          (voice as VoiceId) || 'rachel',
          (voiceStyle as VoiceStyle) || 'default',
          ELEVENLABS_KEY
        );
        fileExtension = 'mp3';
      }

      // Upload to storage
      const storagePath = `${userId}/${generationId}.${fileExtension}`;
      
      const { error: uploadError } = await supabase.storage
        .from('audio')
        .upload(storagePath, result.audioData, {
          contentType: result.contentType,
          upsert: false,
        });

      if (uploadError) {
        console.error('[lucy-audio-generate] Upload error:', uploadError);
        throw new Error('Failed to store audio file');
      }

      // Create signed URL (1 hour expiry)
      const { data: signedData, error: signedError } = await supabase.storage
        .from('audio')
        .createSignedUrl(storagePath, 3600);

      if (signedError || !signedData?.signedUrl) {
        console.error('[lucy-audio-generate] Signed URL error:', signedError);
        throw new Error('Failed to create audio URL');
      }

      // Update generation record (status = 'success')
      await supabase
        .from('audio_generations')
        .update({
          status: 'success',
          audio_path: storagePath,
          public_url: signedData.signedUrl,
        })
        .eq('id', generationId);

      // Return success
      return jsonResponse({
        success: true,
        generationId,
        audioUrl: signedData.signedUrl,
        type,
        style: type === 'music' ? (style || 'lofi') : undefined,
        voice: type === 'voice' ? (voice || 'rachel') : undefined,
      });

    } catch (genError) {
      // Update generation record (status = 'error')
      const errorMessage = genError instanceof Error ? genError.message : 'Generation failed';
      
      await supabase
        .from('audio_generations')
        .update({
          status: 'error',
          error: errorMessage,
        })
        .eq('id', generationId);

      throw genError;
    }

  } catch (error) {
    console.error('[lucy-audio-generate] Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Audio generation failed',
      500
    );
  }
});
