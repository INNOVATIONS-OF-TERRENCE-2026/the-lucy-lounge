/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — TOOL SERVICE                                             │
 * │                                                                             │
 * │ Unified service for all AI tool operations                                 │
 * │ Handles execution, history, and result management                          │
 * │                                                                             │
 * │ Lucy's tools are powerful, safe, and always logged.                        │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { supabase } from '@/integrations/supabase/client';

// =============================================================================
// TYPES
// =============================================================================

export type ToolId = 'summarizer' | 'captioning' | 'calculator' | 'code-executor' | 'web-fetcher';

export interface ToolRun {
  id: string;
  toolId: ToolId;
  inputData: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  outputs?: ToolOutput[];
}

export interface ToolOutput {
  type: string;
  content: string;
  contentJson?: Record<string, unknown>;
}

export interface ToolHistoryItem {
  id: string;
  tool_id: string;
  input_data: Record<string, unknown>;
  status: string;
  created_at: string;
  outputs: ToolOutput[];
}

// =============================================================================
// WEBSITE SUMMARIZER
// =============================================================================

export interface SummarizerInput {
  url: string;
}

export interface SummarizerOutput {
  summary: string;
  title: string;
  wordCount: number;
  readingTime: number;
  keyPoints: string[];
  citations: { text: string; position: number }[];
}

export async function summarizeWebsite(input: SummarizerInput): Promise<SummarizerOutput> {
  // Create run record
  const { data: runData, error: runError } = await supabase
    .rpc('create_tool_run', {
      p_tool_id: 'summarizer',
      p_input_type: 'url',
      p_input_data: input
    });

  if (runError) throw new Error(`Failed to create run: ${runError.message}`);
  const runId = runData as string;

  try {
    // Call edge function
    const { data, error } = await supabase.functions.invoke('browser-fetch', {
      body: { url: input.url, mode: 'summarize' }
    });

    if (error) throw error;

    // Parse response
    const result: SummarizerOutput = {
      summary: data.summary || 'No summary available',
      title: data.title || 'Untitled',
      wordCount: data.wordCount || 0,
      readingTime: Math.ceil((data.wordCount || 0) / 200),
      keyPoints: data.keyPoints || [],
      citations: data.citations || []
    };

    // Complete run
    await supabase.rpc('complete_tool_run', {
      p_run_id: runId,
      p_status: 'completed',
      p_output_type: 'summary',
      p_content: result.summary,
      p_content_json: result
    });

    return result;
  } catch (err) {
    // Mark as failed
    await supabase.rpc('complete_tool_run', {
      p_run_id: runId,
      p_status: 'failed',
      p_output_type: 'error',
      p_content: '',
      p_error_message: err instanceof Error ? err.message : 'Unknown error'
    });
    throw err;
  }
}

// =============================================================================
// IMAGE CAPTIONING
// =============================================================================

export interface CaptioningInput {
  imageUrl?: string;
  imageBase64?: string;
}

export interface CaptioningOutput {
  caption: string;
  tags: string[];
  confidence: number;
  objects: { name: string; confidence: number }[];
  colors: string[];
}

export async function captionImage(input: CaptioningInput): Promise<CaptioningOutput> {
  const { data: runData, error: runError } = await supabase
    .rpc('create_tool_run', {
      p_tool_id: 'captioning',
      p_input_type: 'image',
      p_input_data: { hasUrl: !!input.imageUrl, hasBase64: !!input.imageBase64 }
    });

  if (runError) throw new Error(`Failed to create run: ${runError.message}`);
  const runId = runData as string;

  try {
    // Call vision edge function
    const { data, error } = await supabase.functions.invoke('hf-vision', {
      body: { 
        image_url: input.imageUrl,
        image_base64: input.imageBase64,
        task: 'caption'
      }
    });

    if (error) throw error;

    const result: CaptioningOutput = {
      caption: data.caption || 'No caption generated',
      tags: data.tags || [],
      confidence: data.confidence || 0,
      objects: data.objects || [],
      colors: data.colors || []
    };

    await supabase.rpc('complete_tool_run', {
      p_run_id: runId,
      p_status: 'completed',
      p_output_type: 'caption',
      p_content: result.caption,
      p_content_json: result
    });

    return result;
  } catch (err) {
    await supabase.rpc('complete_tool_run', {
      p_run_id: runId,
      p_status: 'failed',
      p_output_type: 'error',
      p_content: '',
      p_error_message: err instanceof Error ? err.message : 'Unknown error'
    });
    throw err;
  }
}

