/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — USER MEDIA STATE HOOK                                    │
 * │                                                                             │
 * │ React hook for managing user media interactions (progress, ratings,        │
 * │ collections) with optimistic updates and Supabase sync                     │
 * │ PHASE 2 IMPLEMENTATION                                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  getUserMediaState,
  upsertUserMediaState,
  markMediaCompleted,
  getUserCollections,
  addToCollection,
  removeFromCollection,
  isInCollection,
  getUserRating,
  setUserRating,
  recordWatchEvent,
  recordListenEvent,
} from '@/supabase/userState';
import type {
  UserMediaState,
  MediaCollection,
  MediaCategory,
} from '@/media/types';

// =============================================================================
// TYPES
// =============================================================================

export interface UserMediaStateHook {
  // Progress tracking
  getProgress: (mediaNodeId: string) => Promise<UserMediaState | null>;
  updateProgress: (mediaNodeId: string, position: number, duration: number) => Promise<void>;
  markComplete: (mediaNodeId: string) => Promise<void>;
  
  // Rating
  getRating: (mediaNodeId: string) => Promise<number | null>;
  rate: (mediaNodeId: string, rating: number) => Promise<void>;
  
  // Collections
  collections: MediaCollection[];
  isInFavorites: (mediaNodeId: string) => Promise<boolean>;
  addToFavorites: (mediaNodeId: string) => Promise<void>;
  removeFromFavorites: (mediaNodeId: string) => Promise<void>;
  addToWatchlist: (mediaNodeId: string) => Promise<void>;
  removeFromWatchlist: (mediaNodeId: string) => Promise<void>;
  
  // Event recording (for taste profile updates)
  recordWatch: (mediaNodeId: string, durationSeconds: number, completed: boolean) => Promise<void>;
  recordListen: (mediaNodeId: string, durationSeconds: number, completed: boolean) => Promise<void>;
  
  // Loading state
  isLoading: boolean;
  error: string | null;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useUserMediaState(): UserMediaStateHook {
  // Get user session with supabase.auth directly (no external auth-helpers)
  const [userId, setUserId] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id);
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  // State
  const [collections, setCollections] = useState<MediaCollection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cache for collection IDs
  const [favoritesId, setFavoritesId] = useState<string | null>(null);
  const [watchlistId, setWatchlistId] = useState<string | null>(null);
  
  // ==========================================================================
  // LOAD COLLECTIONS
  // ==========================================================================
  
  useEffect(() => {
    if (!userId) {
      setCollections([]);
      setFavoritesId(null);
      setWatchlistId(null);
      return;
    }
    
    const loadCollections = async () => {
      try {
        const userCollections = await getUserCollections(userId);
        setCollections(userCollections);
        
        // Find favorites and watchlist IDs
        const favorites = userCollections.find(c => c.collection_type === 'favorites');
        const watchlist = userCollections.find(c => c.collection_type === 'watchlist');
        
        setFavoritesId(favorites?.id || null);
        setWatchlistId(watchlist?.id || null);
      } catch (err) {
        console.error('[useUserMediaState] loadCollections error:', err);
      }
    };
    
    loadCollections();
  }, [userId]);
  
  // ==========================================================================
  // PROGRESS TRACKING
  // ==========================================================================
  
  const getProgress = useCallback(async (mediaNodeId: string): Promise<UserMediaState | null> => {
    if (!userId) return null;
    return getUserMediaState(userId, mediaNodeId);
  }, [userId]);
  
