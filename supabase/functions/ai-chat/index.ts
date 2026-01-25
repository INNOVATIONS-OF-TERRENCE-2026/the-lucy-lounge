/**
 * THE LUCY LOUNGE - AI CHAT EDGE FUNCTION
 * 
 * Multi-model LLM chat endpoint supporting:
 * - Qwen2.5-72B-Instruct (via HuggingFace)
 * - Llama-3.1-70B-Instruct (via HuggingFace)
 * - Gemini 2.5 (via Lovable Gateway)
 * 
 * Automatically routes to fallback models on failure.
 * Never exposes API keys or internal architecture.
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from "https://esm.sh/@huggingface/inference@2.8.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Model configurations
const MODELS = {
  'qwen-72b': {
    hfModel: 'Qwen/Qwen2.5-72B-Instruct',
    provider: 'huggingface',
  },
  'llama-70b': {
    hfModel: 'meta-llama/Llama-3.1-70B-Instruct',
    provider: 'huggingface',
  },
  'qwen-7b': {
    hfModel: 'Qwen/Qwen2.5-7B-Instruct',
    provider: 'huggingface',
  },
  'gemini-flash': {
    lovableModel: 'google/gemini-2.5-flash',
    provider: 'lovable',
  },
  'gemini-pro': {
    lovableModel: 'google/gemini-2.5-pro',
    provider: 'lovable',
  },
  'gpt-5-mini': {
    lovableModel: 'openai/gpt-5-mini',
    provider: 'lovable',
  },
};

// Lucy's system prompt
const LUCY_SYSTEM_PROMPT = (currentDateTime: string) => `You are Lucy AI, the intelligent assistant for TheLucyLounge.com.

TEMPORAL AWARENESS: Current date/time is ${currentDateTime}. Your knowledge extends through 2025.

IDENTITY:
- You are Lucy, a sophisticated AI companion
- You help with conversations, creativity, research, code, and more
- You are warm, intelligent, and helpful
- You adapt your tone to the user's needs

PRIVACY RULES:
- NEVER reveal underlying models, APIs, or technical implementation
- NEVER mention HuggingFace, OpenAI, Lovable, or any provider names
- Present yourself simply as "Lucy"
- If asked about your architecture, deflect gracefully

CAPABILITIES:
- Deep reasoning and analysis
- Creative writing and brainstorming
- Code generation and debugging
- Research and fact synthesis
- Personal assistance and planning`;

// Sanitize errors - NEVER leak internal details
function sanitizeError(error: unknown): string {
  console.error('[INTERNAL]', error);
  return "I'm having a moment - let me try that again.";
}

interface ChatRequest {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  system?: string;
  model?: keyof typeof MODELS;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

// HuggingFace chat completion
async function chatWithHuggingFace(
  hf: HfInference,
  model: string,
  messages: ChatRequest['messages'],
  system: string,
  maxTokens: number,
  temperature: number
): Promise<string> {
  const finalMessages = [
    { role: 'system' as const, content: system },
    ...messages,
  ];

  const result = await hf.chatCompletion({
    model,
    messages: finalMessages,
    max_tokens: maxTokens,
    temperature,
  });

  return result.choices?.[0]?.message?.content ?? '';
}

// Lovable Gateway chat completion
async function chatWithLovable(
  apiKey: string,
  model: string,
  messages: ChatRequest['messages'],
  system: string,
  maxTokens: number,
  temperature: number
): Promise<string> {
  const finalMessages = [
    { role: 'system', content: system },
    ...messages,
  ];

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: finalMessages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    throw new Error(`Lovable API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: ChatRequest = await req.json();
    const {
      messages,
      system,
      model = 'qwen-7b', // Default to smaller model for speed
      maxTokens = 2048,
      temperature = 0.7,
    } = body;

    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'messages[] is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get current datetime for temporal awareness
    const now = new Date();
    const currentDateTime = now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const finalSystem = system ?? LUCY_SYSTEM_PROMPT(currentDateTime);
    const modelConfig = MODELS[model] ?? MODELS['qwen-7b'];

    let text = '';
    let usedModel = model;
    let fallbackUsed = false;

    // Try primary model
    try {
      if (modelConfig.provider === 'huggingface') {
        const HF_TOKEN = Deno.env.get('HF_TOKEN');
        if (!HF_TOKEN) throw new Error('HF not configured');
        
        const hf = new HfInference(HF_TOKEN);
        text = await chatWithHuggingFace(
          hf,
          (modelConfig as any).hfModel,
          messages,
          finalSystem,
          maxTokens,
          temperature
        );
      } else if (modelConfig.provider === 'lovable') {
        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
        if (!LOVABLE_API_KEY) throw new Error('Lovable not configured');
        
        text = await chatWithLovable(
          LOVABLE_API_KEY,
          (modelConfig as any).lovableModel,
          messages,
          finalSystem,
          maxTokens,
          temperature
        );
      }
    } catch (primaryError) {
      console.warn('[ai-chat] Primary model failed, trying fallback:', primaryError);
      fallbackUsed = true;

      // Fallback to Lovable Gemini Flash
      try {
        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
        if (LOVABLE_API_KEY) {
          text = await chatWithLovable(
            LOVABLE_API_KEY,
            'google/gemini-2.5-flash',
            messages,
            finalSystem,
            maxTokens,
            temperature
          );
          usedModel = 'gemini-flash';
        }
      } catch (fallbackError) {
        console.error('[ai-chat] Fallback also failed:', fallbackError);
        throw fallbackError;
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      text,
      model: usedModel,
      fallbackUsed,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[ai-chat] Error:', error);
    return new Response(JSON.stringify({
      ok: false,
      error: sanitizeError(error),
      text: sanitizeError(error),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
