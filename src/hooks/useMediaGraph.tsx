/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — MEDIA GRAPH HOOK                                          │
 * │                                                                             │
 * │ React hook for accessing Universal Media Graph with caching,               │
 * │ loading states, and mobile-safe data fetching                              │
 * │ PHASE 2 IMPLEMENTATION                                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  getTrendingContent,
  getNewReleases,
  getContentByGenre,
  getContentByMood,
  getRelatedContent,
  searchMediaNodes,
  getMediaNode,
  getMediaNodeWithDetails,
} from '@/supabase/media';
import {
  getContinueWatching,
  getContinueListening,
} from '@/supabase/userState';
import {
  getPersonalizedRecommendations,
  getBecauseYouWatched,
  getFeaturedJourneys,
  getMoodContent,
  getTimeBasedContent,
  isUserColdStart,
  buildRecommendationRows,
} from '@/supabase/recommendations';
import type {
  MediaNode,
  MediaCategory,
  RecommendationRow,
  LucyJourney,
} from '@/media/types';

// =============================================================================
// TYPES
// =============================================================================

export interface MediaGraphState {
  // Row data
  continueWatching: MediaNode[];
  continueListening: MediaNode[];
  trending: MediaNode[];
  newReleases: MediaNode[];
  forYou: MediaNode[];
  recommendationRows: RecommendationRow[];
  journeys: LucyJourney[];
  
  // Loading states
  isLoading: boolean;
  isLoadingRows: boolean;
  isLoadingSearch: boolean;
  
  // Error state
  error: string | null;
  
  // Cold start
  isColdStart: boolean;
  
  // Stale indicator
  isStale: boolean;
}

export interface MediaGraphActions {
  // Refresh methods
  refresh: () => Promise<void>;
  refreshContinueWatching: () => Promise<void>;
  refreshContinueListening: () => Promise<void>;
  refreshRecommendations: () => Promise<void>;
  
  // Search
  search: (query: string, category?: MediaCategory) => Promise<MediaNode[]>;
  
  // Get single node
  getNode: (nodeId: string) => Promise<MediaNode | null>;
  getNodeWithDetails: (nodeId: string) => Promise<any>;
  
  // Get related content
  getRelated: (nodeId: string, limit?: number) => Promise<MediaNode[]>;
  
  // Get mood content
  getMoodContent: (mood: string, limit?: number) => Promise<MediaNode[]>;
  
  // Mark data stale (after user action)
  markStale: () => void;
}

