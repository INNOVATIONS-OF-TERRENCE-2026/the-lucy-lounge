/**
 * THE LUCY LOUNGE - Session Management Edge Function
 * 
 * Tracks user sessions for analytics and personalization:
 * - Create/update session on app load
 * - Track last activity
 * - Clean up stale sessions
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SessionRequest {
  action: 'start' | 'heartbeat' | 'end' | 'list';
  user_id?: string;
  session_token?: string;
  device_info?: {
    browser?: string;
    os?: string;
    device_type?: string;
    screen_size?: string;
  };
  ip_address?: string;
  user_agent?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const body: SessionRequest = await req.json();
    const { action, user_id, session_token, device_info, user_agent } = body;
    
    // Get IP from request headers
    const ip_address = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                       req.headers.get('cf-connecting-ip') ||
                       null;

    let result;

    switch (action) {
      case 'start': {
        // Generate new session token if not provided
        const token = session_token || crypto.randomUUID();
        
        const { data, error } = await supabase
          .from('user_sessions')
          .insert({
            user_id: user_id || null,
            session_token: token,
            device_info: device_info || {},
            ip_address,
            user_agent,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;
        result = { success: true, session: data };
        break;
      }

      case 'heartbeat': {
        if (!session_token) throw new Error('session_token is required');
        
        const { data, error } = await supabase
          .from('user_sessions')
          .update({ 
            last_active_at: new Date().toISOString(),
            user_id: user_id || null, // Update user_id if they logged in
          })
          .eq('session_token', session_token)
          .eq('is_active', true)
          .select()
          .single();

        if (error) throw error;
        result = { success: true, session: data };
        break;
      }

      case 'end': {
        if (!session_token) throw new Error('session_token is required');
        
        const { error } = await supabase
          .from('user_sessions')
          .update({ 
            is_active: false,
            ended_at: new Date().toISOString(),
          })
          .eq('session_token', session_token);

        if (error) throw error;
        result = { success: true, ended: session_token };
        break;
      }

      case 'list': {
        if (!user_id) throw new Error('user_id is required for list action');
        
        const { data, error } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', user_id)
          .order('started_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        result = { success: true, sessions: data };
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
    console.error('Session function error:', error);
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
