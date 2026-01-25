/**
 * THE LUCY LOUNGE - Recently Played Hook
 * 
 * Tracks listening history using localStorage
 * Uses listening_favorites table for persistent favorites
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

  // Load recently played from localStorage
  useEffect(() => {
    const loadRecentlyPlayed = () => {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setRecentlyPlayed(Array.isArray(parsed) ? parsed : []);
        } else {
          setRecentlyPlayed([]);
        }
      } catch (err) {
        console.warn('Error loading recently played:', err);
        setRecentlyPlayed([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecentlyPlayed();
  }, [user]);

  // Add to recently played
  const addRecentlyPlayed = useCallback(
    async (item: Omit<RecentlyPlayedItem, 'id' | 'user_id' | 'played_at' | 'play_count'>) => {
      const now = new Date().toISOString();
      
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
        
        let updated: RecentlyPlayedItem[];
        if (existing) {
          // Move to top, increment play count
          const filtered = prev.filter((p) => p.id !== existing.id);
          updated = [{ ...existing, played_at: now, play_count: existing.play_count + 1 }, ...filtered].slice(0, MAX_ITEMS);
        } else {
          updated = [newItem, ...prev].slice(0, MAX_ITEMS);
        }

        // Persist to localStorage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    [user]
  );

  // Clear all recently played
  const clearRecentlyPlayed = useCallback(async () => {
    setRecentlyPlayed([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  // Remove single item
  const removeRecentlyPlayed = useCallback(
    async (id: string) => {
      setRecentlyPlayed((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  return {
    recentlyPlayed,
    loading,
    addRecentlyPlayed,
    clearRecentlyPlayed,
    removeRecentlyPlayed,
  };
}
