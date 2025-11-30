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

    const { userId, summary, persona } = await req.json();

    if (!userId || !summary?.trim()) {
      return new Response(JSON.stringify({ error: 'userId and summary are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[memory-save] Saving memory for user:', userId);

    // Store in user_memories table
    const { data, error } = await supabase
      .from('user_memories')
      .insert({
        user_id: userId,
        content: summary,
        memory_type: persona || 'general',
        importance_score: 0.8, // Default importance
      })
      .select()
      .single();

    if (error) {
      console.error('[memory-save] DB error:', error);
      throw error;
    }

    return new Response(JSON.stringify({
      ok: true,
      memory: data,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[memory-save] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to save memory'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
