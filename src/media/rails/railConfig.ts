/**
 * THE LUCY LOUNGE — DYNAMIC RAIL CONFIGURATION
 * 
 * Netflix-style rails powered by tag-based queries
 * NOT hard-coded arrays — all content from Supabase
 */

import { supabase } from '@/integrations/supabase/client';
import type { MediaNode } from '@/media/types';

// =============================================================================
// RAIL CONFIGURATION TYPES
// =============================================================================

export interface RailConfig {
  id: string;
  title: string;
  subtitle?: string;
  queryType: 'tag' | 'era' | 'trending' | 'recent' | 'custom';
  tags?: string[];        // For tag-based queries
  eraRange?: [number, number]; // For era queries [startYear, endYear]
  mediaTypes?: string[];  // Filter by media_type
  category?: string;      // Filter by category
  minItems: number;       // Minimum items to show rail
  limit: number;          // Max items to fetch
  priority: 'high' | 'normal' | 'low';
  icon?: string;
}

export interface RailData {
  config: RailConfig;
  items: MediaNode[];
  loading: boolean;
  error?: string;
}

// =============================================================================
// RAIL DEFINITIONS (Netflix-style)
// =============================================================================

export const RAIL_CONFIGS: RailConfig[] = [
  // Trending Movies
  {
    id: 'trending-movies',
    title: 'Trending Movies',
    subtitle: 'Popular right now',
    queryType: 'trending',
    tags: ['trending'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 8,
    limit: 20,
    priority: 'high',
    icon: '🔥'
  },
  
  // Black Cinema
  {
    id: 'black-cinema',
    title: 'Black Cinema',
    subtitle: 'Culturally significant films',
    queryType: 'tag',
    tags: ['black-cinema'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 12,
    limit: 30,
    priority: 'high',
    icon: '✊🏿'
  },
  
  // Best 1990s Movies
  {
    id: 'best-90s',
    title: "Best 1990's Movies",
    subtitle: 'Decade-defining classics',
    queryType: 'era',
    eraRange: [1990, 1999],
    tags: ['nineties'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 12,
    limit: 25,
    priority: 'high',
    icon: '💿'
  },
  
  // Top Action Movies
  {
    id: 'top-action',
    title: 'Top Action Movies',
    subtitle: 'Adrenaline-pumping classics',
    queryType: 'tag',
    tags: ['action'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 12,
    limit: 25,
    priority: 'high',
    icon: '💥'
  },
  
  // Complete Top Sci-Fi Movies
  {
    id: 'top-sci-fi',
    title: 'Complete Top Sci-Fi Movies',
    subtitle: 'Mind-bending journeys',
    queryType: 'tag',
    tags: ['sci-fi'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 12,
    limit: 25,
    priority: 'high',
    icon: '🚀'
  },
  
  // Top Cartoon / Animated Movies
  {
    id: 'animation',
    title: 'Top Cartoon / Animated Movies',
    subtitle: 'Animated classics & anime',
    queryType: 'tag',
    tags: ['animation'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 12,
    limit: 25,
    priority: 'high',
    icon: '🎨'
  },
  
  // Black TV Shows (Full Seasons)
  {
    id: 'black-tv-shows',
    title: 'Black TV Shows',
    subtitle: 'Full seasons available',
    queryType: 'tag',
    tags: ['black-cinema', 'full-season'],
    mediaTypes: ['tv_season', 'tv_show'],
    category: 'video',
    minItems: 10,
    limit: 20,
    priority: 'high',
    icon: '📺'
  },
  
  // Comedy Favorites
  {
    id: 'comedy',
    title: 'Comedy Favorites',
    subtitle: 'Laugh out loud',
    queryType: 'tag',
    tags: ['comedy'],
    category: 'video',
    minItems: 10,
    limit: 20,
    priority: 'normal',
    icon: '😂'
  },
  
  // Drama Collection
  {
    id: 'drama',
    title: 'Drama Collection',
    subtitle: 'Powerful storytelling',
    queryType: 'tag',
    tags: ['drama'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 10,
    limit: 20,
    priority: 'normal',
    icon: '🎭'
  },
  
  // Classic Films (Pre-1980)
  {
    id: 'classics',
    title: 'Classic Films',
    subtitle: 'Timeless cinema',
    queryType: 'tag',
    tags: ['classic'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 8,
    limit: 20,
    priority: 'normal',
    icon: '🎞️'
  },
  
  // 1980s Movies
  {
    id: '80s-movies',
    title: "1980's Movies",
    subtitle: 'Neon-soaked nostalgia',
    queryType: 'era',
    eraRange: [1980, 1989],
    tags: ['eighties'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 8,
    limit: 20,
    priority: 'normal',
    icon: '📼'
  },
  
  // Kids & Family
  {
    id: 'kids-family',
    title: 'Kids & Family',
    subtitle: 'Fun for all ages',
    queryType: 'tag',
    tags: ['kids', 'family'],
    category: 'video',
    minItems: 8,
    limit: 20,
    priority: 'normal',
    icon: '🧸'
  },
  
  // Animated Series
  {
    id: 'animated-series',
    title: 'Animated Series',
    subtitle: 'Cartoon marathons',
    queryType: 'tag',
    tags: ['animation'],
    mediaTypes: ['tv_show', 'tv_season'],
    category: 'video',
    minItems: 6,
    limit: 15,
    priority: 'normal',
    icon: '📺'
  },
  
  // Thriller Collection
  {
    id: 'thrillers',
    title: 'Thriller Collection',
    subtitle: 'Edge of your seat',
    queryType: 'tag',
    tags: ['thriller'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 8,
    limit: 20,
    priority: 'low',
    icon: '😱'
  },
  
  // =============================================================================
  // PUBLIC DOMAIN / FAST PROVIDER RAILS
  // =============================================================================
  
  // Public Domain Classics (Internet Archive)
  {
    id: 'public-domain-classics',
    title: 'Public Domain Classics',
    subtitle: 'Free films from Internet Archive',
    queryType: 'tag',
    tags: ['public-domain', 'archive-org'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 10,
    limit: 25,
    priority: 'high',
    icon: '🎬'
  },
  
  // Film Noir Collection
  {
    id: 'film-noir',
    title: 'Film Noir',
    subtitle: 'Dark shadows and deadly dames',
    queryType: 'tag',
    tags: ['film-noir'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 8,
    limit: 20,
    priority: 'normal',
    icon: '🔪'
  },
  
  // Silent Film Era
  {
    id: 'silent-films',
    title: 'Silent Film Masterpieces',
    subtitle: 'The birth of cinema',
    queryType: 'tag',
    tags: ['silent-film'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 6,
    limit: 15,
    priority: 'normal',
    icon: '🎥'
  },
  
  // Cult Classics
  {
    id: 'cult-classics',
    title: 'Cult Classics',
    subtitle: 'So bad they are good',
    queryType: 'tag',
    tags: ['cult-classic', 'b-movie'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 8,
    limit: 20,
    priority: 'normal',
    icon: '👾'
  },
  
  // Blaxploitation Era
  {
    id: 'blaxploitation',
    title: 'Blaxploitation Classics',
    subtitle: 'Revolutionary Black cinema',
    queryType: 'tag',
    tags: ['blaxploitation'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 4,
    limit: 15,
    priority: 'normal',
    icon: '✊🏿'
  },
  
  // Horror Classics
  {
    id: 'horror-classics',
    title: 'Horror Classics',
    subtitle: 'Timeless terror',
    queryType: 'tag',
    tags: ['horror', 'classic'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 8,
    limit: 20,
    priority: 'normal',
    icon: '👻'
  },
  
  // Atomic Age Sci-Fi
  {
    id: 'atomic-age-scifi',
    title: 'Atomic Age Sci-Fi',
    subtitle: '1950s creature features',
    queryType: 'tag',
    tags: ['atomic-age', 'creature-feature'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 5,
    limit: 15,
    priority: 'low',
    icon: '☢️'
  },
  
  // Western Films
  {
    id: 'westerns',
    title: 'Classic Westerns',
    subtitle: 'Cowboys and outlaws',
    queryType: 'tag',
    tags: ['western'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 4,
    limit: 15,
    priority: 'low',
    icon: '🤠'
  },
  
  // Golden Age Hollywood
  {
    id: 'golden-age',
    title: 'Golden Age Hollywood',
    subtitle: 'The studio system era',
    queryType: 'tag',
    tags: ['golden-age', 'pre-code'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 6,
    limit: 20,
    priority: 'low',
    icon: '⭐'
  },
  
  // =============================================================================
  // OSCAR MICHEAUX & RACE FILMS
  // =============================================================================
  
  // Oscar Micheaux Films
  {
    id: 'race-films',
    title: 'Race Films (1910s-1950s)',
    subtitle: 'Independent Black cinema pioneers',
    queryType: 'tag',
    tags: ['race-films', 'black-cinema'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 5,
    limit: 20,
    priority: 'high',
    icon: '🎬'
  },
  
  // Black Westerns
  {
    id: 'black-westerns',
    title: 'Black Westerns',
    subtitle: 'Herb Jeffries & the Bronze Buckaroo',
    queryType: 'tag',
    tags: ['western', 'black-cinema'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 3,
    limit: 10,
    priority: 'normal',
    icon: '🤠'
  },
  
  // Black Musicals
  {
    id: 'black-musicals',
    title: 'Classic Black Musicals',
    subtitle: 'Lena Horne, Cab Calloway & more',
    queryType: 'tag',
    tags: ['musical', 'black-cinema'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 3,
    limit: 15,
    priority: 'normal',
    icon: '🎵'
  },
  
  // Paul Robeson Collection
  {
    id: 'paul-robeson',
    title: 'Paul Robeson Collection',
    subtitle: 'Legendary performer and activist',
    queryType: 'custom',
    tags: ['paul-robeson', 'black-cinema'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 3,
    limit: 10,
    priority: 'normal',
    icon: '🎭'
  },
  
  // =============================================================================
  // ANIMATION & SERIALS
  // =============================================================================
  
  // Classic Animation
  {
    id: 'classic-animation',
    title: 'Classic Animation',
    subtitle: 'Fleischer Studios & more',
    queryType: 'tag',
    tags: ['animation', 'shorts', 'public-domain'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 5,
    limit: 15,
    priority: 'normal',
    icon: '🎨'
  },
  
  // Serials & Cliffhangers
  {
    id: 'serials',
    title: 'Serials & Cliffhangers',
    subtitle: 'Flash Gordon, Buck Rogers & more',
    queryType: 'tag',
    tags: ['series', 'adventure', 'public-domain'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 3,
    limit: 10,
    priority: 'low',
    icon: '📺'
  },
  
  // Comedy Shorts
  {
    id: 'comedy-shorts',
    title: 'Classic Comedy Shorts',
    subtitle: 'Chaplin, Keaton, Laurel & Hardy',
    queryType: 'tag',
    tags: ['comedy', 'shorts', 'silent-era'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 3,
    limit: 15,
    priority: 'normal',
    icon: '🎩'
  },
  
  // =============================================================================
  // INTERNATIONAL CINEMA
  // =============================================================================
  
  // Japanese Classics
  {
    id: 'japanese-classics',
    title: 'Japanese Cinema',
    subtitle: 'Kurosawa & beyond',
    queryType: 'tag',
    tags: ['international', 'drama', 'classic'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 2,
    limit: 10,
    priority: 'normal',
    icon: '🇯🇵'
  },
  
  // Martial Arts
  {
    id: 'martial-arts',
    title: 'Martial Arts',
    subtitle: 'Kung fu classics',
    queryType: 'tag',
    tags: ['martial-arts', 'action'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 2,
    limit: 15,
    priority: 'low',
    icon: '🥋'
  },
  
  // =============================================================================
  // PRE-CODE & EARLY HOLLYWOOD
  // =============================================================================
  
  // Pre-Code Hollywood
  {
    id: 'pre-code',
    title: 'Pre-Code Hollywood',
    subtitle: 'Scandalous classics (1929-1934)',
    queryType: 'tag',
    tags: ['pre-code'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 3,
    limit: 15,
    priority: 'normal',
    icon: '💋'
  },
  
  // German Expressionism
  {
    id: 'german-expressionism',
    title: 'German Expressionism',
    subtitle: 'Shadows and nightmares',
    queryType: 'tag',
    tags: ['silent-film', 'horror', 'international'],
    mediaTypes: ['movie'],
    category: 'video',
    minItems: 2,
    limit: 10,
    priority: 'low',
    icon: '🖤'
  }
];

// =============================================================================
// RAIL QUERY FUNCTIONS
// =============================================================================

/**
 * Fetch items for a single rail based on config
 */
export async function fetchRailItems(config: RailConfig): Promise<MediaNode[]> {
  try {
    let items: MediaNode[] = [];
    
    switch (config.queryType) {
      case 'tag':
        items = await fetchByTags(config);
        break;
      case 'era':
        items = await fetchByEra(config);
        break;
      case 'trending':
        items = await fetchTrending(config);
        break;
      case 'recent':
        items = await fetchRecent(config);
        break;
      default:
        items = await fetchByTags(config);
    }
    
    return items;
  } catch (error) {
    console.error(`[RailQuery] Error fetching rail ${config.id}:`, error);
    return [];
  }
}

/**
 * Fetch content by tags using media_node_tags junction
 */
async function fetchByTags(config: RailConfig): Promise<MediaNode[]> {
  if (!config.tags || config.tags.length === 0) return [];
  
  // Get tag IDs first
  const { data: tagData, error: tagError } = await supabase
    .from('media_tags')
    .select('id, slug')
    .in('slug', config.tags);
  
  if (tagError || !tagData || tagData.length === 0) {
    console.warn(`[RailQuery] No tags found for ${config.tags.join(', ')}`);
    return [];
  }
  
  const tagIds = tagData.map(t => t.id);
  
  // Fetch media nodes with these tags
  const { data, error } = await supabase
    .from('media_node_tags')
    .select(`
      media_nodes!inner (
        id, canonical_id, media_type, category, title, description,
        release_year, duration_seconds, poster_url, backdrop_url,
        thumbnail_url, youtube_id, popularity_score, average_rating,
        content_rating, created_at, updated_at
      )
    `)
    .in('tag_id', tagIds)
    .limit(config.limit * 2); // Fetch extra for filtering
  
  if (error || !data) {
    console.error(`[RailQuery] fetchByTags error:`, error);
    return [];
  }
  
  // Extract and dedupe media nodes
  const nodeMap = new Map<string, MediaNode>();
  data.forEach((item: any) => {
    const node = item.media_nodes;
    if (node && node.id) {
      // Apply filters
      if (config.mediaTypes && !config.mediaTypes.includes(node.media_type)) return;
      if (config.category && node.category !== config.category) return;
      nodeMap.set(node.id, node as MediaNode);
    }
  });
  
  // Sort by popularity and limit
  return Array.from(nodeMap.values())
    .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0))
    .slice(0, config.limit);
}

/**
 * Fetch content by era (year range)
 */
async function fetchByEra(config: RailConfig): Promise<MediaNode[]> {
  if (!config.eraRange) return fetchByTags(config);
  
  const [startYear, endYear] = config.eraRange;
  
  let query = supabase
    .from('media_nodes')
    .select('*')
    .gte('release_year', startYear)
    .lte('release_year', endYear)
    .order('popularity_score', { ascending: false })
    .limit(config.limit);
  
  if (config.mediaTypes && config.mediaTypes.length > 0) {
    query = query.in('media_type', config.mediaTypes);
  }
  
  if (config.category) {
    query = query.eq('category', config.category);
  }
  
  const { data, error } = await query;
  
  if (error || !data) {
    console.error(`[RailQuery] fetchByEra error:`, error);
    // Fallback to tag-based query
    return fetchByTags(config);
  }
  
  return data as MediaNode[];
}

/**
 * Fetch trending content
 */
async function fetchTrending(config: RailConfig): Promise<MediaNode[]> {
  let query = supabase
    .from('media_nodes')
    .select('*')
    .order('popularity_score', { ascending: false })
    .limit(config.limit);
  
  if (config.mediaTypes && config.mediaTypes.length > 0) {
    query = query.in('media_type', config.mediaTypes);
  }
  
  if (config.category) {
    query = query.eq('category', config.category);
  }
  
  const { data, error } = await query;
  
  if (error || !data) {
    console.error(`[RailQuery] fetchTrending error:`, error);
    return [];
  }
  
  return data as MediaNode[];
}

/**
 * Fetch recent content
 */
async function fetchRecent(config: RailConfig): Promise<MediaNode[]> {
  let query = supabase
    .from('media_nodes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(config.limit);
  
  if (config.mediaTypes && config.mediaTypes.length > 0) {
    query = query.in('media_type', config.mediaTypes);
  }
  
  if (config.category) {
    query = query.eq('category', config.category);
  }
  
  const { data, error } = await query;
  
  if (error || !data) {
    console.error(`[RailQuery] fetchRecent error:`, error);
    return [];
  }
  
  return data as MediaNode[];
}

/**
 * Fetch all rails in parallel
 */
export async function fetchAllRails(
  configs: RailConfig[] = RAIL_CONFIGS
): Promise<Map<string, MediaNode[]>> {
  const results = new Map<string, MediaNode[]>();
  
  // Fetch high priority first, then others
  const highPriority = configs.filter(c => c.priority === 'high');
  const normalPriority = configs.filter(c => c.priority === 'normal');
  const lowPriority = configs.filter(c => c.priority === 'low');
  
  // Fetch all in parallel
  const allFetches = await Promise.all(
    [...highPriority, ...normalPriority, ...lowPriority].map(async (config) => {
      const items = await fetchRailItems(config);
      return { id: config.id, items };
    })
  );
  
  allFetches.forEach(({ id, items }) => {
    results.set(id, items);
  });
  
  return results;
}

/**
 * Get rail config by ID
 */
export function getRailConfig(id: string): RailConfig | undefined {
  return RAIL_CONFIGS.find(c => c.id === id);
}

/**
 * Filter rails that have enough items
 */
export function filterViableRails(
  configs: RailConfig[],
  railData: Map<string, MediaNode[]>
): RailConfig[] {
  return configs.filter(config => {
    const items = railData.get(config.id) || [];
    return items.length >= config.minItems;
  });
}