// Cache TTL in milliseconds
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CONTINUE_WATCHING_TTL = 1 * 60 * 1000; // 1 minute for continue watching

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useMediaGraph(category?: MediaCategory): [MediaGraphState, MediaGraphActions] {
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
  const [state, setState] = useState<MediaGraphState>({
    continueWatching: [],
    continueListening: [],
    trending: [],
    newReleases: [],
    forYou: [],
    recommendationRows: [],
    journeys: [],
    isLoading: true,
    isLoadingRows: false,
    isLoadingSearch: false,
    error: null,
    isColdStart: true,
    isStale: false,
  });
  
  // Cache timestamps
  const cacheRef = useRef<{
    continueWatching: number;
    continueListening: number;
    recommendations: number;
    trending: number;
  }>({
    continueWatching: 0,
    continueListening: 0,
    recommendations: 0,
    trending: 0,
  });
  
  // Abort controller for cleanup
  const abortRef = useRef<AbortController | null>(null);
  
  // ==========================================================================
  // FETCH METHODS
  // ==========================================================================
  
  const fetchContinueWatching = useCallback(async () => {
    if (!userId) return;
    
    const now = Date.now();
    if (now - cacheRef.current.continueWatching < CONTINUE_WATCHING_TTL) {
      return; // Cache is fresh
    }
    
    try {
      const data = await getContinueWatching(userId, 10);
      setState(prev => ({ ...prev, continueWatching: data }));
      cacheRef.current.continueWatching = now;
    } catch (error) {
      console.error('[useMediaGraph] fetchContinueWatching error:', error);
    }
  }, [userId]);
  
  const fetchContinueListening = useCallback(async () => {
    if (!userId) return;
    
    const now = Date.now();
    if (now - cacheRef.current.continueListening < CONTINUE_WATCHING_TTL) {
      return;
    }
    
    try {
      const data = await getContinueListening(userId, 10);
      setState(prev => ({ ...prev, continueListening: data }));
      cacheRef.current.continueListening = now;
    } catch (error) {
      console.error('[useMediaGraph] fetchContinueListening error:', error);
    }
  }, [userId]);
  
  const fetchRecommendations = useCallback(async () => {
    const now = Date.now();
    if (now - cacheRef.current.recommendations < CACHE_TTL && !state.isStale) {
      return;
    }
    
    setState(prev => ({ ...prev, isLoadingRows: true }));
    
    try {
      // Check cold start
      let coldStart = true;
      if (userId) {
        coldStart = await isUserColdStart(userId);
      }
      
      // Fetch all rows
      const rows = await buildRecommendationRows(userId || null, category, {
        includeTrending: true,
        includeNewReleases: true,
        includeJourneys: true,
        includeMoods: true,
        includeBecauseYouWatched: !!userId,
      });
      
      // Extract specific data
      const forYouRow = rows.find(r => r.id === 'personalized');
      const trendingRow = rows.find(r => r.id === 'trending');
      const newReleasesRow = rows.find(r => r.id === 'new-releases');
      
      // Fetch journeys
      const journeys = await getFeaturedJourneys(category, 10);
      
      setState(prev => ({
        ...prev,
        recommendationRows: rows,
        forYou: forYouRow?.items || [],
        trending: trendingRow?.items || [],
        newReleases: newReleasesRow?.items || [],
        journeys,
        isColdStart: coldStart,
        isLoadingRows: false,
        isStale: false,
      }));
      
      cacheRef.current.recommendations = now;
    } catch (error) {
      console.error('[useMediaGraph] fetchRecommendations error:', error);
      setState(prev => ({
        ...prev,
        isLoadingRows: false,
        error: 'Failed to load recommendations',
      }));
    }
  }, [userId, category, state.isStale]);
  
  const fetchTrending = useCallback(async () => {
    const now = Date.now();
    if (now - cacheRef.current.trending < CACHE_TTL) {
      return;
    }
    
    try {
      const data = await getTrendingContent(category, 20);
      setState(prev => ({ ...prev, trending: data }));
      cacheRef.current.trending = now;
    } catch (error) {
      console.error('[useMediaGraph] fetchTrending error:', error);
    }
  }, [category]);
  
  // ==========================================================================
  // INITIAL LOAD
  // ==========================================================================
  
  useEffect(() => {
    let mounted = true;
    abortRef.current = new AbortController();
    
    const loadInitialData = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        // Parallel fetch for initial data
        await Promise.all([
          fetchContinueWatching(),
          fetchContinueListening(),
          fetchRecommendations(),
        ]);
        
        if (mounted) {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Failed to load media data',
          }));
        }
      }
    };
    
    loadInitialData();
    
    return () => {
      mounted = false;
      abortRef.current?.abort();
    };
  }, [userId, category]);
  
  // ==========================================================================
  // ACTIONS
  // ==========================================================================
  
  const refresh = useCallback(async () => {
    // Clear cache
    cacheRef.current = {
      continueWatching: 0,
      continueListening: 0,
      recommendations: 0,
      trending: 0,
    };
    
    setState(prev => ({ ...prev, isLoading: true, isStale: false }));
    
    await Promise.all([
      fetchContinueWatching(),
      fetchContinueListening(),
      fetchRecommendations(),
    ]);
    
    setState(prev => ({ ...prev, isLoading: false }));
  }, [fetchContinueWatching, fetchContinueListening, fetchRecommendations]);
  
  const refreshContinueWatching = useCallback(async () => {
    cacheRef.current.continueWatching = 0;
    await fetchContinueWatching();
  }, [fetchContinueWatching]);
  
  const refreshContinueListening = useCallback(async () => {
    cacheRef.current.continueListening = 0;
    await fetchContinueListening();
  }, [fetchContinueListening]);
  
  const refreshRecommendations = useCallback(async () => {
    cacheRef.current.recommendations = 0;
    await fetchRecommendations();
  }, [fetchRecommendations]);
  
  const search = useCallback(async (query: string, searchCategory?: MediaCategory): Promise<MediaNode[]> => {
    setState(prev => ({ ...prev, isLoadingSearch: true }));
    
    try {
      const results = await searchMediaNodes(query, {
        category: searchCategory || category,
        limit: 20,
      });
      
      setState(prev => ({ ...prev, isLoadingSearch: false }));
      return results;
    } catch (error) {
      console.error('[useMediaGraph] search error:', error);
      setState(prev => ({ ...prev, isLoadingSearch: false }));
      return [];
    }
  }, [category]);
  
  const getNode = useCallback(async (nodeId: string): Promise<MediaNode | null> => {
    return getMediaNode(nodeId);
  }, []);
  
  const getNodeWithDetails = useCallback(async (nodeId: string) => {
    return getMediaNodeWithDetails(nodeId);
  }, []);
  
  const getRelated = useCallback(async (nodeId: string, limit = 10): Promise<MediaNode[]> => {
    return getRelatedContent(nodeId, limit);
  }, []);
  
  const getMoodContentAction = useCallback(async (mood: string, limit = 20): Promise<MediaNode[]> => {
    return getMoodContent(mood, category, limit);
  }, [category]);
  
  const markStale = useCallback(() => {
    setState(prev => ({ ...prev, isStale: true }));
  }, []);
  
  // ==========================================================================
  // RETURN
  // ==========================================================================
  
  const actions: MediaGraphActions = useMemo(() => ({
    refresh,
    refreshContinueWatching,
    refreshContinueListening,
    refreshRecommendations,
    search,
    getNode,
    getNodeWithDetails,
    getRelated,
    getMoodContent: getMoodContentAction,
    markStale,
  }), [
    refresh,
    refreshContinueWatching,
    refreshContinueListening,
    refreshRecommendations,
    search,
    getNode,
    getNodeWithDetails,
    getRelated,
    getMoodContentAction,
    markStale,
  ]);
  
  return [state, actions];
}

export default useMediaGraph;
