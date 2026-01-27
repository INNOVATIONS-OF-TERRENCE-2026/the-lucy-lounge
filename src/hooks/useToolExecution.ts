/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — TOOL EXECUTION HOOK                                      │
 * │                                                                             │
 * │ Unified hook for AI tool execution with streaming, model selection,        │
 * │ history persistence, and error handling                                    │
 * │                                                                             │
 * │ Lucy's tools are powerful, safe, and always logged.                        │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// =============================================================================
// TYPES
// =============================================================================

export type ToolId = 'summarizer' | 'captioning' | 'calculator' | 'code-executor' | 'web-fetcher';

export type AIModel = 
  | 'gpt-4o' 
  | 'gpt-4o-mini' 
  | 'claude-3-5-sonnet' 
  | 'claude-3-haiku'
  | 'gemini-2.0-flash'
  | 'llama-3.3-70b';

export interface ModelOption {
  id: AIModel;
  name: string;
  provider: string;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'standard' | 'high' | 'premium';
  costTier: 1 | 2 | 3;
}

export const AI_MODELS: ModelOption[] = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', speed: 'fast', quality: 'standard', costTier: 1 },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', speed: 'fast', quality: 'standard', costTier: 1 },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google', speed: 'fast', quality: 'standard', costTier: 1 },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', speed: 'medium', quality: 'high', costTier: 2 },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', speed: 'medium', quality: 'premium', costTier: 3 },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'Meta', speed: 'medium', quality: 'high', costTier: 2 },
];

export interface ToolRun {
  id: string;
  toolId: ToolId;
  model: AIModel;
  inputData: Record<string, unknown>;
  status: 'pending' | 'running' | 'streaming' | 'completed' | 'failed' | 'cancelled';
  output?: string;
  outputJson?: Record<string, unknown>;
  error?: string;
  tokensUsed?: number;
  executionTime?: number;
  createdAt: Date;
}

export interface UseToolExecutionOptions {
  toolId: ToolId;
  defaultModel?: AIModel;
  enableStreaming?: boolean;
  persistHistory?: boolean;
}

export interface UseToolExecutionReturn {
  // State
  isExecuting: boolean;
  isStreaming: boolean;
  streamedOutput: string;
  result: ToolRun | null;
  error: string | null;
  
  // Model
  selectedModel: AIModel;
  setSelectedModel: (model: AIModel) => void;
  availableModels: ModelOption[];
  
  // History
  history: ToolRun[];
  loadHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
  
  // Execution
  execute: <T>(input: Record<string, unknown>, processor?: (data: unknown) => T) => Promise<T | null>;
  cancel: () => void;
  reset: () => void;
  
  // Export
  exportResult: (format: 'json' | 'text' | 'markdown') => string | null;
}

// =============================================================================
// HOOK
// =============================================================================

