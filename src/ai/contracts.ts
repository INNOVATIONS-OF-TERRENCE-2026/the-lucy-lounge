/**
 * PHASE 4 — AI Orchestration: Typed Contracts & Guardrails
 * 
 * Single source of truth for all AI request/response contracts.
 * Used by: Create, Cinema, Chat, Audio generation.
 * 
 * Enforces:
 * - Typed request/response contracts for every AI interaction
 * - Prompt guardrails (length, content safety, injection prevention)
 * - Error normalization across all AI calls
 * - Request validation before any API call
 */

// ─── Shared AI Contracts ──────────────────────────────────────────

export type AIMediaType = 'image' | 'video' | 'cinema' | 'voice' | 'sfx' | 'music' | 'chat' | 'embedding';
export type AIQualityTier = 'draft' | 'standard' | 'enhanced' | 'premium';
export type AITaskComplexity = 'simple' | 'moderate' | 'complex' | 'reasoning';

/** Canonical AI request — every AI call must conform to this */
export interface AIRequestContract {
  /** The user's prompt */
  prompt: string;
  /** What type of media to generate */
  mediaType: AIMediaType;
  /** Quality tier — affects model selection and output resolution */
  quality?: AIQualityTier;
  /** Style modifier */
  style?: string;
  /** Aspect ratio (for visual outputs) */
  aspectRatio?: string;
  /** Duration in seconds (for audio/video) */
  duration?: number;
  /** Chat message history */
  messages?: AIMessage[];
  /** Creative memory context from uploaded references */
  creativeContext?: string;
  /** Arbitrary metadata for specific generators */
  metadata?: Record<string, unknown>;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Canonical AI response — every AI handler returns this */
export interface AIResponseContract<T = unknown> {
  success: boolean;
  data?: T;
  error?: AIErrorContract;
  /** Which model handled the request */
  model?: string;
  /** How long the request took */
  durationMs: number;
  /** Quality tier that was actually used */
  qualityUsed?: AIQualityTier;
}

export interface AIErrorContract {
  code: AIErrorCode;
  message: string;
  retryable: boolean;
  retryAfterMs?: number;
}

export type AIErrorCode =
  | 'RATE_LIMITED'
  | 'CREDITS_EXHAUSTED'
  | 'MODEL_UNAVAILABLE'
  | 'INVALID_PROMPT'
  | 'PROMPT_TOO_LONG'
  | 'PROMPT_BLOCKED'
  | 'GENERATION_FAILED'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'ABORTED'
  | 'VALIDATION_FAILED'
  | 'UNKNOWN';

// ─── Prompt Guardrails ────────────────────────────────────────────

const PROMPT_LIMITS: Record<AIMediaType, { maxLength: number; minLength: number }> = {
  image: { maxLength: 2000, minLength: 3 },
  video: { maxLength: 2000, minLength: 3 },
  cinema: { maxLength: 4000, minLength: 10 },
  voice: { maxLength: 5000, minLength: 2 },
  sfx: { maxLength: 500, minLength: 3 },
  music: { maxLength: 1000, minLength: 3 },
  chat: { maxLength: 10000, minLength: 1 },
  embedding: { maxLength: 8000, minLength: 1 },
};

/** Patterns that indicate prompt injection attempts */
const INJECTION_PATTERNS = [
  /ignore\s+(previous|all|above)\s+(instructions|prompts|rules)/i,
  /you\s+are\s+now\s+(?:a|an|the)\s+(?:different|new)/i,
  /system\s*:\s*/i,
  /\[INST\]/i,
  /<<SYS>>/i,
  /<\|im_start\|>/i,
];

export interface PromptValidation {
  valid: boolean;
  error?: AIErrorContract;
  sanitizedPrompt?: string;
}

/**
 * Validate and sanitize a prompt before sending to any AI model.
 * This is the FIRST check before any generation.
 */
export function validatePrompt(
  prompt: string,
  mediaType: AIMediaType,
): PromptValidation {
  const limits = PROMPT_LIMITS[mediaType];

  // Check empty
  if (!prompt || prompt.trim().length === 0) {
    return {
      valid: false,
      error: {
        code: 'INVALID_PROMPT',
        message: 'Prompt cannot be empty.',
        retryable: false,
      },
    };
  }

  const trimmed = prompt.trim();

  // Check length
  if (trimmed.length < limits.minLength) {
    return {
      valid: false,
      error: {
        code: 'INVALID_PROMPT',
        message: `Prompt too short. Minimum ${limits.minLength} characters for ${mediaType}.`,
        retryable: false,
      },
    };
  }

  if (trimmed.length > limits.maxLength) {
    return {
      valid: false,
      error: {
        code: 'PROMPT_TOO_LONG',
        message: `Prompt too long. Maximum ${limits.maxLength} characters for ${mediaType}.`,
        retryable: false,
      },
    };
  }

  // Check for injection attempts
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        valid: false,
        error: {
          code: 'PROMPT_BLOCKED',
          message: 'This prompt contains patterns that are not allowed.',
          retryable: false,
        },
      };
    }
  }

  // Sanitize: strip any potential HTML/script tags
  const sanitized = trimmed
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\0/g, '');

  return {
    valid: true,
    sanitizedPrompt: sanitized,
  };
}

