/**
 * THE LUCY LOUNGE - Spotify OAuth Callback Handler
 * 
 * Handles Spotify OAuth callback:
 * - Exchanges authorization code for tokens
 * - Stores tokens securely in spotify_connections
 * - Handles token refresh
 * - Graceful failure handling
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email: string;
  images?: Array<{ url: string }>;
}

interface CallbackRequest {
  code?: string;
  refresh_token?: string;
  action: 'callback' | 'refresh' | 'disconnect';
  user_id: string;
  redirect_uri?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const spotifyClientId = Deno.env.get('SPOTIFY_CLIENT_ID');
    const spotifyClientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

    if (!spotifyClientId || !spotifyClientSecret) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Spotify not configured',
          message: 'Spotify OAuth is not available. Using embed-only mode.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: CallbackRequest = await req.json();
    const { action, user_id, code, refresh_token, redirect_uri } = body;

    if (!user_id) {
      throw new Error('user_id is required');
    }

    let result;

    switch (action) {
      case 'callback': {
        if (!code) throw new Error('Authorization code is required');
        
        // Determine redirect URI (must match what was used in authorization)
        const callbackUri = redirect_uri || `${Deno.env.get('PUBLIC_URL') || 'https://thelucylounge.com'}/api/spotify/callback`;

        // Exchange code for tokens
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${spotifyClientId}:${spotifyClientSecret}`)}`,
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: callbackUri,
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('Spotify token exchange failed:', errorText);
          throw new Error('Failed to exchange authorization code');
        }

        const tokens: SpotifyTokenResponse = await tokenResponse.json();

        // Get user profile from Spotify
        const profileResponse = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
          },
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch Spotify profile');
        }

        const profile: SpotifyUserProfile = await profileResponse.json();

        // Store in database
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
        const scopes = tokens.scope.split(' ');

        const { data, error } = await supabase.rpc('upsert_spotify_connection', {
          p_user_id: user_id,
          p_spotify_user_id: profile.id,
          p_display_name: profile.display_name,
          p_email: profile.email,
          p_access_token: tokens.access_token,
          p_refresh_token: tokens.refresh_token || '',
          p_expires_at: expiresAt,
          p_scopes: scopes,
        });

        if (error) throw error;

        result = {
          success: true,
          spotify_user: {
            id: profile.id,
            display_name: profile.display_name,
            email: profile.email,
          },
          expires_at: expiresAt,
        };
        break;
      }

      case 'refresh': {
        // Get existing connection
        const { data: connection, error: connError } = await supabase
          .from('spotify_connections')
          .select('refresh_token')
          .eq('user_id', user_id)
          .eq('is_active', true)
          .single();

        if (connError || !connection?.refresh_token) {
          throw new Error('No active Spotify connection found');
        }

        // Refresh tokens
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${spotifyClientId}:${spotifyClientSecret}`)}`,
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: connection.refresh_token,
          }),
        });

        if (!tokenResponse.ok) {
          // Token refresh failed - disconnect gracefully
          await supabase.rpc('disconnect_spotify', { p_user_id: user_id });
          throw new Error('Token refresh failed - Spotify disconnected');
        }

        const tokens: SpotifyTokenResponse = await tokenResponse.json();
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

        // Update tokens
        await supabase
          .from('spotify_connections')
          .update({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || connection.refresh_token,
            token_expires_at: expiresAt,
            last_sync_at: new Date().toISOString(),
          })
          .eq('user_id', user_id);

        result = {
          success: true,
          access_token: tokens.access_token,
          expires_at: expiresAt,
        };
        break;
      }

      case 'disconnect': {
        await supabase.rpc('disconnect_spotify', { p_user_id: user_id });
        result = { success: true, message: 'Spotify disconnected' };
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
    console.error('Spotify callback error:', error);
    
    // Graceful failure - don't break the UI
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error?.message || 'Unknown error').replace(/client_secret|access_token|refresh_token/gi, '[REDACTED]'),
        message: 'Spotify connection failed. Listening Mode will use embed-only mode.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
