/**
 * THE LUCY LOUNGE - SUPREME AI ROUTER v2
 * 
 * Intelligent model routing with:
 * - User tier-based access control
 * - Quota enforcement
 * - Cost-aware model selection
 * - Full telemetry logging
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
  | 'creative'
  | 'web_fetch'
  | 'calculator';

type UserTier = 'free' | 'pro' | 'power' | 'enterprise';

interface RouteDecision {
  intent: Intent;
  model: string;
  originalModel: string;
  service: 'openrouter' | 'lovable' | 'huggingface' | 'elevenlabs' | 'internal';
  confidence: number;
  reasoning: string;
  wasDowngraded: boolean;
  downgradeReason?: string;
}

interface AccessCheck {
  allowed: boolean;
  reason: string;
  daily_remaining: number;
  tier: UserTier;
  upgrade_available: boolean;
}

interface RouterRequest {
  prompt: string;
  mode?: 'auto' | 'manual';
  preferredModel?: string;
  outputType?: Intent;
  userId?: string;
  sessionId?: string;
  toolId?: string; // Explicit tool override
}

interface RouterResponse {
  route: RouteDecision;
  access: AccessCheck;
  endpoints: Record<string, string>;
  quotas: {
    tier: UserTier;
    dailyRemaining: number;
    upgradeAvailable: boolean;
  };
}

// Intent detection patterns with confidence scores
const INTENT_PATTERNS: Record<Intent, { patterns: RegExp[]; weight: number; toolId: string }> = {
  image: {
    patterns: [
      /\b(generate|create|make|draw|design|render|visualize)\b.*(image|picture|photo|illustration|art|graphic|logo|icon)/i,
      /\b(image|picture|photo|illustration|art|graphic)\b.*\b(of|showing|depicting|with)/i,
      /\b(show me|let me see|visualize|picture)\b/i,
      /\bsdxl|stable diffusion|dall-e|midjourney style\b/i,
    ],
    weight: 0.95,
    toolId: 'image',
  },
  video: {
    patterns: [
      /\b(generate|create|make|render)\b.*(video|animation|clip|movie|footage)/i,
      /\b(video|animation|clip)\b.*\b(of|showing|depicting)/i,
      /\banimate|motion|moving image\b/i,
    ],
    weight: 0.90,
    toolId: 'video',
  },
  music: {
    patterns: [
      /\b(generate|create|make|compose|produce)\b.*(music|song|beat|track|melody|instrumental|audio)/i,
      /\b(music|song|beat|track)\b.*\b(in|with|for|like)/i,
      /\bsuno|musicgen|lo-?fi|hip-?hop beat|edm|ambient\b/i,
    ],
    weight: 0.92,
    toolId: 'music',
  },
  voice: {
    patterns: [
      /\b(speak|say|read|narrate|voice|tts|text.?to.?speech)\b/i,
      /\b(convert|turn)\b.*\b(to|into)\b.*(speech|audio|voice)/i,
      /\belevenlabs|voice clone|voice over\b/i,
    ],
    weight: 0.93,
    toolId: 'voice',
  },
  document: {
    patterns: [
      /\b(generate|create|make|export)\b.*(pdf|document|report|contract|invoice)/i,
      /\b(pdf|document)\b.*\b(for|with|containing)/i,
      /\bdownload as pdf|save as document\b/i,
    ],
    weight: 0.88,
    toolId: 'pdf',
  },
  code: {
    patterns: [
      /\b(write|create|generate|debug|fix|refactor|optimize)\b.*(code|function|class|script|program|api)/i,
      /\b(typescript|javascript|python|react|node|sql|rust|go)\b/i,
      /```|<code>|\bfunction\b|\bclass\b|\bconst\b|\blet\b|\bimport\b/i,
    ],
    weight: 0.94,
    toolId: 'code',
  },
  analysis: {
    patterns: [
      /\b(analyze|analyse|research|compare|evaluate|assess|study|investigate|review)\b/i,
      /\b(what do you think|your analysis|break down|deep dive)\b/i,
      /\bpros and cons|swot|comparison|benchmark\b/i,
    ],
    weight: 0.85,
    toolId: 'chat',
  },
  creative: {
    patterns: [
      /\b(write|create|compose)\b.*(story|poem|essay|article|blog|script|lyrics)/i,
      /\b(creative|imaginative|fictional)\b/i,
      /\bonce upon|in a world|imagine if\b/i,
    ],
    weight: 0.82,
    toolId: 'chat',
  },
  web_fetch: {
    patterns: [
      /\b(fetch|scrape|get|read)\b.*(website|webpage|url|page)/i,
      /\b(summarize|extract).*(from|the)\b.*(url|website|page|article)/i,
    ],
    weight: 0.88,
    toolId: 'web_fetch',
  },
  calculator: {
    patterns: [
      /\b(calculate|compute|solve|evaluate)\b/i,
      /\b\d+\s*[\+\-\*\/\^]\s*\d+/,
      /\bmath|equation|formula\b/i,
    ],
    weight: 0.80,
    toolId: 'calculator',
  },
  chat: {
    patterns: [
      /^(hi|hello|hey|what|how|why|when|where|who|can you|could you|please|thanks)/i,
      /\?$/,
    ],
    weight: 0.60, // Default fallback
    toolId: 'chat',
  },
};

// Model mapping per intent with tier-based variants
const INTENT_TO_MODEL: Record<Intent, { 
  model: string; 
  service: RouteDecision['service'];
  tierModels: Partial<Record<UserTier, string>>;
}> = {
  image: { 
    model: 'stabilityai/stable-diffusion-xl-base-1.0', 
    service: 'huggingface',
    tierModels: {
      pro: 'black-forest-labs/FLUX.1-schnell',
      power: 'black-forest-labs/FLUX.1-dev',
      enterprise: 'black-forest-labs/FLUX.1-dev',
    }
  },
  video: { 
    model: 'ali-vilab/text-to-video-ms-1.7b', 
    service: 'huggingface',
    tierModels: {}
  },
  music: { 
    model: 'facebook/musicgen-small', 
    service: 'huggingface',
    tierModels: {
      pro: 'facebook/musicgen-medium',
      power: 'facebook/musicgen-large',
      enterprise: 'facebook/musicgen-large',
    }
  },
  voice: { 
    model: 'eleven_multilingual_v2', 
    service: 'elevenlabs',
    tierModels: {}
  },
  document: { 
    model: 'internal-pdf-generator', 
    service: 'internal',
    tierModels: {}
  },
  code: { 
    model: 'google/gemini-2.0-flash-001', 
    service: 'openrouter',
    tierModels: {
      pro: 'google/gemini-2.0-flash-thinking-exp:free',
      power: 'google/gemini-2.0-flash-thinking-exp:free',
      enterprise: 'anthropic/claude-3.5-sonnet',
    }
  },
  analysis: { 
    model: 'google/gemini-2.0-flash-001', 
    service: 'openrouter',
    tierModels: {
      pro: 'google/gemini-2.0-flash-thinking-exp:free',
      power: 'google/gemini-2.0-flash-thinking-exp:free',
      enterprise: 'anthropic/claude-3.5-sonnet',
    }
  },
  creative: { 
    model: 'google/gemini-2.0-flash-001', 
    service: 'openrouter',
    tierModels: {
      pro: 'openai/gpt-4o-mini',
      power: 'openai/gpt-4o-mini',
      enterprise: 'openai/gpt-4o-mini',
    }
  },
  web_fetch: {
    model: 'browser-fetch',
    service: 'internal',
    tierModels: {}
  },
  calculator: {
    model: 'local',
    service: 'internal',
    tierModels: {}
  },
  chat: { 
    model: 'google/gemini-2.0-flash-001', 
    service: 'openrouter',
    tierModels: {
      pro: 'google/gemini-2.0-flash-001',
      power: 'google/gemini-2.0-flash-thinking-exp:free',
      enterprise: 'anthropic/claude-3.5-sonnet',
    }
  },
};

// LLM models for chat routing (OpenRouter model IDs)
const LLM_MODELS = {
  fast: 'google/gemini-2.0-flash-lite-001',
  balanced: 'google/gemini-2.0-flash-001',
  powerful: 'google/gemini-2.0-flash-thinking-exp:free',
  creative: 'openai/gpt-4o-mini',
};

// Model cost estimates (per 1K tokens)
const MODEL_COSTS: Record<string, number> = {
  'google/gemini-2.0-flash-lite-001': 0.0001,
  'google/gemini-2.0-flash-001': 0.0003,
  'google/gemini-2.0-flash-thinking-exp:free': 0.001,
  'openai/gpt-4o-mini': 0.0015,
  'anthropic/claude-3.5-sonnet': 0.003,
  'stabilityai/stable-diffusion-xl-base-1.0': 0.002,
  'black-forest-labs/FLUX.1-schnell': 0.003,
  'black-forest-labs/FLUX.1-dev': 0.005,
  'facebook/musicgen-small': 0.001,
  'facebook/musicgen-medium': 0.002,
  'facebook/musicgen-large': 0.003,
  'eleven_multilingual_v2': 0.0004,
};

function classifyIntent(prompt: string, toolIdOverride?: string): { intent: Intent; toolId: string; confidence: number } {
  // If explicit tool override, use that
  if (toolIdOverride) {
    const intent = Object.entries(INTENT_PATTERNS).find(([_, config]) => config.toolId === toolIdOverride);
    if (intent) {
      return { intent: intent[0] as Intent, toolId: toolIdOverride, confidence: 1.0 };
    }
  }

  let bestMatch: { intent: Intent; toolId: string; confidence: number } = { 
    intent: 'chat', 
    toolId: 'chat',
    confidence: 0.5 
  };

  for (const [intent, config] of Object.entries(INTENT_PATTERNS) as [Intent, typeof INTENT_PATTERNS[Intent]][]) {
    for (const pattern of config.patterns) {
      if (pattern.test(prompt)) {
        const confidence = config.weight;
        if (confidence > bestMatch.confidence) {
          bestMatch = { intent, toolId: config.toolId, confidence };
        }
      }
    }
  }

  return bestMatch;
}

function routeLLM(prompt: string, tier: UserTier): string {
  const length = prompt.length;

  // Code patterns -> powerful model (if tier allows)
  if (/\b(code|function|debug|typescript|python|react)\b/i.test(prompt) || /```/.test(prompt)) {
    return tier === 'free' ? LLM_MODELS.balanced : LLM_MODELS.powerful;
  }

  // Creative writing -> creative model
  if (/\b(write|story|poem|creative|imagine)\b/i.test(prompt) && !/\b(code|technical)\b/i.test(prompt)) {
    return tier === 'free' ? LLM_MODELS.balanced : LLM_MODELS.creative;
  }

  // Short simple queries -> fast model
  if (length < 100 && /\b(what|who|when|where|define|explain)\b/i.test(prompt)) {
    return LLM_MODELS.fast;
  }

  // Long or analytical -> powerful model (if tier allows)
  if (length > 500 || /\b(analyze|research|compare|detailed|comprehensive)\b/i.test(prompt)) {
    return tier === 'free' ? LLM_MODELS.balanced : LLM_MODELS.powerful;
  }

  // Default balanced
  return LLM_MODELS.balanced;
}

function selectModel(intent: Intent, tier: UserTier, preferredModel?: string): { model: string; wasDowngraded: boolean; downgradeReason?: string } {
  const mapping = INTENT_TO_MODEL[intent];
  
  // If user has preferred model
  if (preferredModel) {
    // Check if tier allows this model (simplified check)
    const tierOrder: UserTier[] = ['free', 'pro', 'power', 'enterprise'];
    const userTierIndex = tierOrder.indexOf(tier);
    
    // Pro+ models require pro+ tier
    const proModels = ['google/gemini-2.0-flash-thinking-exp:free', 'openai/gpt-4o-mini', 'black-forest-labs/FLUX.1-schnell'];
    const powerModels = ['anthropic/claude-3.5-sonnet', 'black-forest-labs/FLUX.1-dev'];
    
    if (proModels.includes(preferredModel) && userTierIndex < 1) {
      return { 
        model: mapping.model, 
        wasDowngraded: true, 
        downgradeReason: 'Model requires Pro tier or higher' 
      };
    }
    if (powerModels.includes(preferredModel) && userTierIndex < 2) {
      return { 
        model: mapping.tierModels.pro || mapping.model, 
        wasDowngraded: true, 
        downgradeReason: 'Model requires Power tier or higher' 
      };
    }
    
    return { model: preferredModel, wasDowngraded: false };
  }
  
  // Use tier-appropriate model
  const tierModel = mapping.tierModels[tier];
  return { 
    model: tierModel || mapping.model, 
    wasDowngraded: false 
  };
}

async function checkAccess(supabase: any, userId: string, toolId: string, model?: string): Promise<AccessCheck> {
  try {
    const { data, error } = await supabase.rpc('check_tool_access', {
      p_user_id: userId,
      p_tool_id: toolId,
      p_model: model || null
    });

    if (error) {
      console.error('[ai-router] Access check error:', error);
      // Log the failure to telemetry
      await logTelemetry(supabase, 'error', 'access_check_failed', {
        userId,
        toolId,
        error: error.message,
      }, userId);
      // FAIL CLOSED for security - deny access on error
      return { 
        allowed: false, 
        reason: 'Access check temporarily unavailable. Please try again.', 
        daily_remaining: 0, 
        tier: 'free', 
        upgrade_available: true 
      };
    }

    if (data && data.length > 0) {
      return {
        allowed: data[0].allowed,
        reason: data[0].reason,
        daily_remaining: data[0].daily_remaining,
        tier: data[0].tier as UserTier,
        upgrade_available: data[0].upgrade_available
      };
    }

    // No data returned - treat as free tier with default quotas
    return { allowed: true, reason: 'Default access', daily_remaining: 10, tier: 'free', upgrade_available: true };
  } catch (e) {
    console.error('[ai-router] Access check exception:', e);
    // Log the exception to telemetry
    try {
      await supabase.rpc('log_platform_event', {
        p_category: 'error',
        p_event_name: 'access_check_exception',
        p_severity: 'error',
        p_user_id: userId,
        p_function_name: 'ai-router',
        p_message: e instanceof Error ? e.message : 'Unknown error',
        p_stack_trace: e instanceof Error ? e.stack : undefined,
      });
    } catch (logError) {
      console.error('[ai-router] Failed to log exception:', logError);
    }
    // FAIL CLOSED for security
    return { 
      allowed: false, 
      reason: 'Access check temporarily unavailable. Please try again.', 
      daily_remaining: 0, 
      tier: 'free', 
      upgrade_available: true 
    };
  }
}

async function logUsage(supabase: any, userId: string, sessionId: string | undefined, decision: RouteDecision, access: AccessCheck, promptLength: number) {
  try {
    await supabase.from('model_usage_logs').insert({
      user_id: userId,
      session_id: sessionId,
      intent: decision.intent,
      model: decision.model,
      service: decision.service,
      confidence: decision.confidence,
      prompt_length: promptLength,
      user_tier: access.tier,
      quota_remaining: access.daily_remaining,
      was_downgraded: decision.wasDowngraded,
      downgrade_reason: decision.downgradeReason,
      estimated_cost: MODEL_COSTS[decision.model] ? (promptLength / 1000) * MODEL_COSTS[decision.model] : 0,
    });
  } catch (e) {
    console.error('[ai-router] Failed to log usage:', e);
  }
}

async function logTelemetry(supabase: any, category: string, eventName: string, details: any, userId?: string) {
  try {
    await supabase.rpc('log_platform_event', {
      p_category: category,
      p_event_name: eventName,
      p_severity: 'info',
      p_user_id: userId || null,
      p_function_name: 'ai-router',
      p_details: details,
    });
  } catch (e) {
    console.error('[ai-router] Failed to log telemetry:', e);
  }
}

serve(async (req) => {
  const startTime = Date.now();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

  try {
    const body: RouterRequest = await req.json();
    const { prompt, mode = 'auto', preferredModel, outputType, userId, sessionId, toolId } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Classify intent
    const classification = classifyIntent(prompt, toolId || (outputType ? INTENT_PATTERNS[outputType]?.toolId : undefined));
    
    // Check access (if user provided)
    let access: AccessCheck = { allowed: true, reason: 'Anonymous access', daily_remaining: -1, tier: 'free', upgrade_available: true };
    if (userId && supabase) {
      access = await checkAccess(supabase, userId, classification.toolId);
    }

    // If not allowed, return early
    if (!access.allowed) {
      const response: RouterResponse = {
        route: {
          intent: classification.intent,
          model: '',
          originalModel: '',
          service: 'internal',
          confidence: classification.confidence,
          reasoning: access.reason,
          wasDowngraded: false,
        },
        access,
        endpoints: {},
        quotas: {
          tier: access.tier,
          dailyRemaining: access.daily_remaining,
          upgradeAvailable: access.upgrade_available,
        }
      };

      // Log denial
      if (supabase) {
        await logTelemetry(supabase, 'ai_routing', 'access_denied', {
          toolId: classification.toolId,
          reason: access.reason,
          tier: access.tier,
        }, userId);
      }

      return new Response(JSON.stringify(response), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Select model based on tier
    const { model, wasDowngraded, downgradeReason } = selectModel(
      classification.intent, 
      access.tier, 
      mode === 'manual' ? preferredModel : undefined
    );

    // For chat intent, do additional LLM routing
    let finalModel = model;
    if (classification.intent === 'chat' && !preferredModel) {
      finalModel = routeLLM(prompt, access.tier);
    }

    const mapping = INTENT_TO_MODEL[classification.intent];
    const decision: RouteDecision = {
      intent: classification.intent,
      model: finalModel,
      originalModel: preferredModel || mapping.model,
      service: mapping.service,
      confidence: classification.confidence,
      reasoning: `Detected ${classification.intent} intent with ${(classification.confidence * 100).toFixed(0)}% confidence. Tier: ${access.tier}`,
      wasDowngraded,
      downgradeReason,
    };

    console.log(`[ai-router] Intent: ${decision.intent}, Model: ${decision.model}, Tier: ${access.tier}, Confidence: ${decision.confidence}`);

    // Log usage (non-blocking)
    if (userId && supabase) {
      logUsage(supabase, userId, sessionId, decision, access, prompt.length).catch(console.error);
      logTelemetry(supabase, 'ai_routing', 'route_decision', {
        intent: decision.intent,
        model: decision.model,
        tier: access.tier,
        wasDowngraded,
        latencyMs: Date.now() - startTime,
      }, userId).catch(console.error);
    }

    const response: RouterResponse = {
      route: decision,
      access,
      endpoints: {
        image: '/functions/v1/hf-image-gen',
        video: '/functions/v1/hf-video-gen',
        music: '/functions/v1/hf-music-gen',
        voice: '/functions/v1/elevenlabs-voice',
        document: '/functions/v1/pdf-generator',
        chat: '/functions/v1/chat-stream',
        web_fetch: '/functions/v1/browser-fetch',
        code: '/functions/v1/code-executor',
      },
      quotas: {
        tier: access.tier,
        dailyRemaining: access.daily_remaining,
        upgradeAvailable: access.upgrade_available,
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[ai-router] Error:', error);
    
    // Log error telemetry
    if (supabase) {
      logTelemetry(supabase, 'error', 'ai_router_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }).catch(console.error);
    }

    return new Response(JSON.stringify({ 
      error: 'Routing failed. Lucy will use default chat model.',
      route: { 
        intent: 'chat', 
        model: 'google/gemini-2.0-flash-001', 
        originalModel: 'google/gemini-2.0-flash-001',
        service: 'openrouter',
        confidence: 0.5,
        reasoning: 'Fallback due to routing error',
        wasDowngraded: false,
      },
      access: { allowed: true, reason: 'Fallback', daily_remaining: -1, tier: 'free', upgrade_available: true },
      quotas: { tier: 'free', dailyRemaining: -1, upgradeAvailable: true },
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