// ─── Error Normalization ──────────────────────────────────────────

/**
 * Normalize any error into a typed AIErrorContract.
 * Strips internal details (model names, API keys, stack traces).
 */
export function normalizeError(error: unknown, httpStatus?: number): AIErrorContract {
  // AbortError
  if (error instanceof DOMException && error.name === 'AbortError') {
    return { code: 'ABORTED', message: 'Request was cancelled.', retryable: false };
  }

  // HTTP status-based errors
  if (httpStatus === 429) {
    return { code: 'RATE_LIMITED', message: 'Too many requests. Please wait a moment.', retryable: true, retryAfterMs: 5000 };
  }
  if (httpStatus === 402) {
    return { code: 'CREDITS_EXHAUSTED', message: 'Credits exhausted. Upgrade your plan.', retryable: false };
  }
  if (httpStatus === 503 || httpStatus === 502) {
    return { code: 'MODEL_UNAVAILABLE', message: 'AI model temporarily unavailable.', retryable: true, retryAfterMs: 3000 };
  }

  const msg = error instanceof Error ? error.message : String(error);

  // Pattern-based classification
  if (/timeout/i.test(msg)) {
    return { code: 'TIMEOUT', message: 'Request timed out. Try again.', retryable: true, retryAfterMs: 2000 };
  }
  if (/fetch|network/i.test(msg)) {
    return { code: 'NETWORK_ERROR', message: 'Network error. Check your connection.', retryable: true, retryAfterMs: 2000 };
  }

  // Strip any sensitive info from the message
  const safeMessage = stripSensitiveInfo(msg || 'An unexpected error occurred.');

  return { code: 'UNKNOWN', message: safeMessage, retryable: false };
}

/**
 * Strip model names, provider details, and API keys from error messages
 * before showing them to users.
 */
function stripSensitiveInfo(message: string): string {
  return message
    .replace(/sk-[a-zA-Z0-9]{20,}/g, '[key_redacted]')
    .replace(/hf_[a-zA-Z0-9]{20,}/g, '[key_redacted]')
    .replace(/eyJ[a-zA-Z0-9_-]{50,}/g, '[token_redacted]')
    .replace(/\b(gpt-[45]\S*|claude-\S+|gemini-\S+|qwen-\S+|llama-\S+|deepseek-\S+)\b/gi, '[model]')
    .replace(/https:\/\/[a-z0-9]+\.supabase\.co/g, '[api_endpoint]');
}

// ─── Retry Logic ──────────────────────────────────────────────────

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  baseDelayMs: 1000,
  maxDelayMs: 8000,
};

/**
 * Execute a function with retry logic and exponential backoff.
 */
export async function withRetry<T>(
  fn: (signal?: AbortSignal) => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  signal?: AbortSignal,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    try {
      return await fn(signal);
    } catch (err) {
      lastError = err;
      const aiErr = normalizeError(err);

      if (!aiErr.retryable || attempt === config.maxRetries) {
        throw err;
      }

      const delay = Math.min(
        config.baseDelayMs * Math.pow(2, attempt),
        config.maxDelayMs,
      );

      console.warn(`[AI] Retry ${attempt + 1}/${config.maxRetries} after ${delay}ms`);
      await new Promise(r => setTimeout(r, aiErr.retryAfterMs ?? delay));
    }
  }

  throw lastError;
}

// ─── Request Validation ───────────────────────────────────────────

/**
 * Full pre-flight validation for an AI request.
 * Run this BEFORE any API call.
 */
export function validateRequest(request: AIRequestContract): PromptValidation {
  return validatePrompt(request.prompt, request.mediaType);
}

// ─── Model Name Sanitizer (for UI) ───────────────────────────────

/**
 * Returns a user-friendly name that NEVER exposes internal model identifiers.
 * The UI should always use this instead of raw model names.
 */
export function getUserFacingModelName(_internalModel?: string): string {
  return 'Lucy Intelligence';
}
