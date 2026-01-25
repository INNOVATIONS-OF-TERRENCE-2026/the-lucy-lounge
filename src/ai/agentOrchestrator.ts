/**
 * THE LUCY LOUNGE - AGENT ORCHESTRATOR
 * 
 * LangGraph-style multi-agent orchestration system.
 * Routes user requests through specialized agents based on intent.
 * 
 * AGENT MODES:
 * - Chat Agent: General conversation and Q&A
 * - Music Agent: Spotify, playlists, ambient audio
 * - Vision Agent: Image analysis, generation
 * - Dev Agent: Code generation, debugging
 * - Research Agent: Web search, fact-checking
 * - Memory Agent: Personal context, recall
 * 
 * This orchestrator manages agent state, tool calls, and response synthesis.
 */

import { supabase } from '@/integrations/supabase/client';
import { llmRouter, type LLMMessage, type LLMModel } from './llmRouter';
import { embeddingClient } from './embeddingClient';

// ============================================================================
// TYPES
// ============================================================================

export type AgentMode = 
  | 'chat' 
  | 'music' 
  | 'vision' 
  | 'dev' 
  | 'research' 
  | 'memory'
  | 'creative'
  | 'document';

export type ToolName = 
  | 'web_search'
  | 'browser_fetch'
  | 'code_exec'
  | 'image_gen'
  | 'image_analyze'
  | 'memory_search'
  | 'memory_store'
  | 'spotify_control'
  | 'document_gen'
  | 'tts'
  | 'stt';

export interface Tool {
  name: ToolName;
  description: string;
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
  execute: (args: Record<string, unknown>, context: AgentContext) => Promise<ToolResult>;
}

export interface ToolResult {
  ok: boolean;
  data?: unknown;
  error?: string;
  durationMs: number;
}

export interface AgentContext {
  userId: string;
  sessionId: string;
  conversationId?: string;
  mode: AgentMode;
  previousMessages: LLMMessage[];
  memories: Memory[];
  tools: Tool[];
}

export interface Memory {
  id: string;
  content: string;
  type: string;
  importance: number;
  createdAt: Date;
  embedding?: number[];
}

export interface AgentStep {
  stepNumber: number;
  tool: ToolName;
  arguments: Record<string, unknown>;
  result?: ToolResult;
  reasoning?: string;
}

export interface AgentPlan {
  steps: AgentStep[];
  continue: boolean;
  reasoning: string;
}

export interface OrchestratorRequest {
  message: string;
  userId: string;
  sessionId?: string;
  conversationId?: string;
  mode?: AgentMode | 'auto';
  attachments?: { type: string; data: string }[];
  preferredModel?: LLMModel;
}

export interface OrchestratorResponse {
  ok: boolean;
  response: string;
  mode: AgentMode;
  steps: AgentStep[];
  memories?: Memory[];
  suggestions?: string[];
  model: LLMModel;
  totalLatencyMs: number;
}

// ============================================================================
// MODE DETECTION
// ============================================================================

