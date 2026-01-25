/**
 * THE LUCY LOUNGE - Recently Played Hook
 * 
 * Tracks listening history in Supabase with offline fallback
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface RecentlyPlayedItem {
  id: string;
  user_id: string;
  content_type: 'spotify' | 'ambient' | 'audio_generation' | 'youtube';
  content_id: string;
  title: string | null;
  artist: string | null;
  genre: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  played_at: string;
  play_count: number;
}

const LOCAL_STORAGE_KEY = 'lucy-recently-played';
const MAX_ITEMS = 50;

export function useRecentlyPlayedSync() {
  const [user, setUser] = useState<User | null>(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load recently played
  useEffect(() => {
    const loadRecentlyPlayed = async () => {
      if (!user) {
        // Anonymous: use localStorage
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          try {
            setRecentlyPlayed(JSON.parse(stored));
          } catch {
            setRecentlyPlayed([]);
          }
        }
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('recently_played')
          .select('*')
          .eq('user_id', user.id)
          .order('played_at', { ascending: false })
          .limit(MAX_ITEMS);

        if (error) throw error;
        setRecentlyPlayed(data as RecentlyPlayedItem[]);
        
        // Sync to localStorage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        console.error('Error loading recently played:', err);
        // Fallback to localStorage
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          setRecentlyPlayed(JSON.parse(stored));
        }
      } finally {
        setLoading(false);
      }
    };

    loadRecentlyPlayed();

    // Realtime subscription
    if (user) {
      const channel = supabase
        .channel('recently_played_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'recently_played',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // Refetch on any change
            loadRecentlyPlayed();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Add to recently played
  const addRecentlyPlayed = useCallback(
    async (item: Omit<RecentlyPlayedItem, 'id' | 'user_id' | 'played_at' | 'play_count'>) => {
      const now = new Date().toISOString();
      
      // Optimistic update for localStorage
      const newItem: RecentlyPlayedItem = {
        id: crypto.randomUUID(),
        user_id: user?.id ?? 'anonymous',
        played_at: now,
        play_count: 1,
        ...item,
      };

      setRecentlyPlayed((prev) => {
        // Check if already exists
        const existing = prev.find(
          (p) => p.content_type === item.content_type && p.content_id === item.content_id
        );
        
        if (existing) {
          // Move to top, increment play count
          const updated = prev.filter((p) => p.id !== existing.id);
          return [{ ...existing, played_at: now, play_count: existing.play_count + 1 }, ...updated].slice(0, MAX_ITEMS);
        }
        
        return [newItem, ...prev].slice(0, MAX_ITEMS);
      });

      // Update localStorage
      const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const existingIdx = stored.findIndex(
        (p: RecentlyPlayedItem) => p.content_type === item.content_type && p.content_id === item.content_id
      );
      
      if (existingIdx >= 0) {
        stored[existingIdx] = { ...stored[existingIdx], played_at: now, play_count: stored[existingIdx].play_count + 1 };
        stored.unshift(stored.splice(existingIdx, 1)[0]);
      } else {
        stored.unshift(newItem);
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stored.slice(0, MAX_ITEMS)));

      // Persist to database
      if (user) {
        try {
          await supabase.rpc('upsert_recently_played', {
            p_user_id: user.id,
            p_content_type: item.content_type,
            p_content_id: item.content_id,
            p_title: item.title,
            p_artist: item.artist,
            p_genre: item.genre,
            p_thumbnail_url: item.thumbnail_url,
            p_duration_seconds: item.duration_seconds,
          });
        } catch (err) {
          console.error('Error saving recently played:', err);
        }
      }
    },
    [user]
  );

  // Clear all recently played
  const clearRecentlyPlayed = useCallback(async () => {
    setRecentlyPlayed([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    if (user) {
      try {
        await supabase
          .from('recently_played')
          .delete()
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Error clearing recently played:', err);
      }
    }
  }, [user]);

  // Remove single item
  const removeRecentlyPlayed = useCallback(
    async (id: string) => {
      setRecentlyPlayed((prev) => prev.filter((p) => p.id !== id));
      
      const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(stored.filter((p: RecentlyPlayedItem) => p.id !== id))
      );

      if (user) {
        try {
          await supabase
            .from('recently_played')
            .delete()
            .eq('id', id);
        } catch (err) {
          console.error('Error removing recently played:', err);
        }
      }
    },
    [user]
  );

  return {
    recentlyPlayed,
    loading,
    addRecentlyPlayed,
    clearRecentlyPlayed,
    removeRecentlyPlayed,
  };
}
