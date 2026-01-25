/**
 * THE LUCY LOUNGE - LLM ROUTER
 * 
 * Client-side intelligent model routing that selects the optimal
 * LLM based on task complexity, latency requirements, and cost.
 * 
 * MODELS SUPPORTED:
 * - Qwen2.5-72B-Instruct (reasoning, complex tasks)
 * - Llama-3.1-70B-Instruct (general purpose)
 * - DeepSeek-R1 (deep reasoning, chain-of-thought)
 * - Gemini 2.5 Flash (fast responses, simple tasks)
 * 
 * All inference happens server-side via Supabase Edge Functions.
 * This module handles routing decisions and client-side orchestration.
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type LLMProvider = 'huggingface' | 'lovable' | 'deepseek' | 'local';

export type LLMModel = 
  | 'qwen-72b'
  | 'llama-70b'
  | 'deepseek-r1'
  | 'gemini-flash'
  | 'gemini-pro'
  | 'gpt-5-mini'
  | 'local-mistral';

export type TaskComplexity = 'simple' | 'moderate' | 'complex' | 'reasoning';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRoutingDecision {
  model: LLMModel;
  provider: LLMProvider;
  confidence: number;
  reasoning: string;
  estimatedLatencyMs: number;
  fallbackModel?: LLMModel;
}

export interface LLMRequest {
  messages: LLMMessage[];
  system?: string;
  maxTokens?: number;
  temperature?: number;
  mode?: 'auto' | 'fast' | 'powerful' | 'reasoning';
  preferredModel?: LLMModel;
  stream?: boolean;
}

export interface LLMResponse {
  ok: boolean;
  text: string;
  model: LLMModel;
  provider: LLMProvider;
  latencyMs: number;
  tokensUsed?: number;
  fallbackUsed?: boolean;
}

// ============================================================================
// MODEL REGISTRY
// ============================================================================

const MODEL_REGISTRY: Record<LLMModel, {
  provider: LLMProvider;
  endpoint: string;
  maxTokens: number;
  latencyMs: number;
  capabilities: TaskComplexity[];
  costTier: 'free' | 'low' | 'medium' | 'high';
}> = {
  'qwen-72b': {
    provider: 'huggingface',
    endpoint: 'hf-chat',
    maxTokens: 8192,
    latencyMs: 3000,
    capabilities: ['simple', 'moderate', 'complex', 'reasoning'],
    costTier: 'medium',
  },
  'llama-70b': {
    provider: 'huggingface',
    endpoint: 'hf-chat',
    maxTokens: 8192,
    latencyMs: 2500,
    capabilities: ['simple', 'moderate', 'complex'],
    costTier: 'medium',
  },
  'deepseek-r1': {
    provider: 'deepseek',
    endpoint: 'reasoning-engine',
    maxTokens: 16384,
    latencyMs: 5000,
    capabilities: ['complex', 'reasoning'],
    costTier: 'high',
  },
  'gemini-flash': {
    provider: 'lovable',
    endpoint: 'lucy-router',
    maxTokens: 8192,
    latencyMs: 800,
    capabilities: ['simple', 'moderate'],
    costTier: 'low',
  },
  'gemini-pro': {
    provider: 'lovable',
    endpoint: 'lucy-router',
    maxTokens: 32768,
    latencyMs: 1500,
    capabilities: ['simple', 'moderate', 'complex', 'reasoning'],
    costTier: 'medium',
  },
  'gpt-5-mini': {
    provider: 'lovable',
    endpoint: 'lucy-router',
    maxTokens: 16384,
    latencyMs: 1200,
    capabilities: ['simple', 'moderate', 'complex'],
    costTier: 'medium',
  },
  'local-mistral': {
    provider: 'local',
    endpoint: 'local-inference',
    maxTokens: 4096,
    latencyMs: 500,
    capabilities: ['simple'],
    costTier: 'free',
  },
};

// ============================================================================
// COMPLEXITY DETECTION
// ============================================================================

const COMPLEXITY_PATTERNS: Record<TaskComplexity, RegExp[]> = {
  reasoning: [
    /\b(prove|derive|deduce|infer|reason|logic|theorem|hypothesis)\b/i,
    /\b(step.?by.?step|chain.?of.?thought|show.?your.?work|explain.?how)\b/i,
    /\b(mathematical|scientific|philosophical|analytical)\b/i,
    /\b(why|how come|what causes|what if)\b.*\?/i,
  ],
  complex: [
    /\b(analyze|synthesize|evaluate|compare|contrast|research)\b/i,
    /\b(code|program|implement|build|create|develop)\b.*(system|application|api|service)/i,
    /\b(strategy|plan|architecture|design|blueprint)\b/i,
    /\b(multiple|several|various|comprehensive|thorough)\b/i,
  ],
  moderate: [
    /\b(explain|describe|summarize|outline|define)\b/i,
    /\b(write|draft|compose|create)\b.*(email|letter|message|post)/i,
    /\b(help|assist|guide|show)\b.*(me|us)/i,
  ],
  simple: [
    /^(hi|hello|hey|what|who|when|where)\b/i,
    /\b(yes|no|thanks|okay)\b/i,
    /\?$/,
  ],
};

/**
 * Analyze message complexity to determine optimal model
 */
