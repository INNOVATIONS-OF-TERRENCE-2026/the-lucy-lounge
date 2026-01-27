import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { startDate, endDate } = await req.json();

    // Get user's conversation IDs first
    const { data: userConvs } = await supabaseClient
      .from('conversations')
      .select('id')
      .eq('user_id', user.id);
    
    const conversationIds = userConvs?.map(c => c.id) || [];

    // Get message count
    const { count: messageCount } = await supabaseClient
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .in('conversation_id', conversationIds);

    // Get usage stats
    const { data: usageStats } = await supabaseClient
      .from('usage_stats')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate);

    // Get conversation count
    const { count: conversationCount } = await supabaseClient
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    // Get analytics events
    const { data: events } = await supabaseClient
      .from('analytics_events')
      .select('event_type, event_data, created_at')
      .eq('user_id', user.id)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    // Aggregate data
    const totalTokens = usageStats?.reduce((sum, stat) => sum + stat.tokens_used, 0) || 0;
    const totalCost = usageStats?.reduce((sum, stat) => sum + Number(stat.cost_usd), 0) || 0;
    const modelDistribution = usageStats?.reduce((acc, stat) => {
      acc[stat.model_used || 'unknown'] = (acc[stat.model_used || 'unknown'] || 0) + stat.messages_sent;
      return acc;
    }, {} as Record<string, number>);

    return new Response(
      JSON.stringify({
        messageCount: messageCount || 0,
        conversationCount: conversationCount || 0,
        totalTokens,
        totalCost: totalCost.toFixed(2),
        modelDistribution,
        events: events || [],
        usageByDay: usageStats || [],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Analytics error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
