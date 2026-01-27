import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * THE LUCY LOUNGE - INTELLIGENT MODEL ROUTER
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Multi-brain routing system that powers Lucy AI with frontier intelligence.
 * 
 * GENIUS MODE:
 * - Forces 70B+ class models for maximum intelligence
 * - Prioritizes depth over speed
 * - User sees "Lucy is thinking deeply..." (never model names)
 * 
 * TASK-BASED ROUTING:
 * - Deep reasoning → Qwen2.5-72B / Claude 3.5 Sonnet
 * - Emotional/conversational → Claude 3.5 Sonnet / GPT-4o
 * - Code/architecture → Qwen2.5-Coder-32B / CodeLlama-34B
 * - Tool orchestration → Qwen2.5-32B / Mistral-Nemo
 * - Emergency fallback → Phi-3-mini / TinyLlama
 * 
 * ABSOLUTE RULES:
 * - Lucy is the ONLY identity visible to users
 * - NEVER expose model names, providers, or technical details
 * - All routing decisions happen server-side
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-type, x-genius-mode',
};

// ═══════════════════════════════════════════════════════════════════════════════
// OPENROUTER API CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_HEADERS = {
  'HTTP-Referer': 'https://thelucylounge.com',
  'X-Title': 'Lucy AI',
};

// ═══════════════════════════════════════════════════════════════════════════════
// FRONTIER MODEL CONFIGURATION (70B+ CLASS)
// ═══════════════════════════════════════════════════════════════════════════════

interface ModelConfig {
  id: string;
  openrouterId: string;
  maxTokens: number;
  temperature: number;
  tier: 'genius' | 'standard' | 'fast' | 'fallback';
  costPer1kTokens: number;
}

// Genius Mode models - 70B+ class, maximum intelligence
const GENIUS_MODELS: ModelConfig[] = [
  { id: 'qwen-72b', openrouterId: 'qwen/qwen-2.5-72b-instruct', maxTokens: 8192, temperature: 0.7, tier: 'genius', costPer1kTokens: 0.004 },
  { id: 'claude-sonnet', openrouterId: 'anthropic/claude-3.5-sonnet', maxTokens: 8192, temperature: 0.7, tier: 'genius', costPer1kTokens: 0.003 },
  { id: 'gpt-4o', openrouterId: 'openai/gpt-4o', maxTokens: 8192, temperature: 0.7, tier: 'genius', costPer1kTokens: 0.005 },
  { id: 'llama-70b', openrouterId: 'meta-llama/llama-3.1-70b-instruct', maxTokens: 8192, temperature: 0.7, tier: 'genius', costPer1kTokens: 0.002 },
];

