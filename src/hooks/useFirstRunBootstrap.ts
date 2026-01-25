/**
 * THE LUCY LOUNGE - First Run User Bootstrap
 * 
 * Ensures user profile exists on first login.
 * Hydrates preferences from localStorage.
 * Never blocks login if data is missing.
 */

import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

// LocalStorage keys to check for legacy data
const LEGACY_KEYS = {
  theme: 'lucy-theme',
  musicEnabled: 'lucy-music-enabled',
  musicVolume: 'lucy-music-volume',
  soundEnabled: 'lucy-sound-enabled',
  shuffleEnabled: 'lucy-music-shuffle',
  activeWorld: 'lucy-worlds-active',
  spotifyContentId: 'lucy-spotify-content',
  spotifyGenre: 'lucy-spotify-genre',
  recentlyPlayed: 'lucy-recently-played',
  preferences: 'lucy-user-preferences',
};

interface LegacyLocalStorageData {
  theme?: string;
  music_enabled?: boolean;
  music_volume?: number;
  sound_enabled?: boolean;
  shuffle_enabled?: boolean;
  active_world?: string;
  spotify_content_id?: string;
  spotify_genre?: string;
}

/**
 * Collects legacy data from localStorage
 */
function collectLocalStorageData(): LegacyLocalStorageData {
  const data: LegacyLocalStorageData = {};

  try {
    // Theme
    const theme = localStorage.getItem(LEGACY_KEYS.theme);
    if (theme) data.theme = theme;

    // Audio settings
    const musicEnabled = localStorage.getItem(LEGACY_KEYS.musicEnabled);
    if (musicEnabled !== null) data.music_enabled = musicEnabled === 'true';

    const musicVolume = localStorage.getItem(LEGACY_KEYS.musicVolume);
    if (musicVolume !== null) data.music_volume = parseFloat(musicVolume);

    const soundEnabled = localStorage.getItem(LEGACY_KEYS.soundEnabled);
    if (soundEnabled !== null) data.sound_enabled = soundEnabled !== 'false';

    const shuffleEnabled = localStorage.getItem(LEGACY_KEYS.shuffleEnabled);
    if (shuffleEnabled !== null) data.shuffle_enabled = shuffleEnabled !== 'false';

    // World
    const activeWorld = localStorage.getItem(LEGACY_KEYS.activeWorld);
    if (activeWorld) data.active_world = activeWorld;

    // Spotify
    const spotifyContent = localStorage.getItem(LEGACY_KEYS.spotifyContentId);
    if (spotifyContent) {
      try {
        const parsed = JSON.parse(spotifyContent);
        data.spotify_content_id = parsed.contentId || parsed;
        data.spotify_genre = parsed.genre;
      } catch {
        data.spotify_content_id = spotifyContent;
      }
    }

    // Consolidated preferences (newer format)
    const prefs = localStorage.getItem(LEGACY_KEYS.preferences);
    if (prefs) {
      try {
        const parsed = JSON.parse(prefs);
        Object.assign(data, {
          theme: data.theme || parsed.theme,
          music_enabled: data.music_enabled ?? parsed.music_enabled,
          music_volume: data.music_volume ?? parsed.music_volume,
          sound_enabled: data.sound_enabled ?? parsed.sound_enabled,
          shuffle_enabled: data.shuffle_enabled ?? parsed.shuffle_enabled,
          active_world: data.active_world || parsed.active_world,
          spotify_content_id: data.spotify_content_id || parsed.spotify_content_id,
          spotify_genre: data.spotify_genre || parsed.spotify_genre,
        });
      } catch {
        // Ignore parse errors
      }
    }
  } catch (err) {
    console.warn('Error collecting localStorage data:', err);
  }

  return data;
}

/**
 * Bootstrap user profile
 */
async function bootstrapUser(user: User): Promise<void> {
  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      // Profile doesn't exist - create it
      const localStorageData = collectLocalStorageData();

      // Create profile with preferences stored as JSON
      const { error } = await supabase.from('profiles').insert({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        preferences: JSON.parse(JSON.stringify(localStorageData)),
      });

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.warn('Profile creation error:', error);
      } else {
        console.log('User profile created');
      }
    }
  } catch (err) {
    // Never throw - bootstrap failures are non-blocking
    console.warn('User bootstrap error (non-blocking):', err);
  }
}

/**
 * Hook to bootstrap user on first login
 * Call this in your main App or layout component
 */
export function useFirstRunBootstrap() {
  const bootstrappedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userId = session.user.id;
          
          // Only bootstrap once per session
          if (!bootstrappedRef.current.has(userId)) {
            bootstrappedRef.current.add(userId);
            await bootstrapUser(session.user);
          }
        }
      }
    );

    // Also check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !bootstrappedRef.current.has(session.user.id)) {
        bootstrappedRef.current.add(session.user.id);
        bootstrapUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
}

/**
 * Standalone bootstrap function for imperative use
 */
export async function bootstrapCurrentUser(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    await bootstrapUser(session.user);
  }
}