  const updateProgress = useCallback(async (
    mediaNodeId: string,
    position: number,
    duration: number
  ): Promise<void> => {
    if (!userId) return;
    
    try {
      await upsertUserMediaState(userId, mediaNodeId, {
        last_position_seconds: position,
        total_duration_seconds: duration,
        last_played_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[useUserMediaState] updateProgress error:', err);
      setError('Failed to save progress');
    }
  }, [userId]);
  
  const markComplete = useCallback(async (mediaNodeId: string): Promise<void> => {
    if (!userId) return;
    
    try {
      await markMediaCompleted(userId, mediaNodeId);
    } catch (err) {
      console.error('[useUserMediaState] markComplete error:', err);
      setError('Failed to mark as complete');
    }
  }, [userId]);
  
  // ==========================================================================
  // RATINGS
  // ==========================================================================
  
  const getRating = useCallback(async (mediaNodeId: string): Promise<number | null> => {
    if (!userId) return null;
    return getUserRating(userId, mediaNodeId);
  }, [userId]);
  
  const rate = useCallback(async (mediaNodeId: string, rating: number): Promise<void> => {
    if (!userId) return;
    
    try {
      await setUserRating(userId, mediaNodeId, rating);
    } catch (err) {
      console.error('[useUserMediaState] rate error:', err);
      setError('Failed to save rating');
    }
  }, [userId]);
  
  // ==========================================================================
  // COLLECTIONS - FAVORITES
  // ==========================================================================
  
  const isInFavoritesCheck = useCallback(async (mediaNodeId: string): Promise<boolean> => {
    if (!userId || !favoritesId) return false;
    return isInCollection(favoritesId, mediaNodeId);
  }, [userId, favoritesId]);
  
  const addToFavoritesAction = useCallback(async (mediaNodeId: string): Promise<void> => {
    if (!userId) return;
    
    try {
      // Create favorites collection if it doesn't exist
      let collectionId = favoritesId;
      if (!collectionId) {
        const { getOrCreateCollection } = await import('@/supabase/userState');
        const collection = await getOrCreateCollection(userId, 'favorites');
        if (collection) {
          collectionId = collection.id;
          setFavoritesId(collectionId);
        }
      }
      
      if (collectionId) {
        await addToCollection(collectionId, mediaNodeId);
      }
    } catch (err) {
      console.error('[useUserMediaState] addToFavorites error:', err);
      setError('Failed to add to favorites');
    }
  }, [userId, favoritesId]);
  
  const removeFromFavoritesAction = useCallback(async (mediaNodeId: string): Promise<void> => {
    if (!userId || !favoritesId) return;
    
    try {
      await removeFromCollection(favoritesId, mediaNodeId);
    } catch (err) {
      console.error('[useUserMediaState] removeFromFavorites error:', err);
      setError('Failed to remove from favorites');
    }
  }, [userId, favoritesId]);
  
  // ==========================================================================
  // COLLECTIONS - WATCHLIST
  // ==========================================================================
  
  const addToWatchlistAction = useCallback(async (mediaNodeId: string): Promise<void> => {
    if (!userId) return;
    
    try {
      let collectionId = watchlistId;
      if (!collectionId) {
        const { getOrCreateCollection } = await import('@/supabase/userState');
        const collection = await getOrCreateCollection(userId, 'watchlist');
        if (collection) {
          collectionId = collection.id;
          setWatchlistId(collectionId);
        }
      }
      
      if (collectionId) {
        await addToCollection(collectionId, mediaNodeId);
      }
    } catch (err) {
      console.error('[useUserMediaState] addToWatchlist error:', err);
      setError('Failed to add to watchlist');
    }
  }, [userId, watchlistId]);
  
  const removeFromWatchlistAction = useCallback(async (mediaNodeId: string): Promise<void> => {
    if (!userId || !watchlistId) return;
    
    try {
      await removeFromCollection(watchlistId, mediaNodeId);
    } catch (err) {
      console.error('[useUserMediaState] removeFromWatchlist error:', err);
      setError('Failed to remove from watchlist');
    }
  }, [userId, watchlistId]);
  
  // ==========================================================================
  // EVENT RECORDING
  // ==========================================================================
  
  const recordWatch = useCallback(async (
    mediaNodeId: string,
    durationSeconds: number,
    completed: boolean
  ): Promise<void> => {
    if (!userId) return;
    
    try {
      await recordWatchEvent(userId, mediaNodeId, durationSeconds, completed);
    } catch (err) {
      console.error('[useUserMediaState] recordWatch error:', err);
      // Don't set error - this is a background operation
    }
  }, [userId]);
  
  const recordListen = useCallback(async (
    mediaNodeId: string,
    durationSeconds: number,
    completed: boolean
  ): Promise<void> => {
    if (!userId) return;
    
    try {
      await recordListenEvent(userId, mediaNodeId, durationSeconds, completed);
    } catch (err) {
      console.error('[useUserMediaState] recordListen error:', err);
      // Don't set error - this is a background operation
    }
  }, [userId]);
  
  // ==========================================================================
  // RETURN
  // ==========================================================================
  
  return useMemo(() => ({
    getProgress,
    updateProgress,
    markComplete,
    getRating,
    rate,
    collections,
    isInFavorites: isInFavoritesCheck,
    addToFavorites: addToFavoritesAction,
    removeFromFavorites: removeFromFavoritesAction,
    addToWatchlist: addToWatchlistAction,
    removeFromWatchlist: removeFromWatchlistAction,
    recordWatch,
    recordListen,
    isLoading,
    error,
  }), [
    getProgress,
    updateProgress,
    markComplete,
    getRating,
    rate,
    collections,
    isInFavoritesCheck,
    addToFavoritesAction,
    removeFromFavoritesAction,
    addToWatchlistAction,
    removeFromWatchlistAction,
    recordWatch,
    recordListen,
    isLoading,
    error,
  ]);
}

export default useUserMediaState;
