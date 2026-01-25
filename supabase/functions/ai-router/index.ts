/**
 * THE LUCY LOUNGE - SUPREME AI ROUTER
 * 
 * Intelligent model routing that analyzes user intent and routes to:
 * - LLM (Lovable Gateway) for chat/reasoning
 * - HuggingFace for images/video/music
 * - ElevenLabs for voice
 * - PDF generation service
 * 
 * Lucy decides the best model - smarter than the user.
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Intent classification types
type Intent = 
  | 'chat' 
  | 'image' 
  | 'video' 
  | 'music' 
  | 'voice' 
  | 'document' 
  | 'code' 
  | 'analysis' 
  | 'creative';

interface RouteDecision {
  intent: Intent;
  model: string;
  service: 'lovable' | 'huggingface' | 'elevenlabs' | 'internal';
  confidence: number;
  reasoning: string;
}

interface RouterRequest {
  prompt: string;
  mode?: 'auto' | 'manual';
  preferredModel?: string;
  outputType?: Intent;
  userId?: string;
  sessionId?: string;
}

// Intent detection patterns with confidence scores
const INTENT_PATTERNS: Record<Intent, { patterns: RegExp[]; weight: number }> = {
  image: {
    patterns: [
      /\b(generate|create|make|draw|design|render|visualize)\b.*(image|picture|photo|illustration|art|graphic|logo|icon)/i,
      /\b(image|picture|photo|illustration|art|graphic)\b.*\b(of|showing|depicting|with)/i,
      /\b(show me|let me see|visualize|picture)\b/i,
      /\bsdxl|stable diffusion|dall-e|midjourney style\b/i,
    ],
    weight: 0.95,
  },
  video: {
    patterns: [
      /\b(generate|create|make|render)\b.*(video|animation|clip|movie|footage)/i,
      /\b(video|animation|clip)\b.*\b(of|showing|depicting)/i,
      /\banimate|motion|moving image\b/i,
    ],
    weight: 0.90,
  },
  music: {
    patterns: [
      /\b(generate|create|make|compose|produce)\b.*(music|song|beat|track|melody|instrumental|audio)/i,
      /\b(music|song|beat|track)\b.*\b(in|with|for|like)/i,
      /\bsuno|musicgen|lo-?fi|hip-?hop beat|edm|ambient\b/i,
    ],
    weight: 0.92,
  },
  voice: {
    patterns: [
      /\b(speak|say|read|narrate|voice|tts|text.?to.?speech)\b/i,
      /\b(convert|turn)\b.*\b(to|into)\b.*(speech|audio|voice)/i,
      /\belevenlabs|voice clone|voice over\b/i,
    ],
    weight: 0.93,
  },
  document: {
    patterns: [
      /\b(generate|create|make|export)\b.*(pdf|document|report|contract|invoice)/i,
      /\b(pdf|document)\b.*\b(for|with|containing)/i,
      /\bdownload as pdf|save as document\b/i,
    ],
    weight: 0.88,
  },
  code: {
    patterns: [
      /\b(write|create|generate|debug|fix|refactor|optimize)\b.*(code|function|class|script|program|api)/i,
      /\b(typescript|javascript|python|react|node|sql|rust|go)\b/i,
      /```|<code>|\bfunction\b|\bclass\b|\bconst\b|\blet\b|\bimport\b/i,
    ],
    weight: 0.94,
  },
  analysis: {
    patterns: [
      /\b(analyze|analyse|research|compare|evaluate|assess|study|investigate|review)\b/i,
      /\b(what do you think|your analysis|break down|deep dive)\b/i,
      /\bpros and cons|swot|comparison|benchmark\b/i,
    ],
    weight: 0.85,
  },
  creative: {
    patterns: [
      /\b(write|create|compose)\b.*(story|poem|essay|article|blog|script|lyrics)/i,
      /\b(creative|imaginative|fictional)\b/i,
      /\bonce upon|in a world|imagine if\b/i,
    ],
    weight: 0.82,
  },
  chat: {
    patterns: [
      /^(hi|hello|hey|what|how|why|when|where|who|can you|could you|please|thanks)/i,
      /\?$/,
    ],
    weight: 0.60, // Default fallback
  },
};

// Model mapping per intent
const INTENT_TO_MODEL: Record<Intent, { model: string; service: RouteDecision['service'] }> = {
  image: { model: 'stabilityai/stable-diffusion-xl-base-1.0', service: 'huggingface' },
  video: { model: 'ali-vilab/text-to-video-ms-1.7b', service: 'huggingface' },
  music: { model: 'facebook/musicgen-small', service: 'huggingface' },
  voice: { model: 'eleven_multilingual_v2', service: 'elevenlabs' },
  document: { model: 'internal-pdf-generator', service: 'internal' },
  code: { model: 'google/gemini-2.5-pro', service: 'lovable' },
  analysis: { model: 'google/gemini-2.5-pro', service: 'lovable' },
  creative: { model: 'openai/gpt-5-mini', service: 'lovable' },
  chat: { model: 'google/gemini-2.5-flash', service: 'lovable' },
};

// LLM models for chat routing
const LLM_MODELS = {
  fast: 'google/gemini-2.5-flash-lite',
  balanced: 'google/gemini-2.5-flash',
  powerful: 'google/gemini-2.5-pro',
  creative: 'openai/gpt-5-mini',
};

function classifyIntent(prompt: string): RouteDecision {
  let bestMatch: { intent: Intent; confidence: number } = { intent: 'chat', confidence: 0.5 };

  for (const [intent, config] of Object.entries(INTENT_PATTERNS) as [Intent, typeof INTENT_PATTERNS[Intent]][]) {
    for (const pattern of config.patterns) {
      if (pattern.test(prompt)) {
        const confidence = config.weight;
        if (confidence > bestMatch.confidence) {
          bestMatch = { intent, confidence };
        }
      }
    }
  }

  const mapping = INTENT_TO_MODEL[bestMatch.intent];
  
  // For chat intent, do additional LLM routing
  let model = mapping.model;
  if (bestMatch.intent === 'chat') {
    model = routeLLM(prompt);
  }

  return {
    intent: bestMatch.intent,
    model,
    service: mapping.service,
    confidence: bestMatch.confidence,
    reasoning: `Detected ${bestMatch.intent} intent with ${(bestMatch.confidence * 100).toFixed(0)}% confidence`,
  };
}

function routeLLM(prompt: string): string {
  const length = prompt.length;
  const lower = prompt.toLowerCase();

  // Code patterns -> powerful model
  if (/\b(code|function|debug|typescript|python|react)\b/i.test(prompt) || /```/.test(prompt)) {
    return LLM_MODELS.powerful;
  }

  // Creative writing -> creative model
  if (/\b(write|story|poem|creative|imagine)\b/i.test(prompt) && !/\b(code|technical)\b/i.test(prompt)) {
    return LLM_MODELS.creative;
  }

  // Short simple queries -> fast model
  if (length < 100 && /\b(what|who|when|where|define|explain)\b/i.test(prompt)) {
    return LLM_MODELS.fast;
  }

  // Long or analytical -> powerful model
  if (length > 500 || /\b(analyze|research|compare|detailed|comprehensive)\b/i.test(prompt)) {
    return LLM_MODELS.powerful;
  }

  // Default balanced
  return LLM_MODELS.balanced;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const body: RouterRequest = await req.json();
    const { prompt, mode = 'auto', preferredModel, outputType, userId, sessionId } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let decision: RouteDecision;

    // Manual mode - user specified output type
    if (mode === 'manual' && outputType) {
      const mapping = INTENT_TO_MODEL[outputType];
      decision = {
        intent: outputType,
        model: preferredModel || mapping.model,
        service: mapping.service,
        confidence: 1.0,
        reasoning: `User specified ${outputType} output`,
      };
    } 
    // Preferred model override
    else if (preferredModel) {
      const intent = classifyIntent(prompt).intent;
      decision = {
        intent,
        model: preferredModel,
        service: 'lovable',
        confidence: 1.0,
        reasoning: `User preferred model: ${preferredModel}`,
      };
    }
    // Auto mode - Lucy decides
    else {
      decision = classifyIntent(prompt);
    }

    console.log(`[ai-router] Intent: ${decision.intent}, Model: ${decision.model}, Confidence: ${decision.confidence}`);

    // Log usage for analytics (non-blocking)
    if (userId) {
      logUsage(userId, sessionId, decision, prompt.length).catch(console.error);
    }

    // Return routing decision
    return new Response(JSON.stringify({
      route: decision,
      endpoints: {
        image: '/functions/v1/hf-image-gen',
        video: '/functions/v1/hf-video-gen',
        music: '/functions/v1/hf-music-gen',
        voice: '/functions/v1/elevenlabs-voice',
        document: '/functions/v1/pdf-generator',
        chat: '/functions/v1/chat-stream',
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[ai-router] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Routing failed. Lucy will use default chat model.',
      fallback: { intent: 'chat', model: 'google/gemini-2.5-flash', service: 'lovable' }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function logUsage(userId: string, sessionId: string | undefined, decision: RouteDecision, promptLength: number) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase.from('model_usage_logs').insert({
      user_id: userId,
      session_id: sessionId,
      intent: decision.intent,
      model: decision.model,
      service: decision.service,
      confidence: decision.confidence,
      prompt_length: promptLength,
    });
  } catch (e) {
    console.error('[ai-router] Failed to log usage:', e);
  }
}
