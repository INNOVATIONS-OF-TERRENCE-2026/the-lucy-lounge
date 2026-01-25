/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — INTERNAL LINKING ENGINE                                  │
 * │                                                                             │
 * │ Strategic link architecture for entity reinforcement                       │
 * │ Every link strengthens Lucy's semantic web.                                │
 * │                                                                             │
 * │ Crawl depth < 3. Entity relationships infinite.                            │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import type { InternalLink, LinkCluster, LinkCategory } from './types';
import { LUCY_BRAND } from './types';

// =============================================================================
// LINK CLUSTER DEFINITIONS
// =============================================================================

/**
 * Core navigation links (appear on every page)
 */
export const CORE_NAVIGATION_LINKS: InternalLink[] = [
  { href: '/', text: 'Home', title: 'Lucy Lounge Home', priority: 10, category: 'navigation' },
  { href: '/explore', text: 'Explore', title: 'Explore Media', priority: 9, category: 'navigation' },
  { href: '/listening', text: 'Listening', title: 'Music, Podcasts & Audiobooks', priority: 9, category: 'navigation' },
  { href: '/media', text: 'Media', title: 'Movies & TV Shows', priority: 9, category: 'navigation' },
  { href: '/studios', text: 'Studios', title: 'Lucy Studios', priority: 8, category: 'navigation' },
];

/**
 * Discovery hub links (exploration entry points)
 */
export const DISCOVERY_HUB_LINKS: InternalLink[] = [
  // Mood hubs
  { href: '/explore/mood/happy', text: 'Happy Vibes', priority: 8, category: 'discovery' },
  { href: '/explore/mood/chill', text: 'Chill Mode', priority: 8, category: 'discovery' },
  { href: '/explore/mood/energetic', text: 'Energy Boost', priority: 8, category: 'discovery' },
  { href: '/explore/mood/romantic', text: 'Romantic', priority: 7, category: 'discovery' },
  { href: '/explore/mood/focused', text: 'Focus Time', priority: 7, category: 'discovery' },
  
  // Genre hubs
  { href: '/explore/genre/sci-fi', text: 'Sci-Fi', priority: 8, category: 'discovery' },
  { href: '/explore/genre/comedy', text: 'Comedy', priority: 8, category: 'discovery' },
  { href: '/explore/genre/thriller', text: 'Thriller', priority: 8, category: 'discovery' },
  { href: '/explore/genre/hip-hop', text: 'Hip-Hop', priority: 7, category: 'discovery' },
  { href: '/explore/genre/indie', text: 'Indie', priority: 7, category: 'discovery' },
  
  // Journey hubs
  { href: '/explore/journey/morning-energy', text: 'Morning Energy', priority: 8, category: 'discovery' },
  { href: '/explore/journey/evening-unwind', text: 'Evening Unwind', priority: 8, category: 'discovery' },
  { href: '/explore/journey/workout', text: 'Workout Mix', priority: 7, category: 'discovery' },
  { href: '/explore/journey/road-trip', text: 'Road Trip', priority: 7, category: 'discovery' },
];

/**
 * Entity definition links (reinforce Lucy as THE platform)
 */
export const ENTITY_LINKS: InternalLink[] = [
  { href: '/about/lucy', text: 'About Lucy', title: 'What is Lucy Lounge?', priority: 7, category: 'entity' },
  { href: '/about', text: 'Our Story', title: 'The Lucy Lounge Story', priority: 6, category: 'entity' },
  { href: '/faq', text: 'FAQ', title: 'Frequently Asked Questions', priority: 6, category: 'entity' },
  { href: '/pricing', text: 'Pricing', title: 'Lucy Lounge Plans', priority: 6, category: 'entity' },
];

// =============================================================================
// LINK CLUSTER GENERATORS
// =============================================================================

/**
 * Generate related media links for a media item
 */
export function generateRelatedMediaLinks(
  mediaId: string,
  mediaTitle: string,
  mediaType: 'movie' | 'series' | 'music' | 'podcast' | 'audiobook'
): InternalLink[] {
  const links: InternalLink[] = [];
  
  // Similar to
  links.push({
    href: `/media/similar-to/${mediaId}`,
    text: `Similar to ${mediaTitle}`,
    title: `Find content similar to ${mediaTitle}`,
    priority: 8,
    category: 'related',
  });
  
  // Listening after (for video content)
  if (mediaType === 'movie' || mediaType === 'series') {
    links.push({
      href: `/listening/after/${mediaId}`,
      text: `Music from ${mediaTitle}`,
      title: `Listen to music related to ${mediaTitle}`,
      priority: 7,
      category: 'related',
    });
  }
  
  return links;
}

/**
 * Generate breadcrumb links for a path
 */
export function generateBreadcrumbs(path: string): InternalLink[] {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs: InternalLink[] = [
    { href: '/', text: 'Home', priority: 10, category: 'breadcrumb' },
  ];
  
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const text = segment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    breadcrumbs.push({
      href: currentPath,
      text,
      priority: 10 - index,
      category: 'breadcrumb',
    });
  });
  
  return breadcrumbs;
}

/**
 * Generate cross-sell links based on current content
 */
