import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * THE LUCY LOUNGE - LUCY BRAIN MEMORY SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * CROSS-STUDIO INTELLIGENCE SYSTEM
 * 
 * This service enables Lucy to:
 * - Store memories from ANY source (chat, audio, lounge, tools)
 * - Retrieve relevant context for ANY studio
 * - Learn user preferences over time
 * - Maintain personality continuity across sessions
 * 
 * ENDPOINTS:
 * - POST /store - Store a new memory
 * - POST /recall - Retrieve relevant memories
 * - POST /session - Get/create active brain session
 * - POST /preferences - Get/update preferences
 * - POST /emit - Emit cross-studio event
 * - POST /context - Get full context for a studio
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Memory source types
type MemorySource = 'chat' | 'audio' | 'lounge' | 'tool' | 'studio' | 'arcade' | 'system';
type MemoryType = 'fact' | 'preference' | 'creation' | 'insight' | 'emotion' | 'context' | 'topic';

interface StoreMemoryRequest {
  source: MemorySource;
  content: string;
  memoryType?: MemoryType;
  importance?: number;
  sourceId?: string;
  metadata?: Record<string, unknown>;
}

interface RecallMemoryRequest {
  sources?: MemorySource[];
  memoryTypes?: MemoryType[];
  limit?: number;
  query?: string; // For semantic search
}

