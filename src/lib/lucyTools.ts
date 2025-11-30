/**
 * Lucy Tool System - Type Definitions
 * Defines tools, agent steps, and message formats
 */

export type LucyToolName =
  | "chat"
  | "vision"
  | "web_search"
  | "code_exec"
  | "image_gen"
  | "browser_fetch"
  | "memory_search"
  | "reasoning";

export type LucyToolCall = {
  tool: LucyToolName;
  arguments: Record<string, any>;
};

export type LucyAgentStep = {
  stepNumber: number;
  toolCall: LucyToolCall;
  toolResult?: any;
  notes?: string;
  durationMs?: number;
};

export type LucyAgentPlan = {
  finalAnswer?: string;
  steps: LucyAgentStep[];
  continue?: boolean;
  persona?: string;
  confidence?: number;
};

export type LucyMessage = {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolName?: LucyToolName;
  toolResultJson?: any;
  timestamp?: string;
};

export type BrowserFetchResult = {
  url: string;
  title: string;
  textPreview: string;
  success: boolean;
};

export type CodeExecutionResult = {
  ok: boolean;
  stdout: string;
  result?: any;
  error?: string;
  durationMs: number;
};

export type MemoryRecord = {
  id: string;
  userId: string;
  summary: string;
  embedding?: number[];
  persona?: string;
  createdAt: string;
};