const MODE_PATTERNS: Record<AgentMode, RegExp[]> = {
  music: [
    /\b(play|pause|skip|next|previous|shuffle|repeat|queue|playlist)\b/i,
    /\b(spotify|music|song|track|album|artist|genre|lo-?fi|ambient)\b/i,
    /\b(listen|hearing|sounds|audio|beats)\b/i,
  ],
  vision: [
    /\b(image|picture|photo|screenshot|visual|see|look|show)\b/i,
    /\b(generate|create|draw|render|visualize)\b.*(image|picture|art)/i,
    /\b(analyze|describe|identify|recognize)\b.*(image|photo|picture)/i,
    /\b(sdxl|dall-?e|midjourney|stable diffusion)\b/i,
  ],
  dev: [
    /\b(code|program|script|function|class|api|debug|fix|error|bug)\b/i,
    /\b(typescript|javascript|python|react|node|sql|rust|go|html|css)\b/i,
    /```|<code>/i,
    /\b(implement|refactor|optimize|build|develop)\b/i,
  ],
  research: [
    /\b(search|find|look up|google|research|investigate)\b/i,
    /\b(what is|who is|when did|where is|how does)\b.*\?/i,
    /\b(news|latest|current|today|recent)\b/i,
    /\b(fact|verify|source|citation|reference)\b/i,
  ],
  memory: [
    /\b(remember|recall|forgot|last time|previously|before)\b/i,
    /\b(my|our)\b.*(preference|favorite|usual|always)\b/i,
    /\b(you said|i told you|we discussed|mentioned)\b/i,
  ],
  creative: [
    /\b(write|compose|create|draft)\b.*(story|poem|essay|blog|script|lyrics)/i,
    /\b(creative|imaginative|fictional|narrative)\b/i,
  ],
  document: [
    /\b(pdf|document|report|invoice|contract|export)\b/i,
    /\b(generate|create|make)\b.*(document|pdf|report)/i,
  ],
  chat: [], // Default fallback
};

/**
 * Detect the appropriate agent mode from user message
 */
export function detectMode(message: string): AgentMode {
  for (const [mode, patterns] of Object.entries(MODE_PATTERNS)) {
    if (mode === 'chat') continue; // Skip default
    if (patterns.some(p => p.test(message))) {
      return mode as AgentMode;
    }
  }
  return 'chat';
}

// ============================================================================
// TOOL REGISTRY
// ============================================================================

const createTools = (): Tool[] => [
  {
    name: 'web_search',
    description: 'Search the web for current information',
    parameters: {
      query: { type: 'string', description: 'Search query', required: true },
    },
    execute: async (args, context) => {
      const start = Date.now();
      try {
        const { data, error } = await supabase.functions.invoke('web-search', {
          body: { query: args.query },
        });
        return { ok: !error, data, durationMs: Date.now() - start };
      } catch (e) {
        return { ok: false, error: String(e), durationMs: Date.now() - start };
      }
    },
  },
  {
    name: 'browser_fetch',
    description: 'Fetch and parse content from a URL',
    parameters: {
      url: { type: 'string', description: 'URL to fetch', required: true },
    },
    execute: async (args, context) => {
      const start = Date.now();
      try {
        const { data, error } = await supabase.functions.invoke('browser-fetch', {
          body: { url: args.url },
        });
        return { ok: !error, data, durationMs: Date.now() - start };
      } catch (e) {
        return { ok: false, error: String(e), durationMs: Date.now() - start };
      }
    },
  },
  {
    name: 'code_exec',
    description: 'Execute JavaScript code in a sandbox',
    parameters: {
      code: { type: 'string', description: 'JavaScript code to execute', required: true },
    },
    execute: async (args, context) => {
      const start = Date.now();
      try {
        const { data, error } = await supabase.functions.invoke('code-executor', {
          body: { code: args.code, language: 'javascript' },
        });
        return { ok: !error, data, durationMs: Date.now() - start };
      } catch (e) {
        return { ok: false, error: String(e), durationMs: Date.now() - start };
      }
    },
  },
  {
    name: 'image_gen',
    description: 'Generate an image from a text prompt',
    parameters: {
      prompt: { type: 'string', description: 'Image generation prompt', required: true },
    },
    execute: async (args, context) => {
      const start = Date.now();
      try {
        const { data, error } = await supabase.functions.invoke('generate-image', {
          body: { prompt: args.prompt },
        });
        return { ok: !error, data, durationMs: Date.now() - start };
      } catch (e) {
        return { ok: false, error: String(e), durationMs: Date.now() - start };
      }
    },
  },
  {
    name: 'memory_search',
    description: 'Search user memories for relevant context',
    parameters: {
      query: { type: 'string', description: 'Search query', required: true },
    },
    execute: async (args, context) => {
      const start = Date.now();
      try {
        // Use semantic search via embeddings
        const results = await embeddingClient.searchMemories(
          context.userId,
          args.query as string,
          5
        );
        return { ok: true, data: results, durationMs: Date.now() - start };
      } catch (e) {
        return { ok: false, error: String(e), durationMs: Date.now() - start };
      }
    },
  },
  {
    name: 'memory_store',
    description: 'Store important information to user memory',
    parameters: {
      content: { type: 'string', description: 'Content to remember', required: true },
      type: { type: 'string', description: 'Memory type (preference, fact, conversation)' },
    },
    execute: async (args, context) => {
      const start = Date.now();
      try {
        await embeddingClient.storeMemory(
          context.userId,
          args.content as string,
          (args.type as string) ?? 'conversation'
        );
        return { ok: true, data: { stored: true }, durationMs: Date.now() - start };
      } catch (e) {
        return { ok: false, error: String(e), durationMs: Date.now() - start };
      }
    },
  },
  {
    name: 'tts',
    description: 'Convert text to speech audio',
    parameters: {
      text: { type: 'string', description: 'Text to speak', required: true },
      voice: { type: 'string', description: 'Voice ID (alloy, echo, fable, onyx, nova, shimmer)' },
    },
    execute: async (args, context) => {
      const start = Date.now();
      try {
        const { data, error } = await supabase.functions.invoke('text-to-speech', {
          body: { text: args.text, voice: args.voice ?? 'nova' },
        });
        return { ok: !error, data, durationMs: Date.now() - start };
      } catch (e) {
        return { ok: false, error: String(e), durationMs: Date.now() - start };
      }
    },
  },
  {
    name: 'document_gen',
    description: 'Generate a PDF document',
    parameters: {
      content: { type: 'string', description: 'Document content (markdown)', required: true },
      title: { type: 'string', description: 'Document title' },
    },
    execute: async (args, context) => {
      const start = Date.now();
      try {
        const { data, error } = await supabase.functions.invoke('pdf-generator', {
          body: { content: args.content, title: args.title ?? 'Document' },
        });
        return { ok: !error, data, durationMs: Date.now() - start };
      } catch (e) {
        return { ok: false, error: String(e), durationMs: Date.now() - start };
      }
    },
  },
];

// ============================================================================
// ORCHESTRATOR
// ============================================================================

const ORCHESTRATOR_SYSTEM = `You are Lucy's agent orchestrator for TheLucyLounge.com.

Your role is to analyze user requests and determine the optimal execution plan.

Available tools:
- web_search: Search the internet for information
- browser_fetch: Fetch and parse a specific URL
- code_exec: Execute JavaScript code
- image_gen: Generate images from prompts
- memory_search: Search user's personal memory/context
- memory_store: Store important information to memory
- tts: Convert text to speech
- document_gen: Generate PDF documents

RULES:
1. Use web_search for current events, facts, prices, availability
2. Use memory_search before answering personalized questions
3. Use image_gen only when user explicitly wants an image
4. Use code_exec for calculations, data transformations, simulations
5. Prefer direct answers when no tools are needed
6. Limit to 3 tool calls maximum per request

Respond with a JSON plan:
{
  "steps": [
    { "stepNumber": 1, "tool": "tool_name", "arguments": {...}, "reasoning": "why" }
  ],
  "continue": false,
  "reasoning": "overall plan explanation",
  "directAnswer": "answer if no tools needed"
}`;

/**
 * Main orchestration function - routes request through appropriate agents
 */
export async function orchestrate(request: OrchestratorRequest): Promise<OrchestratorResponse> {
  const startTime = Date.now();
  const sessionId = request.sessionId ?? crypto.randomUUID();
  
  // Detect mode
  const mode = request.mode === 'auto' || !request.mode
    ? detectMode(request.message)
    : request.mode;

  console.log('[Agent Orchestrator] Mode:', mode, '| Message:', request.message.slice(0, 50));

  // Build context
  const tools = createTools();
  const context: AgentContext = {
    userId: request.userId,
    sessionId,
    conversationId: request.conversationId,
    mode,
    previousMessages: [],
    memories: [],
    tools,
  };

  // Search memories for context
  try {
    const memories = await embeddingClient.searchMemories(request.userId, request.message, 3);
    context.memories = memories.map(m => ({
      id: m.id,
      content: m.content,
      type: m.type,
      importance: m.importance,
      createdAt: new Date(m.createdAt),
    }));
  } catch (e) {
    console.warn('[Agent Orchestrator] Memory search failed:', e);
  }

  // Get execution plan from LLM
  const planMessages: LLMMessage[] = [
    { role: 'user', content: request.message },
  ];

  if (context.memories.length > 0) {
    const memoryContext = context.memories
      .map(m => `[Memory: ${m.type}] ${m.content}`)
      .join('\n');
    planMessages.unshift({
      role: 'system',
      content: `Relevant user memories:\n${memoryContext}`,
    });
  }

  let plan: AgentPlan = { steps: [], continue: false, reasoning: '' };
  let directAnswer: string | undefined;

  try {
    const planResponse = await llmRouter.chat({
      messages: planMessages,
      system: ORCHESTRATOR_SYSTEM,
      temperature: 0.2,
      mode: 'fast',
    });

    if (planResponse.ok) {
      const jsonMatch = planResponse.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        plan = parsed;
        directAnswer = parsed.directAnswer;
      }
    }
  } catch (e) {
    console.warn('[Agent Orchestrator] Plan parsing failed:', e);
  }

  // Execute tool calls
  const executedSteps: AgentStep[] = [];

  if (!directAnswer && plan.steps.length > 0) {
    for (const step of plan.steps.slice(0, 3)) { // Max 3 tool calls
      const tool = tools.find(t => t.name === step.tool);
      if (tool) {
        console.log('[Agent Orchestrator] Executing tool:', step.tool);
        const result = await tool.execute(step.arguments, context);
        executedSteps.push({ ...step, result });
      }
    }
  }

  // Synthesize final response
  let finalResponse: string;
  let usedModel: LLMModel;

  if (directAnswer) {
    // Direct answer from plan - expand it
    const expandResponse = await llmRouter.chat({
      messages: [{ role: 'user', content: request.message }],
      system: `You are Lucy, an intelligent AI assistant. Provide a helpful, conversational response.\n\nDirect answer to use: ${directAnswer}`,
      temperature: 0.7,
      preferredModel: request.preferredModel,
    });
    finalResponse = expandResponse.text;
    usedModel = expandResponse.model;
  } else if (executedSteps.length > 0) {
    // Synthesize from tool results
    const toolContext = executedSteps
      .map(s => `Tool: ${s.tool}\nResult: ${JSON.stringify(s.result?.data ?? s.result?.error)}`)
      .join('\n\n');

    const synthesisResponse = await llmRouter.chat({
      messages: [
        { role: 'user', content: request.message },
        { role: 'assistant', content: `I used these tools to help answer:\n${toolContext}` },
        { role: 'user', content: 'Please synthesize a helpful response based on these results.' },
      ],
      system: 'You are Lucy. Synthesize the tool results into a natural, helpful response.',
      temperature: 0.7,
      preferredModel: request.preferredModel,
    });
    finalResponse = synthesisResponse.text;
    usedModel = synthesisResponse.model;
  } else {
    // No tools, direct chat
    const chatResponse = await llmRouter.chat({
      messages: [{ role: 'user', content: request.message }],
      temperature: 0.7,
      preferredModel: request.preferredModel,
    });
    finalResponse = chatResponse.text;
    usedModel = chatResponse.model;
  }

  // Store conversation to memory (if significant)
  if (request.message.length > 50) {
    try {
      await embeddingClient.storeMemory(
        request.userId,
        `User asked: ${request.message.slice(0, 200)}`,
        'conversation'
      );
    } catch (e) {
      console.warn('[Agent Orchestrator] Memory store failed:', e);
    }
  }

  return {
    ok: true,
    response: finalResponse,
    mode,
    steps: executedSteps,
    memories: context.memories,
    suggestions: generateSuggestions(mode, request.message),
    model: usedModel,
    totalLatencyMs: Date.now() - startTime,
  };
}

/**
 * Generate follow-up suggestions based on mode and context
 */
function generateSuggestions(mode: AgentMode, message: string): string[] {
  const baseSuggestions: Record<AgentMode, string[]> = {
    chat: ['Tell me more', 'Can you explain that?', 'What else should I know?'],
    music: ['Create a playlist', 'Play something similar', 'What\'s trending?'],
    vision: ['Generate another image', 'Make it more detailed', 'Try a different style'],
    dev: ['Explain this code', 'Add error handling', 'Write tests for this'],
    research: ['Find more sources', 'Summarize the key points', 'Fact-check this'],
    memory: ['What else do you remember?', 'Save this for later', 'Clear my preferences'],
    creative: ['Continue the story', 'Make it more dramatic', 'Add more details'],
    document: ['Export as PDF', 'Add more sections', 'Format for printing'],
  };

  return baseSuggestions[mode] ?? baseSuggestions.chat;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const agentOrchestrator = {
  orchestrate,
  detectMode,
  createTools,
};

export default agentOrchestrator;
