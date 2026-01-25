/**
 * THE LUCY LOUNGE - AI Memory Edge Function
 * 
 * Manages Lucy's long-term memory system:
 * - Store new memories (facts, preferences, emotional context)
 * - Retrieve relevant memories by semantic search
 * - Update/decay memory importance over time
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MemoryRequest {
  action: 'store' | 'retrieve' | 'search' | 'forget';
  user_id: string;
  memory_type?: 'fact' | 'preference' | 'emotional' | 'general';
  content?: string;
  metadata?: Record<string, unknown>;
  query?: string;
  limit?: number;
  memory_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const body: MemoryRequest = await req.json();
    const { action, user_id, memory_type, content, metadata, query, limit = 10, memory_id } = body;

    if (!user_id) {
      throw new Error('user_id is required');
    }

    let result;

    switch (action) {
      case 'store': {
        if (!content) throw new Error('content is required for store action');
        
        // Calculate importance score
        const importance = calculateImportance(memory_type || 'general', content, metadata);
        
        const { data, error } = await supabase
          .from('user_memories')
          .insert({
            user_id,
            memory_type: memory_type || 'general',
            content,
            metadata: {
              ...metadata,
              importance,
              created_at: new Date().toISOString(),
            },
          })
          .select()
          .single();

        if (error) throw error;
        result = { success: true, memory: data };
        break;
      }

      case 'retrieve': {
        // Get all memories for user, optionally filtered by type
        let queryBuilder = supabase
          .from('user_memories')
          .select('*')
          .eq('user_id', user_id)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (memory_type) {
          queryBuilder = queryBuilder.eq('memory_type', memory_type);
        }

        const { data, error } = await queryBuilder;
        if (error) throw error;
        result = { success: true, memories: data };
        break;
      }

      case 'search': {
        if (!query) throw new Error('query is required for search action');
        
        // Full-text search on content
        const { data, error } = await supabase
          .from('user_memories')
          .select('*')
          .eq('user_id', user_id)
          .textSearch('content', query, { type: 'websearch' })
          .limit(limit);

        if (error) {
          // Fallback to ILIKE if full-text search fails
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('user_memories')
            .select('*')
            .eq('user_id', user_id)
            .ilike('content', `%${query}%`)
            .limit(limit);

          if (fallbackError) throw fallbackError;
          result = { success: true, memories: fallbackData };
        } else {
          result = { success: true, memories: data };
        }
        break;
      }

      case 'forget': {
        if (!memory_id) throw new Error('memory_id is required for forget action');
        
        const { error } = await supabase
          .from('user_memories')
          .delete()
          .eq('id', memory_id)
          .eq('user_id', user_id); // Ensure user owns the memory

        if (error) throw error;
        result = { success: true, deleted: memory_id };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    const error = err as Error;
    console.error('Memory function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error?.message || 'Unknown error').replace(/key|token|password/gi, '[REDACTED]') 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

function calculateImportance(
  memoryType: string,
  content: string,
  metadata?: Record<string, unknown>
): number {
  let score = 0.5;

  // Type-based scoring
  switch (memoryType) {
    case 'fact':
      score = 0.8;
      break;
    case 'preference':
      score = 0.7;
      break;
    case 'emotional':
      score = 0.9;
      break;
    case 'general':
      score = 0.4;
      break;
  }

  // Content length bonus
  if (content.length > 100) {
    score += 0.1;
  }

  // Metadata bonus
  if (metadata?.mentions_count) {
    score += 0.05 * Math.min(Number(metadata.mentions_count), 5);
  }

  return Math.min(score, 1.0);
}
