/**
 * THE LUCY LOUNGE - User Preferences Hook
 * 
 * Uses localStorage for preferences storage
 * Database sync available when profiles.preferences JSONB column is used
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface UserPreferences {
  user_id: string;
  // Theme & Display
  theme: string;
  reading_mode: 'normal' | 'sepia' | 'dark' | 'high-contrast';
  focus_mode: boolean;
  // Audio
  music_enabled: boolean;
  music_volume: number;
  sound_enabled: boolean;
  shuffle_enabled: boolean;
  // AI
  streaming_speed: 'slow' | 'normal' | 'fast';
  voice_enabled: boolean;
  // Lucy Worlds
  active_world: string;
  world_enabled: boolean;
  // Spotify
  spotify_content_id: string | null;
  spotify_content_type: 'playlist' | 'album' | 'track';
  spotify_genre: string | null;
  // Weather/Ambient
  weather_season: string | null;
  weather_enabled: boolean;
  // Arcade
  arcade_difficulty: 'easy' | 'medium' | 'hard';
  arcade_muted: boolean;
  // Meta
  updated_at: string;
}

const DEFAULT_PREFERENCES: Partial<UserPreferences> = {
  theme: 'midnight-purple',
  reading_mode: 'normal',
  focus_mode: false,
  music_enabled: false,
  music_volume: 0.5,
  sound_enabled: true,
  shuffle_enabled: true,
  streaming_speed: 'normal',
  voice_enabled: true,
  active_world: 'none',
  world_enabled: false,
  spotify_content_type: 'playlist',
  weather_enabled: false,
  arcade_difficulty: 'medium',
  arcade_muted: false,
};

// LocalStorage key
const LOCAL_STORAGE_KEY = 'lucy-user-preferences';

export function useUserPreferences() {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load preferences from localStorage
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setPreferences({ 
            ...DEFAULT_PREFERENCES, 
            ...parsed,
            user_id: user?.id ?? 'anonymous'
          } as UserPreferences);
        } else {
          setPreferences({ 
            ...DEFAULT_PREFERENCES,
            user_id: user?.id ?? 'anonymous'
          } as UserPreferences);
        }
      } catch (err) {
        console.warn('Error loading preferences from localStorage:', err);
        setPreferences({ 
          ...DEFAULT_PREFERENCES,
          user_id: user?.id ?? 'anonymous'
        } as UserPreferences);
      } finally {
        setLoading(false);
      }

      // Optional: Try to sync from profiles.preferences if user is logged in
      if (user) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('preferences')
            .eq('id', user.id)
            .single();

          if (data?.preferences && typeof data.preferences === 'object') {
            const dbPrefs = data.preferences as Record<string, unknown>;
            const merged = { 
              ...DEFAULT_PREFERENCES, 
              ...dbPrefs,
              user_id: user.id 
            } as UserPreferences;
            setPreferences(merged);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
          }
        } catch {
          // Silently fail - localStorage is primary source
        }
      }
    };

    loadPreferences();
  }, [user]);

  // Update single preference
  const updatePreference = useCallback(
    async <K extends keyof UserPreferences>(
      key: K,
      value: UserPreferences[K]
    ): Promise<void> => {
      if (!preferences) return;

      // Update state and localStorage
      const updated = { 
        ...preferences, 
        [key]: value, 
        updated_at: new Date().toISOString() 
      };
      setPreferences(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

      // Optional: background sync to profiles.preferences
      if (user) {
        try {
          await supabase
            .from('profiles')
            .update({ 
              preferences: JSON.parse(JSON.stringify(updated)),
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
        } catch (err) {
          console.warn('Background sync failed:', err);
        }
      }
    },
    [user, preferences]
  );

  // Update multiple preferences
  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>): Promise<void> => {
      if (!preferences) return;

      const updated = { 
        ...preferences, 
        ...updates, 
        updated_at: new Date().toISOString() 
      };
      setPreferences(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

      // Optional: background sync to profiles.preferences
      if (user) {
        try {
          await supabase
            .from('profiles')
            .update({ 
              preferences: JSON.parse(JSON.stringify(updated)),
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
        } catch (err) {
          console.warn('Background sync failed:', err);
        }
      }
    },
    [user, preferences]
  );

  // Reset to defaults
  const resetPreferences = useCallback(async (): Promise<void> => {
    const reset = { 
      ...DEFAULT_PREFERENCES,
      user_id: user?.id ?? 'anonymous',
      updated_at: new Date().toISOString()
    } as UserPreferences;
    
    setPreferences(reset);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reset));

    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ 
            preferences: JSON.parse(JSON.stringify(reset)),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      } catch (err) {
        console.warn('Background sync failed:', err);
      }
    }
  }, [user]);

  return {
    preferences,
    loading,
    error,
    updatePreference,
    updatePreferences,
    resetPreferences,
  };
}

// Convenience hooks for specific preference groups
export function useThemePreferences() {
  const { preferences, updatePreference, loading } = useUserPreferences();
  
  return {
    theme: preferences?.theme ?? 'midnight-purple',
    readingMode: preferences?.reading_mode ?? 'normal',
    focusMode: preferences?.focus_mode ?? false,
    setTheme: (theme: string) => updatePreference('theme', theme),
    setReadingMode: (mode: UserPreferences['reading_mode']) => updatePreference('reading_mode', mode),
    setFocusMode: (enabled: boolean) => updatePreference('focus_mode', enabled),
    loading,
  };
}

export function useAudioPreferences() {
  const { preferences, updatePreference, updatePreferences, loading } = useUserPreferences();
  
  return {
    musicEnabled: preferences?.music_enabled ?? false,
    musicVolume: preferences?.music_volume ?? 0.5,
    soundEnabled: preferences?.sound_enabled ?? true,
    shuffleEnabled: preferences?.shuffle_enabled ?? true,
    setMusicEnabled: (enabled: boolean) => updatePreference('music_enabled', enabled),
    setMusicVolume: (volume: number) => updatePreference('music_volume', volume),
    setSoundEnabled: (enabled: boolean) => updatePreference('sound_enabled', enabled),
    setShuffleEnabled: (enabled: boolean) => updatePreference('shuffle_enabled', enabled),
    updateAudio: (updates: Partial<Pick<UserPreferences, 'music_enabled' | 'music_volume' | 'sound_enabled' | 'shuffle_enabled'>>) => 
      updatePreferences(updates),
    loading,
  };
}

export function useSpotifyPreferences() {
  const { preferences, updatePreferences, loading } = useUserPreferences();
  
  return {
    contentId: preferences?.spotify_content_id,
    contentType: preferences?.spotify_content_type ?? 'playlist',
    genre: preferences?.spotify_genre,
    setSpotifyContent: (contentId: string, contentType: UserPreferences['spotify_content_type'], genre?: string) =>
      updatePreferences({ spotify_content_id: contentId, spotify_content_type: contentType, spotify_genre: genre ?? null }),
    clearSpotifyContent: () => 
      updatePreferences({ spotify_content_id: null, spotify_genre: null }),
    loading,
  };
}

export function useLucyWorldsPreferences() {
  const { preferences, updatePreference, updatePreferences, loading } = useUserPreferences();
  
  return {
    activeWorld: preferences?.active_world ?? 'none',
    worldEnabled: preferences?.world_enabled ?? false,
    setActiveWorld: (world: string) => updatePreferences({ active_world: world, world_enabled: world !== 'none' }),
    setWorldEnabled: (enabled: boolean) => updatePreference('world_enabled', enabled),
    loading,
  };
}
