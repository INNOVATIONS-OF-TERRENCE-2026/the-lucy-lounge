import { useState, useEffect, useCallback } from 'react';

export interface RecentlyPlayedItem {
  id: string;
  title: string;
  subtitle: string;
  genre: string;
  contentType: 'playlist' | 'album';
}

const STORAGE_KEY = 'lucy-recently-played';
const MAX_ITEMS = 5;

export const useRecentlyPlayed = () => {
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentlyPlayed(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recently played:', error);
    }
  }, []);

  // Save to localStorage whenever list changes
  const saveToStorage = useCallback((items: RecentlyPlayedItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving recently played:', error);
    }
  }, []);

  const addRecentlyPlayed = useCallback((item: RecentlyPlayedItem) => {
    setRecentlyPlayed(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(p => p.id !== item.id);
      // Add to top, limit to MAX_ITEMS
      const updated = [item, ...filtered].slice(0, MAX_ITEMS);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const clearRecentlyPlayed = useCallback(() => {
    setRecentlyPlayed([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    recentlyPlayed,
    addRecentlyPlayed,
    clearRecentlyPlayed,
  };
};
