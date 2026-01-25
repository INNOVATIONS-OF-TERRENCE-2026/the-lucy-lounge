// =============================================================================
// THE LUCY LOUNGE - UX ROW DEFINITIONS
// =============================================================================
// Defines all recommendation row types and their configurations
// Powers the "Netflix-level UX without being a clone" experience
// =============================================================================

import type {
  MediaNode,
  MediaCategory,
  MediaType,
  LucyJourney,
  MoodDiscoveryConfig,
} from '../types';

// =============================================================================
// ROW TYPES
// =============================================================================

export type RowType =
  // Continue watching/listening
  | 'continue_watching'
  | 'continue_listening'
  
  // Personalized recommendations
  | 'for_you'
  | 'because_you_watched'
  | 'because_you_listened'
  | 'top_picks'
  | 'hidden_gems'
  
  // Discovery
  | 'trending_now'
  | 'new_releases'
  | 'popular_in_genre'
  | 'mood_discovery'
  | 'lucy_journeys'
  | 'curated_collection'
  
  // Category specific
  | 'featured_movies'
  | 'featured_shows'
  | 'featured_music'
  | 'featured_podcasts'
  | 'featured_audiobooks'
  
  // Time-based
  | 'morning_picks'
  | 'afternoon_vibes'
  | 'evening_watch'
  | 'late_night'
  | 'weekend_binge'
  
  // Social
  | 'friends_watching'
  | 'trending_in_your_area'
  
  // Provider specific
  | 'free_to_watch'
  | 'fast_channels'
  | 'public_domain';

// =============================================================================
// ROW CONFIGURATION
// =============================================================================

export interface RowConfig {
  id: string;
  type: RowType;
  title: string;
  subtitle?: string;
  
  // Display options
  layout: 'horizontal' | 'hero' | 'grid' | 'featured';
  itemSize: 'small' | 'medium' | 'large' | 'hero';
  showProgress?: boolean;
  showReason?: boolean;
  maxItems?: number;
  
  // Filtering
  category?: MediaCategory;
  mediaType?: MediaType;
  genres?: string[];
  moods?: string[];
  providers?: string[];
  
  // Dynamic data
  sourceNodeId?: string;
  moodSlug?: string;
  journeyId?: string;
  
  // Visibility
  requiresAuth?: boolean;
  minItemsToShow?: number;
  priority?: number;
}

// =============================================================================
// ROW DEFINITIONS FOR HOME PAGE
// =============================================================================

export const HOME_ROW_DEFINITIONS: RowConfig[] = [
  // Hero row - Featured content
  {
    id: 'home-hero',
    type: 'for_you',
    title: 'Featured for You',
    layout: 'hero',
    itemSize: 'hero',
    maxItems: 5,
    priority: 1,
  },
  
  // Continue watching (video)
  {
    id: 'home-continue-watching',
    type: 'continue_watching',
    title: 'Continue Watching',
    layout: 'horizontal',
    itemSize: 'medium',
    showProgress: true,
    category: 'video',
    requiresAuth: true,
    minItemsToShow: 1,
    priority: 2,
  },
  
  // Continue listening (audio)
  {
    id: 'home-continue-listening',
    type: 'continue_listening',
    title: 'Continue Listening',
    layout: 'horizontal',
    itemSize: 'medium',
    showProgress: true,
    category: 'audio',
    requiresAuth: true,
    minItemsToShow: 1,
    priority: 3,
  },
  
  // Top picks
  {
    id: 'home-top-picks',
    type: 'top_picks',
    title: 'Top Picks for You',
    subtitle: 'Based on your taste',
    layout: 'horizontal',
    itemSize: 'medium',
    showReason: true,
    maxItems: 15,
    requiresAuth: true,
    priority: 4,
  },
  
  // Trending now
  {
    id: 'home-trending',
    type: 'trending_now',
    title: 'Trending Now',
    layout: 'horizontal',
    itemSize: 'medium',
    maxItems: 15,
    priority: 5,
  },
  
  // Lucy Journeys
  {
    id: 'home-journeys',
    type: 'lucy_journeys',
    title: 'Lucy Journeys',
    subtitle: 'Curated paths through content',
    layout: 'horizontal',
    itemSize: 'large',
    maxItems: 8,
    priority: 6,
  },
  
  // New releases
  {
    id: 'home-new-releases',
    type: 'new_releases',
    title: 'Just Released',
    layout: 'horizontal',
    itemSize: 'medium',
    maxItems: 15,
    priority: 7,
  },
  
  // Free to watch
  {
    id: 'home-free',
    type: 'free_to_watch',
    title: 'Free to Watch',
    subtitle: 'No subscription needed',
    layout: 'horizontal',
    itemSize: 'medium',
    maxItems: 15,
    priority: 8,
  },
];