interface ContextRequest {
  studio: 'chat' | 'audio' | 'lounge' | 'tool';
  includePreferences?: boolean;
  includeRecentMemories?: boolean;
  includeSessionState?: boolean;
  memoryLimit?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY IMPORTANCE SCORING
// ═══════════════════════════════════════════════════════════════════════════════

function calculateImportance(
  content: string,
  source: MemorySource,
  memoryType: MemoryType,
  providedImportance?: number
): number {
  if (providedImportance !== undefined) return Math.min(1, Math.max(0, providedImportance));
  
  let score = 0.5;
  
  // Source-based scoring
  switch (source) {
    case 'chat': score += 0.1; break;
    case 'audio': score += 0.15; break; // Creations are valuable
    case 'lounge': score += 0.05; break;
    case 'system': score += 0.2; break;
  }
  
  // Type-based scoring
  switch (memoryType) {
    case 'preference': score += 0.2; break;
    case 'creation': score += 0.25; break;
    case 'insight': score += 0.15; break;
    case 'emotion': score += 0.1; break;
    case 'fact': score += 0.05; break;
  }
  
  // Content-based scoring
  const keywords = ['remember', 'important', 'always', 'never', 'love', 'hate', 'prefer', 'favorite'];
  if (keywords.some(kw => content.toLowerCase().includes(kw))) {
    score += 0.15;
  }
  
  // Length bonus (longer = more detailed)
  if (content.length > 200) score += 0.05;
  if (content.length > 500) score += 0.05;
  
  return Math.min(1, score);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

interface StudioContext {
  sessionId: string;
  emotionalState?: string;
  currentTopic?: string;
  preferences: {
    tonePreference: string;
    creativityLevel: number;
    musicStyles: string[];
    verbosity: string;
    [key: string]: unknown;
  };
  recentMemories: Array<{
    source: string;
    type: string;
    summary: string;
    importance: number;
  }>;
  studioSpecific: Record<string, unknown>;
}

async function buildStudioContext(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  studio: string,
  options: {
    includePreferences?: boolean;
    includeRecentMemories?: boolean;
    includeSessionState?: boolean;
    memoryLimit?: number;
  }
): Promise<StudioContext> {
  const context: StudioContext = {
    sessionId: '',
    preferences: {
      tonePreference: 'friendly',
      creativityLevel: 0.7,
      musicStyles: [],
      verbosity: 'balanced',
    },
    recentMemories: [],
    studioSpecific: {},
  };
  
  // Get or create session
  const { data: sessionData } = await supabase.rpc('get_or_create_brain_session', {
    p_user_id: userId,
    p_context: studio,
  });
  
  if (sessionData) {
    context.sessionId = sessionData.id;
    context.emotionalState = sessionData.emotional_state;
    context.currentTopic = sessionData.current_topic;
  }
  
  // Get preferences
  if (options.includePreferences !== false) {
    const { data: prefs } = await supabase.rpc('get_or_create_brain_preferences', {
      p_user_id: userId,
    });
    
    if (prefs) {
      context.preferences = {
        tonePreference: prefs.tone_preference || 'friendly',
        creativityLevel: prefs.creativity_level || 0.7,
        musicStyles: prefs.music_style || [],
        verbosity: prefs.verbosity || 'balanced',
        audioEnergy: prefs.audio_energy,
        preferredGenres: prefs.preferred_genres || [],
        ambientStyle: prefs.ambient_style,
        humorLevel: prefs.humor_level,
        learningStyle: prefs.learning_style,
        topicsOfInterest: prefs.topics_of_interest || [],
      };
    }
  }
  
  // Get recent memories
  if (options.includeRecentMemories !== false) {
    const limit = options.memoryLimit || 10;
    
    // Get memories relevant to this studio
    const relevantSources = getRelevantSourcesForStudio(studio);
    
    const { data: memories } = await supabase.rpc('get_relevant_brain_memories', {
      p_user_id: userId,
      p_sources: relevantSources,
      p_limit: limit,
    });
    
    if (memories) {
      context.recentMemories = memories.map((m: any) => ({
        source: m.source,
        type: m.memory_type,
        summary: m.summary || m.content?.slice(0, 100),
        importance: m.importance_score,
      }));
    }
  }
  
  // Add studio-specific context
  context.studioSpecific = await getStudioSpecificContext(supabase, userId, studio);
  
  return context;
}

function getRelevantSourcesForStudio(studio: string): string[] {
  switch (studio) {
    case 'chat':
      return ['chat', 'audio', 'lounge', 'tool']; // Chat benefits from all sources
    case 'audio':
      return ['audio', 'chat', 'lounge']; // Audio focuses on creative context
    case 'lounge':
      return ['lounge', 'chat', 'audio']; // Lounges use emotional context
    case 'tool':
      return ['tool', 'chat']; // Tools are task-focused
    default:
      return ['chat', 'audio', 'lounge', 'tool'];
  }
}

async function getStudioSpecificContext(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  studio: string
): Promise<Record<string, unknown>> {
  switch (studio) {
    case 'audio': {
      // Get recent audio generations
      const { data: generations } = await supabase
        .from('audio_generations')
        .select('prompt, style, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      return {
        recentGenerations: generations || [],
        suggestedStyles: extractStylePatterns(generations || []),
      };
    }
    
    case 'lounge': {
      // Get recent lounge sessions
      const { data: sessions } = await supabase
        .from('lounge_sessions')
        .select('lounge_type, mood, duration_minutes')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      return {
        recentLounges: sessions || [],
        preferredMoods: extractMoodPatterns(sessions || []),
      };
    }
    
    default:
      return {};
  }
}

function extractStylePatterns(generations: any[]): string[] {
  if (!generations.length) return [];
  const styles = generations.map(g => g.style).filter(Boolean);
  return [...new Set(styles)].slice(0, 3);
}

function extractMoodPatterns(sessions: any[]): string[] {
  if (!sessions.length) return [];
  const moods = sessions.map(s => s.mood).filter(Boolean);
  return [...new Set(moods)].slice(0, 3);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop() || 'context';
    const body = await req.json().catch(() => ({}));

    console.log(`[lucy-brain-memory] Action: ${action}, User: ${userId?.slice(0, 8)}...`);

    // ═══════════════════════════════════════════════════════════════════════════
    // ACTION: STORE MEMORY
    // ═══════════════════════════════════════════════════════════════════════════
    
    if (action === 'store') {
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { source, content, memoryType = 'fact', importance, sourceId } = body as StoreMemoryRequest;
      
      if (!source || !content) {
        return new Response(JSON.stringify({ error: 'source and content are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const calculatedImportance = calculateImportance(content, source, memoryType, importance);
      
      const { data: memory, error } = await supabase.rpc('store_brain_memory', {
        p_user_id: userId,
        p_source: source,
        p_content: content,
        p_memory_type: memoryType,
        p_importance: calculatedImportance,
        p_source_id: sourceId || null,
      });

      if (error) throw error;

      return new Response(JSON.stringify({
        ok: true,
        memory: { id: memory.id, importance: calculatedImportance },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ACTION: RECALL MEMORIES
    // ═══════════════════════════════════════════════════════════════════════════
    
    if (action === 'recall') {
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { sources, memoryTypes, limit = 10 } = body as RecallMemoryRequest;
      
      const { data: memories, error } = await supabase.rpc('get_relevant_brain_memories', {
        p_user_id: userId,
        p_sources: sources || null,
        p_memory_types: memoryTypes || null,
        p_limit: limit,
      });

      if (error) throw error;

      return new Response(JSON.stringify({
        ok: true,
        memories: memories || [],
        count: memories?.length || 0,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ACTION: GET/CREATE SESSION
    // ═══════════════════════════════════════════════════════════════════════════
    
    if (action === 'session') {
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { context = 'chat' } = body;
      
      const { data: session, error } = await supabase.rpc('get_or_create_brain_session', {
        p_user_id: userId,
        p_context: context,
      });

      if (error) throw error;

      return new Response(JSON.stringify({
        ok: true,
        session,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ACTION: GET/UPDATE PREFERENCES
    // ═══════════════════════════════════════════════════════════════════════════
    
    if (action === 'preferences') {
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { update } = body;
      
      if (update && typeof update === 'object') {
        // Update preferences
        for (const [key, value] of Object.entries(update)) {
          await supabase.rpc('learn_brain_preference', {
            p_user_id: userId,
            p_preference_key: key,
            p_preference_value: String(value),
          });
        }
      }
      
      const { data: prefs, error } = await supabase.rpc('get_or_create_brain_preferences', {
        p_user_id: userId,
      });

      if (error) throw error;

      return new Response(JSON.stringify({
        ok: true,
        preferences: prefs,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ACTION: EMIT CROSS-STUDIO EVENT
    // ═══════════════════════════════════════════════════════════════════════════
    
    if (action === 'emit') {
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { eventType, source, payload = {}, target } = body;
      
      if (!eventType || !source) {
        return new Response(JSON.stringify({ error: 'eventType and source are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: eventId, error } = await supabase.rpc('emit_brain_event', {
        p_user_id: userId,
        p_event_type: eventType,
        p_source: source,
        p_payload: payload,
        p_target: target || null,
      });

      if (error) throw error;

      return new Response(JSON.stringify({
        ok: true,
        eventId,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ACTION: GET FULL CONTEXT (Default)
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Default action: get context
    const {
      studio = 'chat',
      includePreferences = true,
      includeRecentMemories = true,
      includeSessionState = true,
      memoryLimit = 10,
    } = body as ContextRequest;

    if (!userId) {
      // Return default context for anonymous users
      return new Response(JSON.stringify({
        ok: true,
        context: {
          sessionId: null,
          preferences: {
            tonePreference: 'friendly',
            creativityLevel: 0.7,
            musicStyles: [],
            verbosity: 'balanced',
          },
          recentMemories: [],
          studioSpecific: {},
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const context = await buildStudioContext(supabase, userId, studio, {
      includePreferences,
      includeRecentMemories,
      includeSessionState,
      memoryLimit,
    });

    return new Response(JSON.stringify({
      ok: true,
      context,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[lucy-brain-memory] Error:', error);
    return new Response(JSON.stringify({
      error: 'Lucy Brain encountered an issue. Please try again.',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
