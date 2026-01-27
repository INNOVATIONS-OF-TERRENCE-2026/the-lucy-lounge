/**
 * THE LUCY LOUNGE — PERSONALIZED RECOMMENDATION RAILS
 * 
 * React hooks for Lucy's AI-powered content recommendations
 * Connects the recommendation engine to the MediaV2 UI
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { MediaNode } from '@/media/types';

// =============================================================================
// TYPES
// =============================================================================

export interface PersonalizedRail {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  items: MediaNode[];
  loading: boolean;
  error?: string;
  type: 'for-you' | 'continue-watching' | 'because-you-watched' | 'mood' | 'journey' | 'trending';
  sourceMediaId?: string; // For "Because You Watched" rails
  mood?: string; // For mood-based rails
}

export interface RecommendationSignals {
  recentWatches: string[]; // canonical_ids
  completedItems: string[];
  likedGenres: string[];
  watchTime: Map<string, number>; // canonical_id -> seconds
  preferredEras: string[];
  moodHistory: string[];
}

export interface RecommendationOptions {
  limit?: number;
  excludeWatched?: boolean;
  preferEmbeddable?: boolean;
  includeDeepLinks?: boolean;
}

// =============================================================================
// SIGNAL WEIGHTS (Match recommendation engine)
// =============================================================================

const SIGNAL_WEIGHTS = {
  explicit_like: 10,
  watch_completion: 5,
  click_through: 2,
  browse_time: 1,
  recency_decay: 0.95,
  tag_affinity: 3,
  creator_affinity: 4,
  era_affinity: 2,
} as const;

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Get user's recommendation signals from their history
 */
