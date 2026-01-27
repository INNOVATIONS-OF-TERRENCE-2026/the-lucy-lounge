/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * THE LUCY LOUNGE - Lucy Brain Hook (PERFORMANCE OPTIMIZED)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Frontend client for the Lucy Brain Router.
 * 
 * PERFORMANCE FEATURES:
 * - Mobile detection for optimized context windows
 * - Immediate streaming start
 * - Request deduplication
 * - Optimistic UI support
 * 
 * ABSOLUTE RULES:
 * - Never expose model names, providers, or technical details
 * - Lucy is the only AI identity visible to users
 * - All routing decisions happen server-side
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════════
// PERFORMANCE: Mobile detection
// ═══════════════════════════════════════════════════════════════════════════════

function detectMobile(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check user agent
  const ua = navigator.userAgent.toLowerCase();
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
  
  // Check screen size
  const isSmallScreen = window.innerWidth < 768;
  
  // Check touch capability
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return isMobileUA || (isSmallScreen && hasTouch);
}

// Types (provider-agnostic)
export type BrainMode = 'auto' | 'chat' | 'reasoning' | 'tool_use' | 'code' | 'creative';
export type LatencyBudget = 'low' | 'medium' | 'high';

export interface LucyMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LucyBrainOptions {
  mode?: BrainMode;
  latencyBudget?: LatencyBudget;
  stream?: boolean;
  context?: {
    toolResults?: unknown;
    attachments?: string[];
    previousTopics?: string[];
  };
  /**
   * GENIUS MODE: Forces 70B+ class models for maximum intelligence.
   * When enabled, Lucy uses frontier models for deeper, more thoughtful responses.
   * UI shows "Lucy is thinking deeply..." - NEVER shows model names.
   */
  geniusMode?: boolean;
}

export interface LucyBrainResponse {
  success: boolean;
  content: string;
  error?: string;
  timing?: {
    totalMs: number;
  };
}

interface UseLucyBrainReturn {
  // Core functions
  sendMessage: (
    messages: LucyMessage[],
    userId: string,
    conversationId?: string | null,
    options?: LucyBrainOptions
  ) => Promise<LucyBrainResponse>;
  
  // Streaming state
  streamingText: string;
  isStreaming: boolean;
  
  // Control functions
  cancelStream: () => void;
  
  // Status
  isLoading: boolean;
  error: string | null;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vabrcwdngngdbjmtpwxp.supabase.co';

export function useLucyBrain(): UseLucyBrainReturn {
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef<string | null>(null);
  
  // Memoize mobile detection
  const isMobile = useMemo(() => detectMobile(), []);

  /**
   * Cancel any active streaming
   */
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  /**
   * Process SSE stream from Lucy Brain
   */
  const processStream = useCallback(async (
    response: Response,
    onChunk: (text: string) => void
  ): Promise<string> => {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');
    
    const decoder = new TextDecoder();
    let fullText = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              fullText += content;
              onChunk(fullText);
            }
          } catch {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
    
    return fullText;
  }, []);

  /**
   * Send message to Lucy Brain
   */
  const sendMessage = useCallback(async (
    messages: LucyMessage[],
    userId: string,
    conversationId?: string | null,
    options: LucyBrainOptions = {}
  ): Promise<LucyBrainResponse> => {
    // Cancel any existing stream
    cancelStream();
    
    // Set up new abort controller
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setError(null);
    setStreamingText('');
    
    const {
      mode = 'auto',
      latencyBudget = isMobile ? 'low' : 'medium', // Force low latency on mobile
      stream = true,
      context = {},
      geniusMode = false, // GENIUS MODE: Forces 70B+ models
    } = options;

    // Generate request ID for deduplication
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    requestIdRef.current = requestId;

    try {
      // Get auth session
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/lucy-brain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Type': isMobile ? 'mobile' : 'desktop',
          ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
        },
        body: JSON.stringify({
          messages,
          mode,
          userId,
          conversationId,
          stream,
          latencyBudget,
          context,
          isMobile,
          geniusMode, // GENIUS MODE: Forces 70B+ models for maximum intelligence
        }),
        signal: abortControllerRef.current.signal,
      });
      
      // Check if request was superseded
      if (requestIdRef.current !== requestId) {
        return { success: false, content: '', error: 'Request superseded' };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Lucy encountered an issue (${response.status})`;
        setError(errorMessage);
        return { success: false, content: '', error: errorMessage };
      }

      // Handle streaming response
      if (stream && response.headers.get('content-type')?.includes('text/event-stream')) {
        setIsStreaming(true);
        
        const fullText = await processStream(response, (text) => {
          setStreamingText(text);
        });
        
        setIsStreaming(false);
        setStreamingText('');
        
        return {
          success: true,
          content: fullText,
          timing: { totalMs: parseInt(response.headers.get('X-Lucy-Time') || '0') },
        };
      }

      // Handle non-streaming response
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return { success: false, content: '', error: data.error };
      }

      return {
        success: true,
        content: data.text || data.content || '',
        timing: data.timing,
      };

    } catch (err) {
      // Handle abort
      if (err instanceof Error && err.name === 'AbortError') {
        return { success: false, content: '', error: 'Request cancelled' };
      }
      
      // Handle other errors - never expose technical details
      console.error('[useLucyBrain] Error:', err);
      const errorMessage = "Lucy's thinking was briefly interrupted. Please try again.";
      setError(errorMessage);
      return { success: false, content: '', error: errorMessage };
      
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [cancelStream, processStream]);

  return {
    sendMessage,
    streamingText,
    isStreaming,
    cancelStream,
    isLoading,
    error,
  };
}

/**
 * Simple function to call Lucy Brain without hook state
 * Useful for one-off calls from non-component code
 */
export async function callLucyBrain(
  messages: LucyMessage[],
  options: LucyBrainOptions & { userId?: string; conversationId?: string } = {}
): Promise<LucyBrainResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = options.userId || session?.user?.id || 'anonymous';
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/lucy-brain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
      },
      body: JSON.stringify({
        messages,
        mode: options.mode || 'auto',
        userId,
        conversationId: options.conversationId,
        stream: false, // Non-streaming for simple calls
        latencyBudget: options.latencyBudget || 'medium',
        context: options.context || {},
        geniusMode: options.geniusMode || false, // GENIUS MODE support
      }),
    });

    if (!response.ok) {
      return { success: false, content: '', error: 'Lucy is temporarily unavailable' };
    }

    const data = await response.json();
    return {
      success: true,
      content: data.text || data.content || '',
      timing: data.timing,
    };
    
  } catch (err) {
    console.error('[callLucyBrain] Error:', err);
    return { success: false, content: '', error: 'Connection issue' };
  }
}

export default useLucyBrain;