// =============================================================================
// ROW DEFINITIONS FOR MEDIA MODE (VIDEO)
// =============================================================================

export const MEDIA_MODE_ROW_DEFINITIONS: RowConfig[] = [
  // Hero - Featured video content
  {
    id: 'media-hero',
    type: 'for_you',
    title: 'Featured',
    layout: 'hero',
    itemSize: 'hero',
    category: 'video',
    maxItems: 5,
    priority: 1,
  },
  
  // Continue watching
  {
    id: 'media-continue',
    type: 'continue_watching',
    title: 'Continue Watching',
    layout: 'horizontal',
    itemSize: 'medium',
    showProgress: true,
    category: 'video',
    requiresAuth: true,
    minItemsToShow: 1,
    priority: 2,
  },
  
  // FAST Channels
  {
    id: 'media-fast-channels',
    type: 'fast_channels',
    title: 'Live TV Channels',
    subtitle: 'Free linear streaming',
    layout: 'horizontal',
    itemSize: 'medium',
    mediaType: 'fast_channel',
    maxItems: 10,
    priority: 3,
  },
  
  // Featured movies
  {
    id: 'media-movies',
    type: 'featured_movies',
    title: 'Movies',
    layout: 'horizontal',
    itemSize: 'medium',
    mediaType: 'movie',
    maxItems: 15,
    priority: 4,
  },
  
  // Featured shows
  {
    id: 'media-shows',
    type: 'featured_shows',
    title: 'TV Shows',
    layout: 'horizontal',
    itemSize: 'medium',
    mediaType: 'tv_show',
    maxItems: 15,
    priority: 5,
  },
  
  // Public domain classics
  {
    id: 'media-public-domain',
    type: 'public_domain',
    title: 'Classic Cinema',
    subtitle: 'Timeless public domain films',
    layout: 'horizontal',
    itemSize: 'medium',
    providers: ['archive_org'],
    maxItems: 15,
    priority: 6,
  },
  
  // Genre rows (generated dynamically)
  {
    id: 'media-genre-action',
    type: 'popular_in_genre',
    title: 'Action & Adventure',
    layout: 'horizontal',
    itemSize: 'medium',
    genres: ['action', 'adventure'],
    category: 'video',
    maxItems: 15,
    priority: 7,
  },
  {
    id: 'media-genre-comedy',
    type: 'popular_in_genre',
    title: 'Comedy',
    layout: 'horizontal',
    itemSize: 'medium',
    genres: ['comedy'],
    category: 'video',
    maxItems: 15,
    priority: 8,
  },
  {
    id: 'media-genre-drama',
    type: 'popular_in_genre',
    title: 'Drama',
    layout: 'horizontal',
    itemSize: 'medium',
    genres: ['drama'],
    category: 'video',
    maxItems: 15,
    priority: 9,
  },
  {
    id: 'media-genre-scifi',
    type: 'popular_in_genre',
    title: 'Sci-Fi & Fantasy',
    layout: 'horizontal',
    itemSize: 'medium',
    genres: ['sci-fi', 'fantasy'],
    category: 'video',
    maxItems: 15,
    priority: 10,
  },
  {
    id: 'media-genre-documentary',
    type: 'popular_in_genre',
    title: 'Documentaries',
    layout: 'horizontal',
    itemSize: 'medium',
    genres: ['documentary'],
    category: 'video',
    maxItems: 15,
    priority: 11,
  },
];

// =============================================================================
// ROW DEFINITIONS FOR LISTENING MODE (AUDIO)
// =============================================================================