// =============================================================================
// MATH CALCULATOR
// =============================================================================

export interface CalculatorInput {
  expression: string;
  showSteps?: boolean;
}

export interface CalculatorOutput {
  result: string;
  steps: { step: number; description: string; value: string }[];
  latex?: string;
  isValid: boolean;
  errorMessage?: string;
}

// Safe math evaluator (no eval!)
function safeEvaluate(expression: string): { result: number; steps: { step: number; description: string; value: string }[] } {
  const steps: { step: number; description: string; value: string }[] = [];
  let stepNum = 1;

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

  return { result, steps };
}

function evaluateSimple(expr: string): number {
  // Handle basic operations in correct order
  const tokens = tokenize(expr);
  return parseExpression(tokens);
}

function tokenize(expr: string): (number | string)[] {
  const tokens: (number | string)[] = [];
  let num = '';
  
  for (const char of expr.replace(/\s/g, '')) {
    if (/[0-9.]/.test(char)) {
      num += char;
    } else {
      if (num) {
        tokens.push(parseFloat(num));
        num = '';
      }
      if (['+', '-', '*', '/', '%', '**'].includes(char) || char === '*' && tokens[tokens.length - 1] === '*') {
        if (char === '*' && tokens[tokens.length - 1] === '*') {
          tokens.pop();
          tokens.push('**');
        } else {
          tokens.push(char);
        }
      }
    }
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

export async function calculateMath(input: CalculatorInput): Promise<CalculatorOutput> {
  const { data: runData, error: runError } = await supabase
    .rpc('create_tool_run', {
      p_tool_id: 'calculator',
      p_input_type: 'expression',
      p_input_data: input
    });

  if (runError) throw new Error(`Failed to create run: ${runError.message}`);
  const runId = runData as string;

  try {
    const { result, steps } = safeEvaluate(input.expression);
    
    const output: CalculatorOutput = {
      result: result.toString(),
      steps: input.showSteps ? steps : [],
      isValid: true
    };

    await supabase.rpc('complete_tool_run', {
      p_run_id: runId,
      p_status: 'completed',
      p_output_type: 'result',
      p_content: output.result,
      p_content_json: output
    });

    return output;
  } catch (err) {
    const output: CalculatorOutput = {
      result: '',
      steps: [],
      isValid: false,
      errorMessage: err instanceof Error ? err.message : 'Invalid expression'
    };

    await supabase.rpc('complete_tool_run', {
      p_run_id: runId,
      p_status: 'failed',
      p_output_type: 'error',
      p_content: '',
      p_error_message: output.errorMessage
    });

    return output;
  }
}

// =============================================================================
// CODE EXECUTOR (CLIENT-SIDE SANDBOX)
// =============================================================================

export interface CodeExecutorInput {
  code: string;
  language: 'javascript' | 'typescript';
  timeout?: number;
}

export interface CodeExecutorOutput {
  output: string;
  logs: string[];
  error?: string;
  executionTime: number;
}

export async function executeCode(input: CodeExecutorInput): Promise<CodeExecutorOutput> {
  const { data: runData, error: runError } = await supabase
    .rpc('create_tool_run', {
      p_tool_id: 'code-executor',
      p_input_type: 'code',
      p_input_data: { language: input.language, codeLength: input.code.length }
    });

  if (runError) throw new Error(`Failed to create run: ${runError.message}`);
  const runId = runData as string;

  const startTime = performance.now();
  const logs: string[] = [];
  let output = '';
  let error: string | undefined;

  try {
    // Create sandboxed execution environment using Web Worker
    const workerCode = `
      const logs = [];
      const originalConsole = {
        log: (...args) => logs.push(args.map(a => String(a)).join(' ')),
        error: (...args) => logs.push('[ERROR] ' + args.map(a => String(a)).join(' ')),
        warn: (...args) => logs.push('[WARN] ' + args.map(a => String(a)).join(' ')),
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
      
      try {
        const result = (function() {
          ${input.code}
        })();
        self.postMessage({ success: true, result: result !== undefined ? String(result) : '', logs });
      } catch (e) {
        self.postMessage({ success: false, error: e.message, logs });
      }
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    const result = await new Promise<{ success: boolean; result?: string; error?: string; logs: string[] }>((resolve) => {
      const timeout = setTimeout(() => {
        worker.terminate();
        resolve({ success: false, error: 'Execution timeout (5 seconds)', logs: [] });
      }, input.timeout || 5000);

      worker.onmessage = (e) => {
        clearTimeout(timeout);
        worker.terminate();
        resolve(e.data);
      };

      worker.onerror = (e) => {
        clearTimeout(timeout);
        worker.terminate();
        resolve({ success: false, error: e.message, logs: [] });
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

  const executionTime = performance.now() - startTime;

  const outputData: CodeExecutorOutput = {
    output,
    logs,
    error,
    executionTime
  };

  await supabase.rpc('complete_tool_run', {
    p_run_id: runId,
    p_status: error ? 'failed' : 'completed',
    p_output_type: error ? 'error' : 'console',
    p_content: output || logs.join('\n'),
    p_content_json: outputData,
    p_error_message: error
  });

  return outputData;
}

// =============================================================================
// WEB FETCHER
// =============================================================================

export interface WebFetcherInput {
  url: string;
  extractMode: 'text' | 'html' | 'metadata' | 'all';
}

export interface WebFetcherOutput {
  url: string;
  title: string;
  text: string;
  html?: string;
  metadata: {
    description?: string;
    keywords?: string[];
    author?: string;
    publishedDate?: string;
    ogImage?: string;
  };
  links: { text: string; href: string }[];
  images: { src: string; alt: string }[];
  wordCount: number;
}

export async function fetchWebsite(input: WebFetcherInput): Promise<WebFetcherOutput> {
  const { data: runData, error: runError } = await supabase
    .rpc('create_tool_run', {
      p_tool_id: 'web-fetcher',
      p_input_type: 'url',
      p_input_data: input
    });

  if (runError) throw new Error(`Failed to create run: ${runError.message}`);
  const runId = runData as string;

  try {
    const { data, error } = await supabase.functions.invoke('browser-fetch', {
      body: { url: input.url, mode: input.extractMode }
    });

    if (error) throw error;

    const result: WebFetcherOutput = {
      url: input.url,
      title: data.title || 'Untitled',
      text: data.text || '',
      html: input.extractMode === 'html' || input.extractMode === 'all' ? data.html : undefined,
      metadata: data.metadata || {},
      links: data.links || [],
      images: data.images || [],
      wordCount: (data.text || '').split(/\s+/).filter(Boolean).length
    };

    await supabase.rpc('complete_tool_run', {
      p_run_id: runId,
      p_status: 'completed',
      p_output_type: 'fetch',
      p_content: result.text.substring(0, 10000),
      p_content_json: result
    });

    return result;
  } catch (err) {
    await supabase.rpc('complete_tool_run', {
      p_run_id: runId,
      p_status: 'failed',
      p_output_type: 'error',
      p_content: '',
      p_error_message: err instanceof Error ? err.message : 'Fetch failed'
    });
    throw err;
  }
}

// =============================================================================
// TOOL HISTORY
// =============================================================================

export async function getToolHistory(toolId?: ToolId, limit = 20): Promise<ToolRun[]> {
  const { data, error } = await supabase
    .rpc('get_tool_history', {
      p_tool_id: toolId || null,
      p_limit: limit
    });

  if (error) throw error;

  return (data as ToolHistoryItem[] || []).map(item => ({
    id: item.id,
    toolId: item.tool_id as ToolId,
    inputData: item.input_data,
    status: item.status as ToolRun['status'],
    createdAt: new Date(item.created_at),
    outputs: item.outputs
  }));
}

export default {
  summarizeWebsite,
  captionImage,
  calculateMath,
  executeCode,
  fetchWebsite,
  getToolHistory
};
