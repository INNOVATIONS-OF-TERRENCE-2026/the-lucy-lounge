/**
 * THE LUCY LOUNGE - Legacy Lovable Cloud Ingestion
 * 
 * One-time Edge Function to:
 * - Pull any remaining data from Lovable Cloud (if reachable)
 * - Normalize into new Supabase tables
 * - Mark records with source = 'lovable_cloud'
 * 
 * This is a best-effort migration - failures are logged but don't block.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IngestRequest {
  user_id: string;
  user_email: string;
  localStorage_data?: {
    theme?: string;
    music_enabled?: boolean;
    music_volume?: number;
    sound_enabled?: boolean;
    shuffle_enabled?: boolean;
    active_world?: string;
    spotify_content_id?: string;
    spotify_genre?: string;
    recently_played?: Array<{
      content_type: string;
      content_id: string;
      title?: string;
      artist?: string;
      genre?: string;
    }>;
  };
}

interface IngestResult {
  success: boolean;
  profile_created: boolean;
  preferences_created: boolean;
  recently_played_count: number;
  errors: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const result: IngestResult = {
    success: false,
    profile_created: false,
    preferences_created: false,
    recently_played_count: 0,
    errors: [],
  };

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const body: IngestRequest = await req.json();
    const { user_id, user_email, localStorage_data } = body;

    if (!user_id || !user_email) {
      throw new Error('user_id and user_email are required');
    }

    // 1. Ensure profile exists
    const { data: profile, error: profileError } = await supabase.rpc('ensure_user_profile', {
      p_user_id: user_id,
      p_email: user_email,
    });

    if (profileError) {
      result.errors.push(`Profile: ${profileError.message}`);
    } else {
      result.profile_created = true;
    }

    // 2. Create/update preferences from localStorage
    if (localStorage_data) {
      const prefDefaults = {
        theme: localStorage_data.theme || 'midnight-purple',
        music_enabled: localStorage_data.music_enabled ?? false,
        music_volume: localStorage_data.music_volume ?? 0.5,
        sound_enabled: localStorage_data.sound_enabled ?? true,
        shuffle_enabled: localStorage_data.shuffle_enabled ?? true,
        active_world: localStorage_data.active_world || 'none',
        spotify_content_id: localStorage_data.spotify_content_id || null,
        spotify_genre: localStorage_data.spotify_genre || null,
      };

      const { data: prefs, error: prefsError } = await supabase.rpc('ensure_user_preferences', {
        p_user_id: user_id,
        p_defaults: prefDefaults,
      });

      if (prefsError) {
        result.errors.push(`Preferences: ${prefsError.message}`);
      } else {
        result.preferences_created = true;

        // Log the import
        await supabase.from('legacy_import_log').insert({
          user_id,
          source: 'localstorage',
          entity_type: 'preferences',
          source_data: prefDefaults,
          import_status: 'success',
          processed_at: new Date().toISOString(),
        });
      }

      // 3. Import recently played
      if (localStorage_data.recently_played && Array.isArray(localStorage_data.recently_played)) {
        for (const item of localStorage_data.recently_played.slice(0, 50)) {
          try {
            await supabase.rpc('upsert_recently_played', {
              p_user_id: user_id,
              p_content_type: item.content_type || 'spotify',
              p_content_id: item.content_id,
              p_title: item.title || null,
              p_artist: item.artist || null,
              p_genre: item.genre || null,
            });
            result.recently_played_count++;
          } catch (err) {
            // Continue on individual failures
            result.errors.push(`Recently played ${item.content_id}: ${err.message}`);
          }
        }
      }
    }

    // 4. Try to pull from Lovable Cloud (best effort)
    // Note: Lovable Cloud may not be accessible - this is expected
    try {
      // Lovable Cloud API endpoint (if it exists)
      const lovableCloudUrl = Deno.env.get('LOVABLE_CLOUD_URL');
      
      if (lovableCloudUrl) {
        const cloudResponse = await fetch(`${lovableCloudUrl}/api/user/${user_id}/data`, {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
          },
        });

        if (cloudResponse.ok) {
          const cloudData = await cloudResponse.json();
          
          // Log successful cloud import
          await supabase.from('legacy_import_log').insert({
            user_id,
            source: 'lovable_cloud',
            entity_type: 'full_export',
            source_data: cloudData,
            import_status: 'success',
            processed_at: new Date().toISOString(),
          });
        }
      }
    } catch (cloudErr) {
      // Expected to fail - Lovable Cloud is legacy
      console.log('Lovable Cloud not reachable (expected):', cloudErr.message);
    }

    result.success = result.profile_created || result.preferences_created;

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Legacy ingest error:', error);
    result.errors.push(error.message);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 even on error - this is best-effort
    });
  }
});