export const LISTENING_MODE_ROW_DEFINITIONS: RowConfig[] = [
  // Hero - Featured audio
  {
    id: 'listening-hero',
    type: 'for_you',
    title: 'Featured',
    layout: 'hero',
    itemSize: 'hero',
    category: 'audio',
    maxItems: 5,
    priority: 1,
  },
  
  // Continue listening
  {
    id: 'listening-continue',
    type: 'continue_listening',
    title: 'Continue Listening',
    layout: 'horizontal',
    itemSize: 'medium',
    showProgress: true,
    category: 'audio',
    requiresAuth: true,
    minItemsToShow: 1,
    priority: 2,
  },
  
  // Featured music
  {
    id: 'listening-music',
    type: 'featured_music',
    title: 'Music',
    layout: 'horizontal',
    itemSize: 'medium',
    mediaType: 'music_album',
    maxItems: 15,
    priority: 3,
  },
  
  // Featured podcasts
  {
    id: 'listening-podcasts',
    type: 'featured_podcasts',
    title: 'Podcasts',
    layout: 'horizontal',
    itemSize: 'medium',
    mediaType: 'podcast_show',
    maxItems: 15,
    priority: 4,
  },
  
  // Featured audiobooks
  {
    id: 'listening-audiobooks',
    type: 'featured_audiobooks',
    title: 'Audiobooks',
    layout: 'horizontal',
    itemSize: 'medium',
    mediaType: 'audiobook',
    maxItems: 15,
    priority: 5,
  },
  
  // Public domain audiobooks (LibriVox)
  {
    id: 'listening-librivox',
    type: 'public_domain',
    title: 'Free Audiobooks',
    subtitle: 'LibriVox classics',
    layout: 'horizontal',
    itemSize: 'medium',
    providers: ['librivox'],
    maxItems: 15,
    priority: 6,
  },
  
  // Mood-based rows
  {
    id: 'listening-mood-focus',
    type: 'mood_discovery',
    title: 'Focus Mode',
    subtitle: 'Music for concentration',
    layout: 'horizontal',
    itemSize: 'medium',
    moodSlug: 'focus',
    category: 'audio',
    maxItems: 15,
    priority: 7,
  },
  {
    id: 'listening-mood-chill',
    type: 'mood_discovery',
    title: 'Chill Vibes',
    layout: 'horizontal',
    itemSize: 'medium',
    moodSlug: 'chill',
    category: 'audio',
    maxItems: 15,
    priority: 8,
  },
  {
    id: 'listening-mood-energize',
    type: 'mood_discovery',
    title: 'Get Energized',
    layout: 'horizontal',
    itemSize: 'medium',
    moodSlug: 'energetic',
    category: 'audio',
    maxItems: 15,
    priority: 9,
  },
];

// =============================================================================
// ROW DEFINITIONS FOR EXPLORE MODE
// =============================================================================

export const EXPLORE_MODE_ROW_DEFINITIONS: RowConfig[] = [
  // Featured Journeys
  {
    id: 'explore-journeys-featured',
    type: 'lucy_journeys',
    title: 'Featured Journeys',
    subtitle: 'Curated adventures through content',
    layout: 'featured',
    itemSize: 'large',
    maxItems: 6,
    priority: 1,
  },
  
  // Mood discovery grid
  {
    id: 'explore-moods',
    type: 'mood_discovery',
    title: 'Discover by Mood',
    layout: 'grid',
    itemSize: 'large',
    maxItems: 8,
    priority: 2,
  },
  
  // Hidden gems
  {
    id: 'explore-hidden-gems',
    type: 'hidden_gems',
    title: 'Hidden Gems',
    subtitle: 'Underrated content you\'ll love',
    layout: 'horizontal',
    itemSize: 'medium',
    showReason: true,
    requiresAuth: true,
    maxItems: 15,
    priority: 3,
  },
  
  // All journeys by category
  {
    id: 'explore-journeys-video',
    type: 'lucy_journeys',
    title: 'Video Journeys',
    layout: 'horizontal',
    itemSize: 'medium',
    category: 'video',
    maxItems: 10,
    priority: 4,
  },
  {
    id: 'explore-journeys-audio',
    type: 'lucy_journeys',
    title: 'Audio Journeys',
    layout: 'horizontal',
    itemSize: 'medium',
    category: 'audio',
    maxItems: 10,
    priority: 5,
  },
  
  // Cross-category discovery
  {
    id: 'explore-soundtracks',
    type: 'curated_collection',
    title: 'Soundtracks & Scores',
    subtitle: 'Music from your favorite shows and movies',
    layout: 'horizontal',
    itemSize: 'medium',
    genres: ['soundtrack', 'score'],
    maxItems: 15,
    priority: 6,
  },
  
  // New arrivals
  {
    id: 'explore-new',
    type: 'new_releases',
    title: 'New This Week',
    layout: 'horizontal',
    itemSize: 'medium',
    maxItems: 20,
    priority: 7,
  },
];

// =============================================================================
// TIME-BASED ROW CONFIGURATIONS
// =============================================================================

