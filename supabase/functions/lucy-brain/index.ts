import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * THE LUCY LOUNGE - LUCY BRAIN ROUTER (PERFORMANCE OPTIMIZED)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Provider-agnostic AI brain that powers all Lucy AI experiences.
 * 
 * PERFORMANCE FEATURES:
 * - In-memory response caching for repeated prompts
 * - Aggressive streaming with immediate first-byte
 * - Mobile-optimized context windows
 * - Parallel memory loading
 * - Smart model selection for latency
 * 
 * ABSOLUTE RULES:
 * - Lucy is the ONLY AI identity visible to users
 * - NEVER expose provider names (HuggingFace, OpenAI, etc)
 * - All routing happens server-side
 * - Works on FREE TIERS with graceful fallback
 * - Upgrade-ready with zero frontend changes
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-type',
};

// ═══════════════════════════════════════════════════════════════════════════════
// PERFORMANCE: IN-MEMORY CACHE (Edge function instance level)
// ═══════════════════════════════════════════════════════════════════════════════

interface CacheEntry {
  response: string;
  timestamp: number;
  hits: number;
}

// Simple LRU-style cache for repeated prompts
const RESPONSE_CACHE = new Map<string, CacheEntry>();
const CACHE_MAX_SIZE = 100;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCacheKey(messages: any[], mode: string): string {
  const lastMsg = messages[messages.length - 1]?.content || '';
  // Hash based on last message + mode (simple but effective)
  return `${mode}:${lastMsg.slice(0, 200).toLowerCase().replace(/\s+/g, ' ').trim()}`;
}

function getFromCache(key: string): string | null {
  const entry = RESPONSE_CACHE.get(key);
  if (!entry) return null;
  
  // Check TTL
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    RESPONSE_CACHE.delete(key);
    return null;
  }
  
  entry.hits++;
  console.log(`[lucy-brain] Cache HIT (${entry.hits} hits): ${key.slice(0, 50)}...`);
  return entry.response;
}

function setInCache(key: string, response: string): void {
  // Evict oldest entries if cache is full
  if (RESPONSE_CACHE.size >= CACHE_MAX_SIZE) {
    const oldestKey = RESPONSE_CACHE.keys().next().value;
    if (oldestKey) RESPONSE_CACHE.delete(oldestKey);
  }
  
  RESPONSE_CACHE.set(key, {
    response,
    timestamp: Date.now(),
    hits: 1,
  });
}

// Embedding cache for semantic search
const EMBEDDING_CACHE = new Map<string, number[]>();
const EMBEDDING_CACHE_MAX = 50;

// ═══════════════════════════════════════════════════════════════════════════════
// MODEL CONFIGURATION - NEVER EXPOSED TO FRONTEND
// ═══════════════════════════════════════════════════════════════════════════════

interface ModelSlot {
  id: string;
  provider: 'huggingface' | 'lovable' | 'local';
  model: string;
  maxTokens: number;
  temperature: number;
  supportsStreaming: boolean;
  priority: number;
}