function analyzeComplexity(messages: LLMMessage[]): TaskComplexity {
  const lastUserMessage = messages
    .filter(m => m.role === 'user')
    .pop()?.content ?? '';

  // Check patterns in order of complexity (highest first)
  for (const complexity of ['reasoning', 'complex', 'moderate', 'simple'] as TaskComplexity[]) {
    const patterns = COMPLEXITY_PATTERNS[complexity];
    if (patterns.some(p => p.test(lastUserMessage))) {
      return complexity;
    }
  }

  // Default based on message length
  if (lastUserMessage.length > 500) return 'complex';
  if (lastUserMessage.length > 200) return 'moderate';
  return 'simple';
}

// ============================================================================
// ROUTING LOGIC
// ============================================================================

/**
 * Select optimal model based on request characteristics
 */
export function routeToModel(request: LLMRequest): LLMRoutingDecision {
  const { messages, mode = 'auto', preferredModel } = request;

  // If user explicitly requested a model, use it
  if (preferredModel && MODEL_REGISTRY[preferredModel]) {
    const info = MODEL_REGISTRY[preferredModel];
    return {
      model: preferredModel,
      provider: info.provider,
      confidence: 1.0,
      reasoning: 'User-selected model',
      estimatedLatencyMs: info.latencyMs,
    };
  }

  // Mode-based routing
  if (mode === 'fast') {
    return {
      model: 'gemini-flash',
      provider: 'lovable',
      confidence: 0.95,
      reasoning: 'Fast mode selected - using lowest latency model',
      estimatedLatencyMs: 800,
      fallbackModel: 'gpt-5-mini',
    };
  }

  if (mode === 'powerful') {
    return {
      model: 'gemini-pro',
      provider: 'lovable',
      confidence: 0.95,
      reasoning: 'Powerful mode selected - using highest capability model',
      estimatedLatencyMs: 1500,
      fallbackModel: 'qwen-72b',
    };
  }

  if (mode === 'reasoning') {
    return {
      model: 'deepseek-r1',
      provider: 'deepseek',
      confidence: 0.95,
      reasoning: 'Reasoning mode selected - using chain-of-thought model',
      estimatedLatencyMs: 5000,
      fallbackModel: 'gemini-pro',
    };
  }

  // Auto mode: analyze complexity
  const complexity = analyzeComplexity(messages);

  switch (complexity) {
    case 'reasoning':
      return {
        model: 'deepseek-r1',
        provider: 'deepseek',
        confidence: 0.85,
        reasoning: 'Complex reasoning task detected - using DeepSeek R1',
        estimatedLatencyMs: 5000,
        fallbackModel: 'gemini-pro',
      };

    case 'complex':
      return {
        model: 'gemini-pro',
        provider: 'lovable',
        confidence: 0.88,
        reasoning: 'Complex task detected - using Gemini Pro',
        estimatedLatencyMs: 1500,
        fallbackModel: 'qwen-72b',
      };

    case 'moderate':
      return {
        model: 'gpt-5-mini',
        provider: 'lovable',
        confidence: 0.90,
        reasoning: 'Moderate complexity - using GPT-5 Mini for balance',
        estimatedLatencyMs: 1200,
        fallbackModel: 'gemini-flash',
      };

    case 'simple':
    default:
      return {
        model: 'gemini-flash',
        provider: 'lovable',
        confidence: 0.92,
        reasoning: 'Simple task - using fastest model',
        estimatedLatencyMs: 800,
        fallbackModel: 'gpt-5-mini',
      };
  }
}