// Task-specific model routing
const TASK_MODELS: Record<string, ModelConfig[]> = {
  // Deep reasoning / planning / architecture
  deep_reasoning: [
    { id: 'qwen-72b', openrouterId: 'qwen/qwen-2.5-72b-instruct', maxTokens: 8192, temperature: 0.6, tier: 'genius', costPer1kTokens: 0.004 },
    { id: 'claude-sonnet', openrouterId: 'anthropic/claude-3.5-sonnet', maxTokens: 8192, temperature: 0.6, tier: 'genius', costPer1kTokens: 0.003 },
    { id: 'llama-70b', openrouterId: 'meta-llama/llama-3.1-70b-instruct', maxTokens: 8192, temperature: 0.6, tier: 'genius', costPer1kTokens: 0.002 },
  ],
  
  // Emotional / conversational / empathetic
  emotional: [
    { id: 'claude-sonnet', openrouterId: 'anthropic/claude-3.5-sonnet', maxTokens: 4096, temperature: 0.8, tier: 'genius', costPer1kTokens: 0.003 },
    { id: 'gpt-4o', openrouterId: 'openai/gpt-4o', maxTokens: 4096, temperature: 0.8, tier: 'genius', costPer1kTokens: 0.005 },
    { id: 'qwen-72b', openrouterId: 'qwen/qwen-2.5-72b-instruct', maxTokens: 4096, temperature: 0.8, tier: 'genius', costPer1kTokens: 0.004 },
  ],
  
  // Code generation / debugging / architecture
  code: [
    { id: 'qwen-coder-32b', openrouterId: 'qwen/qwen-2.5-coder-32b-instruct', maxTokens: 8192, temperature: 0.2, tier: 'standard', costPer1kTokens: 0.002 },
    { id: 'claude-sonnet', openrouterId: 'anthropic/claude-3.5-sonnet', maxTokens: 8192, temperature: 0.2, tier: 'genius', costPer1kTokens: 0.003 },
    { id: 'gpt-4o', openrouterId: 'openai/gpt-4o', maxTokens: 8192, temperature: 0.2, tier: 'genius', costPer1kTokens: 0.005 },
  ],
  
  // Tool orchestration / function calling
  tool: [
    { id: 'qwen-32b', openrouterId: 'qwen/qwen-2.5-32b-instruct', maxTokens: 4096, temperature: 0.3, tier: 'standard', costPer1kTokens: 0.001 },
    { id: 'mistral-nemo', openrouterId: 'mistralai/mistral-nemo', maxTokens: 4096, temperature: 0.3, tier: 'standard', costPer1kTokens: 0.0005 },
    { id: 'qwen-72b', openrouterId: 'qwen/qwen-2.5-72b-instruct', maxTokens: 4096, temperature: 0.3, tier: 'genius', costPer1kTokens: 0.004 },
  ],
  
  // Creative writing / storytelling
  creative: [
    { id: 'claude-sonnet', openrouterId: 'anthropic/claude-3.5-sonnet', maxTokens: 8192, temperature: 0.9, tier: 'genius', costPer1kTokens: 0.003 },
    { id: 'gpt-4o', openrouterId: 'openai/gpt-4o', maxTokens: 8192, temperature: 0.9, tier: 'genius', costPer1kTokens: 0.005 },
    { id: 'qwen-72b', openrouterId: 'qwen/qwen-2.5-72b-instruct', maxTokens: 8192, temperature: 0.9, tier: 'genius', costPer1kTokens: 0.004 },
  ],
  
  // Quick / simple queries
  quick: [
    { id: 'gemini-flash', openrouterId: 'google/gemini-2.0-flash-001', maxTokens: 2048, temperature: 0.7, tier: 'fast', costPer1kTokens: 0.0001 },
    { id: 'gpt-4o-mini', openrouterId: 'openai/gpt-4o-mini', maxTokens: 2048, temperature: 0.7, tier: 'fast', costPer1kTokens: 0.00015 },
    { id: 'qwen-7b', openrouterId: 'qwen/qwen-2.5-7b-instruct', maxTokens: 2048, temperature: 0.7, tier: 'fast', costPer1kTokens: 0.00005 },
  ],
  
  // General chat (balanced)
  general: [
    { id: 'gemini-flash', openrouterId: 'google/gemini-2.0-flash-001', maxTokens: 4096, temperature: 0.7, tier: 'standard', costPer1kTokens: 0.0001 },
    { id: 'gpt-4o-mini', openrouterId: 'openai/gpt-4o-mini', maxTokens: 4096, temperature: 0.7, tier: 'standard', costPer1kTokens: 0.00015 },
    { id: 'claude-sonnet', openrouterId: 'anthropic/claude-3.5-sonnet', maxTokens: 4096, temperature: 0.7, tier: 'genius', costPer1kTokens: 0.003 },
  ],
  
  // Emergency fallback (always available)
  fallback: [
    { id: 'phi-3-mini', openrouterId: 'microsoft/phi-3-mini-128k-instruct', maxTokens: 2048, temperature: 0.7, tier: 'fallback', costPer1kTokens: 0.00001 },
    { id: 'gemini-flash-lite', openrouterId: 'google/gemini-2.0-flash-lite-001', maxTokens: 1024, temperature: 0.7, tier: 'fallback', costPer1kTokens: 0.00001 },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// TASK DETECTION PATTERNS
// ═══════════════════════════════════════════════════════════════════════════════

type TaskType = 'deep_reasoning' | 'emotional' | 'code' | 'tool' | 'creative' | 'quick' | 'general';

const TASK_PATTERNS = {
  deep_reasoning: /\b(analyze|explain|compare|evaluate|why|how does|strategy|plan|research|investigate|complex|detailed|comprehensive|architecture|design|system|framework|optimize)\b/i,
  emotional: /\b(feel|feeling|sad|happy|anxious|worried|stressed|help me|support|understand|empathy|relationship|personal|comfort|advice|cope|struggle)\b/i,
  code: /\b(code|function|class|debug|error|syntax|algorithm|programming|typescript|javascript|python|react|sql|api|endpoint|bug|fix|implement|refactor)\b|```/i,
  tool: /\b(search|fetch|calculate|generate|create|make|build|convert|translate|summarize|extract)\b/i,
  creative: /\b(write|story|poem|creative|imagine|describe|narrative|essay|blog|article|script|fiction|novel)\b/i,
  quick: /\b(what is|who is|when|where|define|hello|hi|hey|thanks|okay|yes|no|simple)\b/i,
};

function detectTaskType(prompt: string, providedMode?: string): TaskType {
  // If a specific mode is provided, map it to task type
  if (providedMode) {
    const modeMap: Record<string, TaskType> = {
      'reasoning': 'deep_reasoning',
      'tool_use': 'tool',
      'code': 'code',
      'creative': 'creative',
      'chat': 'general',
    };
    if (modeMap[providedMode]) return modeMap[providedMode];
  }
  
  // Auto-detect from content
  if (TASK_PATTERNS.code.test(prompt)) return 'code';
  if (TASK_PATTERNS.deep_reasoning.test(prompt) || prompt.length > 500) return 'deep_reasoning';
  if (TASK_PATTERNS.emotional.test(prompt)) return 'emotional';
  if (TASK_PATTERNS.tool.test(prompt)) return 'tool';
  if (TASK_PATTERNS.creative.test(prompt)) return 'creative';
  if (TASK_PATTERNS.quick.test(prompt) && prompt.length < 100) return 'quick';
  
  return 'general';
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRIVACY SANITIZER - NEVER EXPOSE INTERNALS
// ═══════════════════════════════════════════════════════════════════════════════

function sanitizeError(error: unknown): string {
  console.error('[INTERNAL ERROR]', error);
  return "Lucy's response engine is temporarily busy. Please try again.";
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPENROUTER API CALLS
// ═══════════════════════════════════════════════════════════════════════════════

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');

async function callOpenRouter(
  model: ModelConfig,
  messages: any[],
  stream: boolean = true
): Promise<Response> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }
  
  console.log(`[model-router] Calling model: ${model.id} (${model.openrouterId})`);
  
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      ...OPENROUTER_HEADERS,
    },
    body: JSON.stringify({
      model: model.openrouterId,
      messages,
      max_tokens: model.maxTokens,
      temperature: model.temperature,
      stream,
    }),
  });
  
  return response;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FALLBACK CHAIN - ROBUST MODEL EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

async function executeWithFallback(
  models: ModelConfig[],
  messages: any[],
  stream: boolean = true
): Promise<{ response: Response; modelUsed: string }> {
  let lastError: Error | null = null;
  
  for (const model of models) {
    try {
      const response = await callOpenRouter(model, messages, stream);
      
      if (response.ok) {
        console.log(`[model-router] Success with ${model.id}`);
        return { response, modelUsed: model.id };
      }
      
      // Handle specific errors
      const status = response.status;
      if (status === 429) {
        console.log(`[model-router] Rate limited on ${model.id}, trying next...`);
        continue;
      }
      if (status === 503 || status === 502) {
        console.log(`[model-router] Model ${model.id} unavailable, trying next...`);
        continue;
      }
      if (status === 402) {
        console.log(`[model-router] Insufficient credits for ${model.id}, trying next...`);
        continue;
      }
      
      const errorText = await response.text();
      console.log(`[model-router] Error from ${model.id}: ${status} - ${errorText.slice(0, 200)}`);
      lastError = new Error(`${model.id} failed: ${status}`);
      
    } catch (err) {
      console.error(`[model-router] Exception with ${model.id}:`, err);
      lastError = err as Error;
    }
  }
  
  // Try fallback models as last resort
  if (models !== TASK_MODELS.fallback) {
    console.log('[model-router] All primary models failed, trying fallback chain...');
    return executeWithFallback(TASK_MODELS.fallback, messages, stream);
  }
  
  throw lastError || new Error('All models failed');
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { 
      messages, 
      geniusMode = false,  // GENIUS MODE FLAG
      mode,                 // Optional task mode hint
      enableFusion = false,
      preferredModel = null,
      isMobile = false,
    } = await req.json();

    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    // Get last user message for routing
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    // ═══════════════════════════════════════════════════════════════════════════
    // GENIUS MODE OVERRIDE - Force 70B+ models
    // ═══════════════════════════════════════════════════════════════════════════
    
    if (geniusMode) {
      console.log('[model-router] GENIUS MODE ACTIVE - Using frontier models');
      
      // In Genius Mode, always use 70B+ class models
      const { response, modelUsed } = await executeWithFallback(GENIUS_MODELS, messages, true);
      
      const elapsed = Date.now() - startTime;
      console.log(`[model-router] Genius response in ${elapsed}ms using ${modelUsed}`);
      
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'X-Lucy-Mode': 'genius',
          'X-Lucy-Time': elapsed.toString(),
        },
      });
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // INTELLIGENT TASK-BASED ROUTING
    // ═══════════════════════════════════════════════════════════════════════════
    
    const taskType = detectTaskType(lastMessage, mode);
    const taskModels = TASK_MODELS[taskType] || TASK_MODELS.general;
    
    // For mobile, prefer faster models from the task set
    let selectedModels = taskModels;
    if (isMobile && taskType !== 'deep_reasoning') {
      // On mobile, use fast models for non-critical tasks
      selectedModels = taskModels.filter(m => m.tier !== 'genius') || taskModels;
      if (selectedModels.length === 0) selectedModels = TASK_MODELS.quick;
    }
    
    console.log(`[model-router] Task: ${taskType}, Mobile: ${isMobile}, Models: ${selectedModels.map(m => m.id).join(', ')}`);

    // Execute with fallback chain
    const { response, modelUsed } = await executeWithFallback(selectedModels, messages, true);

    const elapsed = Date.now() - startTime;
    console.log(`[model-router] Response ready in ${elapsed}ms using ${modelUsed}`);

    // Handle rate limit response
    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Lucy is experiencing high demand. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('Model response error');
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'X-Lucy-Task': taskType,
        'X-Lucy-Time': elapsed.toString(),
      },
    });

  } catch (error) {
    console.error('[model-router] Fatal error:', error);
    return new Response(JSON.stringify({ error: sanitizeError(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
