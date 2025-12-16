import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Privacy sanitizer
function sanitizeError(error: unknown): string {
  console.error('[INTERNAL ERROR]', error);
  return "Context analysis temporarily unavailable. Your conversation continues normally.";
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { conversationId, messages = [] } = await req.json();
    
    if (!conversationId || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Conversation ID and messages required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.log('[context-analyzer] LOVABLE_API_KEY not configured, skipping analysis');
      return new Response(JSON.stringify({ 
        topics: [],
        preferences: {},
        keyFacts: [],
        suggestions: [],
        unresolvedQuestions: [],
        skipped: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[context-analyzer] Analyzing context for conversation:', conversationId);

    // Get current date/time for temporal context
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentDateTime = now.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Build conversation summary (limit to prevent token overflow)
    const recentMessages = messages.slice(-5);
    const conversationText = recentMessages.map((m: any) => 
      `${m.role}: ${m.content?.substring(0, 500) || ''}`
    ).join('\n\n');

    const analysisPrompt = `Analyze this conversation briefly and extract key context.

Conversation:
${conversationText.substring(0, 2000)}

Respond with JSON only:
{
  "topics": ["topic1", "topic2"],
  "preferences": {},
  "suggestions": ["helpful follow-up suggestion"]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          {
            role: 'system',
            content: `You are a context analyzer. Extract key topics and preferences from conversations. Respond only with valid JSON. Current year: ${currentYear}.`
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[context-analyzer] AI gateway error:', response.status, errorText);
      // Return empty results instead of throwing - this is a non-critical feature
      return new Response(JSON.stringify({ 
        topics: [],
        preferences: {},
        keyFacts: [],
        suggestions: [],
        unresolvedQuestions: [],
        error: 'Analysis unavailable'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    
    let analysis = {
      topics: [],
      preferences: {},
      keyFacts: [],
      suggestions: [],
      unresolvedQuestions: []
    };
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        analysis = { ...analysis, ...parsed };
      }
    } catch (e) {
      console.error('[context-analyzer] Failed to parse response:', e);
    }

    console.log('[context-analyzer] Analysis complete:', analysis.topics);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[context-analyzer] Internal error:', error);
    return new Response(JSON.stringify({ 
      error: sanitizeError(error),
      topics: [],
      preferences: {},
      keyFacts: [],
      suggestions: [],
      unresolvedQuestions: []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
