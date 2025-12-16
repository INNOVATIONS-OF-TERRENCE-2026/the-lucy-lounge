import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FavoriteItem {
  id: string;
  title: string;
  subtitle?: string;
  genre: string;
  contentType: 'playlist' | 'album';
}

const LOCAL_STORAGE_KEY = 'lucy-favorites-offline';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth state and load favorites
  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
        // Load from database
        const { data, error } = await supabase
          .from('listening_favorites')
          .select('content_id, title, subtitle, genre, content_type')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setFavorites(data.map(item => ({
            id: item.content_id,
            title: item.title,
            subtitle: item.subtitle || undefined,
            genre: item.genre,
            contentType: item.content_type as 'playlist' | 'album'
          })));
        }
      } else {
        // Load from localStorage for offline/guest users
        try {
          const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (stored) {
            setFavorites(JSON.parse(stored));
          }
        } catch (error) {
          console.error('Error loading offline favorites:', error);
        }
      }
      
      setLoading(false);
    };

    loadFavorites();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const saveToLocalStorage = useCallback((items: FavoriteItem[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving offline favorites:', error);
    }
  }, []);

  const addFavorite = useCallback(async (item: FavoriteItem) => {
    // Optimistic update
    setFavorites(prev => {
      const exists = prev.some(f => f.id === item.id);
      if (exists) return prev;
      const updated = [item, ...prev];
      if (!userId) saveToLocalStorage(updated);
      return updated;
    });

    if (userId) {
      const { error } = await supabase
        .from('listening_favorites')
        .insert({
          user_id: userId,
          content_id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          genre: item.genre,
          content_type: item.contentType
        });
      
      if (error) {
        console.error('Error adding favorite:', error);
        // Revert on error
        setFavorites(prev => prev.filter(f => f.id !== item.id));
      }
    }
  }, [userId, saveToLocalStorage]);

  const removeFavorite = useCallback(async (contentId: string) => {
    const removed = favorites.find(f => f.id === contentId);
    
    // Optimistic update
    setFavorites(prev => {
      const updated = prev.filter(f => f.id !== contentId);
      if (!userId) saveToLocalStorage(updated);
      return updated;
    });

    if (userId) {
      const { error } = await supabase
        .from('listening_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('content_id', contentId);
      
      if (error && removed) {
        console.error('Error removing favorite:', error);
        // Revert on error
        setFavorites(prev => [removed, ...prev]);
      }
    }
  }, [userId, favorites, saveToLocalStorage]);

  const toggleFavorite = useCallback(async (item: FavoriteItem) => {
    const isFavorite = favorites.some(f => f.id === item.id);
    if (isFavorite) {
      await removeFavorite(item.id);
    } else {
      await addFavorite(item);
    }
  }, [favorites, addFavorite, removeFavorite]);

  const isFavorite = useCallback((contentId: string) => {
    return favorites.some(f => f.id === contentId);
  }, [favorites]);

  return {
    favorites,
    loading,
    isLoggedIn: !!userId,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite
  };
};
