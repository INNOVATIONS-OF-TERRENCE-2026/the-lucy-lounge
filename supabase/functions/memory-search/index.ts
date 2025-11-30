import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, query, topK = 5, persona } = await req.json();

    if (!userId || !query?.trim()) {
      return new Response(JSON.stringify({ error: 'userId and query are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[memory-search] Searching memories for user:', userId);

    // Simple text search using PostgreSQL full-text search
    let dbQuery = supabase
      .from('user_memories')
      .select('*')
      .eq('user_id', userId)
      .order('importance_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(topK);

    // Filter by persona if specified
    if (persona) {
      dbQuery = dbQuery.eq('memory_type', persona);
    }

    // Search in content
    if (query) {
      dbQuery = dbQuery.textSearch('content', query, {
        type: 'websearch',
        config: 'english',
      });
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.error('[memory-search] DB error:', error);
      throw error;
    }

    return new Response(JSON.stringify({
      ok: true,
      memories: data || [],
      count: data?.length || 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[memory-search] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to search memories',
      memories: [],
      count: 0,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