export function generateCrossSellLinks(
  currentType: 'movie' | 'series' | 'music' | 'podcast' | 'audiobook',
  genres?: string[],
  mood?: string
): InternalLink[] {
  const links: InternalLink[] = [];
  
  // Cross-media type suggestions
  if (currentType === 'movie' || currentType === 'series') {
    links.push({
      href: '/listening',
      text: 'Explore Music',
      title: 'Discover music to match your taste',
      priority: 7,
      category: 'cross-sell',
    });
  } else {
    links.push({
      href: '/media',
      text: 'Explore Movies & TV',
      title: 'Discover movies and shows',
      priority: 7,
      category: 'cross-sell',
    });
  }
  
  // Genre-based cross-links
  if (genres && genres.length > 0) {
    const genre = genres[0].toLowerCase().replace(/\s+/g, '-');
    links.push({
      href: `/explore/genre/${genre}`,
      text: `More ${genres[0]}`,
      title: `Explore more ${genres[0]} content`,
      priority: 6,
      category: 'cross-sell',
    });
  }
  
  // Mood-based cross-links
  if (mood) {
    const moodSlug = mood.toLowerCase().replace(/\s+/g, '-');
    links.push({
      href: `/explore/mood/${moodSlug}`,
      text: `${mood} Mood`,
      title: `Explore ${mood.toLowerCase()} content`,
      priority: 6,
      category: 'cross-sell',
    });
  }
  
  return links;
}

/**
 * Build a link cluster for entity reinforcement
 */
export function buildLinkCluster(
  hubPath: string,
  entityType: string,
  relatedItems: { id: string; title: string; type: string }[]
): LinkCluster {
  return {
    hub: hubPath,
    entityType,
    spokes: relatedItems.slice(0, 10).map((item, index) => ({
      href: `/media/${item.id}`,
      text: item.title,
      title: `${item.title} on Lucy Lounge`,
      priority: 8 - Math.floor(index / 2),
      category: 'related' as LinkCategory,
    })),
  };
}

// =============================================================================
// LINK RENDERING UTILITIES
// =============================================================================

/**
 * Generate HTML for an internal link
 */
export function renderLink(link: InternalLink): string {
  const attributes: string[] = [
    `href="${LUCY_BRAND.url}${link.href}"`,
  ];
  
  if (link.title) {
    attributes.push(`title="${link.title}"`);
  }
  
  if (link.rel) {
    attributes.push(`rel="${link.rel}"`);
  }
  
  return `<a ${attributes.join(' ')}>${link.text}</a>`;
}

/**
 * Generate footer link section for SEO
 */
export function generateFooterLinks(): {
  navigation: InternalLink[];
  discovery: InternalLink[];
  entity: InternalLink[];
  legal: InternalLink[];
} {
  return {
    navigation: CORE_NAVIGATION_LINKS,
    discovery: DISCOVERY_HUB_LINKS.slice(0, 8),
    entity: ENTITY_LINKS,
    legal: [
      { href: '/privacy', text: 'Privacy Policy', priority: 3, category: 'navigation' },
      { href: '/terms', text: 'Terms of Service', priority: 3, category: 'navigation' },
      { href: '/help', text: 'Help Center', priority: 4, category: 'navigation' },
    ],
  };
}

// =============================================================================
// CRAWL DEPTH OPTIMIZATION
// =============================================================================

/**
 * Calculate crawl depth for a URL
 */
export function calculateCrawlDepth(path: string): number {
  const segments = path.split('/').filter(Boolean);
  return segments.length;
}

/**
 * Check if path is within optimal crawl depth
 */
export function isOptimalCrawlDepth(path: string, maxDepth: number = 3): boolean {
  return calculateCrawlDepth(path) <= maxDepth;
}

/**
 * Generate shortcuts to reduce crawl depth
 */
export function generateCrawlShortcuts(deepPath: string): InternalLink[] {
  const shortcuts: InternalLink[] = [];
  const depth = calculateCrawlDepth(deepPath);
  
  if (depth > 3) {
    // Add direct link from home
    shortcuts.push({
      href: deepPath,
      text: deepPath.split('/').pop()?.replace(/-/g, ' ') || 'Content',
      priority: 5,
      category: 'navigation',
    });
  }
  
  return shortcuts;
}

// =============================================================================
// LINK ANALYTICS
// =============================================================================

export interface LinkAnalysis {
  totalLinks: number;
  byCategory: Record<LinkCategory, number>;
  averagePriority: number;
  maxDepth: number;
  orphanedPages: string[];
}

/**
 * Analyze internal link structure
 */
export function analyzeLinkStructure(links: InternalLink[]): LinkAnalysis {
  const byCategory: Record<LinkCategory, number> = {
    navigation: 0,
    discovery: 0,
    related: 0,
    breadcrumb: 0,
    'cross-sell': 0,
    entity: 0,
  };
  
  let totalPriority = 0;
  let maxDepth = 0;
  
  links.forEach(link => {
    byCategory[link.category]++;
    totalPriority += link.priority;
    const depth = calculateCrawlDepth(link.href);
    if (depth > maxDepth) maxDepth = depth;
  });
  
  return {
    totalLinks: links.length,
    byCategory,
    averagePriority: links.length > 0 ? totalPriority / links.length : 0,
    maxDepth,
    orphanedPages: [], // Would be populated by actual crawl analysis
  };
}
