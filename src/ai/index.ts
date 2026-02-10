/**
 * THE LUCY LOUNGE - AI MODULE INDEX
 * 
 * Central export for all AI capabilities.
 * Import from @/ai for access to:
 * - LLM routing and chat
 * - Agent orchestration
 * - Embedding and semantic search
 */

// LLM Router - Intelligent model selection and chat
export {
  llmRouter,
  chat,
  streamChat,
  routeToModel,
  getAvailableModels,
  isModelAvailable,
  getModelCostTier,
  type LLMProvider,
  type LLMModel,
  type LLMMessage,
  type LLMRequest,
  type LLMResponse,
  type LLMRoutingDecision,
  type TaskComplexity,
} from './llmRouter';

// Agent Orchestrator - Multi-agent task execution
export {
  agentOrchestrator,
  orchestrate,
  detectMode,
  type AgentMode,
  type AgentContext,
  type AgentStep,
  type AgentPlan,
  type OrchestratorRequest,
  type OrchestratorResponse,
  type Tool,
  type ToolName,
  type ToolResult,
  type Memory,
} from './agentOrchestrator';

// Embedding Client - Semantic search and memory
export {
  embeddingClient,
  generateEmbedding,
  generateEmbeddings,
  cosineSimilarity,
  storeMemory,
  searchMemories,
  findSimilar,
  clusterBySimilarity,
  clearCache,
  getEmbeddingDimension,
  normalizeText,
  type EmbeddingResult,
  type MemoryRecord,
  type SearchResult,
  type StoreMemoryOptions,
} from './embeddingClient';

// Convenience re-exports
export { llmRouter as default } from './llmRouter';

// AI Contracts — Typed request/response contracts & guardrails (Phase 4)
export {
  validatePrompt,
  validateRequest,
  normalizeError,
  withRetry,
  getUserFacingModelName,
  DEFAULT_RETRY_CONFIG,
  type AIRequestContract,
  type AIResponseContract,
  type AIErrorContract,
  type AIErrorCode,
  type AIMediaType,
  type AIQualityTier,
  type AITaskComplexity,
  type AIMessage,
  type PromptValidation,
  type RetryConfig,
} from './contracts';