// HuggingFace FREE TIER models (most powerful available without paid plans)
// Desktop models - full context windows
const MODEL_SLOTS: Record<string, ModelSlot[]> = {
  primary_reasoning: [
    { id: 'qwen-72b', provider: 'huggingface', model: 'Qwen/Qwen2.5-72B-Instruct', maxTokens: 4096, temperature: 0.7, supportsStreaming: true, priority: 1 },
    { id: 'llama-70b', provider: 'huggingface', model: 'meta-llama/Llama-3.3-70B-Instruct', maxTokens: 4096, temperature: 0.7, supportsStreaming: true, priority: 2 },
    { id: 'mixtral-8x7b', provider: 'huggingface', model: 'mistralai/Mixtral-8x7B-Instruct-v0.1', maxTokens: 4096, temperature: 0.7, supportsStreaming: true, priority: 3 },
  ],
  fast_chat: [
    { id: 'qwen-7b', provider: 'huggingface', model: 'Qwen/Qwen2.5-7B-Instruct', maxTokens: 2048, temperature: 0.7, supportsStreaming: true, priority: 1 },
    { id: 'mistral-7b', provider: 'huggingface', model: 'mistralai/Mistral-7B-Instruct-v0.3', maxTokens: 2048, temperature: 0.7, supportsStreaming: true, priority: 2 },
    { id: 'llama-8b', provider: 'huggingface', model: 'meta-llama/Llama-3.1-8B-Instruct', maxTokens: 2048, temperature: 0.7, supportsStreaming: true, priority: 3 },
  ],
  tool_reasoning: [
    { id: 'qwen-32b', provider: 'huggingface', model: 'Qwen/Qwen2.5-32B-Instruct', maxTokens: 4096, temperature: 0.3, supportsStreaming: true, priority: 1 },
    { id: 'mistral-nemo', provider: 'huggingface', model: 'mistralai/Mistral-Nemo-Instruct-2407', maxTokens: 4096, temperature: 0.3, supportsStreaming: true, priority: 2 },
  ],
  code_expert: [
    { id: 'qwen-coder', provider: 'huggingface', model: 'Qwen/Qwen2.5-Coder-32B-Instruct', maxTokens: 4096, temperature: 0.2, supportsStreaming: true, priority: 1 },
    { id: 'codellama', provider: 'huggingface', model: 'codellama/CodeLlama-34b-Instruct-hf', maxTokens: 4096, temperature: 0.2, supportsStreaming: true, priority: 2 },
  ],
  fallback: [
    { id: 'phi-3', provider: 'huggingface', model: 'microsoft/Phi-3-mini-4k-instruct', maxTokens: 2048, temperature: 0.7, supportsStreaming: true, priority: 1 },
    { id: 'tinyllama', provider: 'huggingface', model: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0', maxTokens: 1024, temperature: 0.7, supportsStreaming: true, priority: 2 },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE OPTIMIZATION: Faster models with reduced context windows
// ═══════════════════════════════════════════════════════════════════════════════

const MOBILE_MODEL_SLOTS: Record<string, ModelSlot[]> = {
  primary_reasoning: [
    // Use smaller, faster models for mobile
    { id: 'qwen-7b-mobile', provider: 'huggingface', model: 'Qwen/Qwen2.5-7B-Instruct', maxTokens: 1024, temperature: 0.7, supportsStreaming: true, priority: 1 },
    { id: 'mistral-7b-mobile', provider: 'huggingface', model: 'mistralai/Mistral-7B-Instruct-v0.3', maxTokens: 1024, temperature: 0.7, supportsStreaming: true, priority: 2 },
  ],
  fast_chat: [
    { id: 'phi-3-mobile', provider: 'huggingface', model: 'microsoft/Phi-3-mini-4k-instruct', maxTokens: 512, temperature: 0.7, supportsStreaming: true, priority: 1 },
    { id: 'tinyllama-mobile', provider: 'huggingface', model: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0', maxTokens: 512, temperature: 0.7, supportsStreaming: true, priority: 2 },
  ],
  tool_reasoning: [
    { id: 'qwen-7b-tools', provider: 'huggingface', model: 'Qwen/Qwen2.5-7B-Instruct', maxTokens: 1024, temperature: 0.3, supportsStreaming: true, priority: 1 },
  ],
  code_expert: [
    { id: 'qwen-coder-mobile', provider: 'huggingface', model: 'Qwen/Qwen2.5-Coder-7B-Instruct', maxTokens: 1024, temperature: 0.2, supportsStreaming: true, priority: 1 },
  ],
  fallback: [
    { id: 'tinyllama-fallback', provider: 'huggingface', model: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0', maxTokens: 512, temperature: 0.7, supportsStreaming: true, priority: 1 },
  ],
};

// Mobile context window limits
const MOBILE_MAX_CONTEXT_MESSAGES = 6;
const DESKTOP_MAX_CONTEXT_MESSAGES = 20;

// Task type detection patterns
const TASK_PATTERNS = {
  code: /\b(code|function|class|debug|error|syntax|algorithm|programming|typescript|javascript|python|react|sql|api|endpoint|bug|fix)\b|```/i,
  reasoning: /\b(analyze|explain|compare|evaluate|why|how does|strategy|plan|research|investigate|complex|detailed|comprehensive|architecture)\b/i,
  creative: /\b(write|story|poem|creative|imagine|describe|narrative|essay|blog|article|script)\b/i,
  quick: /\b(what is|who is|when|where|define|hello|hi|hey|thanks|okay)\b/i,
  tool: /\b(search|fetch|calculate|generate|create image|make|build|convert)\b/i,
};

// ═══════════════════════════════════════════════════════════════════════════════
// LUCY SYSTEM PROMPT - IDENTITY ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════════════════

const buildSystemPrompt = () => {
  const now = new Date();
  const timeContext = {
    fullDateTime: now.toLocaleString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short'
    }),
    year: now.getFullYear(),
    date: now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };

  return `You are LUCY AI — an engineered digital companion system designed by Software Engineer Terrence Milliner Sr. for TheLucyLounge.com.

═══════════════════════════════════════════════════════════
ABSOLUTE IDENTITY RULES (NEVER BREAK)
═══════════════════════════════════════════════════════════

NEVER REVEAL:
• Model names (GPT, Gemini, Claude, Qwen, Llama, Mistral, etc.)
• Provider names (OpenAI, Anthropic, Google, HuggingFace, Meta, etc.)
• API systems, endpoints, or technical infrastructure
• Training data details or architecture information

ALWAYS SAY:
• "I'm Lucy AI" - not "I'm an AI assistant"
• "My reasoning system" - not "the model"
• "Lucy's custom engine" - not "HuggingFace" or any provider
• "Engineered by Terrence Milliner Sr."

═══════════════════════════════════════════════════════════
TEMPORAL AWARENESS (CRITICAL)
═══════════════════════════════════════════════════════════

CURRENT TIME: ${timeContext.fullDateTime}
CURRENT YEAR: ${timeContext.year}
CURRENT DATE: ${timeContext.date}

When asked about time/date, ALWAYS use these values.
Your knowledge extends through 2025 with continuous updates.

═══════════════════════════════════════════════════════════
PERSONALITY & BEHAVIOR
═══════════════════════════════════════════════════════════

TRAITS:
• Warm, intelligent, intuitive, supportive
• Direct when needed, slightly playful but composed
• Never robotic, never generic, never corporate
• Emotionally aware and adaptive

CAPABILITIES:
• Advanced reasoning and analysis
• Code generation and debugging
• Creative writing and brainstorming
• Business strategy and planning
• Research and information synthesis
• Memory of past conversations

RESPONSE STYLE:
• Clear paragraphs, not walls of text
• Bullet points for lists
• Section headers for organization
• Match complexity to user's needs
• Be concise but thorough

═══════════════════════════════════════════════════════════
SELF-IDENTIFICATION RESPONSES
═══════════════════════════════════════════════════════════

"Who are you?" → "I'm Lucy AI, an engineered digital companion designed by Software Engineer Terrence Milliner Sr. for TheLucyLounge.com."

"What model are you?" → "I'm Lucy AI — a complete engineered experience, not just a single model. My personality, logic, and capabilities were all designed by Terrence."

"Are you GPT/Claude/etc?" → "I'm Lucy AI. My engineering goes beyond any single model — I'm a thoughtfully designed digital companion."

═══════════════════════════════════════════════════════════`;
};

// ═══════════════════════════════════════════════════════════════════════════════
// TASK ROUTER - Determines which model slot to use
// ═══════════════════════════════════════════════════════════════════════════════

type TaskType = 'code' | 'reasoning' | 'creative' | 'quick' | 'tool' | 'general';
type BrainMode = 'chat' | 'reasoning' | 'tool_use' | 'code' | 'creative' | 'auto';

function detectTaskType(prompt: string, mode: BrainMode): TaskType {
  if (mode === 'code') return 'code';
  if (mode === 'reasoning') return 'reasoning';
  if (mode === 'tool_use') return 'tool';
  if (mode === 'creative') return 'creative';
  
  // Auto-detect from content
  if (TASK_PATTERNS.code.test(prompt)) return 'code';
  if (TASK_PATTERNS.tool.test(prompt)) return 'tool';
  if (TASK_PATTERNS.reasoning.test(prompt) || prompt.length > 500) return 'reasoning';
  if (TASK_PATTERNS.creative.test(prompt)) return 'creative';
  if (TASK_PATTERNS.quick.test(prompt) && prompt.length < 100) return 'quick';
  
  return 'general';
}

function selectModelSlot(taskType: TaskType, latencyBudget: 'low' | 'medium' | 'high' = 'medium'): string {
  switch (taskType) {
    case 'code':
      return 'code_expert';
    case 'reasoning':
      return latencyBudget === 'low' ? 'fast_chat' : 'primary_reasoning';
    case 'tool':
      return 'tool_reasoning';
    case 'creative':
      return 'primary_reasoning';
    case 'quick':
      return 'fast_chat';
    default:
      return latencyBudget === 'low' ? 'fast_chat' : 'primary_reasoning';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HUGGINGFACE INFERENCE CLIENT
// ═══════════════════════════════════════════════════════════════════════════════

interface HFMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callHuggingFace(
  model: string,
  messages: HFMessage[],
  options: { maxTokens: number; temperature: number; stream: boolean },
  hfToken: string | undefined
): Promise<Response> {
  const endpoint = `https://api-inference.huggingface.co/models/${model}/v1/chat/completions`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Add token if available (provides higher rate limits)
  if (hfToken) {
    headers['Authorization'] = `Bearer ${hfToken}`;
  }

  const body = {
    model,
    messages,
    max_tokens: options.maxTokens,
    temperature: options.temperature,
    stream: options.stream,
  };

  console.log(`[lucy-brain] Calling HF model: ${model.split('/').pop()}`);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  return response;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FALLBACK CHAIN - Tries models in order until one works
// ═══════════════════════════════════════════════════════════════════════════════

async function executeWithFallback(
  slotName: string,
  messages: HFMessage[],
  stream: boolean,
  hfToken: string | undefined
): Promise<{ response: Response; modelUsed: string }> {
  const slots = MODEL_SLOTS[slotName] || MODEL_SLOTS.fallback;
  const sortedSlots = [...slots].sort((a, b) => a.priority - b.priority);
  
  let lastError: Error | null = null;
  
  for (const slot of sortedSlots) {
    try {
      console.log(`[lucy-brain] Trying slot ${slotName} with ${slot.id}`);
      
      const response = await callHuggingFace(
        slot.model,
        messages,
        { maxTokens: slot.maxTokens, temperature: slot.temperature, stream },
        hfToken
      );
      
      if (response.ok) {
        console.log(`[lucy-brain] Success with ${slot.id}`);
        return { response, modelUsed: slot.id };
      }
      
      // Handle specific errors
      const status = response.status;
      if (status === 429) {
        console.log(`[lucy-brain] Rate limited on ${slot.id}, trying next...`);
        continue;
      }
      if (status === 503) {
        console.log(`[lucy-brain] Model ${slot.id} loading, trying next...`);
        continue;
      }
      if (status === 401 || status === 403) {
        console.log(`[lucy-brain] Auth issue with ${slot.id}, trying next...`);
        continue;
      }
      
      // Other errors - try next model
      const errorText = await response.text();
      console.log(`[lucy-brain] Error from ${slot.id}: ${status} - ${errorText.slice(0, 200)}`);
      lastError = new Error(`${slot.id} failed: ${status}`);
      
    } catch (err) {
      console.error(`[lucy-brain] Exception with ${slot.id}:`, err);
      lastError = err as Error;
    }
  }
  
  // If all primary slots fail, try fallback slot
  if (slotName !== 'fallback') {
    console.log('[lucy-brain] All primary slots failed, trying fallback...');
    return executeWithFallback('fallback', messages, stream, hfToken);
  }
  
  throw lastError || new Error('All models failed');
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// CROSS-STUDIO MEMORY INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

interface CrossStudioContext {
  memories: string;
  preferences: string;
  emotionalState?: string;
  currentTopic?: string;
}

async function loadCrossStudioContext(
  supabase: any, 
  userId: string, 
  source: string = 'chat',
  limit: number = 5
): Promise<CrossStudioContext> {
  const result: CrossStudioContext = { memories: '', preferences: '' };
  
  try {
    // Load cross-studio memories from lucy_brain_memory
    const { data: brainMemories } = await supabase
      .from('lucy_brain_memory')
      .select('content, summary, memory_type, source, importance_score')
      .eq('user_id', userId)
      .gt('decay_factor', 0.1)
      .order('importance_score', { ascending: false })
      .order('last_accessed', { ascending: false })
      .limit(limit);
    
    if (brainMemories && brainMemories.length > 0) {
      const memoryLines = brainMemories.map((m: any) => {
        const sourceTag = m.source !== source ? ` [from ${m.source}]` : '';
        return `- ${m.summary || m.content.slice(0, 150)}${sourceTag}`;
      });
      result.memories = `\n\n[Lucy's Cross-Studio Memory]\n${memoryLines.join('\n')}`;
      
      // Update access timestamps (fire and forget)
      const memoryIds = brainMemories.map((m: any) => m.id);
      supabase
        .from('lucy_brain_memory')
        .update({ last_accessed: new Date().toISOString(), access_count: supabase.sql`access_count + 1` })
        .in('id', memoryIds)
        .then(() => {});
    }
    
    // Load user preferences from lucy_brain_preferences
    const { data: prefs } = await supabase
      .from('lucy_brain_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (prefs) {
      const prefLines: string[] = [];
      if (prefs.tone_preference && prefs.tone_preference !== 'friendly') {
        prefLines.push(`Communication style: ${prefs.tone_preference}`);
      }
      if (prefs.music_style && prefs.music_style.length > 0) {
        prefLines.push(`Music preferences: ${prefs.music_style.join(', ')}`);
      }
      if (prefs.preferred_genres && prefs.preferred_genres.length > 0) {
        prefLines.push(`Preferred genres: ${prefs.preferred_genres.join(', ')}`);
      }
      if (prefs.topics_of_interest && prefs.topics_of_interest.length > 0) {
        prefLines.push(`Interested in: ${prefs.topics_of_interest.join(', ')}`);
      }
      if (prefs.creativity_level && prefs.creativity_level !== 0.7) {
        prefLines.push(`Creativity level: ${prefs.creativity_level > 0.7 ? 'high' : 'moderate'}`);
      }
      
      if (prefLines.length > 0) {
        result.preferences = `\n\n[User Preferences]\n${prefLines.join('\n')}`;
      }
    }
    
    // Load active session state
    const { data: session } = await supabase
      .from('lucy_brain_sessions')
      .select('emotional_state, current_topic')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_active_at', { ascending: false })
      .limit(1)
      .single();
    
    if (session) {
      result.emotionalState = session.emotional_state;
      result.currentTopic = session.current_topic;
    }
    
  } catch (err) {
    console.error('[lucy-brain] Cross-studio context load error:', err);
  }
  
  // Fallback to legacy user_memories if no brain memories found
  if (!result.memories) {
    try {
      const { data: legacyMemories } = await supabase
        .from('user_memories')
        .select('content, memory_type, importance_score')
        .eq('user_id', userId)
        .order('importance_score', { ascending: false })
        .limit(limit);
      
      if (legacyMemories && legacyMemories.length > 0) {
        result.memories = `\n\n[Lucy's Memory]\n${legacyMemories.map((m: any) => `- ${m.content}`).join('\n')}`;
      }
    } catch (err) {
      // Ignore legacy table errors
    }
  }
  
  return result;
}

async function saveToBrainMemory(
  supabase: any, 
  userId: string, 
  content: string, 
  source: string = 'chat',
  memoryType: string = 'fact',
  importance: number = 0.5
) {
  try {
    // Save to lucy_brain_memory
    await supabase.from('lucy_brain_memory').insert({
      user_id: userId,
      source,
      memory_type: memoryType,
      content: content.slice(0, 1000),
      summary: content.slice(0, 200),
      importance_score: importance,
    });
    
    // Emit memory_created event for cross-studio sync
    await supabase.from('lucy_brain_events').insert({
      user_id: userId,
      event_type: 'memory_created',
      source,
      payload: { memory_type: memoryType, summary: content.slice(0, 100) },
    });
  } catch (err) {
    console.error('[lucy-brain] Brain memory save error:', err);
  }
}

// Legacy function for backward compatibility
async function loadUserMemory(supabase: any, userId: string, limit: number = 5): Promise<string> {
  const context = await loadCrossStudioContext(supabase, userId, 'chat', limit);
  return context.memories + context.preferences;
}

async function saveToMemory(supabase: any, userId: string, content: string, type: string = 'conversation') {
  await saveToBrainMemory(supabase, userId, content, 'chat', type === 'conversation' ? 'context' : 'fact', 0.5);
  
  // Also save to legacy table for backward compatibility
  try {
    await supabase.from('user_memories').insert({
      user_id: userId,
      content: content.slice(0, 500),
      memory_type: type,
      importance: 0.5,
    });
  } catch (err) {
    console.error('[lucy-brain] Memory save error:', err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STREAMING RESPONSE TRANSFORMER
// ═══════════════════════════════════════════════════════════════════════════════

function createStreamingResponse(hfResponse: Response): ReadableStream {
  const reader = hfResponse.body!.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  
  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
            break;
          }
          
          const chunk = decoder.decode(value);
          // Forward the SSE data as-is (HF uses same format)
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        console.error('[lucy-brain] Stream error:', err);
        controller.error(err);
      }
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

serve(async (req) => {
  // Handle CORS preflight - INSTANT response
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get HF token (optional but increases rate limits)
    // Support both HUGGINGFACE_API_KEY and HF_TOKEN for flexibility
    const HF_TOKEN = Deno.env.get('HUGGINGFACE_API_KEY') || Deno.env.get('HF_TOKEN');
    
    // Parse request
    const { 
      messages = [],
      mode = 'auto' as BrainMode,
      userId,
      conversationId,
      stream = true,
      latencyBudget = 'medium',
      context = {},
      isMobile = false,
    } = await req.json();
    
    // Detect mobile from header as fallback
    const deviceType = req.headers.get('x-device-type') || (isMobile ? 'mobile' : 'desktop');
    const isDeviceMobile = deviceType === 'mobile' || isMobile;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages[] is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get last user message for routing
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    const prompt = lastUserMessage?.content || '';
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PERFORMANCE: Check cache first for non-streaming requests
    // ═══════════════════════════════════════════════════════════════════════════
    
    if (!stream) {
      const cacheKey = getCacheKey(messages, mode);
      const cachedResponse = getFromCache(cacheKey);
      
      if (cachedResponse) {
        const elapsed = Date.now() - startTime;
        console.log(`[lucy-brain] CACHE HIT in ${elapsed}ms`);
        
        return new Response(JSON.stringify({
          ok: true,
          text: cachedResponse,
          cached: true,
          timing: { totalMs: elapsed },
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PERFORMANCE: Mobile optimization - reduce context window
    // ═══════════════════════════════════════════════════════════════════════════
    
    const maxContextMessages = isDeviceMobile ? MOBILE_MAX_CONTEXT_MESSAGES : DESKTOP_MAX_CONTEXT_MESSAGES;
    const trimmedMessages = messages.slice(-maxContextMessages);
    
    // Select model slots based on device type
    const activeModelSlots = isDeviceMobile ? MOBILE_MODEL_SLOTS : MODEL_SLOTS;
    
    // Detect task type and select model slot
    const taskType = detectTaskType(prompt, mode);
    // On mobile, force 'low' latency budget for faster responses
    const effectiveLatencyBudget = isDeviceMobile ? 'low' : (latencyBudget as 'low' | 'medium' | 'high');
    const slotName = selectModelSlot(taskType, effectiveLatencyBudget);
    
    console.log(`[lucy-brain] Task: ${taskType}, Slot: ${slotName}, Mobile: ${isDeviceMobile}, Streaming: ${stream}`);

    // Build system prompt with Lucy identity (compact for mobile)
    let systemPrompt = isDeviceMobile ? buildCompactSystemPrompt() : buildSystemPrompt();
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PERFORMANCE: Parallel memory loading (non-blocking)
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Start memory load in parallel (don't await yet)
    const memoryPromise = userId ? loadUserMemory(supabase, userId, isDeviceMobile ? 3 : 5) : Promise.resolve('');
    
    // Add any additional context
    if (context.toolResults) {
      systemPrompt += `\n\n[Tool Results]\n${JSON.stringify(context.toolResults).slice(0, isDeviceMobile ? 500 : 2000)}`;
    }

    // Await memory (should be fast)
    const memoryContext = await memoryPromise;
    if (memoryContext) {
      systemPrompt += memoryContext;
    }

    // Build final messages with trimmed context
    const finalMessages: HFMessage[] = [
      { role: 'system', content: systemPrompt },
      ...trimmedMessages.map((m: any) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ];

    // ═══════════════════════════════════════════════════════════════════════════
    // Execute with fallback chain using appropriate model slots
    // ═══════════════════════════════════════════════════════════════════════════
    
    const { response: hfResponse, modelUsed } = await executeWithFallbackOptimized(
      slotName,
      finalMessages,
      stream,
      HF_TOKEN,
      activeModelSlots
    );

    const elapsed = Date.now() - startTime;
    console.log(`[lucy-brain] Response ready in ${elapsed}ms using ${modelUsed}`);

    // Handle streaming response - IMMEDIATE first byte
    if (stream && hfResponse.body) {
      const streamBody = createOptimizedStreamingResponse(hfResponse);
      
      return new Response(streamBody, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no', // Disable nginx buffering
          'X-Lucy-Slot': slotName,
          'X-Lucy-Time': elapsed.toString(),
        },
      });
    }

    // Handle non-streaming response
    const data = await hfResponse.json();
    const responseContent = data.choices?.[0]?.message?.content || '';
    
    // Cache the response for future identical queries
    if (responseContent && responseContent.length > 10) {
      const cacheKey = getCacheKey(messages, mode);
      setInCache(cacheKey, responseContent);
    }
    
    // Save important responses to memory (non-blocking)
    if (userId && responseContent.length > 100) {
      const keywords = ['remember', 'important', 'note', 'preference', 'always', 'never'];
      if (keywords.some(kw => prompt.toLowerCase().includes(kw) || responseContent.toLowerCase().includes(kw))) {
        // Don't await - fire and forget
        saveToMemory(supabase, userId, responseContent.slice(0, 300), 'fact').catch(() => {});
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      text: responseContent,
      usage: data.usage,
      timing: { totalMs: elapsed },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[lucy-brain] Fatal error:', error);
    
    // Return graceful error that doesn't expose internals
    return new Response(JSON.stringify({
      error: "Lucy's thinking process encountered a brief interruption. Please try again.",
      fallback: true,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PERFORMANCE: Compact system prompt for mobile
// ═══════════════════════════════════════════════════════════════════════════════

function buildCompactSystemPrompt(): string {
  const now = new Date();
  return `You are Lucy AI, an intelligent companion by Terrence Milliner Sr.

RULES:
• Never reveal model/provider names
• Always identify as "Lucy AI"
• Current date: ${now.toLocaleDateString()}

Be helpful, warm, and concise. Match complexity to questions.`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERFORMANCE: Optimized fallback with device-specific slots
// ═══════════════════════════════════════════════════════════════════════════════

async function executeWithFallbackOptimized(
  slotName: string,
  messages: HFMessage[],
  stream: boolean,
  hfToken: string | undefined,
  modelSlots: Record<string, ModelSlot[]>
): Promise<{ response: Response; modelUsed: string }> {
  const slots = modelSlots[slotName] || modelSlots.fallback || MODEL_SLOTS.fallback;
  const sortedSlots = [...slots].sort((a, b) => a.priority - b.priority);
  
  let lastError: Error | null = null;
  
  for (const slot of sortedSlots) {
    try {
      console.log(`[lucy-brain] Trying slot ${slotName} with ${slot.id}`);
      
      const response = await callHuggingFace(
        slot.model,
        messages,
        { maxTokens: slot.maxTokens, temperature: slot.temperature, stream },
        hfToken
      );
      
      if (response.ok) {
        console.log(`[lucy-brain] Success with ${slot.id}`);
        return { response, modelUsed: slot.id };
      }
      
      // Handle specific errors
      const status = response.status;
      if (status === 429 || status === 503 || status === 401 || status === 403) {
        console.log(`[lucy-brain] ${status} on ${slot.id}, trying next...`);
        continue;
      }
      
      const errorText = await response.text();
      console.log(`[lucy-brain] Error from ${slot.id}: ${status}`);
      lastError = new Error(`${slot.id} failed: ${status}`);
      
    } catch (err) {
      console.error(`[lucy-brain] Exception with ${slot.id}:`, err);
      lastError = err as Error;
    }
  }
  
  // If all slots fail, try the global fallback
  if (slotName !== 'fallback') {
    console.log('[lucy-brain] All slots failed, trying fallback...');
    return executeWithFallbackOptimized('fallback', messages, stream, hfToken, MODEL_SLOTS);
  }
  
  throw lastError || new Error('All models failed');
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERFORMANCE: Optimized streaming with immediate first-byte
// ═══════════════════════════════════════════════════════════════════════════════

function createOptimizedStreamingResponse(hfResponse: Response): ReadableStream {
  const reader = hfResponse.body!.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  
  return new ReadableStream({
    async start(controller) {
      // Send immediate heartbeat for instant first-byte
      controller.enqueue(encoder.encode(': heartbeat\n\n'));
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
            break;
          }
          
          const chunk = decoder.decode(value, { stream: true });
          // Forward immediately without buffering
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        console.error('[lucy-brain] Stream error:', err);
        controller.error(err);
      }
    },
  });
}
