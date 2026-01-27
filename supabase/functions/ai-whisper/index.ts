/**
 * THE LUCY LOUNGE - AI WHISPER (SPEECH-TO-TEXT) EDGE FUNCTION
 * 
 * Server-side speech transcription using OpenAI Whisper.
 * Accepts audio in various formats and returns text transcript.
 * 
 * SUPPORTED FORMATS:
 * - WebM (from browser MediaRecorder)
 * - MP3, WAV, M4A, OGG
 * 
 * NEVER runs on client - all transcription is server-side.
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process base64 audio in chunks to handle large files
function processBase64Chunks(base64String: string, chunkSize = 32768): Uint8Array {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

// Detect MIME type from audio data
function detectMimeType(data: Uint8Array): string {
  // Check for WebM signature
  if (data[0] === 0x1A && data[1] === 0x45 && data[2] === 0xDF && data[3] === 0xA3) {
    return 'audio/webm';
  }
  // Check for MP3 signature
  if ((data[0] === 0xFF && (data[1] & 0xE0) === 0xE0) || 
      (data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33)) {
    return 'audio/mp3';
  }
  // Check for WAV signature
  if (data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46) {
    return 'audio/wav';
  }
  // Check for OGG signature
  if (data[0] === 0x4F && data[1] === 0x67 && data[2] === 0x67 && data[3] === 0x53) {
    return 'audio/ogg';
  }
  // Default to WebM for browser recordings
  return 'audio/webm';
}

// Sanitize error messages
function sanitizeError(error: unknown): string {
  console.error('[INTERNAL]', error);
  return 'Transcription temporarily unavailable. Please try again.';
}

interface WhisperRequest {
  audio: string; // Base64-encoded audio
  language?: string;
  prompt?: string;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'Transcription service not configured',
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: WhisperRequest = await req.json();
    const { audio, language, prompt } = body;

    if (!audio) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'audio (base64) is required',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[ai-whisper] Processing audio, length:', audio.length);

    // Decode base64 audio
    const binaryAudio = processBase64Chunks(audio);
    const mimeType = detectMimeType(binaryAudio);
    
    console.log('[ai-whisper] Detected MIME type:', mimeType, 'Size:', binaryAudio.length, 'bytes');

    // Prepare form data for Whisper API
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: mimeType });
    
    // Determine file extension
    const extension = mimeType.includes('webm') ? 'webm' : 
                     mimeType.includes('mp3') ? 'mp3' :
                     mimeType.includes('wav') ? 'wav' :
                     mimeType.includes('ogg') ? 'ogg' : 'webm';
    
    formData.append('file', blob, `audio.${extension}`);
    formData.append('model', 'whisper-1');
    
    if (language) {
      formData.append('language', language);
    }
    if (prompt) {
      formData.append('prompt', prompt);
    }

    // Call Whisper API via OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://thelucylounge.com',
        'X-Title': 'The Lucy Lounge',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ai-whisper] API error:', errorText);
      throw new Error(`Transcription failed: ${response.status}`);
    }

    const result = await response.json();
    const text = result.text ?? '';

    console.log('[ai-whisper] Transcription complete, length:', text.length);

    return new Response(JSON.stringify({
      ok: true,
      text,
      language: result.language,
      duration: result.duration,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[ai-whisper] Error:', error);
    return new Response(JSON.stringify({
      ok: false,
      error: sanitizeError(error),
      text: '',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
