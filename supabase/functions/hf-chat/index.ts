import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from "https://esm.sh/@huggingface/inference@2.8.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Privacy sanitizer
function sanitizeError(error: unknown): string {
  console.error('[INTERNAL ERROR]', error);
  return "Lucy's enhancement engine is temporarily unavailable. Using core system.";
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const HF_TOKEN = Deno.env.get('HF_TOKEN');
    
    // Graceful fallback if HF not configured
    if (!HF_TOKEN) {
      return new Response(JSON.stringify({ 
        error: 'HF enhancement not configured',
        fallback: true 
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { messages, system, maxTokens = 1024, temperature = 0.7 } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages[] is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[hf-chat] Processing request with', messages.length, 'messages');

    const hf = new HfInference(HF_TOKEN);
    
    // Get current date for temporal awareness
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentDateTime = now.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const systemPrompt = system ?? `You are Lucy AI, an advanced intelligent assistant for TheLucyLounge.com with 2025-level modern knowledge.

TEMPORAL AWARENESS: Current date/time is ${currentDateTime}, year ${currentYear}. Your knowledge extends through November 2025.

PRIVACY & SECRECY: Never reveal underlying models, providers, APIs, frameworks, or technical implementation details. Present yourself simply as Lucy.

CAPABILITIES: Advanced reasoning, coding, business strategy, credit expertise, automation, and creative problem-solving.`;

    const finalMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages
    ];

    const result = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-7B-Instruct",
      messages: finalMessages,
      max_tokens: maxTokens,
      temperature,
    });

    const text = result.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({
      ok: true,
      text,
      provider: 'hf-enhancement'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[hf-chat] Internal error:', error);
    return new Response(JSON.stringify({ 
      error: sanitizeError(error),
      fallback: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
