/**
 * THE LUCY LOUNGE — LUCY AUDIO GENERATE
 * 
 * Unified audio generation with AUTOMATIC INTENT DETECTION.
 * 
 * TWO ENGINES:
 * - MUSIC → HuggingFace MusicGen (FREE, open-source)
 * - VOICE → ElevenLabs TTS (speech/narration only)
 * 
 * Lucy automatically routes based on prompt analysis.
 * Users see only "Lucy AI" - no provider details exposed.
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

type GenerationType = 'music' | 'voice' | 'auto';
type MusicStyle = 'lofi' | 'ambient' | 'hiphop' | 'cinematic' | 'electronic' | 'jazz' | 'classical' | 'rock';
type VoiceId = 'rachel' | 'domi' | 'bella' | 'antoni' | 'josh' | 'adam' | 'sam';
type VoiceStyle = 'default' | 'stable' | 'expressive' | 'narrative';

interface GenerateRequest {
  type?: GenerationType;  // Optional - Lucy will auto-detect if not provided
  prompt: string;
  // Music options
  style?: MusicStyle;
  duration?: number;
  // Voice options
  voice?: VoiceId;
  voiceStyle?: VoiceStyle;
}

// =============================================================================
// INTENT DETECTION - Lucy decides music vs voice
// =============================================================================

const MUSIC_KEYWORDS = [
  // Genres
  'music', 'song', 'beat', 'track', 'melody', 'tune', 'soundtrack', 'score',
  'lofi', 'lo-fi', 'hip hop', 'hiphop', 'jazz', 'classical', 'rock', 'pop',
  'electronic', 'edm', 'ambient', 'cinematic', 'orchestral', 'instrumental',
  'drum', 'bass', 'guitar', 'piano', 'synth', 'synthesizer',
  // Actions
  'compose', 'create music', 'make a beat', 'generate music', 'produce',
  // Moods for music
  'chill beat', 'relaxing music', 'upbeat', 'energetic music', 'sad music',
  'happy music', 'epic music', 'background music', 'study music',
  // Music terms
  'bpm', 'tempo', 'chord', 'riff', 'groove', 'vibe', 'loop',
];

const VOICE_KEYWORDS = [
  // Speech indicators
  'say', 'speak', 'read', 'narrate', 'announce', 'voice', 'speech',
  'text to speech', 'tts', 'voiceover', 'voice over', 'narrator',
  // Content types that need voice
  'audiobook', 'podcast', 'announcement', 'message', 'greeting',
  'introduction', 'script', 'dialogue', 'monologue',
  // Explicit voice requests
  'read this', 'say this', 'speak this', 'read aloud', 'read out loud',
];

function detectIntent(prompt: string): 'music' | 'voice' {
  const lowerPrompt = prompt.toLowerCase();
  
  // Count keyword matches
  let musicScore = 0;
  let voiceScore = 0;
  
  for (const keyword of MUSIC_KEYWORDS) {
    if (lowerPrompt.includes(keyword)) {
      musicScore += keyword.length > 5 ? 2 : 1; // Longer keywords = stronger signal
    }
  }
  
  for (const keyword of VOICE_KEYWORDS) {
    if (lowerPrompt.includes(keyword)) {
      voiceScore += keyword.length > 5 ? 2 : 1;
    }
  }
  
  // Check for quotes (usually indicates speech)
  if (lowerPrompt.includes('"') || lowerPrompt.includes("'")) {
    voiceScore += 3;
  }
  
  // Check for complete sentences that look like speech content
  const sentencePattern = /^[A-Z][^.!?]*[.!?]$/;
  if (sentencePattern.test(prompt.trim())) {
    voiceScore += 2;
  }
  
  // If prompt is very short and looks like a command to say something
  if (prompt.length < 200 && (lowerPrompt.startsWith('say ') || lowerPrompt.startsWith('read '))) {
    voiceScore += 5;
  }
  
  console.log(`[Intent Detection] Music: ${musicScore}, Voice: ${voiceScore}`);
  
  // Default to music if scores are tied or both zero
  // (Music generation is more common use case)
  return voiceScore > musicScore ? 'voice' : 'music';
}

function detectMusicStyle(prompt: string): MusicStyle {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('lofi') || lowerPrompt.includes('lo-fi') || lowerPrompt.includes('chill') || lowerPrompt.includes('study')) {
    return 'lofi';
  }
  if (lowerPrompt.includes('ambient') || lowerPrompt.includes('atmospheric') || lowerPrompt.includes('peaceful')) {
    return 'ambient';
  }
  if (lowerPrompt.includes('hip hop') || lowerPrompt.includes('hiphop') || lowerPrompt.includes('rap') || lowerPrompt.includes('trap')) {
    return 'hiphop';
  }
  if (lowerPrompt.includes('cinematic') || lowerPrompt.includes('epic') || lowerPrompt.includes('film') || lowerPrompt.includes('movie')) {
    return 'cinematic';
  }
  if (lowerPrompt.includes('electronic') || lowerPrompt.includes('edm') || lowerPrompt.includes('dance') || lowerPrompt.includes('techno')) {
    return 'electronic';
  }
  if (lowerPrompt.includes('jazz') || lowerPrompt.includes('saxophone') || lowerPrompt.includes('swing')) {
    return 'jazz';
  }
  if (lowerPrompt.includes('classical') || lowerPrompt.includes('orchestral') || lowerPrompt.includes('symphony')) {
    return 'classical';
  }
  if (lowerPrompt.includes('rock') || lowerPrompt.includes('guitar') || lowerPrompt.includes('metal')) {
    return 'rock';
  }
  
  // Default based on mood words
  if (lowerPrompt.includes('relax') || lowerPrompt.includes('calm') || lowerPrompt.includes('sleep')) {
    return 'ambient';
  }
  if (lowerPrompt.includes('energy') || lowerPrompt.includes('workout') || lowerPrompt.includes('pump')) {
    return 'electronic';
  }
  
  return 'lofi'; // Default
}

// =============================================================================
// MUSIC GENERATION CONFIG (HuggingFace - FREE)
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
// VOICE GENERATION CONFIG (ElevenLabs - VOICE ONLY)
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
// MUSIC GENERATION (HuggingFace MusicGen - FREE)
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
  
  console.log(`[lucy-audio-generate] MUSIC ENGINE: ${modelId}`);
  console.log(`[lucy-audio-generate] Style: ${style}, Duration: ${maxDuration}s`);
  console.log(`[lucy-audio-generate] Prompt: ${enhancedPrompt.substring(0, 100)}...`);

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
    console.error('[lucy-audio-generate] HuggingFace Error:', response.status, errorText);
    
    if (response.status === 503) {
      // Model is loading - this is common for free tier
      const parsed = JSON.parse(errorText);
      const waitTime = parsed.estimated_time || 60;
      throw new Error(`Music model is loading. Please try again in ${Math.ceil(waitTime)} seconds.`);
    }
    if (response.status === 429) {
      throw new Error('Music generation rate limit reached. Please wait a moment and try again.');
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
// VOICE GENERATION (ElevenLabs - SPEECH ONLY)
// =============================================================================

async function generateVoice(
  text: string,
  voice: VoiceId,
  style: VoiceStyle,
  elevenLabsKey: string
): Promise<{ audioData: Uint8Array; contentType: string }> {
  const voiceId = ELEVENLABS_VOICES[voice] || ELEVENLABS_VOICES.rachel;
  const settings = VOICE_SETTINGS[style] || VOICE_SETTINGS.default;
  
  console.log(`[lucy-audio-generate] VOICE ENGINE: ElevenLabs`);
  console.log(`[lucy-audio-generate] Voice: ${voice}, Style: ${style}`);
  console.log(`[lucy-audio-generate] Text length: ${text.length} chars`);

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
    let { type, prompt, style, duration, voice, voiceStyle } = body;

    if (!prompt || !prompt.trim()) {
      return errorResponse('Prompt is required', 400);
    }

    // AUTO-DETECT TYPE if not specified or set to 'auto'
    let detectedType: 'music' | 'voice';
    let autoDetected = false;
    
    if (!type || type === 'auto') {
      detectedType = detectIntent(prompt);
      autoDetected = true;
      console.log(`[lucy-audio-generate] AUTO-DETECTED TYPE: ${detectedType}`);
    } else {
      detectedType = type as 'music' | 'voice';
    }

    // Auto-detect style for music if not provided
    if (detectedType === 'music' && !style) {
      style = detectMusicStyle(prompt);
      console.log(`[lucy-audio-generate] AUTO-DETECTED STYLE: ${style}`);
    }

    // Create generation record (status = 'running')
    const generationId = crypto.randomUUID();
    const { error: insertError } = await supabase
      .from('audio_generations')
      .insert({
        id: generationId,
        user_id: userId,
        prompt: prompt.trim(),
        style: detectedType === 'music' ? (style || 'lofi') : (voiceStyle || 'default'),
        duration_seconds: detectedType === 'music' ? (duration || 10) : null,
        generation_type: detectedType,
        status: 'running',
        metadata: {
          voice: detectedType === 'voice' ? (voice || 'rachel') : null,
          autoDetected,
        },
      });

    if (insertError) {
      console.error('[lucy-audio-generate] Insert error:', insertError);
      return errorResponse('Failed to start generation', 500);
    }

    try {
      // Generate audio based on detected type
      let result: { audioData: Uint8Array; contentType: string };
      let fileExtension: string;

      if (detectedType === 'music') {
        // MUSIC ENGINE: HuggingFace MusicGen (FREE)
        if (!HF_TOKEN) {
          throw new Error('Music generation service not configured. Please add HUGGINGFACE_API_KEY.');
        }
        result = await generateMusic(
          prompt.trim(),
          (style as MusicStyle) || 'lofi',
          duration || 10,
          HF_TOKEN
        );
        fileExtension = 'wav';
      } else {
        // VOICE ENGINE: ElevenLabs (SPEECH ONLY)
        if (!ELEVENLABS_KEY) {
          throw new Error('Voice generation service not configured. Please add ELEVENLABS_API_KEY.');
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

      // Return success with detected info
      return jsonResponse({
        success: true,
        generationId,
        audioUrl: signedData.signedUrl,
        type: detectedType,
        autoDetected,
        style: detectedType === 'music' ? (style || 'lofi') : undefined,
        voice: detectedType === 'voice' ? (voice || 'rachel') : undefined,
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
