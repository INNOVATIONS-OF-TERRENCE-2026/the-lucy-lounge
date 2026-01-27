/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — RECOMMENDATIONS HOOK                                     │
 * │                                                                             │
 * │ React hook for personalized recommendations with infinite scroll           │
 * │                                                                             │
 * │ Lucy knows what you want.                                                  │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import recommendationEngine, {
  RecommendationRow,
  MediaItem,
  UserInteraction,
} from '@/services/recommendationEngine';

// =============================================================================
// TYPES
// =============================================================================

export interface UseRecommendationsOptions {
  category?: string;
  autoLoad?: boolean;
  includePersonalized?: boolean;
  includeTrending?: boolean;
  includeMoods?: boolean;
  includeDiscovery?: boolean;
}

export interface UseRecommendationsReturn {
  rows: RecommendationRow[];
  loading: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  refresh: () => Promise<void>;
  recordInteraction: (interaction: UserInteraction, metadata: Record<string, unknown>) => Promise<void>;
  currentlyPlaying: MediaItem | null;
  setCurrentlyPlaying: (item: MediaItem | null) => void;
  queue: MediaItem[];
  addToQueue: (item: MediaItem) => void;
  removeFromQueue: (itemId: string) => void;
  clearQueue: () => void;
  playNext: () => MediaItem | null;
}

// =============================================================================
// HOOK
// =============================================================================

export function useRecommendations({
  category,
  autoLoad = true,
  includePersonalized = true,
  includeTrending = true,
  includeMoods = true,
  includeDiscovery = true,
}: UseRecommendationsOptions = {}): UseRecommendationsReturn {
  const { user, isAuthenticated } = useAuth();
  
  const [rows, setRows] = useState<RecommendationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  
  // Playback state
  const [currentlyPlaying, setCurrentlyPlaying] = useState<MediaItem | null>(null);
  const [queue, setQueue] = useState<MediaItem[]>([]);
  
  const loadedRef = useRef(false);

  // Load recommendations
  const loadRecommendations = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setPage(0);
      setRows([]);
      setHasMore(true);
    }

    setLoading(true);
    setError(null);

    try {
      const newRows = await recommendationEngine.buildRecommendationRows(
        isAuthenticated ? user?.id || null : null,
        category,
        {
          includePersonalized,
          includeTrending,
          includeMoods,
          includeDiscovery,
          recentItemId: currentlyPlaying?.id,
        }
      );

      if (isRefresh) {
        setRows(newRows);
      } else {
        setRows(prev => {
          // Merge without duplicates
          const existingIds = new Set(prev.map(r => r.id));
          const uniqueNew = newRows.filter(r => !existingIds.has(r.id));
          return [...prev, ...uniqueNew];
        });
      }

      setHasMore(newRows.length > 0);
      setPage(prev => prev + 1);

    } catch (err) {
      console.error('[useRecommendations] Load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, category, includePersonalized, includeTrending, includeMoods, includeDiscovery, currentlyPlaying?.id]);

  // Load more (infinite scroll)
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    await loadRecommendations(false);
  }, [loading, hasMore, loadRecommendations]);

  // Refresh
  const refresh = useCallback(async () => {
    await loadRecommendations(true);
  }, [loadRecommendations]);

  // Record user interaction
  const recordInteraction = useCallback(async (
    interaction: UserInteraction,
    metadata: Record<string, unknown>
  ) => {
    if (!isAuthenticated || !user?.id) return;

    try {
      await recommendationEngine.updateTasteVector(user.id, interaction, metadata);
    } catch (err) {
      console.error('[useRecommendations] Record interaction error:', err);
    }
  }, [isAuthenticated, user?.id]);

  // Queue management
  const addToQueue = useCallback((item: MediaItem) => {
    setQueue(prev => {
      if (prev.some(i => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeFromQueue = useCallback((itemId: string) => {
    setQueue(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const playNext = useCallback((): MediaItem | null => {
    if (queue.length === 0) return null;
    
    const [next, ...rest] = queue;
    setQueue(rest);
    setCurrentlyPlaying(next);
    return next;
  }, [queue]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && !loadedRef.current) {
      loadedRef.current = true;
      loadRecommendations(true);
    }
  }, [autoLoad, loadRecommendations]);

  // Reload when currently playing changes (for "More Like This")
  useEffect(() => {
    if (currentlyPlaying && loadedRef.current) {
      // Add "More Like This" row without full refresh
      recommendationEngine.getSimilarItems(currentlyPlaying.id, 10).then(similar => {
        if (similar.length > 0) {
          setRows(prev => {
            // Remove old similar row
            const filtered = prev.filter(r => !r.id.startsWith('similar-'));
            return [
              filtered[0], // Keep "For You" first
              {
                id: `similar-${currentlyPlaying.id}`,
                title: `More Like "${currentlyPlaying.title}"`,
                reason: 'Similar vibes',
                reasonType: 'similar' as const,
                items: similar,
                sourceItem: currentlyPlaying,
              },
              ...filtered.slice(1),
            ];
          });
        }
      });
    }
  }, [currentlyPlaying]);

  return {
    rows,
    loading,
    error,
    loadMore,
    hasMore,
    refresh,
    recordInteraction,
    currentlyPlaying,
    setCurrentlyPlaying,
    queue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    playNext,
  };
}

export default useRecommendations;