export function useToolExecution({
  toolId,
  defaultModel = 'gpt-4o-mini',
  enableStreaming = true,
  persistHistory = true,
}: UseToolExecutionOptions): UseToolExecutionReturn {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // State
  const [isExecuting, setIsExecuting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedOutput, setStreamedOutput] = useState('');
  const [result, setResult] = useState<ToolRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>(defaultModel);
  const [history, setHistory] = useState<ToolRun[]>([]);
  
  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const runIdRef = useRef<string | null>(null);

  // Load history
  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('tool_runs')
        .select(`
          id,
          tool_id,
          input_data,
          status,
          tokens_used,
          created_at,
          tool_run_outputs (
            output_type,
            content,
            content_json
          )
        `)
        .eq('tool_id', toolId)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      const mappedHistory: ToolRun[] = (data || []).map((run: any) => ({
        id: run.id,
        toolId: run.tool_id,
        model: run.input_data?.model || 'gpt-4o-mini',
        inputData: run.input_data,
        status: run.status,
        output: run.tool_run_outputs?.[0]?.content,
        outputJson: run.tool_run_outputs?.[0]?.content_json,
        tokensUsed: run.tokens_used,
        createdAt: new Date(run.created_at),
      }));

      setHistory(mappedHistory);
    } catch (err) {
      console.error('[useToolExecution] Load history error:', err);
    }
  }, [isAuthenticated, user?.id, toolId]);

  // Clear history
  const clearHistory = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;

    try {
      await supabase
        .from('tool_runs')
        .delete()
        .eq('tool_id', toolId)
        .eq('user_id', user.id);

      setHistory([]);
      toast({ title: 'History cleared' });
    } catch (err) {
      console.error('[useToolExecution] Clear history error:', err);
      toast({ title: 'Failed to clear history', variant: 'destructive' });
    }
  }, [isAuthenticated, user?.id, toolId, toast]);

  // Create run record
  const createRun = useCallback(async (inputData: Record<string, unknown>): Promise<string | null> => {
    // For anonymous users or when history is disabled, use temp ID
    if (!persistHistory || !isAuthenticated) return 'temp-' + Date.now();

    try {
      const { data, error: createError } = await supabase.rpc('create_tool_run', {
        p_tool_id: toolId,
        p_input_type: Object.keys(inputData)[0] || 'data',
        p_input_data: { ...inputData, model: selectedModel }
      });

      if (createError) {
        console.warn('[useToolExecution] Create run error (using temp ID):', createError);
        return 'temp-' + Date.now();
      }
      return data as string;
    } catch (err) {
      console.error('[useToolExecution] Create run error:', err);
      return 'temp-' + Date.now();
    }
  }, [toolId, selectedModel, persistHistory, isAuthenticated]);

  // Complete run record
  const completeRun = useCallback(async (
    runId: string,
    status: 'completed' | 'failed',
    output: string,
    outputJson?: Record<string, unknown>,
    errorMessage?: string
  ) => {
    if (!persistHistory || runId.startsWith('temp-')) return;

    try {
      await supabase.rpc('complete_tool_run', {
        p_run_id: runId,
        p_status: status,
        p_output_type: status === 'completed' ? 'result' : 'error',
        p_content: output,
        p_content_json: outputJson || null,
        p_error_message: errorMessage || null
      });
    } catch (err) {
      console.error('[useToolExecution] Complete run error:', err);
    }
  }, [persistHistory]);

  // Execute tool
  const execute = useCallback(async <T>(
    input: Record<string, unknown>,
    processor?: (data: unknown) => T
  ): Promise<T | null> => {
    setIsExecuting(true);
    setIsStreaming(false);
    setStreamedOutput('');
    setError(null);
    setResult(null);

    // Create abort controller
    abortControllerRef.current = new AbortController();

    // Create run record
    const runId = await createRun(input);
    runIdRef.current = runId;

    if (!runId) {
      setError('Failed to initialize tool run');
      setIsExecuting(false);
      return null;
    }

    const startTime = performance.now();

    try {
      // Determine which edge function to call based on tool
      let functionName: string;
      let body: Record<string, unknown>;

      switch (toolId) {
        case 'summarizer':
          functionName = 'browser-fetch';
          body = { url: input.url, mode: 'summarize', model: selectedModel };
          break;
        case 'captioning':
          functionName = 'hf-vision';
          body = { 
            image_url: input.imageUrl, 
            image_base64: input.imageBase64,
            task: 'caption',
            model: selectedModel 
          };
          break;
        case 'calculator':
          // Calculator runs client-side
          const calcResult = await executeCalculator(input.expression as string, input.showSteps as boolean);
          const executionTime = performance.now() - startTime;
          
          const calcRun: ToolRun = {
            id: runId,
            toolId,
            model: selectedModel,
            inputData: input,
            status: calcResult.isValid ? 'completed' : 'failed',
            output: calcResult.result,
            outputJson: calcResult,
            executionTime,
            createdAt: new Date(),
          };
          
          setResult(calcRun);
          await completeRun(runId, calcResult.isValid ? 'completed' : 'failed', calcResult.result, calcResult, calcResult.errorMessage);
          setIsExecuting(false);
          
          if (processor) return processor(calcResult);
          return calcResult as T;
          
        case 'code-executor':
          // Code executor runs client-side in sandbox
          const codeResult = await executeCodeSandbox(input.code as string, input.language as string, input.timeout as number);
          const codeExecTime = performance.now() - startTime;
          
          const codeRun: ToolRun = {
            id: runId,
            toolId,
            model: selectedModel,
            inputData: input,
            status: codeResult.error ? 'failed' : 'completed',
            output: codeResult.output || codeResult.logs.join('\n'),
            outputJson: codeResult,
            executionTime: codeExecTime,
            createdAt: new Date(),
          };
          
          setResult(codeRun);
          await completeRun(runId, codeResult.error ? 'failed' : 'completed', codeResult.output, codeResult, codeResult.error);
          setIsExecuting(false);
          
          if (processor) return processor(codeResult);
          return codeResult as T;
          
        case 'web-fetcher':
          functionName = 'browser-fetch';
          body = { url: input.url, mode: input.extractMode || 'all' };
          break;
        default:
          throw new Error(`Unknown tool: ${toolId}`);
      }

      // Call edge function with streaming if enabled
      if (enableStreaming && ['summarizer'].includes(toolId)) {
        setIsStreaming(true);
        
        // Use streaming endpoint
        const { data, error: invokeError } = await supabase.functions.invoke(functionName!, {
          body: body!,
        });

        if (invokeError) throw invokeError;

        // For summarizer, we need to call lucy-router for the actual summary
        if (toolId === 'summarizer' && data?.text) {
          const { data: summaryData, error: summaryError } = await supabase.functions.invoke('lucy-router', {
            body: {
              userId: user?.id || 'anonymous',
              model: selectedModel,
              stream: true,
              messages: [{
                role: 'user',
                content: `Summarize this website content comprehensively. Include:
1. Main topic and purpose
2. Key points (bullet list)
3. Important details
4. Conclusion

Title: ${data.title || 'Unknown'}
URL: ${input.url}

Content:
${data.text?.slice(0, 12000) || 'No content available'}`
              }]
            }
          });

          if (summaryError) throw summaryError;

          const summary = summaryData?.plan?.finalAnswer || 
            summaryData?.plan?.steps?.[0]?.result || 
            summaryData?.response ||
            'Summary could not be generated.';

          setStreamedOutput(summary);
          
          const resultData = {
            summary,
            title: data.title,
            url: input.url,
            wordCount: data.text?.split(/\s+/).length || 0,
            readingTime: Math.ceil((data.text?.split(/\s+/).length || 0) / 200),
          };

          const executionTime = performance.now() - startTime;
          const toolRun: ToolRun = {
            id: runId,
            toolId,
            model: selectedModel,
            inputData: input,
            status: 'completed',
            output: summary,
            outputJson: resultData,
            executionTime,
            createdAt: new Date(),
          };

          setResult(toolRun);
          await completeRun(runId, 'completed', summary, resultData);
          
          if (processor) return processor(resultData);
          return resultData as T;
        }

        setIsStreaming(false);
      }

      // Non-streaming execution
      const { data, error: invokeError } = await supabase.functions.invoke(functionName!, {
        body: body!,
      });

      if (invokeError) throw invokeError;

      const executionTime = performance.now() - startTime;
      
      const toolRun: ToolRun = {
        id: runId,
        toolId,
        model: selectedModel,
        inputData: input,
        status: 'completed',
        output: typeof data === 'string' ? data : JSON.stringify(data),
        outputJson: data,
        executionTime,
        createdAt: new Date(),
      };

      setResult(toolRun);
      await completeRun(runId, 'completed', toolRun.output!, data);
      
      // Reload history
      if (persistHistory) {
        loadHistory();
      }

      if (processor) return processor(data);
      return data as T;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Tool execution failed';
      setError(errorMessage);
      
      await completeRun(runId, 'failed', '', undefined, errorMessage);
      
      toast({
        title: 'Tool Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsExecuting(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [toolId, selectedModel, enableStreaming, createRun, completeRun, loadHistory, persistHistory, user?.id, toast]);

  // Cancel execution
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsExecuting(false);
    setIsStreaming(false);
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setIsExecuting(false);
    setIsStreaming(false);
    setStreamedOutput('');
    setResult(null);
    setError(null);
  }, []);

  // Export result
  const exportResult = useCallback((format: 'json' | 'text' | 'markdown'): string | null => {
    if (!result) return null;

    switch (format) {
      case 'json':
        return JSON.stringify(result.outputJson || { output: result.output }, null, 2);
      case 'text':
        return result.output || '';
      case 'markdown':
        return `# Tool Result: ${toolId}\n\n**Model:** ${result.model}\n**Executed:** ${result.createdAt.toISOString()}\n\n## Output\n\n${result.output || 'No output'}`;
      default:
        return null;
    }
  }, [result, toolId]);

  // Load history on mount
  useEffect(() => {
    if (persistHistory && isAuthenticated) {
      loadHistory();
    }
  }, [persistHistory, isAuthenticated, loadHistory]);

  return {
    isExecuting,
    isStreaming,
    streamedOutput,
    result,
    error,
    selectedModel,
    setSelectedModel,
    availableModels: AI_MODELS,
    history,
    loadHistory,
    clearHistory,
    execute,
    cancel,
    reset,
    exportResult,
  };
}

// =============================================================================
// CLIENT-SIDE EXECUTORS
// =============================================================================

interface CalculatorResult {
  result: string;
  steps: { step: number; description: string; value: string }[];
  latex?: string;
  isValid: boolean;
  errorMessage?: string;
}

async function executeCalculator(expression: string, showSteps = true): Promise<CalculatorResult> {
  const steps: { step: number; description: string; value: string }[] = [];
  let stepNum = 1;

  try {
    // Sanitize input - only allow safe characters
    const sanitized = expression.replace(/[^0-9+\-*/().^%\s]/g, '');
    
    if (sanitized !== expression.replace(/\s/g, '')) {
      throw new Error('Invalid characters in expression');
    }

    // Replace ^ with ** for exponentiation
    let processed = sanitized.replace(/\^/g, '**');
    
    steps.push({ step: stepNum++, description: 'Original expression', value: expression });

    // Handle parentheses first
    while (processed.includes('(')) {
      const match = processed.match(/\(([^()]+)\)/);
      if (!match) break;
      
      const innerResult = evaluateSimple(match[1]);
      steps.push({ step: stepNum++, description: `Evaluate (${match[1]})`, value: innerResult.toString() });
      processed = processed.replace(match[0], innerResult.toString());
    }

    const result = evaluateSimple(processed);
    steps.push({ step: stepNum++, description: 'Final result', value: result.toString() });

    return {
      result: result.toString(),
      steps: showSteps ? steps : [],
      isValid: true,
    };
  } catch (err) {
    return {
      result: '',
      steps: [],
      isValid: false,
      errorMessage: err instanceof Error ? err.message : 'Invalid expression',
    };
  }
}

function evaluateSimple(expr: string): number {
  const tokens = tokenize(expr);
  return parseExpression(tokens);
}

function tokenize(expr: string): (number | string)[] {
  const tokens: (number | string)[] = [];
  let num = '';
  let prevChar = '';
  
  for (const char of expr.replace(/\s/g, '')) {
    if (/[0-9.]/.test(char)) {
      num += char;
    } else {
      if (num) {
        tokens.push(parseFloat(num));
        num = '';
      }
      if (char === '*' && prevChar === '*') {
        tokens.pop();
        tokens.push('**');
      } else if (['+', '-', '*', '/', '%'].includes(char)) {
        tokens.push(char);
      }
    }
    prevChar = char;
  }
  if (num) tokens.push(parseFloat(num));
  
  return tokens;
}

function parseExpression(tokens: (number | string)[]): number {
  // Handle exponentiation first (right to left)
  for (let i = tokens.length - 2; i >= 0; i--) {
    if (tokens[i] === '**') {
      const result = Math.pow(tokens[i - 1] as number, tokens[i + 1] as number);
      tokens.splice(i - 1, 3, result);
    }
  }
  
  // Handle multiplication, division, modulo (left to right)
  for (let i = 1; i < tokens.length - 1; i++) {
    if (tokens[i] === '*' || tokens[i] === '/' || tokens[i] === '%') {
      let result: number;
      const left = tokens[i - 1] as number;
      const right = tokens[i + 1] as number;
      
      if (tokens[i] === '*') result = left * right;
      else if (tokens[i] === '/') result = left / right;
      else result = left % right;
      
      tokens.splice(i - 1, 3, result);
      i--;
    }
  }
  
  // Handle addition and subtraction (left to right)
  for (let i = 1; i < tokens.length - 1; i++) {
    if (tokens[i] === '+' || tokens[i] === '-') {
      const left = tokens[i - 1] as number;
      const right = tokens[i + 1] as number;
      const result = tokens[i] === '+' ? left + right : left - right;
      tokens.splice(i - 1, 3, result);
      i--;
    }
  }
  
  return tokens[0] as number;
}

interface CodeExecutorResult {
  output: string;
  logs: string[];
  error?: string;
  executionTime: number;
}

async function executeCodeSandbox(code: string, language: string, timeout = 5000): Promise<CodeExecutorResult> {
  const startTime = performance.now();
  const logs: string[] = [];
  let output = '';
  let error: string | undefined;

  try {
    // Create sandboxed execution environment using Web Worker
    const workerCode = `
      const logs = [];
      const originalConsole = {
        log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        error: (...args) => logs.push('[ERROR] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        warn: (...args) => logs.push('[WARN] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        info: (...args) => logs.push('[INFO] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        table: (data) => logs.push('[TABLE] ' + JSON.stringify(data)),
      };
      
      // Override console
      const console = originalConsole;
      
      // Restricted environment - no access to DOM, fetch, etc.
      const window = undefined;
      const document = undefined;
      const fetch = undefined;
      const XMLHttpRequest = undefined;
      const WebSocket = undefined;
      const localStorage = undefined;
      const sessionStorage = undefined;
      const indexedDB = undefined;
      const navigator = undefined;
      const location = undefined;
      
      // Safe built-ins
      const Math = self.Math;
      const Date = self.Date;
      const JSON = self.JSON;
      const Array = self.Array;
      const Object = self.Object;
      const String = self.String;
      const Number = self.Number;
      const Boolean = self.Boolean;
      const RegExp = self.RegExp;
      const Map = self.Map;
      const Set = self.Set;
      const Promise = self.Promise;
      
      try {
        const result = (function() {
          'use strict';
          ${code}
        })();
        self.postMessage({ success: true, result: result !== undefined ? (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)) : '', logs });
      } catch (e) {
        self.postMessage({ success: false, error: e.message || String(e), logs });
      }
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    const result = await new Promise<{ success: boolean; result?: string; error?: string; logs: string[] }>((resolve) => {
      const timeoutId = setTimeout(() => {
        worker.terminate();
        resolve({ success: false, error: `Execution timeout (${timeout / 1000} seconds)`, logs: [] });
      }, timeout);

      worker.onmessage = (e) => {
        clearTimeout(timeoutId);
        worker.terminate();
        resolve(e.data);
      };

      worker.onerror = (e) => {
        clearTimeout(timeoutId);
        worker.terminate();
        resolve({ success: false, error: e.message || 'Worker error', logs: [] });
      };
    });

    URL.revokeObjectURL(workerUrl);

    if (result.success) {
      output = result.result || '';
      logs.push(...result.logs);
    } else {
      error = result.error;
      logs.push(...result.logs);
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Execution failed';
  }

  return {
    output,
    logs,
    error,
    executionTime: performance.now() - startTime,
  };
}

export default useToolExecution;