export function useRecommendationSignals(): {
  signals: RecommendationSignals | null;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const { user } = useAuth();
  const [signals, setSignals] = useState<RecommendationSignals | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setSignals(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch user's watch history
      const { data: watchHistory } = await supabase
        .from('user_media_state')
        .select('media_node_id, progress_seconds, completed, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(100);

      // Fetch the media nodes for those IDs
      const mediaIds = watchHistory?.map(w => w.media_node_id) || [];
      
      let mediaNodes: MediaNode[] = [];
      if (mediaIds.length > 0) {
        const { data } = await supabase
          .from('media_nodes')
          .select('*')
          .in('id', mediaIds);
        mediaNodes = (data || []) as MediaNode[];
      }

      // Build canonical_id -> media map
      const mediaMap = new Map(mediaNodes.map(m => [m.id, m]));

      // Extract signals
      const recentWatches: string[] = [];
      const completedItems: string[] = [];
      const watchTime = new Map<string, number>();
      const genreCounts = new Map<string, number>();
      const eraCounts = new Map<string, number>();

      for (const watch of watchHistory || []) {
        const media = mediaMap.get(watch.media_node_id);
        if (media) {
          recentWatches.push(media.canonical_id);
          watchTime.set(media.canonical_id, watch.progress_seconds || 0);
          
          if (watch.completed) {
            completedItems.push(media.canonical_id);
          }

          // Count era preferences
          if (media.release_year) {
            const decade = Math.floor(media.release_year / 10) * 10;
            const eraKey = `${decade}s`;
            eraCounts.set(eraKey, (eraCounts.get(eraKey) || 0) + 1);
          }
        }
      }

      // Fetch genre preferences from tags
      if (mediaIds.length > 0) {
        const { data: tagData } = await supabase
          .from('media_node_tags')
          .select(`
            media_node_id,
            media_tags (name, type)
          `)
          .in('media_node_id', mediaIds);

        for (const item of tagData || []) {
          const tag = (item as any).media_tags;
          if (tag?.type === 'genre') {
            genreCounts.set(tag.name, (genreCounts.get(tag.name) || 0) + 1);
          }
        }
      }

      // Sort and extract top preferences
      const likedGenres = [...genreCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([genre]) => genre);

      const preferredEras = [...eraCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([era]) => era);

      setSignals({
        recentWatches,
        completedItems,
        likedGenres,
        watchTime,
        preferredEras,
        moodHistory: [], // TODO: Implement mood tracking
      });
    } catch (error) {
      console.error('[useRecommendationSignals] Error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { signals, loading, refresh };
}

/**
 * Get personalized "For You" recommendations
 */
export function useForYouRail(options: RecommendationOptions = {}): PersonalizedRail {
  const { user } = useAuth();
  const { signals } = useRecommendationSignals();
  const [rail, setRail] = useState<PersonalizedRail>({
    id: 'for-you',
    title: 'For You',
    subtitle: 'Personalized picks',
    icon: '✨',
    items: [],
    loading: true,
    type: 'for-you',
  });

  useEffect(() => {
    async function fetchForYou() {
      const { limit = 20, excludeWatched = true, preferEmbeddable = true } = options;

      try {
        // Build query based on signals
        let query = supabase
          .from('media_nodes')
          .select('*')
          .eq('category', 'video')
          .eq('embed_allowed', true)
          .order('popularity_score', { ascending: false })
          .limit(limit);

        // If user has signals, prioritize their preferred genres
        if (signals?.likedGenres.length) {
          // Get media IDs that match liked genres
          const { data: taggedMedia } = await supabase
            .from('media_node_tags')
            .select(`
              media_node_id,
              media_tags!inner (name)
            `)
            .in('media_tags.name', signals.likedGenres)
            .limit(100);

          const preferredIds = [...new Set(taggedMedia?.map(t => t.media_node_id) || [])];
          
          if (preferredIds.length > 0) {
            query = query.in('id', preferredIds);
          }
        }

        // Exclude already watched items
        if (excludeWatched && signals?.recentWatches.length) {
          query = query.not('canonical_id', 'in', `(${signals.recentWatches.slice(0, 50).join(',')})`);
        }

        const { data, error } = await query;

        if (error) throw error;

        setRail(prev => ({
          ...prev,
          items: (data || []) as MediaNode[],
          loading: false,
        }));
      } catch (error) {
        console.error('[useForYouRail] Error:', error);
        setRail(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    }

    fetchForYou();
  }, [user, signals, options]);

  return rail;
}

/**
 * Get "Continue Watching" rail
 */
export function useContinueWatchingRail(): PersonalizedRail {
  const { user } = useAuth();
  const [rail, setRail] = useState<PersonalizedRail>({
    id: 'continue-watching',
    title: 'Continue Watching',
    subtitle: 'Pick up where you left off',
    icon: '▶️',
    items: [],
    loading: true,
    type: 'continue-watching',
  });

  useEffect(() => {
    async function fetchContinueWatching() {
      if (!user) {
        setRail(prev => ({ ...prev, items: [], loading: false }));
        return;
      }

      try {
        // Get in-progress items (not completed, has progress)
        const { data: watchStates, error: watchError } = await supabase
          .from('user_media_state')
          .select('media_node_id, progress_seconds, updated_at')
          .eq('user_id', user.id)
          .eq('completed', false)
          .gt('progress_seconds', 60) // At least 1 minute watched
          .order('updated_at', { ascending: false })
          .limit(20);

        if (watchError) throw watchError;

        if (!watchStates?.length) {
          setRail(prev => ({ ...prev, items: [], loading: false }));
          return;
        }

        // Fetch the media nodes
        const mediaIds = watchStates.map(w => w.media_node_id);
        const { data: mediaNodes, error: mediaError } = await supabase
          .from('media_nodes')
          .select('*')
          .in('id', mediaIds);

        if (mediaError) throw mediaError;

        // Preserve order from watch states
        const mediaMap = new Map((mediaNodes || []).map(m => [m.id, m]));
        const orderedItems = watchStates
          .map(w => mediaMap.get(w.media_node_id))
          .filter((m): m is MediaNode => m !== undefined);

        setRail(prev => ({
          ...prev,
          items: orderedItems as MediaNode[],
          loading: false,
        }));
      } catch (error) {
        console.error('[useContinueWatchingRail] Error:', error);
        setRail(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    }

    fetchContinueWatching();
  }, [user]);

  return rail;
}

/**
 * Get "Because You Watched X" rail
 */
export function useBecauseYouWatchedRail(sourceMediaId?: string): PersonalizedRail {
  const { user } = useAuth();
  const [rail, setRail] = useState<PersonalizedRail>({
    id: `because-you-watched-${sourceMediaId || 'recent'}`,
    title: 'Because You Watched',
    subtitle: '',
    icon: '🎬',
    items: [],
    loading: true,
    type: 'because-you-watched',
    sourceMediaId,
  });

  useEffect(() => {
    async function fetchRelated() {
      if (!user) {
        setRail(prev => ({ ...prev, items: [], loading: false }));
        return;
      }

      try {
        // Get the source media (either specified or most recent watched)
        let sourceMedia: MediaNode | null = null;

        if (sourceMediaId) {
          const { data } = await supabase
            .from('media_nodes')
            .select('*')
            .eq('id', sourceMediaId)
            .single();
          sourceMedia = data as MediaNode;
        } else {
          // Get most recently completed item
          const { data: recentWatch } = await supabase
            .from('user_media_state')
            .select('media_node_id')
            .eq('user_id', user.id)
            .eq('completed', true)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

          if (recentWatch) {
            const { data } = await supabase
              .from('media_nodes')
              .select('*')
              .eq('id', recentWatch.media_node_id)
              .single();
            sourceMedia = data as MediaNode;
          }
        }

        if (!sourceMedia) {
          setRail(prev => ({ ...prev, items: [], loading: false }));
          return;
        }

        // Update rail title
        setRail(prev => ({
          ...prev,
          subtitle: sourceMedia!.title,
        }));

        // Get tags for the source media
        const { data: sourceTags } = await supabase
          .from('media_node_tags')
          .select('tag_id')
          .eq('media_node_id', sourceMedia.id);

        const tagIds = sourceTags?.map(t => t.tag_id) || [];

        if (tagIds.length === 0) {
          setRail(prev => ({ ...prev, items: [], loading: false }));
          return;
        }

        // Find media with similar tags
        const { data: relatedMediaIds } = await supabase
          .from('media_node_tags')
          .select('media_node_id')
          .in('tag_id', tagIds)
          .neq('media_node_id', sourceMedia.id)
          .limit(50);

        const uniqueIds = [...new Set(relatedMediaIds?.map(r => r.media_node_id) || [])];

        if (uniqueIds.length === 0) {
          setRail(prev => ({ ...prev, items: [], loading: false }));
          return;
        }

        // Fetch the related media
        const { data: relatedMedia, error } = await supabase
          .from('media_nodes')
          .select('*')
          .in('id', uniqueIds)
          .eq('embed_allowed', true)
          .order('popularity_score', { ascending: false })
          .limit(20);

        if (error) throw error;

        setRail(prev => ({
          ...prev,
          items: (relatedMedia || []) as MediaNode[],
          loading: false,
        }));
      } catch (error) {
        console.error('[useBecauseYouWatchedRail] Error:', error);
        setRail(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    }

    fetchRelated();
  }, [user, sourceMediaId]);

  return rail;
}

/**
 * Get mood-based discovery rail
 */
export function useMoodRail(mood: string): PersonalizedRail {
  const [rail, setRail] = useState<PersonalizedRail>({
    id: `mood-${mood}`,
    title: getMoodTitle(mood),
    subtitle: getMoodSubtitle(mood),
    icon: getMoodIcon(mood),
    items: [],
    loading: true,
    type: 'mood',
    mood,
  });

  useEffect(() => {
    async function fetchMoodContent() {
      try {
        // Map moods to tags
        const moodTags = getMoodTags(mood);

        // Get media with mood-matching tags
        const { data: taggedMedia } = await supabase
          .from('media_node_tags')
          .select('media_node_id')
          .in('tag_id', await getTagIds(moodTags))
          .limit(50);

        const mediaIds = [...new Set(taggedMedia?.map(t => t.media_node_id) || [])];

        if (mediaIds.length === 0) {
          setRail(prev => ({ ...prev, items: [], loading: false }));
          return;
        }

        const { data: mediaNodes, error } = await supabase
          .from('media_nodes')
          .select('*')
          .in('id', mediaIds)
          .eq('embed_allowed', true)
          .order('popularity_score', { ascending: false })
          .limit(20);

        if (error) throw error;

        setRail(prev => ({
          ...prev,
          items: (mediaNodes || []) as MediaNode[],
          loading: false,
        }));
      } catch (error) {
        console.error('[useMoodRail] Error:', error);
        setRail(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    }

    fetchMoodContent();
  }, [mood]);

  return rail;
}

/**
 * Get trending content rail
 */
export function useTrendingRail(): PersonalizedRail {
  const [rail, setRail] = useState<PersonalizedRail>({
    id: 'trending-now',
    title: 'Trending Now',
    subtitle: 'What everyone is watching',
    icon: '🔥',
    items: [],
    loading: true,
    type: 'trending',
  });

  useEffect(() => {
    async function fetchTrending() {
      try {
        // Get media with trending tag or high recent activity
        const { data: trendingMedia, error } = await supabase
          .from('media_nodes')
          .select('*')
          .eq('category', 'video')
          .eq('embed_allowed', true)
          .order('popularity_score', { ascending: false })
          .limit(20);

        if (error) throw error;

        setRail(prev => ({
          ...prev,
          items: (trendingMedia || []) as MediaNode[],
          loading: false,
        }));
      } catch (error) {
        console.error('[useTrendingRail] Error:', error);
        setRail(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    }

    fetchTrending();
  }, []);

  return rail;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function getTagIds(tagNames: string[]): Promise<string[]> {
  const { data } = await supabase
    .from('media_tags')
    .select('id')
    .in('name', tagNames);
  return data?.map(t => t.id) || [];
}

function getMoodTags(mood: string): string[] {
  const moodTagMap: Record<string, string[]> = {
    chill: ['comedy', 'animation', 'family', 'documentary'],
    intense: ['thriller', 'horror', 'action', 'drama'],
    nostalgic: ['classic', 'golden-age', 'silent-film', 'cult-classic'],
    adventurous: ['adventure', 'sci-fi', 'fantasy', 'western'],
    thoughtful: ['documentary', 'drama', 'historical', 'social-commentary'],
    scary: ['horror', 'thriller', 'creature-feature', 'psychological'],
    uplifting: ['comedy', 'family', 'musical', 'romance'],
    cultural: ['black-cinema', 'race-films', 'blaxploitation', 'international'],
  };
  return moodTagMap[mood] || [];
}

function getMoodTitle(mood: string): string {
  const titles: Record<string, string> = {
    chill: 'Chill Vibes',
    intense: 'Edge of Your Seat',
    nostalgic: 'Nostalgic Classics',
    adventurous: 'Adventure Awaits',
    thoughtful: 'Food for Thought',
    scary: 'Nightmare Fuel',
    uplifting: 'Feel Good Picks',
    cultural: 'Cultural Gems',
  };
  return titles[mood] || 'Discover';
}

function getMoodSubtitle(mood: string): string {
  const subtitles: Record<string, string> = {
    chill: 'Relax and unwind',
    intense: 'Thrills and tension',
    nostalgic: 'Take a trip back in time',
    adventurous: 'Explore new worlds',
    thoughtful: 'Expand your mind',
    scary: 'If you dare...',
    uplifting: 'Guaranteed smiles',
    cultural: 'Stories that matter',
  };
  return subtitles[mood] || '';
}

function getMoodIcon(mood: string): string {
  const icons: Record<string, string> = {
    chill: '😌',
    intense: '😰',
    nostalgic: '📼',
    adventurous: '🗺️',
    thoughtful: '🤔',
    scary: '👻',
    uplifting: '☀️',
    cultural: '🌍',
  };
  return icons[mood] || '🎬';
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  SIGNAL_WEIGHTS,
};