// ============================================================================
// LLM CLIENT
// ============================================================================

/**
 * Send request to LLM via appropriate edge function
 */
export async function chat(request: LLMRequest): Promise<LLMResponse> {
  const startTime = Date.now();
  const routing = routeToModel(request);
  const modelInfo = MODEL_REGISTRY[routing.model];

  console.log('[LLM Router] Routing decision:', routing);

  try {
    const { data, error } = await supabase.functions.invoke(modelInfo.endpoint, {
      body: {
        messages: request.messages,
        system: request.system,
        maxTokens: request.maxTokens ?? modelInfo.maxTokens,
        temperature: request.temperature ?? 0.7,
        model: routing.model,
      },
    });

    if (error) throw error;

    return {
      ok: true,
      text: data?.text ?? '',
      model: routing.model,
      provider: routing.provider,
      latencyMs: Date.now() - startTime,
      tokensUsed: data?.tokensUsed,
      fallbackUsed: false,
    };

  } catch (primaryError) {
    console.warn('[LLM Router] Primary model failed, trying fallback:', primaryError);

    // Try fallback if available
    if (routing.fallbackModel) {
      const fallbackInfo = MODEL_REGISTRY[routing.fallbackModel];
      
      try {
        const { data, error } = await supabase.functions.invoke(fallbackInfo.endpoint, {
          body: {
            messages: request.messages,
            system: request.system,
            maxTokens: request.maxTokens ?? fallbackInfo.maxTokens,
            temperature: request.temperature ?? 0.7,
            model: routing.fallbackModel,
          },
        });

        if (error) throw error;

        return {
          ok: true,
          text: data?.text ?? '',
          model: routing.fallbackModel,
          provider: fallbackInfo.provider,
          latencyMs: Date.now() - startTime,
          tokensUsed: data?.tokensUsed,
          fallbackUsed: true,
        };

      } catch (fallbackError) {
        console.error('[LLM Router] Fallback also failed:', fallbackError);
      }
    }

    return {
      ok: false,
      text: 'Lucy is experiencing a temporary issue. Please try again.',
      model: routing.model,
      provider: routing.provider,
      latencyMs: Date.now() - startTime,
      fallbackUsed: !!routing.fallbackModel,
    };
  }
}

/**
 * Stream response from LLM (where supported)
 */
export async function* streamChat(request: LLMRequest): AsyncGenerator<string> {
  // For now, fall back to non-streaming
  // Streaming support will be added per-provider
  const response = await chat(request);
  
  if (response.ok) {
    // Simulate streaming by yielding chunks
    const words = response.text.split(' ');
    for (const word of words) {
      yield word + ' ';
      await new Promise(r => setTimeout(r, 30));
    }
  } else {
    yield response.text;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get available models for UI display
 */
export function getAvailableModels(): { model: LLMModel; label: string; description: string }[] {
  return [
    { model: 'gemini-flash', label: 'Gemini Flash', description: 'Fast responses for simple tasks' },
    { model: 'gpt-5-mini', label: 'GPT-5 Mini', description: 'Balanced speed and capability' },
    { model: 'gemini-pro', label: 'Gemini Pro', description: 'Powerful reasoning and analysis' },
    { model: 'qwen-72b', label: 'Qwen 72B', description: 'Open-source powerhouse' },
    { model: 'llama-70b', label: 'Llama 70B', description: 'Meta\'s flagship model' },
    { model: 'deepseek-r1', label: 'DeepSeek R1', description: 'Deep chain-of-thought reasoning' },
  ];
}

/**
 * Check if a specific model is available
 */
export function isModelAvailable(model: LLMModel): boolean {
  return model in MODEL_REGISTRY;
}

/**
 * Get estimated cost tier for a model
 */
export function getModelCostTier(model: LLMModel): string {
  return MODEL_REGISTRY[model]?.costTier ?? 'unknown';
}

// Export singleton instance
export const llmRouter = {
  chat,
  streamChat,
  routeToModel,
  getAvailableModels,
  isModelAvailable,
  getModelCostTier,
  analyzeComplexity,
};

export default llmRouter;