export function getTimeBasedRows(): RowConfig[] {
  const hour = new Date().getHours();
  const isWeekend = [0, 6].includes(new Date().getDay());
  
  const rows: RowConfig[] = [];
  
  // Morning (6 AM - 12 PM)
  if (hour >= 6 && hour < 12) {
    rows.push({
      id: 'time-morning',
      type: 'morning_picks',
      title: 'Good Morning',
      subtitle: 'Start your day right',
      layout: 'horizontal',
      itemSize: 'medium',
      moods: ['uplifting', 'energizing', 'calm'],
      maxItems: 10,
      priority: 1,
    });
  }
  
  // Afternoon (12 PM - 5 PM)
  if (hour >= 12 && hour < 17) {
    rows.push({
      id: 'time-afternoon',
      type: 'afternoon_vibes',
      title: 'Afternoon Vibes',
      layout: 'horizontal',
      itemSize: 'medium',
      moods: ['focus', 'chill', 'productive'],
      maxItems: 10,
      priority: 1,
    });
  }
  
  // Evening (5 PM - 10 PM)
  if (hour >= 17 && hour < 22) {
    rows.push({
      id: 'time-evening',
      type: 'evening_watch',
      title: 'Evening Entertainment',
      layout: 'horizontal',
      itemSize: 'medium',
      moods: ['relaxing', 'entertaining', 'social'],
      maxItems: 10,
      priority: 1,
    });
  }
  
  // Late night (10 PM - 6 AM)
  if (hour >= 22 || hour < 6) {
    rows.push({
      id: 'time-late-night',
      type: 'late_night',
      title: 'Late Night',
      subtitle: 'Perfect for night owls',
      layout: 'horizontal',
      itemSize: 'medium',
      moods: ['chill', 'ambient', 'contemplative'],
      maxItems: 10,
      priority: 1,
    });
  }
  
  // Weekend binge
  if (isWeekend) {
    rows.push({
      id: 'time-weekend',
      type: 'weekend_binge',
      title: 'Weekend Binge',
      subtitle: 'You\'ve got time',
      layout: 'horizontal',
      itemSize: 'medium',
      mediaType: 'tv_show',
      maxItems: 10,
      priority: 2,
    });
  }
  
  return rows;
}

// =============================================================================
// "BECAUSE YOU WATCHED" ROW GENERATOR
// =============================================================================

export function createBecauseYouWatchedRow(
  sourceNode: MediaNode,
  index: number
): RowConfig {
  return {
    id: `because-${sourceNode.id}-${index}`,
    type: 'because_you_watched',
    title: `Because You Watched ${sourceNode.title}`,
    layout: 'horizontal',
    itemSize: 'medium',
    showReason: true,
    sourceNodeId: sourceNode.id,
    maxItems: 10,
    requiresAuth: true,
    priority: 10 + index,
  };
}

export function createBecauseYouListenedRow(
  sourceNode: MediaNode,
  index: number
): RowConfig {
  return {
    id: `because-listened-${sourceNode.id}-${index}`,
    type: 'because_you_listened',
    title: `Because You Listened to ${sourceNode.title}`,
    layout: 'horizontal',
    itemSize: 'medium',
    showReason: true,
    sourceNodeId: sourceNode.id,
    maxItems: 10,
    requiresAuth: true,
    priority: 10 + index,
  };
}

// =============================================================================
// ROW LAYOUT CONFIGURATIONS
// =============================================================================

export interface LayoutConfig {
  itemWidth: number;
  itemHeight: number;
  gap: number;
  scrollSnap: boolean;
  showArrows: boolean;
  autoScroll?: number; // Interval in ms
}

export const LAYOUT_CONFIGS: Record<RowConfig['layout'], LayoutConfig> = {
  horizontal: {
    itemWidth: 200,
    itemHeight: 300,
    gap: 16,
    scrollSnap: true,
    showArrows: true,
  },
  hero: {
    itemWidth: 800,
    itemHeight: 450,
    gap: 24,
    scrollSnap: true,
    showArrows: true,
    autoScroll: 8000,
  },
  grid: {
    itemWidth: 180,
    itemHeight: 180,
    gap: 16,
    scrollSnap: false,
    showArrows: false,
  },
  featured: {
    itemWidth: 350,
    itemHeight: 400,
    gap: 20,
    scrollSnap: true,
    showArrows: true,
  },
};

export const SIZE_MULTIPLIERS: Record<RowConfig['itemSize'], number> = {
  small: 0.75,
  medium: 1.0,
  large: 1.5,
  hero: 2.0,
};

// =============================================================================
// EXPORT ALL DEFINITIONS
// =============================================================================

export const ALL_ROW_DEFINITIONS = {
  home: HOME_ROW_DEFINITIONS,
  media: MEDIA_MODE_ROW_DEFINITIONS,
  listening: LISTENING_MODE_ROW_DEFINITIONS,
  explore: EXPLORE_MODE_ROW_DEFINITIONS,
};
